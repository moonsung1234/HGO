
let http = require("http");
let express = require("express");
let socket = require("socket.io");

let app = express();
let server = http.createServer(app);
let io = socket(server);

let player = [];

function get_id(sid) {
    for(let p of player) {
        if(p.sid == sid) {
            return p.id;
        }
    }

    return null;
}

io.on("connection", sk => {
    sk.on("info", info => {
        let player_info = JSON.parse(info);

        if(player.length == 0) sk.emit("lead", "");
        player.push({ id : player_info.id, sid : sk.id });

        console.log(player_info.id + " connected! " + player.length);
    });

    sk.on("ready", () => {
        player.map(p => {
            if(p.sid != sk.id) {
                sk.emit("enter", JSON.stringify({ id : p.id, length : player.length }));
                io.to(p.sid).emit("enter", JSON.stringify({ id : get_id(sk.id), length : player.length }));
            }
        });
    });

    sk.on("open", () => {
        player.map(p => {
            io.to(p.sid).emit("open", JSON.stringify({ id : get_id(sk.id) }));
        });
    });

    sk.on("ring", () => {
        player.map(p => {
            io.to(p.sid).emit("ring", JSON.stringify({ id : get_id(sk.id) }));
        });
    });

    sk.on("correct", info => {
        player.map(p => {
            io.to(p.sid).emit("correct", info);
        });
    });

    sk.on("wrong", info => {
        player.map(p => {
            io.to(p.sid).emit("wrong", info);
        });
    });

    sk.on("open_p", info => {
        player.map(p => {
            if(p.sid != sk.id) {
                io.to(p.sid).emit("open_p", info);
            }
        });
    });

    sk.on("close_p", info => {
        player.map(p => {
            if(p.sid != sk.id) {
                io.to(p.sid).emit("close_p", info);
            }
        });
    });

    sk.on("disconnect", () => {
        console.log(get_id(sk.id) + " disconnected! " + player.length);
        
        player.map(p => {
            io.to(p.sid).emit("out", JSON.stringify({ id : get_id(sk.id) }));
        });
        player.splice(player.map(p => p.sid).indexOf(sk.id), 1);
    });
});

app.use(express.static(__dirname + "/front/build"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/front/build/index.html");
});

server.listen(80, () => {
    console.log("server run!");
});