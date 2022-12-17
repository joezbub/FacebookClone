import React from 'react'
import { useState } from 'react';
import FormComponent from '../components/FormComponent'
import "../css/main.css"
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {

    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    var handleRegister = (e) => {
        e.preventDefault()
        const username = e.target[0].value
        const password = e.target[1].value
        const fullname = e.target[2].value
        const address = e.target[3].value
        const affiliation = e.target[4].value
        const birthday = e.target[5].value
        var news = []
        for (var i = 0; i < e.target[6].length; i++) {
          if (e.target[6][i].selected) {
            news.push(e.target[6][i].value);
          }
        }
        if (news.length < 2) {
          alert('Please select at least two news categories');
          return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username,
              password: password,
              fullname: fullname, 
              address: address, 
              affiliation: affiliation, 
              birthday: birthday,
              news: news
            })
        };
        fetch('/createaccount', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => setErr(text));
              } else {
                localStorage.setItem('username', username)
                navigate("/homepage")
                setErr(null)
              }
            })
        }

  const news = ['MEDIA', 'ARTS', 'DIVORCE', 'BUSINESS', 'ENVIRONMENT', 'HEALTHY LIVING', 'COLLEGE', 'BLACK VOICES', 'PARENTING', 'STYLE', 'RELIGION', 'WORLD NEWS', 'FIFTY', 'HOME & LIVING', 'GOOD NEWS', 'WELLNESS', 'LATINO VOICES', 'IMPACT', 'FOOD & DRINK', 'TRAVEL', 'THE WORLDPOST', 'COMEDY', 'GREEN', 'POLITICS', 'WOMEN', 'EDUCATION', 'PARENTS', 'SCIENCE', 'TASTE', 'STYLE & BEAUTY', 'WEIRD NEWS', 'MONEY', 'CULTURE & ARTS', 'SPORTS', 'WORLDPOST', 'QUEER VOICES', 'ARTS & CULTURE', 'WEDDINGS', 'CRIME', 'ENTERTAINMENT', 'TECH']
  return (
    <div className="centered-div">
        <form className='form-container' onSubmit={e => handleRegister(e)}>
          <h2>Register</h2>
          <FormComponent name="Username" />
          <FormComponent name="Password" type="password"/>
          <FormComponent name="Full Name" />
          <FormComponent name="Address" />
          <FormComponent name="Affiliation" />
          <FormComponent name="Birthday" type="date"/>
          <h4>News Categories : </h4>
          <select name="categories" id="categories" multiple> 
            {news.sort().map(n => {
              const lower = n.toLowerCase();
              return <option value={lower}>{lower}</option>
            })}
            </select>
          <button className="btn btn-submit" type='submit'>Register</button>
      </form>
      <p style={{ "color": "red" }}>{err && err}</p>
    </div>
  )
}
