import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormComponent from '../components/FormComponent';

export default function Settings() {

  const[me, setMe] = useState(null);
  const news = ['MEDIA', 'ARTS', 'DIVORCE', 'BUSINESS', 'ENVIRONMENT', 'HEALTHY LIVING', 'COLLEGE', 'BLACK VOICES', 'PARENTING', 'STYLE', 'RELIGION', 'WORLD NEWS', 'FIFTY', 'HOME & LIVING', 'GOOD NEWS', 'WELLNESS', 'LATINO VOICES', 'IMPACT', 'FOOD & DRINK', 'TRAVEL', 'THE WORLDPOST', 'COMEDY', 'GREEN', 'POLITICS', 'WOMEN', 'EDUCATION', 'PARENTS', 'SCIENCE', 'TASTE', 'STYLE & BEAUTY', 'WEIRD NEWS', 'MONEY', 'CULTURE & ARTS', 'SPORTS', 'WORLDPOST', 'QUEER VOICES', 'ARTS & CULTURE', 'WEDDINGS', 'CRIME', 'ENTERTAINMENT', 'TECH']


  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    navigate('/');
  }

  const getUser = () => {
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      };
      fetch('/user?username=' + encodeURI(localStorage.getItem('username')), requestOptions)
          .then(res => {
            res.json().then(data => {
              console.log(data)
              setMe(data);
            });
      });
    };
  
  useEffect(() => {
      getUser()
  }, [])

  const handlePasswordChange = (e) => {
      e.preventDefault()
      const pass1 = e.target[0].value
      const pass2 = e.target[1].value
      if (pass1 !== pass2) {
        alert("The passwords are not the same")
      } else if (!pass1) {
        alert("Empty input");
      } else {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'password', value: pass1 })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => alert(err));
                } else {
                  if (!alert('Password change successful')) {
                    window.location.reload();  
                  }
                }
              });
      }
  }

  const handleEmailChange = (e) => {
      e.preventDefault()
      const email = e.target[0].value
      if (!email) {
        alert("Empty input");
      } else {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'email', value: email })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => alert(err));
                } else {
                  if (!alert('Email change successful')) {
                    window.location.reload();  
                  }
                }
              });
      }
  }

  const handleAffiliationChange = (e) => {
      e.preventDefault()
      const affl = e.target[0].value
      if (!affl) {
        alert("Empty affiliation");
      } else {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'affiliation', value: affl })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => alert(err));
                } else {
                  const title = me.username.S + ' updated his affiliation to ' + affl;
                  const description = 'This status update was generated automatically';
                  const params = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title,
                      description: description,
                      creator: me.username.S, 
                      recipient: me.username.S,
                    })
                  }
                  fetch('/createpost', params);
                  if (!alert('Affiliation change successful')) {
                    window.location.reload();  
                  }
                }
              });
      }
  }

  const handleNewsChange = (e) => {
      e.preventDefault()
      var news = []
      for (var i = 0; i < e.target[0].length; i++) {
        if (e.target[0][i].selected) {
          news.push(e.target[0][i].value);
        }
      }
      if (news.length < 2) {
        alert("Please select at least two news categories");
      } else {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'news', value: news })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => alert(err));
                } else {
                  var categories = "";
                  for (var i = 0; i < news.length; ++i) {
                    if (i > 0) {
                      categories = categories.concat(', ' + news[i]);
                    } else {
                      categories = categories.concat(' ' + news[i]);
                    }
                  }
                  const title = me.username.S + ' updated his news categories:' + categories;
                  const description = 'This status update was generated automatically';
                  const params = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title,
                      description: description,
                      creator: me.username.S, 
                      recipient: me.username.S,
                    })
                  }
                  fetch('/createpost', params);
                  if (!alert('News category change successful')) {
                    window.location.reload();  
                  }
                }
              });
      }
  }

  return (
    <div>
      <div className='navbar'>
        <h2>Settings for {me && me.fullname.S}</h2>
        <button onClick={routeChange}>
        Back to Home
        </button>
      </div>
      <div>
        <form className='form-container' onSubmit={e => handlePasswordChange(e)}>
          <h2>Change Password </h2>
          <FormComponent name="New Password" type="password"/>
          <FormComponent name="Retype New Password" type="password" />
          <button className="btn btn-submit" type='submit'>Change</button>
        </form>
      </div>
      <div>
        <form className='form-container' onSubmit={e => handleEmailChange(e)}>
          <h2>Change Email</h2>
          <FormComponent name="New Email"/>
          <button className="btn btn-submit" type='submit'>Change</button>
        </form>
      </div>
      <div>
        <form className='form-container' onSubmit={e => handleAffiliationChange(e)}>
          <h2>Change Affiliation </h2>
          <FormComponent name="New Affiliation"/>
          <button className="btn btn-submit" type='submit'>Change</button>
        </form>
      </div>
      <div>
        <form className='form-container' onSubmit={e => handleNewsChange(e)}>
          <h2>Change News Categories </h2>
          <select name="categories" id="categories" multiple> 
            {news.sort().map(n => {
              const lower = n.toLowerCase();
              return <option value={lower}>{lower}</option>
            })}
            </select>
          <button className="btn btn-submit" type='submit'>Change</button>
        </form>
      </div>
    </div>
  )
}
