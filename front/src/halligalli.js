
import "./App.css";
import React, { createRef, useEffect } from "react";

// sub module
import HG from "./hg";

// image and sound
import back from "./back.PNG";
import bell from "./bell.PNG";
import ding from "./ding.mp3";

class HalliGalli extends React.Component {
  constructor(props) {
    super(props);

    this.socket = this.props.socket;
    this.is_lead = false;
    this.images = this.importAll(require.context("./image", false, /\.(png|PNG|jpe?g|svg)$/));

    this.enter_room();

    this.socket.on("lead", info => {
      let player_info = JSON.parse(info);
      
      this.my_info = player_info;
      this.is_lead = true;

      this.hg = new HG();
      this.hg.enter(this.my_info.sk.id);
    });

    this.socket.on("info", info => {
      this.my_info = JSON.parse(info);
    });

    this.socket.on("enter", info => {
      let player_info = JSON.parse(info);
      
      for(let player of player_info) {
        let ref = createRef();
        let ref2 = createRef();
  
        if(this.is_lead) this.hg.enter(player.sk.id);
  
        this.state.card_component.push([
          player_info,
          this.getCardComponent(player_info, ref, ref2),
          ref,
          ref2
        ]);
      }

      this.setState(this.state);
    });

    this.socket.on("out", info => {
      let player_info = JSON.parse(info);

      if(this.is_lead) this.hg.out(player_info.sk.id);
      
      this.setState({
        card_component : this.state.card_component.filter(c => c[0].name != player_info.name)
      });
    });

    this.socket.on("open", info => {
      if(!this.is_lead) return;

      let player_info = JSON.parse(info);
      let [card, next_player, callback] = this.hg.open(player_info.sk.id);

      if(card) {
        this.state.card_component.map(async (c) => {
          if(c[0].sk.id == player_info.sk.id) {
            player_info.card = card;

            this.socket.emit("open_p", JSON.stringify(player_info));

            let [tag, image] = [c[2].current, c[2].current.querySelector("#card_image")];
          
            image.src = this.images[card + ".PNG"];
            tag.style.transform = "translateX(-50%) rotateY(180deg)";
          
            await callback();

            player_info.name = next_player;

            this.socket.emit("close_p", JSON.stringify(player_info));

            this.state.card_component.map(_c => {
              if(_c[0].sl.id == next_player) {
                let tag = _c[2].current;

                tag.style.transform = "translateX(-50%) rotateY(0deg)";
              }
            });
          }
        });
      }
    });

    this.socket.on("ring", info => {
      if(!this.is_lead) return;

      let player_info = JSON.parse(info);
      let ring = this.hg.ring(player_info.sk.id);

      player_info.score = this.hg.get_score(player_info.sk.id);

      if(ring == true) {
        this.socket.emit("correct", JSON.stringify(player_info));

      } else if(ring == false) {
        this.socket.emit("wrong", JSON.stringify(player_info));

      } else if(ring == null) {
        // pass
      }
    });

    this.socket.on("correct", info => {
      let player_info = JSON.parse(info);

      this.state.card_component.map(c => {
        if(c[0].sk.id == player_info.sk.id) {
          c[3].current.innerHTML = player_info.score;
          c[3].current.style.color = "yellow";
          
          setTimeout(() => {
            c[3].current.style.color = "white";
          }, 1500);
        }
      });
    });

    this.socket.on("wrong", info => {
      let player_info = JSON.parse(info);

      this.state.card_component.map(c => {
        if(c[0].sk.id == player_info.sk.id) {
          c[3].current.innerHTML = player_info.score;
          c[3].current.style.color = "red";
          
          setTimeout(() => {
            c[3].current.style.color = "white";
          }, 1500);
        }
      });
    });

    this.socket.on("open_p", info => {
      let player_info = JSON.parse(info);

      this.state.card_component.map(async (c) => {
        if(c[0].sk.id == player_info.sk.id) {
          let [tag, image] = [c[2].current, c[2].current.querySelector("#card_image")];
        
          image.src = this.images[player_info.card + ".PNG"];
          tag.style.transform = "translateX(-50%) rotateY(180deg)";
        }
      });
    });

    this.socket.on("close_p", info => {
      let player_info = JSON.parse(info);

      this.state.card_component.map(c => {
        if(c[0].sk.id == player_info.sk.id) {
          let tag = c[2].current;

          tag.style.transform = "translateX(-50%) rotateY(0deg)";
        }
      });
    });

    this.socket.emit("ready", "");
  }

