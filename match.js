
class Matcher {
    constructor() {
        this.room = {};
    }

    #hash() {
        return Math.random().toString(16).substr(2, 14);
    }

    /**
     * @param {object} info 
     * @param {string} info.name
     * @param {number} info.limit
     * @param {object} info.player
     * @param {string} info.player.name
     * @param {*} info.player.sk
     */
    create(info) {
        let room_hash = this.#hash();

        this.room[room_hash] = {
            name : info.name,
            limit : info.limit,
            player : [ info.player ]
        }
    }

    /**
     * @param {object} info 
     * @param {string} info.room_name
     * @param {object} info.player
     * @param {string} info.player.name
     * @param {*} info.player.sk
     */
    add(info) {
        Object.keys(this.room).map(r => {
            if(r.name == info.room_name) {
                r.player.push(info.player);
            }
        });
    }

    /**
     * @param {object} info 
     * @param {string} info.name
     */
    find(info) {
        let room_hash = Object.keys(this.room);

        for(let i in room_hash) {
            let hash = room_hash[i];

            for(let j in this.room[hash].player) {
                let player = this.room[hash].player[j];

                if(info.name == player.name) {
                    return i;
                }
            }
        }

        return -1;
    }

    /**
     * @param {object} info 
     * @param {object} info.player
     * @param {string} info.player.name
     * @param {object} info.event 
     * @param {string} info.event.state ALL || WITHOUT || [NAME]
     * @param {string} info.event.name
     * @param {string} info.event.data
     */
    send(info) {
        let room_index = this.find(info.player);

        if(room_index != -1) {
            let room_hash = Object.keys(this.room)[room_index];
            let event_state = info.event.state;

            if(event_state == "ALL") {
                this.room[room_hash].player.map(p => {
                    p.sk.emit(info.event.name, info.event.data);
                });

            } else if(event_state == "WITHOUT") {
                this.room[room_hash].player.map(p => {
                    if(info.player.name != p.name) {
                        p.sk.emit(info.event.name, info.event.data);
                    }
                });

            } else {
                this.room[room_hash].player.map(p => {
                    if(info.event.state == p.name) {
                        p.sk.emit(info.event.name, info.event.data);
                    }
                });
            }
        }
    }

    /**
     * @param {object} info 
     * @param {string} info.name
     */
    delete(info) {
        let room_index = this.find(info);

        if(room_index != -1) {
            let hash = Object.keys(this.room)[room_index];

            if(this.room[hash].player.length <= 1) {
                delete this.room[hash];
            
            } else {
                this.room[hash].player = this.room[hash].player.filter(p => p.name != info.name);
            }
        }
    }
}

module.exports = Matcher;
