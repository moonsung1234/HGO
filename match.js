
class Matcher {
    constructor() {
        this.room = {};
        this.player = {};
        this.sk = {};
    }

    #hash() {
        return Math.random().toString(16).substr(2, 14);
    }

    /**
     * @param {object} info 
     * @param {string} info.name
     * @param {number} info.limit
     * @param {any} info.sk
     * @param {object} info.player
     * @param {string} info.player.name
     * @param {string} info.player.id
     */
    create(info) {
        let room_hash = this.#hash();
        
        this.room[room_hash] = {
            name : info.name,
            limit : info.limit,
            player : [ info.player ]
        }
        this.player[info.player.id] = info.player;
        this.sk[info.player.id] = info.sk;
    }

    /**
     * @param {object} info 
     * @param {string} info.name
     * @param {any} info.sk
     * @param {object} info.player
     * @param {string} info.player.name
     * @param {string} info.player.id
     */
    add(info) {
        for(let room_hash in this.room) {
            if(this.room[room_hash].name == info.name) {
                this.room[room_hash].player.push(info.player);
            }
        }

        this.player[info.player.id] = info.player;
        this.sk[info.player.id] = info.sk;
    }

    /**
     * @param {object} info 
     * @param {string} info.name
     */
    find_by_name(info) {
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
     * @param {string} info.id
     */
    find_by_id(info) {
        let room_hash = Object.keys(this.room);

        for(let i in room_hash) {
            let hash = room_hash[i];

            for(let j in this.room[hash].player) {
                let player = this.room[hash].player[j];

                if(info.id == player.id) {
                    return i;
                }
            }
        }

        return -1;
    }

    /**
     * @param {object} info 
     * @param {object} info.player
     * @param {string} info.player.id
     * @param {object} info.event 
     * @param {string} info.event.state ALL || WITHOUT || [NAME]
     * @param {string} info.event.name
     * @param {string} info.event.data
     */
    send(info) {
        let room_index = this.find_by_id(info.player);

        if(room_index != -1) {
            let room_hash = Object.keys(this.room)[room_index];
            let event_state = info.event.state;

            if(event_state == "ALL") {
                this.room[room_hash].player.map(p => {
                    this.sk[p.id].emit(info.event.name, info.event.data);
                });

            } else if(event_state == "WITHOUT") {
                this.room[room_hash].player.map(p => {
                    if(info.player.id != p.id) {
                        this.sk[p.id].emit(info.event.name, info.event.data);
                    }
                });

            } else {
                this.room[room_hash].player.map(p => {
                    if(info.event.state == p.id) {
                        this.sk[p.id].emit(info.event.name, info.event.data);
                    }
                });
            }
        }
    }

    /**
     * @param {object} info 
     * @param {string} info.id
     */
    delete(info) {
        let room_index = this.find_by_id(info);

        if(room_index != -1) {
            let hash = Object.keys(this.room)[room_index];

            if(this.room[hash].player.length <= 1) {
                delete this.room[hash];
            
            } else {
                this.room[hash].player = this.room[hash].player.filter(p => p.id != info.id);
            }
        }
    }

    /**
     * @param {object} info
     * @param {string} info.name 
     * @param {string} info.id
     */
    get_player(info) {
        for(let player_hash of Object.keys(this.player)) {
            if((info.name == this.player[player_hash].name) || (info.id == this.player[player_hash].id)) {
                return this.player[player_hash];
            }
        }

        return null;
    }

    get_room(id) {
        return this.room[Object.keys(this.room)[this.find_by_id({ id : id })]];
    }

    get_all_room() {
        return Object.keys(this.room).map(h => this.room[h]);
    }
}

module.exports = Matcher;
