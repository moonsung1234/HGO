
let http = require("http");
let express = require("express");
let socket = require("socket.io");
let Matcher = require("./match");

let app = express();
let server = http.createServer(app);
let io = socket(server);
let matcher = new Matcher();

io.on("connection", sk => {
    sk.on("room", () => {
        sk.emit("room", JSON.stringify(matcher.get_all_room()));
    });

    sk.on("create", info => {
        let player_info = JSON.parse(info);

        matcher.create({
            name : player_info.room_name,
            limit : player_info.room_limit,
            sk : sk,
            player : {
                name : player_info.player_name,
                id : sk.id,
            }
        });
        matcher.send({
            player : {
                id : sk.id,
            },
            event : {
                state : "ALL",
                name : "lead",
                data : JSON.stringify({
                    name : player_info.player_name,
                    id : sk.id
                })
            }
        });
        matcher.send({
            player : {
                id : sk.id,
            },
            event : {
                state : sk.id,
                name : "ready",
                data : ""
            }
        });
    }) ;

    sk.on("add", info => {
        let player_info = JSON.parse(info);

        matcher.add({
            name : player_info.room_name,
            sk : sk,
            player : {
                name : player_info.player_name,
                id : sk.id,
            } 
        });
        matcher.send({
            player : {
                id : sk.id,
            },
            event : {
                state : sk.id,
                name : "ready",
                data : ""
            }
        });
    });

    sk.on("ready", () => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "WITHOUT",
                name : "enter",
                data : JSON.stringify([
                    matcher.get_player({
                        name : "",
                        id : sk.id
                    })
                ])
            }
        });
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : sk.id,
                name : "info",
                data : JSON.stringify(matcher.get_player({
                    name : "",
                    id : sk.id
                }))
            }
        });
        console.log(matcher.get_room(sk.id));
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : sk.id,
                name : "enter",
                data : JSON.stringify(matcher.get_room(sk.id).player)
            }
        });
    });

    sk.on("open", () => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "ALL",
                name : "open",
                data : JSON.stringify(matcher.get_player({
                    name : "",
                    id : sk.id
                }))
            }
        });
    });

    sk.on("ring", () => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "ALL",
                name : "ring",
                data : JSON.stringify(matcher.get_player({
                    name : "",
                    id : sk.id
                }))
            }
        });
    });

    sk.on("correct", info => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "ALL",
                name : "correct",
                data : info
            }
        });
    });

    sk.on("wrong", info => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "ALL",
                name : "wrong",
                data : info
            }
        });
    });

    sk.on("open_p", info => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "WITHOUT",
                name : "open_p",
                data : info
            }
        });
    });

    sk.on("close_p", info => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "WITHOUT",
                name : "close_p",
                data : info
            }
        });
    });

    sk.on("disconnect", () => {
        matcher.send({
            player : {
                id : sk.id
            },
            event : {
                state : "ALL",
                name : "out",
                data : JSON.stringify(matcher.get_player({
                    name : "",
                    id : sk.id
                }))
            }
        });
        matcher.delete({
            id : sk.id
        });
    });
});

app.use(express.static(__dirname + "/front/build"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/front/build/index.html");
});

server.listen(80, () => {
    console.log("server run!");
});