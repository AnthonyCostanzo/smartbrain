import React, { useState } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageForm from './components/ImageForm/ImageForm';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        value_area: 350
      }
    }
  }
}

const App = () =>  {
  const [input,setInput] = useState("");
  const [imageUrl,setImageUrl] = useState("");
  const [box,setBox] = useState({});
  const [route,setRoute] = useState("signin");
  const [isSignedIn,setSignIn] = useState(false)
  const [user,setUser] = useState({
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  });
  
  const loadUser = (data) => {
    setUser(data)
  }

  const calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }
  
  const displayFaceBox = (box) => {
    setBox(box);
  }

  const onInputChange = (event) => {
    setInput(event.target.value);
  }

  const onImageSubmit = () => {
    setImageUrl(input);
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input
      })
    })
    .then(response=>response.json())
    .then(response => {
        if (response) {
          fetch('https://infinite-forest-59915.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: user.id
          })
        })
        .then(response => response.json())
        .then(count => {
        setUser(user=>({...user,entries: count}))
        })
      }
    displayFaceBox(calculateFaceLocation(response))
  })
  .catch(err => console.log(err));
  }
  const onRouteChange = (route) => {
    if (route === 'signout') {
      setSignIn(false)
    } else if (route === 'home') {
      setSignIn(true)
    }
    setRoute(route);
  }
  return (
    <div className="App">
      <Particles className='particles'
      params={particlesOptions}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      { route === 'home'
      ? <div>
          <Logo />
          <Rank
            name={user.name}
            entries={user.entries}
          />
          <ImageForm
            onInputChange={onInputChange}
            onImageSubmit={onImageSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          : (
          route === 'signin'
          ? <SignIn loadUser={loadUser} onRouteChange={onRouteChange}/>
          : <Register loadUser={loadUser} onRouteChange={onRouteChange}/>
        )
      }
    </div>
  );
}


export default App;