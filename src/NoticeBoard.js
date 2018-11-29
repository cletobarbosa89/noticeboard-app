import React, { Component } from 'react';
import './App.css';
import firebase from './firebase.js';
// import VoicePlayer from './VoicePlayer';
import Slider from 'react-animated-slider';
import 'react-animated-slider/build/horizontal.css';
import './slider-animations.css';
import './styles.css';

class NoticeBoard extends Component {
  constructor() {
    super();
    this.state = {
      notice: '',
      username: '',
      items: [],
      user: null,
      image: "",
      imageURL: ""
    }
  }
  componentDidMount() {
    const itemsRef = firebase.database().ref('items').orderByChild('timestamp');
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user,
          timestamp: items[item].timestamp,
          profileimg: items[item].profileimg,
          image: items[item].image,
          imageURL: items[item].imageURL
        });
      }
      this.setState({
        items: newState
      });
    });
  }
  render() {
    return (
      <div className='container'>
        <div className="display-slider-item">
        {this.state.items.length ?
        <Slider className="slider-wrapper" autoplay={30000} duration={30000}>
          {this.state.items.map((item, index) => (
              <div
                key={index}
                className="slider-content"
                style={{ background: `url("/default-bg.jpg") no-repeat center center` }}
              >
              {item.imageURL ?
              <div className="inner inner-adjust">
                <div className="column-2 col-1">
                  {item.imageURL && <p className="image-container"><img className="image-slider" src={item.imageURL} alt={item.image} /></p>}
                </div>
                <div className="column-2 col-2">
                  <p><b>{item.title}</b></p>
                </div>
              </div>
              :
              <div className="inner">
                <p><b>{item.title}</b></p>
              </div>
              }
              <section>
                <img src={item.profileimg} alt={item.user} />
                <span>
                  Posted by <strong>{item.user}</strong>
                </span>
              </section>
            </div>
          ))}
        </Slider>
        :
        <div className="slider-content notice-board-empty" style={{ background: `url("/default-bg.jpg") no-repeat center center` }}>
          <div className="inner">
            <p><b>NoticeBoard is empty</b></p>
          </div>
        </div>
        }
        </div>
      </div>
    );
  }
}
export default NoticeBoard;