
import "./App.css";
import React, { createRef, useEffect } from "react";

// component
import HalliGalli from "./halligalli";
import Room from "./room";

// sub module
import io from "socket.io-client";

let socket = io(window.location.href);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      component : <Room renderHalliGalli={this.renderHalliGalli.bind(this)} socket={socket} />
    }
  }

  renderHalliGalli(room_info) {
    this.setState({ component : <HalliGalli room_info={room_info} socket={socket} /> });
  }

  renderRoom() {
    this.setState({ component : <Room renderHalliGalli={this.renderHalliGalli.bind(this)} socket={socket} /> });
  }

  render() {
    return (
      this.state.component
    );
  }
}

export default App;
