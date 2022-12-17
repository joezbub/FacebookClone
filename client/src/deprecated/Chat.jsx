import React, { useEffect, useState } from 'react';
import * as moment from 'moment';

export default function Chat(props) {
  const {username, name, uuid, people, getChats, setOpenChat} = props;
  const [messages, setMessages] = useState([]);

  const getMessages = () => {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch('/messages?id=' + encodeURI(uuid), requestOptions)
        .then(res => {
          res.json().then(data => {
            setMessages(data);
          });
    });
  }

  const handleLeaveChat = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          username: username,
          id: uuid
        })
    };
    fetch('/leavechat', requestOptions)
        .then(res => {
          if (res.ok) {
            // getChats();
            setOpenChat(null);
          }
        });
  }

  // // Refresh state every 5 seconds
  // useEffect(() => {
  //   const retrieveData = () => {
  //     getMessages();
  //   };
  //   retrieveData();
  //   const interval = setInterval(retrieveData, 5000);
  //   return () => {
  //     clearInterval(interval);
  //   }
  // }, [])

  var handleMessageChat = (e) => {
        e.preventDefault()
        const message = e.target[0].value;
        const author = username;
        if (!message) {
          return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author: author,
              message: message,
              id: uuid,
            })
        };
        fetch('/message', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => console.log(text));
              } else {
                // getChats();
                getMessages();
              }
            })
        }

  return (
    <div>
        <h2>Opened Chat: {name}</h2>
        <button>Invite Friend</button>
        <button onClick={() => handleLeaveChat()}>Leave Chat</button>
        {messages && messages.map(message => { 
          return <div key={message.timestamp.N}>
            <p>{message.author.S}: {message.message.S} <small>{moment(parseInt(message.timestamp.N)).fromNow()}</small></p>
          </div>
        })}
        <form onSubmit={e => handleMessageChat(e)}>
          <input name="message" />
          <button type='submit'>Send</button>
        </form>
    </div>
  )
}
