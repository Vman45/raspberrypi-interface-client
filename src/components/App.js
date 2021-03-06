import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import WebSocket from 'ws';

import '../assets/style/index.css';
import Main from './Main';
import PC from './PC';
import Audio from './Audio';
import Controls from './Controls';
import Update from './Update';

const CHANNEL_MESSAGE_REGEX = /^([a-zA-Z0-9]+)((;([a-zA-Z0-9{}():"',.@#-\s\\]+))+)$/;
const LAYER = {
  NONE: 'none',
  CONTROLS: 'controls',
  UPDATE: 'update'
};

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      layer: LAYER.NONE,
    };

    this.listeners = {};
  }

  componentDidMount = () => {
    this.ws = new WebSocket(`ws://localhost:${process.env.REACT_APP_SOCKET_PORT}`);
    this.ws.onopen = () => this.ws.send(`authenticate;${process.env.REACT_APP_SOCKET_AUTH_KEY};1`);
    this.ws.onmessage = this.handleSocketMessage;
  };

  componentWillUnmount = () => this.ws.close();

  handleSocketMessage = (event) => {
    const message = event.data;
    if (message.match(CHANNEL_MESSAGE_REGEX)) {
      const args = message.split(';');
      const channel = args[0];
      args.shift();
      
      for (const key of Object.keys(this.listeners)) {
        if (this.listeners[key][channel]) {
          const callback = this.listeners[key][channel];
          callback(...args);
        }
      }
    }
  }

  addSocketListener = (key, channel, callback) => {
    console.log(`addSocketListener : ${key} ${channel}`);
    if (!this.listeners[key]) {
      this.listeners[key] = {};
    }
    this.listeners[key][channel] = callback;
  }

  removeSocketListener = (key) => {
    console.log(`removeSocketListener : ${key}`);
    delete this.listeners[key];
  }

  emitSocketMessage = (channel, data) => this.ws.send(`${channel};${data}`);

  handlePointerDown = () => {
    if (this.pointerDownTimeout != null) {
      clearTimeout(this.pointerDownTimeout);
    }

    this.pointerDownTimeout = setTimeout(this.handleUpdateClick, 6 * 1000);
  };

  handlePointerUp = () => {
    clearTimeout(this.pointerDownTimeout);
    this.pointerDownTimeout = null;
  };
  
  handleUpdateClick = () => this.setState({ layer: LAYER.CONTROLS });

  render() {
    return (
      <div className="app" onPointerDown={this.handlePointerDown} onPointerUp={this.handlePointerUp}>
        {this.state.layer === LAYER.CONTROLS &&
          <Controls emitSocketMessage={this.emitSocketMessage} addSocketListener={this.addSocketListener} removeSocketListener={this.removeSocketListener} update={() => this.setState({ layer: LAYER.UPDATE })} close={() => this.setState({ layer: LAYER.NONE })} />
        }

        {this.state.layer === LAYER.UPDATE &&
          <Update addSocketListener={this.addSocketListener} removeSocketListener={this.removeSocketListener} close={() => this.setState({ layer: LAYER.NONE })} />
        }

        <>
          <div className="content">
            <BrowserRouter>
              <Switch>
                <Route path='/pc' exact component={() => <PC addSocketListener={this.addSocketListener} removeSocketListener={this.removeSocketListener} />} />
                <Route path='*' component={Main} />
              </Switch>
            </BrowserRouter>
          </div>

          <div className="audio">
            <Audio />
          </div>
        </>
      </div>
    );
  }
}

export default App;