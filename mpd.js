module.exports = function(RED) {
    "use strict";
    var mpd = require('mpd');
    var events = require('events');

    // 存储多个 MPD 服务器的连接
    var connections = {};

    // MPD 服务器配置节点
    function MpdServerNode(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        node.host = n.host;
        node.port = n.port;
        node.connected = false;

        node.eventEmitter = new events.EventEmitter();
        node.eventEmitter.setMaxListeners(0);

        // 初始化计数器
        node.reconnectAttempts = 0;
        node.maxReconnectAttempts = 5;
        node.initialDelay = 1000;

        this.connect(); // 调用原型方法
    }

    MpdServerNode.prototype.getID = function() {
        return "[" + this.host + ":" + this.port + "]";
    };

    MpdServerNode.prototype.connect = function() {
        var node = this;
        var id = node.getID();
        
        // 清理旧连接
        if (connections[id] && connections[id].disconnecting) {
            delete connections[id];
        }

        if (!connections[id]) {
            var newConnection = mpd.connect({ port: node.port, host: node.host });
            connections[id] = newConnection;
            newConnection.instances = 0;
            newConnection.reconnectAttempts = 0; // 绑定到连接对象

            // 清除旧事件监听器
            newConnection.removeAllListeners();

            newConnection.on('error', (err) => {
                node.log(`MPD connet error: ${err}`);
                node.connected = false;
                node.eventEmitter.emit('disconnected'); // 触发断开事件
            });

            newConnection.on('ready', () => {
                node.log(`Successfully connected to MPD server ${node.host}:${node.port}`);
                node.connected = true;
                newConnection.reconnectAttempts = 0; // 重置计数器
                node.eventEmitter.emit('connected');
            });

            newConnection.on('end', () => {
                if (!newConnection.disconnecting) {
                    node.log(`Disconnect from MPD server and attempt to reconnect...`);
                    node.connected = false;
                    node.eventEmitter.emit('disconnected');

                    if (newConnection.reconnectAttempts < node.maxReconnectAttempts) {
                        const delay = node.initialDelay * Math.pow(2, newConnection.reconnectAttempts);
                        newConnection.reconnectAttempts++;
                        setTimeout(() => {
                            node.connect(); // 重新连接
                        }, delay);
                    } else {
                        node.log('The maximum number of reconnections has been reached, and the connection has been abandoned');
                    }
                }
            });
        }
        connections[id].instances += 1;
        node.client = connections[id];
    };

    MpdServerNode.prototype.disconnect = function() {
        var id = this.getID();
        if (connections[id]) {
            connections[id].instances -= 1;
            if (connections[id].instances === 0) {
                connections[id].disconnecting = true;
                connections[id].socket.destroy();
                setTimeout(() => {
                    if (connections[id] && connections[id].instances === 0) {
                        delete connections[id];
                    }
                }, 5000);
            }
        }
    };

    RED.nodes.registerType("mpd-server", MpdServerNode);

    // MPD 输出节点
    function MpdOutNode(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        node.topic = n.topic;
        node.server = RED.nodes.getNode(n.server);
        node.status({
            fill: "red",
            shape: "ring",
            text: "not connected"
        });

        node.on('input', function(m) {
            if (!node.server.connected) {
                node.error("MPD server not connected");
                return;
            }
            
            try {
                // 校验命令格式
                if (typeof m.payload !== 'string' || !mpd.cmd(m.payload)) {
                    throw new Error(`Illegal MPD command: ${m.payload}`);
                }
                
                const options = m.options || [];
                node.server.client.sendCommand(mpd.cmd(m.payload, options), (err, msg) => {
                    if (err) {
                        node.error(`Command execution failed: ${err}`);
                        node.server.eventEmitter.emit('disconnected'); // 触发断开事件
                        return;
                    }
                    var message = m;
                    if (m.rawOutput === true) {
                        message.payload = parseMessageRaw(msg);
                    } else {
                        message.payload = mpd.parseArrayMessage(msg);
                    }
                    if (node.topic.length) {
                        message.topic = node.topic;
                    }
                    if (message.payload) {
                        node.send(message);
                    }
                });
            } catch (error) {
                node.error(`Input processing error: ${error.message}`);
                node.server.eventEmitter.emit('disconnected'); // 触发断开事件
            }
        });

        node.server.eventEmitter.on('connected', function() {
            node.status({
                fill: "green",
                shape: "dot",
                text: "connected"
            });
        });

        node.server.eventEmitter.on('disconnected', function() {
            node.status({
                fill: "red",
                shape: "ring",
                text: "not connected"
            });

            // 尝试重连
            setTimeout(() => {
                node.server.connect();
            }, 2000); // 2秒后重连
        });

        node.on("close", function() {
            node.server.disconnect();
        });
    }
    RED.nodes.registerType("mpd out", MpdOutNode);

    // MPD 输入节点
    function MpdInNode(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var songinfo = {};
        node.topic = n.topic;
        node.server = RED.nodes.getNode(n.server);
        node.status({
            fill: "red",
            shape: "ring",
            text: "not connected"
        });

        node.server.eventEmitter.on('connected', function() {
            node.server.client.on('system', function(name) {
                var msg = {};
                msg.topic = node.topic; // 使用配置的 topic
                msg.payload = {};
				msg.songinfo = {};
                node.server.client.sendCommand(mpd.cmd("currentsong", []), function(err, message) {
                    if (err) {
                        node.log('[MPD] - Error: ' + err);
                    }
                    msg.payload.currentsong = mpd.parseKeyValueMessage(message);
					if (Object.keys(msg.payload.currentsong).length === 0) {
					    console.log('Currentsong is empty');
					} else {
						songinfo = msg.payload.currentsong;
					};
                    node.server.client.sendCommand(mpd.cmd('status', []), function(err, message) {
                        if (err) {
                            node.log('[MPD] - Error: ' + err);
                        }
                        msg.payload.status = mpd.parseKeyValueMessage(message);
                        msg.songinfo = songinfo;
                        node.send(msg);
                    });
                });
            });

            node.status({
                fill: "green",
                shape: "dot",
                text: "connected"
            });
        });

        node.server.eventEmitter.on('disconnected', function() {
            node.status({
                fill: "red",
                shape: "ring",
                text: "not connected"
            });

            // 尝试重连
            setTimeout(() => {
                node.server.connect();
            }, 2000); // 2秒后重连
        });

        node.on("close", function() {
            node.server.disconnect();
        });
    }
    RED.nodes.registerType("mpd in", MpdInNode);

    function parseMessageRaw(msg) {
        var result = [];
        msg.split('\n').forEach(function(m) {
            if (m.length === 0) {
                return;
            }
            var keyValue = m.match(/([^ ]+): (.*)/);
            if (keyValue === null) {
                return;
            }
            if (keyValue.length !== 3) {
                return;
            }
            var obj = {};
            obj[keyValue[1]] = keyValue[2];
            result.push(obj);
        });
        return result;
    }
};