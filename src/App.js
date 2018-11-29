import React, { Component } from 'react';
import './App.css';
import { Route, Link } from 'react-router-dom';
import NoticeBoard from './NoticeBoard';
import MyDashboard from './MyDashboard';
import firebase, { auth, provider } from './firebase.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      notice: '',
      username: '',
      items: [],
      user: null
    }
    this.handleChange = this.handleChange.bind(this);
    this.logout = this.logout.bind(this);
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  login() {
    auth.signInWithPopup(provider) 
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }
  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }
  handleSubmit(e) {
    e.preventDefault();
    if(this.state.notice) {
      const itemsRef = firebase.database().ref('items');
      const item = {
        title: this.state.notice,
        user: this.state.user.displayName || this.state.user.email,
        timestamp: -1 * Date.now(),
        profileimg: this.state.user.photoURL
      }
      itemsRef.push(item);
      this.setState({
        notice: '',
        username: '',
        timestamp: '',
        profileimg: ''
      });
    }
  }
  render() {
    return (
      <div className='app'>
        <header>
            <div className="wrapper">
              <Link to="/">
                <h1>SJ Innovation NoticeBoard</h1>
              </Link>
              <div>
                <Link to="/my-dashboard">
                  <button>My Dashboard</button>
                </Link>
              </div>
            </div>
        </header>
        <div>
          <Route exact path="/" component={NoticeBoard} />
          <Route exact path="/my-dashboard" component={MyDashboard} />
        </div>  
      </div>
    );
  }
}
export default App;