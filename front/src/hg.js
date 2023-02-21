
class HG {
    constructor() {
        this.player = {};
        this.card = {
            st : ["st1", "st2", "st3", "st4", "st5"],
            ba : ["ba1", "ba2", "ba3", "ba4", "ba5"],
            mg : ["mg1", "mg2", "mg3", "mg4", "mg5"],
            ch : ["ch1", "ch2", "ch3", "ch4", "ch5"],
            am : ["pg", "mk", "ep"]
        }

        this.turn = 1;
        this.delay = 2;
        this.end_score = 5;
        this.is_allow = false;
        this.is_correct = false;
    }

    set() {
        this.player = {};
        this.turn = 1;
        this.is_allow = false;
        this.is_correct = false;
    }

    enter(name) {
        if(this.player[name] != undefined) return;
        if(Object.keys(this.player).length >= 4) return;

        this.player[name] = {
            name : name,
            card : null,
            turn : Object.keys(this.player).length + 1,
            score : 0
        }
    }

    out(name) {
        if(Object.keys(this.player).indexOf(name) != -1) {
            delete this.player[name];
        }
    }

    get_score(name) {
        return this.player[name].score;
    }

    get_card() {
        let fruit_percent = 0.9;
        let random_value = Math.floor(Math.random() * 10) + 1;

        if(random_value > fruit_percent * 10) {
            let animal_card = this.card.am;
            
            return animal_card[Math.floor(Math.random() * animal_card.length)];

        } else {
            let fruit = ["st", "ba", "mg", "ch"];
            let fruit_card = this.card[fruit[Math.floor(Math.random() * fruit.length)]];
            
            return fruit_card[Math.floor(Math.random() * fruit_card.length)];
        }   
    }

    compare() {
        let player_card = Object.values(this.player).map(info => info.card);

        for(let key in this.card) {
            if(key == "am") {
                for(let key2 in this.card[key]) {
                    if(key2 == "pg" && player_card.indexOf(key2) != -1) return true;
                    if(key2 == "mk" && player_card.filter(card => this.card.mg.indexOf(card) != -1).length != 0) return true;
                    if(key2 == "ep" && player_card.filter(card => this.card.st.indexOf(card) != -1).length != 0) return true;
                }

            } else {
                let score = player_card.filter(card => this.card[key].indexOf(card) != -1)

                if(score.length > 1) {
                    score = score.reduce((card1, card2) => parseInt(card1.replace(/[^0-9]/g, "")) + parseInt(card2.replace(/[^0-9]/g, "")));
                    
                } else if(score.length == 1) {
                    score = parseInt(score[0].replace(/[^0-9]/g, ""));
                }
            
                if(score == 5) return true;
            };
        }

        return false;
    }

    open(name) {
        if(this.is_allow) return [null, null, null];
        if(this.player[name].turn != this.turn) return [null, null, null];

        this.player[name].card = this.get_card();
        this.turn = this.turn == Object.keys(this.player).length? 1 : this.turn + 1;
        this.is_allow = true;
        this.is_correct = false;

        return [
            this.player[name].card,
            this.player[Object.keys(this.player)[Object.keys(this.player).map(p => this.player[p].turn).indexOf(this.turn)]].name,
            (() => {
                return new Promise((res, rej) => {
                    setTimeout(() => {
                        this.is_allow = false;
        
                        res();
                    }, this.delay * 1000);
                });
            }).bind(this)
        ]
    } 

    ring(name) {
        if(this.compare()) {
            if(!this.is_correct) {
                this.is_correct = true;
                this.player[name].score++;
    
                return true;
            }

            return null;
        }

        this.player[name].score = this.player[name].score > 0? this.player[name].score - 1 : 0;
        
        return false;
    }

    check() {
        for(let key in this.player) {
            if(this.player[key].score >= this.end_score) {
                this.set();
            
                return true;
            }
        }

        return false;
    }

    print() {
        let temp = "";

        for(let key in this.player) {
            temp += key + " : " + this.player[key].card + "\n";
        }

        console.log(temp);
    }
}

export default HG;