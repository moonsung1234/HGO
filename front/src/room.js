
import React, { createRef } from "react";

class Room extends React.Component {
    constructor(props) {
        super(props);

        this.socket = this.props.socket;
        this.state = { room_component : [] }

        this.socket.on("room", info => {
            let all_room = JSON.parse(info);
            this.state.room_component = [];

            for(let room of all_room) {
                this.state.room_component.push([
                    room,
                    this.getRoomComponent(room)
                ]);
            }

            this.setState(this.state);
        });
        
        this.iter = setInterval(() => {
            this.socket.emit("room", "");
        }, 1000);
    }
    
    handleCreateRoom(e) {
        let room_name = prompt("Please write your room's name."); 

        this.props.renderHalliGalli({
            room_name : room_name,
            room_state : "create"
        });
    }

    handleEnterRoom(e) {
        let room_name = e.currentTarget.querySelector("#name").innerText;

        this.props.renderHalliGalli({
            room_name : room_name,
            room_state : "add"
        });
    }

    getRoomComponent(room_info) {
        return (
            <div
                onClick={this.handleEnterRoom.bind(this)}
                style={{
                    width: "100%",
                    height: "12%",
                    borderBottom: "1px solid gray"
                }}
            >
                <div
                    id="state"
                    style={{
                        display: "inline-block",
                        width: "15%",
                        height: "100%",
                        textAlign: "center"
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            transform: "translateY(-50%)",
                            top: "50%",
                        }}
                    >
                        ㅡ
                    </div>
                </div>
                <div
                    id="name"
                    style={{
                        display: "inline-block",
                        width: "70%",
                        height: "100%",
                        textAlign: "center",
                        fontWeight: "bolder",
                        fontSize: "1.5vw"
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            transform: "translateY(-50%)",
                            top: "50%",
                        }}
                    >
                        {room_info.name}
                    </div>
                </div>
                <div
                    id="count"
                    style={{
                        display: "inline-block",
                        width: "15%",
                        height: "100%",
                        textAlign: "center",
                        fontSize: "1.5vw"
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            transform: "translateY(-50%)",
                            top: "50%",
                        }}
                    >
                        {room_info.player.length + "/" + room_info.limit}
                    </div>
                </div>
            </div>
        );
    }

    getMenuComponent() {
        return (
            <div
                id="menu"
                style={{
                    width: "100%",
                    height: "10%",
                    background: "skyblue",
                    boxShadow: "7px 7px 7px gray"
                }}
            >
                <div
                    id="room_create"
                    style={{
                        display: "inline-block",
                        width: "30%",
                        height: "100%"
                    }}
                >
                    <input
                        type="button"
                        value="Create Room"
                        onClick={this.handleCreateRoom.bind(this)}
                        style={{
                            position: "relative",
                            transform: "translate(-50%, -50%)",
                            left: "50%",
                            top: "50%",
                            width: "60%",
                            height: "60%",
                            border: "1px solid black",
                            borderRadius: "7px"
                        }}
                    />
                </div>
                {/* <div
                    id="room_search"
                    style={{
                        display: "inline-block",
                        width: "30%",
                        height: "100%"
                    }}
                >
                    <input
                        type="text"
                        placeholder="room name"
                        style={{
                            position: "relative",
                            transform: "translateY(-50%)",
                            top: "50%",
                            width: "100%",
                            height: "30%",
                            padding: "8px",
                            border: "1px solid black",
                            borderRadius: "10px"
                        }}
                    />
                </div> */}
            </div>
        );
    }

    render() {
        return (
            <div 
                id="room"
                style={{
                    display: "block",
                    width: "100vw",
                    height: "100vh",
                    background: "skyblue"
                }}
            >
                <div
                    id="list"
                    style={{
                        position: "relative",
                        transform: "translate(-50%, -50%)",
                        left: "50%",
                        top: "50%",
                        display: "block",
                        width: "60%",
                        height: "80%",
                        background: "white"
                    }}
                >                    
                    {this.getMenuComponent()}
                    <div
                        style={{
                            width: "100%",
                            height: "90%",
                            overflow: "auto"
                        }}
                    >
                        {this.state.room_component.map(c => c[1])}
                    </div>
                </div>
            </div>
        );
    }
}

export default Room;
