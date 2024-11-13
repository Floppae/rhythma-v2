import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/creator-edit");
    } catch (error) {
      alert("Oops! Login is reserved for developers only.");
      window.location.href = "/";
    }
  }

  function handleEmail(event) {
    const emailInput = event.target.value;
    setEmail(emailInput);
    //console.log(email);
  }

  function handlePassword(event) {
    const passwordInput = event.target.value;
    setPassword(passwordInput);
    //console.log(password);
  }

  return (
    <div className="flex flex-col bg-gradient-to-r from-black via-neutral-600 to-black w-screen h-screen flex justify-center items-center">
      <div className="flex">
        <header className="text-3xl text-white mb-5">Developer Login</header>
      </div>
      <form
        onSubmit={handleLogin}
        className="bg-neutral-800 flex flex-col items-center p-5 rounded-lg"
      >
        <input
          className="m-2 p-2 rounded-lg"
          placeholder="Email"
          onChange={handleEmail}
          value={email}
        ></input>
        <input
          className="m-2 p-2 rounded-lg"
          placeholder="Password"
          onChange={handlePassword}
          value={password}
        ></input>
        <div className="w-full p-2 flex justify-center">
          <button type="submit" className="bg-sky-500 text-white p-2 rounded">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
