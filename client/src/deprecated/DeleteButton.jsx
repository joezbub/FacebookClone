import React, { useEffect, useState } from 'react'
import '../css/main.css'

export default function DeleteButton(props) {
  const {commentId, getComments} = props;

  const handleClick = () => {
    const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: commentId
          })
      };
      fetch('/deletecomment', requestOptions)
          .then(res => {
            if (!res.ok) {
              res.text().then(text => console.log(text));
            } else {
              getComments();
            }
          });
  }
  
  return (
    <button onClick={() => handleClick()}>
      Delete Comment
    </button> 
  )
}
