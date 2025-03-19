'use strict';
const mpd = require('mpd2');
const { cmd } = mpd;
module.exports = function(RED) {


    function MPDNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        
        this.server = RED.nodes.getNode(config.server);
        node.command = config.command;
        node.client = null;
        node.connected = false;
        node.connecting = false;
       // node.status({fill:"red", shape:"ring", text:"未连接"});

        // 连接到MPD服务器
        function connect() {
            if (node.connecting || node.connected) return;
            
            node.connecting = true;
            node.status({fill:"yellow", shape:"ring", text:"Connecting..."});
            
            const connectionConfig = {
                    host: node.server.host,
                    port: node.server.port
            };
            
            if (node.password) {
                connectionConfig.password = node.password;
            }
            
            mpd.connect(connectionConfig).then(client => {
                node.client = client;
                node.connected = true;
                node.connecting = false;
                node.status({fill:"green", shape:"dot", text:"Connected"});
                
                // 监听系统事件
                client.on('system', (subsystem) => {
                    // 只有当subsystem为'player'时才查询当前播放器状态
                    if (subsystem === 'player') {
                        node.client.sendCommand('status')
                            .then(response => {
                                let status;
                                try {
                                    status = mpd.parseObject(response);
                                } catch (e) {
                                    status = response;
                                }
                                
                                // 如果播放器状态为播放中，获取当前播放的音乐信息
                                if (status.state === 'play') {
                                    // 调用currentsong命令获取当前播放的音乐信息
                                    return node.client.sendCommand('currentsong')
                                        .then(songResponse => {
                                            let songInfo;
                                            try {
                                                songInfo = mpd.parseObject(songResponse);
                                            } catch (e) {
                                                songInfo = songResponse;
                                            }
                                            
                                            // 发送包含系统事件、播放器状态和当前歌曲信息的消息
                                            node.send([null, {
                                                event: subsystem,
                                                result: status,
                                                currentsong: songInfo
                                            }]);
                                        })
                                        .catch(err => {
                                            // 如果获取当前歌曲信息失败，仍然发送状态信息
                                            node.error(`Error getting current song information: ${err.message}`, {error: err});
                                            node.send([null, {
                                                event: subsystem,
                                                result: status,
                                                currentsong_error: err.message
                                            }]);
                                        });
                                } else {
                                    // 如果不是播放状态，只发送状态信息
                                    node.send([null, {
                                        event: subsystem,
                                        result: status
                                    }]);
                                }
                            })
                            .catch(err => {
                                // 如果状态查询失败，仍然发送系统事件
                                node.error(`Get status error: ${err.message}`, {error: err});
                                node.send([null, {
                                        event: subsystem,
                                        error: err.message
                                    }]);
                            });
                    } else {
                        // 对于非player事件，直接发送系统事件信息，不查询状态
                        node.send([null, {
                                        event: subsystem
                                    }]);
                    }
                });
                
                // 监听关闭事件
                client.on('close', () => {
                    node.connected = false;
                    node.status({fill:"red", shape:"ring", text:"Connection closed"});
                });
                
                // 监听错误事件
                client.on('error', (err) => {
                    node.error(`MPD error: ${err.message}`, {error: err});
                    node.status({fill:"red", shape:"dot", text:"ERROR: " + err.message});
                });
                
            }).catch(err => {
                node.connecting = false;
                node.error(`MPD connection error: ${err.message}`, {error: err});
                node.status({fill:"red", shape:"dot", text:"connection failed"});
                // 尝试重新连接
                setTimeout(connect, 5000);
            });
        }

        // 处理输入消息
        node.on('input', function(msg) {
            // 如果未连接，尝试连接
            if (!node.connected) {
                connect();
                return;
            }
            
            let command = '';
            let args = [];
            
            // 处理不同类型的输入
            if (typeof msg.payload === 'string') {
                // 如果是字符串，直接作为命令
                command = msg.payload;
                
                // 处理以add开头+空格+URL链接组成的字符串命令
                if (command.startsWith('add ')) {
                    const parts = command.split(' ');
                    if (parts.length >= 2) {
                        const url = parts.slice(1).join(' '); // 获取URL部分
                        if (url.startsWith('http://') || url.startsWith('https://')) {
                            // 对远程链接进行URL编码，但保留协议部分
                            const protocol = url.startsWith('https://') ? 'https://' : 'http://';
                            const urlWithoutProtocol = url.substring(protocol.length);
                            // 对于已经包含百分号编码的部分不进行编码
                            const encodedUrl = protocol + urlWithoutProtocol.split('').map(char => {
                                if (char === '%') {
                                    return char;
                                }
                                return encodeURI(char);
                            }).join('');
                            command = 'add ' + encodedUrl;
                        } else {
                            // 如果不是URL，检查参数是否已经被引号包围
                            if (!url.startsWith('"') && !url.endsWith('"') && !url.startsWith('\'') && !url.endsWith('\'')) {
                                command = 'add "' + url + '"';
                            }
                        }
                    }
                }
            } else if (typeof msg.payload === 'object') {
                // 如果是对象，提取命令和参数
                if (msg.payload.command.startsWith('add') && args.length > 0) {
                    command = msg.payload.command;
                    if (msg.payload.args) {
                        args = Array.isArray(msg.payload.args) ? msg.payload.args : [msg.payload.args];
                        if (typeof args[0] === 'string' && (args[0].startsWith('http://') || args[0].startsWith('https://'))) {
                            // 对远程链接进行URL编码，但保留协议部分（http://或https://）
                            const protocol = args[0].startsWith('https://') ? 'https://' : 'http://';
                            const urlWithoutProtocol = args[0].substring(protocol.length);
                            // 对于已经包含百分号编码的部分不进行编码
                            args[0] = protocol + urlWithoutProtocol.split('').map(char => {
                                if (char === '%') {
                                    return char;
                                }
                                return encodeURI(char);
                            }).join('');
                        }
                    }
                }
            }
            
            // 如果没有指定命令，使用默认命令
            if (!command && node.command) {
                command = node.command;
            }
            
            // 如果有命令，发送到MPD服务器
            if (command) {
                let mpdCommand = args.length > 0 ? cmd(command, args) : command;
                
                node.client.sendCommand(mpdCommand)
                    .then(response => {
                        // 尝试根据命令类型选择不同的解析方法
                        try {
                            let result;
                            // 'status' 或 'stats' 使用 parseObject 解析
                            if (command === 'status' || command === 'stats' || command === 'currentsong') {
                                result = mpd.parseObject(response);
                            }
                            // 'listplaylists', 'list' 或以 'find'/'search' 开头的命令使用 parseList 解析
                            else if (command === 'listplaylists' || command === 'list' || command === 'listall' ||
                                    command.startsWith('find') || command.startsWith('search')) {
                                result = mpd.parseList(response);
                            }
                            // 'playlistinfo', 'playlistid', 'listplaylistinfo' 使用 parseNestedList 解析
                            else if (command === 'playlistinfo' || command === 'playlistid' || 
                                    command === 'listplaylistinfo') {
                                result = mpd.parseNestedList(response);
                            }
                            // 其他命令使用 autoparseValues 解析
                            else {
                                result = mpd.autoparseValues(response);
                            }
                            msg.result = result;
                        } catch (e) {
                            // 如果解析失败，返回原始响应
                            msg.result = response;
                        }
                        if ( msg.result ) {
                            node.send([msg, null]);
                        };
                        
                    })
                    .catch(err => {
                        //node.error(`MPD命令错误: ${err.message}`, {error: err});
                        msg.error = err;
                        node.send([msg, null]);
                    });
            }
        });

        // 节点关闭时断开连接
        node.on('close', function(done) {
            if (node.client) {
                node.client.disconnect().then(() => {
                    node.connected = false;
                    node.client = null;
                    done();
                }).catch(err => {
                    node.error(`Disconnect error: ${err.message}`, {error: err});
                    node.client = null;
                    done();
                });
            } else {
                done();
            }
        });

        // 尝试初始连接
        //if (node.host && node.port) {
        //    connect();
        //}
        // Try to connect on startup
        if (this.server) {
            connect();
        } else {
            node.error("MPD server configuration missing");
            node.status({fill: "red", shape: "dot", text: "MPD server configuration missing"});
        }
    }
    
    // Configuration Node for MPD Server
    function MPDServerNode(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host || 'localhost';
        this.port = config.port || 6600;
        this.password = config.password || '';
    }
    RED.nodes.registerType("mpd2", MPDNode);
    RED.nodes.registerType("mpd2-server", MPDServerNode);
};