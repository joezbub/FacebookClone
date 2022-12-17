import React, { useEffect, useState } from 'react'
import '../css/main.css'
import FormComponent from '../components/FormComponent';

export default function EditInput(props) {
  const {id, getComments} = props;
  const username = localStorage.getItem('username');

  const handleCreateComment = (e) => {
    e.preventDefault()
      const message = e.target[0].value;
      if (message) {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: message, id: id})
          };
          fetch('/editcomment', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => console.log(err));
                } else {
                  console.log('edited');
                  getComments();
                }
              });
      }
    }

  return (
    <form onSubmit={e => handleCreateComment(e)}>
          <FormComponent/>
          <button type='submit'>Edit</button>
      </form>
  )
}
