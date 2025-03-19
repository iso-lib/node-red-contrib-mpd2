## A node-red node to control a mpd server and receive status updates from the server like the current played song

I have been using [node-red-contrib-mpd](https://flows.nodered.org/node/node-red-contrib-mpd), which is based on the mpd module and has not been updated for over 7 years. When I use it, the connection is often interrupted. Therefore, I developed this  based on the mpd2 module to improve the stability of the connection with the Music Player Daemon.

---

#### You can input commands like this：

* msg.payload = "play"
* msg.payload = "stop"
* msg.payload = "add example.mp3"
* msg.payload = "add https://www.example.com/music.mp3"
* msg.payload = "setvol 80"
* msg.payload = "clear"
* msg.payload = "playlistinfo"
* msg.payload = "status"
* ...

#### If you have any questions, you can submit the issue on [GitHub](https://github.com/iso-lib/node-red-contrib-mpd2)

##### example

```
[
    {
        "id": "ba9d6a9211149b26",
        "type": "mpd2",
        "z": "4195b3120a14282d",
        "name": "",
        "server": "d6bc7cd732aa815f",
        "command": "",
        "x": 890,
        "y": 360,
        "wires": [
            [
                "76f07c969648eee2"
            ],
            [
                "5dc1add0e131ee24"
            ]
        ]
    },
    {
        "id": "b452ec03c66fb2f2",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 440,
        "wires": [
            [
                "8806e7b76ac48b34"
            ]
        ]
    },
    {
        "id": "8806e7b76ac48b34",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "play",
        "func": "msg.payload = \"play\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 490,
        "y": 440,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "679dca6c9a185e9f",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 480,
        "wires": [
            [
                "9977815c72d2df4a"
            ]
        ]
    },
    {
        "id": "9977815c72d2df4a",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "stop",
        "func": "msg.payload = \"stop\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 490,
        "y": 480,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "415b5546f995205c",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 360,
        "wires": [
            [
                "666784dcc4a35689"
            ]
        ]
    },
    {
        "id": "666784dcc4a35689",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "add local music file",
        "func": "//The local music file needs to set the music directory on the MPD server. The configuration file is generally /etc/mpd.conf\n\nmsg.payload = \"add example.mp3\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 530,
        "y": 360,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "09344c63bc5a0e8f",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 400,
        "wires": [
            [
                "5779c5f62841dbac"
            ]
        ]
    },
    {
        "id": "5779c5f62841dbac",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "add remote music url",
        "func": "msg.payload = \"add https://www.example.com/music.mp3\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 540,
        "y": 400,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "f45ce712545d2ee9",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 520,
        "wires": [
            [
                "86be6fd6ebfd6de6"
            ]
        ]
    },
    {
        "id": "86be6fd6ebfd6de6",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "set volume",
        "func": "msg.payload = \"setvol 80\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 510,
        "y": 520,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "b45cfb66185feed2",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 560,
        "wires": [
            [
                "83f988e68149f680"
            ]
        ]
    },
    {
        "id": "83f988e68149f680",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "View playlist",
        "func": "msg.payload = \"playlistinfo\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 510,
        "y": 560,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "104c1fbc14ac9398",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 600,
        "wires": [
            [
                "a93683d5197e546c"
            ]
        ]
    },
    {
        "id": "a93683d5197e546c",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "clear playlist",
        "func": "msg.payload = \"clear\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 510,
        "y": 600,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "38b4156b009987da",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 640,
        "wires": [
            [
                "69cc7549ec7b231b"
            ]
        ]
    },
    {
        "id": "69cc7549ec7b231b",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "status",
        "func": "msg.payload = \"status\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 490,
        "y": 640,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "76f07c969648eee2",
        "type": "debug",
        "z": "4195b3120a14282d",
        "name": "info",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 1050,
        "y": 280,
        "wires": []
    },
    {
        "id": "5dc1add0e131ee24",
        "type": "debug",
        "z": "4195b3120a14282d",
        "name": "event",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 1050,
        "y": 420,
        "wires": []
    },
    {
        "id": "ccd26845a405f846",
        "type": "template",
        "z": "4195b3120a14282d",
        "name": "One time input",
        "field": "payload",
        "fieldType": "msg",
        "format": "handlebars",
        "syntax": "mustache",
        "template": "command_list_begin\nstop\nclear\nsetvol 60\nadd \"example.mp3\"\nplay\ncommand_list_end",
        "output": "str",
        "x": 520,
        "y": 200,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "8c28f97dd43b4318",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 320,
        "y": 200,
        "wires": [
            [
                "ccd26845a405f846"
            ]
        ]
    },
    {
        "id": "2fcc6b59540f9b99",
        "type": "function",
        "z": "4195b3120a14282d",
        "name": "currentsong",
        "func": "msg.payload = \"currentsong\";\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 510,
        "y": 680,
        "wires": [
            [
                "ba9d6a9211149b26"
            ]
        ]
    },
    {
        "id": "c1302ac7d00749a4",
        "type": "inject",
        "z": "4195b3120a14282d",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 330,
        "y": 680,
        "wires": [
            [
                "2fcc6b59540f9b99"
            ]
        ]
    },
    {
        "id": "d6bc7cd732aa815f",
        "type": "mpd2-server",
        "name": "My MPD Server",
        "host": "192.168.1.9",
        "port": "6600",
        "password": ""
    }
]
```
