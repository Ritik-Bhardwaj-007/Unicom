import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './server/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Provider, connect } from 'react-redux';
import { legacy_createStore } from '@reduxjs/toolkit';
import 'semantic-ui-css/semantic.min.css';

import Login from './components/Auth/Login/LoginComponent';
import Register from './components/Auth/Register/RegisterComponent';
import { combinedReducers } from './store/reducer';
import { setUser } from './store/actionCreater';
import { AppLoader } from './components/AppLoader/AppLoader.component';

const store = legacy_createStore(combinedReducers);

const Main = (props) => {
  const navigate = useNavigate();
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        props.setUser(user);
        navigate("/");
      }
      else {
        props.setUser(null);
        navigate("/login");
      }
    })
  }, []);

  const location = useLocation();

  return (
    <>
      <AppLoader loading={props.loading && location.pathname === "/"} />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}


const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => { dispatch(setUser(user)) }
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    loading: state.channel.loading,
  }
}

const Index = connect(mapStateToProps, mapDispatchToProps)(Main);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Index />
    </BrowserRouter>
  </Provider>
);

