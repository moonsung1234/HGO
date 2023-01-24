
class HG {
    constructor() {
        this.card = {
            st : ["st1", "st2", "st3", "st4", "st5"],
            ba : ["ba1", "ba2", "ba3", "ba4", "ba5"],
            mg : ["mg1", "mg2", "mg3", "mg4", "mg5"],
            ch : ["ch1", "ch2", "ch3", "ch4", "ch5"],
            am : ["pg", "mk", "ep"]
        }
        this.player = {};
        this.turn = null;
    }

    enter(name) {
        if(this.player[name] != undefined) return;
        if(Object.keys(this.player).length >= 4) return;

        this.player[name] = {
            name : name,
            card : null
        }
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
        let player_card = Object.values(this.player)
                                .map(info => info.card);

        for(let key in this.card) {
            if(key == "am") {
                
            } else {
                let score = player_card
                            .filter(card => this.card[key].indexof(card) != -1)
                            .reduce((card1, card2) => parseInt(card1.replace(/[^0-9]/g, "")) + parseInt(card2.replace(/[^0-9]/g, "")));
            
                if(score == 5) return true;
            };
        }

        return false;
    }

    ring(name) {
        if(this.compare()) {

        }
    }
}