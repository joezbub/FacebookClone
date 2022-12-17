import React from 'react'
import FormComponent from '../components/FormComponent'
import '../css/main.css'
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.getItem('username') && navigate("/homepage");
  })

  const [err, setErr] = useState(null);

  var handleSubmit = (e) => {
    e.preventDefault()
    const username = e.target[0].value
    const password = e.target[1].value
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    };
    fetch('/login', requestOptions)
        .then(res => {
          if (!res.ok) {
            res.text().then(text => setErr(text));
          } else {
            localStorage.setItem('username', username);
            navigate("/homepage");
            setErr(null);
          }
        });
    }

    var handleChangePassword = (e) => {
      e.preventDefault()
      const password = e.target[0].value
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attribute: "password",
            value: password
          })
      };
      fetch('/changeaccount', requestOptions)
          .then(res => {
            if (!res.ok) {
              res.text().then(text => setErr(text));
            } else {
              setErr(null)
            }
          })
      }

  return (
    <div className='centered-div'>
        <form className='form-container' onSubmit={e => handleSubmit(e)}>
          <h2>Log In</h2>
            <FormComponent name="Username"/>
            <FormComponent name="Password" type="password"/>
            <button className="btn btn-submit" type='submit'>Log In</button>
            <a href="/register">Sign Up</a>
            <br />
            <a href="/changepassword">Forgot Password?</a>
        </form>
        <p style={{"color": "red"}}>{err && err}</p>
    </div>
  )
}
