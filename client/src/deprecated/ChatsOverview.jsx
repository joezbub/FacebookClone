import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import * as moment from 'moment';
import { Link } from 'react-router-dom';

export default function ChatsOverview() {

  const username = localStorage.getItem('username');
  const [user, setUser] = useState(null);
  // const [chats, setChats] = useState([]);
  const [openChat, setOpenChat] = useState(null);

  const getUser = () => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch('/user?username=' + encodeURI(username), requestOptions)
        .then(res => {
          res.json().then(data => {
            setUser(data);
          });
    });
  };

  // const getChats = () => {
  //   const requestOptions = {
  //     method: 'GET',
  //     headers: { 'Content-Type': 'application/json' }
  //   };
  //   fetch('/chats?username=' + encodeURI(username), requestOptions)
  //       .then(res => {
  //         res.json().then(data => {
  //           console.log(data);
  //           setChats(data);
  //         });
  //   });
  // }

  // // Refresh state every 5 seconds
  // useEffect(() => {
  //   const retrieveData = () => {
  //     // getUser();
  //     // getChats();
  //   };
  //   retrieveData();
  //   const interval = setInterval(retrieveData, 5000);
  //   return () => {
  //     clearInterval(interval);
  //   }
  // }, [])

  useEffect(() => {
    console.log(openChat);
  }, [openChat]);

  return (
    <div>
        <h2>{user && user.fullname.S}'s Chats</h2>
        {chats.map(chat => { 
          return <div key={chat.uuid.S}>
                <h3>{chat.name.S}</h3>
                <h5>{chat.people.S}</h5>
                <p>Last active: {moment(parseInt(chat.timestamp.N)).fromNow()} </p>
                <button onClick={() => {
                  setOpenChat(chat);
                }}>Open Chat</button>
            </div> 
        })}
        <br/><br/><br/>
        {openChat && <Chat key={openChat.uuid.S} username={username} name={openChat.name.S} uuid={openChat.uuid.S}
           people={openChat.people.S} getChats={getChats} setOpenChat={setOpenChat}></Chat>
}
      <br/><br/>
      <Link to="/"><button>Back to home</button></Link>
    </div>
  )
}
