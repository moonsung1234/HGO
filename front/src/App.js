
import "./App.css";
import React, { createRef, useEffect } from "react";

// component
import Room from "./room";

// sub module
import io from "socket.io-client";
import HG from "./hg";

// image and sound
import back from "./back.PNG";
import bell from "./bell.PNG";
import ding from "./ding.mp3";

function importAll(r) {
  let images = {};

  r.keys().map((item, i) => images[item.replace("./", "")] = r(item));
  
  return images;
}

let images = importAll(require.context("./image", false, /\.(png|PNG|jpe?g|svg)$/));

let socket = io(window.location.href);

class HalliGalli extends React.Component {
  constructor(props) {
    super(props);

    this.is_lead = false;
  
    let player_id = "";

    while(true) {
      player_id = prompt("이름을 입력해주세요 : ");
    
      if(player_id.length > 0 && player_id.length < 10) {
        break;
      }
    }

    this.my_info = { id : player_id };
    let ref = createRef();
    let ref2 = createRef();

    this.state = { 
      card_component : [
        [
          { name : this.my_info.id },
          this.getCardComponent({ name : this.my_info.id }, ref, ref2),
          ref,
          ref2
        ]
      ] 
    };

    socket.on("lead", () => {
      this.is_lead = true;
      this.hg = new HG();
      this.hg.enter(this.my_info.id);
    });

    socket.on("enter", info => {
      let player_info = JSON.parse(info);
      let ref = createRef();
      let ref2 = createRef();

      if(this.is_lead) this.hg.enter(player_info.id);

      this.state.card_component.push([
        { name : player_info.id },
        this.getCardComponent({ name : player_info.id }, ref, ref2),
        ref,
        ref2
      ]);

      if(player_info.length == this.state.card_component.length) {
        this.setState(this.state);
      }
    });

    socket.on("out", info => {
      let player_info = JSON.parse(info);

      if(this.is_lead) this.hg.out(player_info.id);
      
      this.setState({
        card_component : this.state.card_component.filter(c => c[0].name != player_info.id)
      });
    });

    socket.on("open", info => {
      if(!this.is_lead) return;

      let player_info = JSON.parse(info);
      let [card, next_player, callback] = this.hg.open(player_info.id);

      if(card) {
        this.state.card_component.map(async (c) => {
          if(c[0].name == player_info.id) {
            socket.emit("open_p", JSON.stringify({
              id : player_info.id,
              card : card
            }));

            let [tag, image] = [c[2].current, c[2].current.querySelector("#card_image")];
          
            image.src = images[card + ".PNG"];
            tag.style.transform = "translateX(-50%) rotateY(180deg)";
          
            await callback();

            socket.emit("close_p", JSON.stringify({ id : next_player }));

            this.state.card_component.map(_c => {
              if(_c[0].name == next_player) {
                let tag = _c[2].current;

                tag.style.transform = "translateX(-50%) rotateY(0deg)";
              }
            });
          }
        });
      }
    });

    socket.on("ring", info => {
      if(!this.is_lead) return;

      let player_info = JSON.parse(info);
      let ring = this.hg.ring(player_info.id);

      player_info["score"] = this.hg.get_score(player_info.id);

      if(ring == true) {
        socket.emit("correct", JSON.stringify(player_info));

      } else if(ring == false) {
        socket.emit("wrong", JSON.stringify(player_info));

      } else if(ring == null) {
        // pass
      }
    });

    socket.on("correct", info => {
      let player_info = JSON.parse(info);

      this.state.card_component.map(c => {
        if(c[0].name == player_info.id) {
          c[3].current.innerHTML = player_info.score;
          c[3].current.style.color = "yellow";
          
          setTimeout(() => {
            c[3].current.style.color = "white";
          }, 1500);
        }
      });
      // alert(player_info.id + " 1점 추가!");
    });

    socket.on("wrong", info => {
      let player_info = JSON.parse(info);

      this.state.card_component.map(c => {
        if(c[0].name == player_info.id) {
          c[3].current.innerHTML = player_info.score;
          c[3].current.style.color = "red";
          
          setTimeout(() => {
            c[3].current.style.color = "white";
          }, 1500);
        }
      });
    });

    socket.on("open_p", info => {
      /*
      info = {
        id : [player id],
        card : [image path]
      }
      */
      let player_info = JSON.parse(info);

      this.state.card_component.map(async (c) => {
        if(c[0].name == player_info.id) {
          let [tag, image] = [c[2].current, c[2].current.querySelector("#card_image")];
        
          image.src = images[player_info.card + ".PNG"];
          tag.style.transform = "translateX(-50%) rotateY(180deg)";
        }
      });
    });

    socket.on("close_p", info => {
      /*
      info = {
        id : [player id]
      }
      */
      let player_info = JSON.parse(info);

      this.state.card_component.map(c => {
        if(c[0].name == player_info.id) {
          let tag = c[2].current;

          tag.style.transform = "translateX(-50%) rotateY(0deg)";
        }
      });
    });

    socket.emit("info", JSON.stringify(this.my_info));
    socket.emit("ready", "");
  }

  handleCardClick(e) {
    socket.emit("open", JSON.stringify(this.my_info));
  }

  handleBellClick(e) {
    e.target.style.animation = "shake 0.5s";

    new Audio(ding).play();
    setTimeout(() => e.target.style.animation = "", 500);

    socket.emit("ring", JSON.stringify(this.my_info));
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
            src={images["st1.PNG"]}
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

function App() {
  return (
    <Room />
  )
}

export default App;
