import React, { Component } from 'react';
import './App.css';
import firebase, { auth, provider } from './firebase.js';
import FileUploader from "react-firebase-file-uploader";
import Textarea from "react-textarea-count";

class App extends Component {
  constructor() {
    super();
    this.state = {
      notice: '',
      username: '',
      items: [],
      user: null,
      imageCheck: false,
      image: "",
      isUploading: false,
      uploading: false,
      progress: 0,
      imageURL: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.uploadImageCheck = this.uploadImageCheck.bind(this);
    this.disabled = false;
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
    if(this.state.notice && !this.disabled) {
      const itemsRef = firebase.database().ref('items');
      const item = {
        title: this.state.notice,
        user: this.state.user.displayName || this.state.user.email,
        timestamp: -1 * Date.now(),
        profileimg: this.state.user.photoURL,
        image: this.state.image,
        imageURL: this.state.imageURL
      }
      itemsRef.push(item);
      this.setState({
        notice: '',
        username: '',
        timestamp: '',
        profileimg: '',
        imageCheck: false,
        image: "",
        isUploading: false,
        uploading: false,
        progress: 0,
        imageURL: ""
      });
    }
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
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
    });
  }
  removeItem(itemId, imageURL) {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
    if(imageURL) {
      let deleteRef = firebase.storage().refFromURL(`${imageURL}`);
      deleteRef.delete().then(function() {
        console.log('File deleted successfully');
      }).catch(function(error) {
        console.log('Error deleting: ' + error);
      });
    }
  }

  handleUploadStart = () => this.setState({ isUploading: true, progress: 0, uploading: true });
  handleProgress = progress => this.setState({ progress });
  handleUploadError = error => {
    this.setState({ isUploading: false });
    console.error(error);
  };
  handleUploadSuccess = filename => {
    this.setState({ image: filename, progress: 100, isUploading: false });
    firebase
      .storage()
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(url => this.setState({ imageURL: url, uploading: false }));
  };

  uploadImageCheck() {
    if(this.state.imageCheck) {
      if(this.state.imageURL) {
        let deleteRef = firebase.storage().refFromURL(this.state.imageURL);
        deleteRef.delete().then(function() {
          console.log('File deleted successfully');
        }).catch(function(error) {
          console.log('Error deleting: ' + error);
        });
      }
      this.setState({imageCheck: false});
      this.setState({image: "", isUploading: false, progress: 0, imageURL: ""});
    } else {
      this.setState({imageCheck: true});
    }
  }

  render() {
    let imageElement;
    if(this.state.imageCheck) {
      this.disabled = (this.state.notice && this.state.imageURL) ? false : true;
    } else {
      this.disabled = (this.state.notice) ? false : true;
    }
    if(this.state.imageCheck) {
      imageElement =  <label style={{backgroundColor: 'steelblue', color: 'white', padding: 10, borderRadius: 4, pointer: 'cursor'}}>
                        Select your image
                        <FileUploader
                          accept="image/*"
                          name="image"
                          randomizeFilename
                          storageRef={firebase.storage().ref("images")}
                          onUploadStart={this.handleUploadStart}
                          onUploadError={this.handleUploadError}
                          onUploadSuccess={this.handleUploadSuccess}
                          onProgress={this.handleProgress}
                        />
                      </label>;
    }
    return (
      <div className="dash-container">
          {this.state.user ? 
            <div>
              <div className='user-profile'>
                  <span onClick={this.logout}><img src={this.state.user.photoURL} alt={this.state.user.displayName}/></span>
              </div>
              <div className='container'>
                <section className='add-item'>
                      <form onSubmit={this.handleSubmit}>
                        <label><input type="text" name="username" placeholder="What's your Name?" onChange={this.handleChange} value={this.state.user.displayName || this.state.user.email} /></label>
                        <label><Textarea countLimit={580} rows={6} maxLength="580" name="notice" placeholder="Add your message here.." onChange={this.handleChange} value={this.state.notice} /></label>
                        <label>{this.state.chars_left}</label>
                        <label><input type="checkbox" checked={ this.state.imageCheck } onChange={ this.uploadImageCheck } disabled={this.state.uploading}/> Do you want to upload image?</label>
                        {this.state.isUploading && <p>Progress: {this.state.progress}</p>}
                        {this.state.imageURL && <img className="image-preview" src={this.state.imageURL} alt={this.state.image} />}
                        {imageElement}
                        <button disabled={this.disabled}>Add Notice</button>
                      </form>
                </section>

                <section className='display-item'>
                    <div className="wrapper">
                      <ul>
                        {this.state.items.map((item) => {
                          return (
                            <li key={item.id}>
                              <h3>{item.user}</h3>
                              {item.imageURL && <p><img className="image-preview" src={item.imageURL} alt={item.image} /></p>}
                              <p><i><b>{item.title}</b></i>
                                {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                                  <button onClick={() => this.removeItem(item.id, item.imageURL)}>Remove</button>
                                : null}
                              </p>
                              {item.profileimg ? 
                              <div className='profile-img'>
                                <img src={item.profileimg} alt={item.user}/>
                              </div>
                              : null}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                </section>
              </div>
            </div>
          : 
            <div className='container'>
              <p>You must be logged in to see the Notices and submit to it. <button onClick={this.login}>Login</button></p>
            </div>
          }
        </div>
    );
  }
}
export default App;