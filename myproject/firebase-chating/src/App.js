import "./App.css";
import "./style/styleguide.css";
import "./style/reset.css";

import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../src/db/firebase";

import Chating from "./pages/Chating";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

import { clearUser, setUser } from "./component/Redux/userSlice";
import ChatHome from "./pages/ChatHome";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
        const userData = {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        dispatch(setUser(userData));
      } else {
        navigate("/login");
        dispatch(clearUser());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Routes>
        <Route path="/" element={<ChatHome />} />
        <Route path="/chating" element={<Chating />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}

export default App;