  importAll(r) {
    let images = {};
  
    r.keys().map((item, i) => images[item.replace("./", "")] = r(item));
    
    return images;
  }

  get_player() {
    while(true) {
      let player_name = prompt("이름을 입력해주세요 : ");
    
      if(player_name.length > 0 && player_name.length < 10) {
        return player_name;
      }
    }
  }

  enter_room() {
    let room_info = this.props.room_info;
    let player_name = this.get_player();

    if(room_info.room_state == "create") {
      this.socket.emit(room_info.room_state, JSON.stringify({
        room_name : room_info.room_name,
        room_limit : 4,
        player_name : player_name
      }));
    
    } else if(room_info.room_state == "add") {
      this.socket.emit(room_info.room_state, JSON.stringify({
        room_name : room_info.room_name,
        player_name : player_name
      }));
    }
  }

  handleCardClick(e) {
    this.socket.emit("open", JSON.stringify(this.my_info));
  }

  handleBellClick(e) {
    e.target.style.animation = "shake 0.5s";

    new Audio(ding).play();
    setTimeout(() => e.target.style.animation = "", 500);

    this.socket.emit("ring", JSON.stringify(this.my_info));
  }

  getCardComponent(player_info, ref, ref2) {
    return (
      <div 
        id="card1"
        style={{
          display: "inline-block",
          position: "relative",
          width:"25%",
          height: "100%"
        }}
      >
        <div
          id="images"
          ref={ref}
          onClick={player_info != null? this.handleCardClick.bind(this) : null}
          style={{
            left: "50%",
            position: "relative",
            transform: "translateX(-50%)",
            transformStyle: "preserve-3d",
            transition: "all 1s",
            width: "40%",
            height: "70%",
          }}
        >
          <img 
            id="card_image"
            src={this.images["st1.PNG"]}
            style={{
              position: "absolute",
              transform: "rotateY(180deg)",
              width: "100%",
              height: "100%",
              border: "2px solid black",
              borderRadius: "20px",
              backfaceVisibility: "hidden",
              zIndex: 1
            }}
          />
          <img 
            id="back_image"
            src={back}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              border: "2px solid black",
              borderRadius: "20px",
              backfaceVisibility: "hidden",
              zIndex: 2
            }}
          />
        </div>
        <div 
          id="player"
          style={{
            position: "relative",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            width: "50%",
            height: "15%",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2vw",
            color: "white",
            fontWeight: "bold",
            WebkitTextStroke: "1px black"
          }}
        >
          {player_info != null? player_info.name : "ㅡ"}
        </div>
        <div
          id="score"
          ref={ref2}
          style={{
            position: "relative",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            width: "40%",
            height: "10%",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2vw",
            color: "white",
            fontWeight: "bold",
            background: "#FF99CC"
          }}
        >
          0
        </div>
      </div>
    );
  }

  render() {
    return (
      <div 
        id="hg"
        style={{
          display: "block",
          width: "100vw",
          height: "100vh"
        }}
      >
        <div
          id="menu_layer"
          style={{
            width: "100%",
            height: "5%",
            background: "black"
          }}
        >

        </div>
        <div 
          id="up_layer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: "100%",
            height: "45%"
          }}
        >
          <img
            id="bell"
            src={bell}
            onClick={this.handleBellClick.bind(this)}
            style={{
              width: "15%",
              height: "60%"
            }}
          />
        </div>
        <div 
          id="down_layer"
          style={{
            width: "100%",
            height: "50%",
            background: "gray"
          }}
        >
          {this.state.card_component.map(c => c[1])}
        </div>
      </div> 
    );
  }
}

export default HalliGalli;
