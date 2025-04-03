import React, { useState } from 'react'
import "./Login.css"
import assets  from "../../assets/assets"
import { signup, login,resetPass } from '../../config/firebase'

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign up")
  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const onSubmitHandler = (e)=>{
      e.preventDefault();
      if(currentState==="Sign up"){
        signup(username,email,password);
      }else{
        login(email,password)
      }
  }

  return (

    <div className='login'>
      <img className='logo' src={assets.logo_big} alt="" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currentState}</h2>
        {currentState === "Sign up"? <input onChange={(e)=> setUsername(e.target.value)} value={username} type="text" placeholder='username' className="form-input" required /> :""}
        <input onChange={(e)=> setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className="form-input" required />
        <input onChange={(e)=> setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="form-input" required />
        <button type="submit">{currentState ==="Sign up"?"Create Account": "Login"}</button>
        <div className="login-term">
          <input type="checkbox" name="" id="" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login-forgot">
          {
            currentState === "Sign up"
          ?<p className='login-toggle'>Already have an account <span onClick={()=> setCurrentState("Login")}>Login</span></p>
          :<p className='login-toggle'>Create an account <span onClick={()=> setCurrentState("Sign up")}>Click here</span></p>
          
          }
          {currentState === "Login"?<p className='login-toggle'>Forgot Password <span onClick={()=> resetPass(email)}>Reset</span></p> : null }
        </div>
      </form>
    </div>
  )
}

export default Login