import React from 'react';
import ReactSlider from 'react-slider';

import styles from '../assets/style/controls.module.css';
import Refresh from '../assets/image/refresh-page-option.png';
import ArrowRight from '../assets/image/right-arrow.png';

const SOCKET_KEY = 'controls';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  componentDidMount = () => this.props.addSocketListener(SOCKET_KEY, 'updateState', this.handleUpdateState);
  componentWillUnmount = () => this.props.removeSocketListener(SOCKET_KEY);

  handleClose = (event) => {
    event.preventDefault();
    if (event.target === event.currentTarget) {
      this.props.close();
    }
  }

  handleAfterChange = (value) => {
    if (value >= 95) {
      this.props.emitSocketMessage('shutdown', true);
    }
  }

  handleUpdateClick = () => this.props.emitSocketMessage('update', true);

  handleUpdateState = (id, state) => {
    id = Number(id);
    if (id === 0 && state === 'true') {
      this.props.update();
    }
  }

  render() {
    return (
      <div className={styles.background}>
        <div className={styles.sliderouter} onClick={this.handleClose}>
          <ReactSlider 
            value={this.state.value}
            className={styles.slider}
            thumbClassName={styles.thumb}
            trackClassName={styles.track}
            onAfterChange={this.handleAfterChange}
            renderThumb={(props) => <div {...props}><img src={ArrowRight} alt="Right icon" /></div>}
          />
        </div>

        <div className={styles.update}>
          <div className={styles.update_icon}>
            <img src={Refresh} alt="Update icon"  onClick={this.handleUpdateClick} />
          </div>
        </div>
      </div>
    );
  }
}

export default Controls;