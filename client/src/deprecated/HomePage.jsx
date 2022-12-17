import React, { useEffect, useState } from 'react'
import { useNavigate, useResolvedPath } from 'react-router-dom'
import FormComponent from '../components/FormComponent';
import '../css/main.css'
import Post from '../components/Post';
import { Toast } from '../components/Toast'

export default function HomePage() {

  const navigate = useNavigate();

  const username = localStorage.getItem('username');
  const [me, setMe] = useState(null);
  const [friends, setFriends] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchSelected, setSearchSelected] = useState(false);
  const [posts, setPosts] = useState();

  const [notifications, setNotifications] = useState([]);
  const [viewNotifications, setViewNotifications] = useState(false);

  let timeoutId1 = null;
  let timeoutId2 = null;

  const routeChange = () =>{ 
    navigate('/settings');
  }

  const getUser = () => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch('/user?username=' + encodeURI(username), requestOptions)
        .then(res => {
          res.json().then(data => {
            if (JSON.stringify(data) !== JSON.stringify(me)) {
              setMe(data);
            }
          });
    });
  };

  const getPosts = () => {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    fetch('/homepage?username=' + encodeURI(username), requestOptions)
        .then(res => {
          res.json().then(data => {
            setPosts(data);
          });
    });
  }

  const getNotifications = () => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch('/notifications?username=' + encodeURI(username), requestOptions)
    .then(res => {
      if (!res.ok) {
        res.text().then(text => console.log(text));
      } else {
        res.json().then(data => {
          console.log(data)
          setNotifications(data)
        });
      }
    });
  }

  useEffect(() => {
    var promises = [];
    if (me && me.friends) {
      for (const item of me.friends.L) {
        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        promises.push(fetch('/user?username=' + encodeURI(item.S), requestOptions));
      }
      Promise.all(promises).then(responses => {
        Promise.all(responses.map(response => {
          return response.json();
        })).then(values => {
          if (JSON.stringify(values) !== JSON.stringify(friends)) {
            setFriends(values);
          }
        });
      });
    }
  }, [me]);

  // Refresh state every 5 seconds
  useEffect(() => {
    const retrieveData = () => {
      console.log('home page deprecated');
      setMe(getUser(localStorage.getItem('username')));
      getNotifications();
      getPosts();
    };
    retrieveData();
    const interval = setInterval(retrieveData, 5000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  const handleSearch = (e) => {
    const str = e.target.value;
    fetch('/search?string=' + encodeURI(str))
        .then(res => res.json())
        .then(data => setUsers(data))
  }

  const handleNotifyAddFriend = (friendUsername) => {
    if (me.username.S === friendUsername) {
      return;
    }
    console.log(friendUsername);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          me: me.username.S,
          other: friendUsername,
          type: 'friend'
        })
    };
    fetch('/notify', requestOptions)
    .then(res => {
      if (!res.ok) {
        res.text().then(text => console.log(text));
      } else {
        console.log("notified");
      }
    });
  }

  const handleAcceptNotification = (notification) => {
    handleDeleteNotification(notification.username.S, notification.timestamp.N, notification.uuid.S);
    if (notification.type.S === 'friend') {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          me: notification.username.S,
          other: notification.other.S
        })
      };
      fetch('/addfriend', requestOptions)
      .then(res => {
        if (!res.ok) {
          res.text().then(text => console.log(text));
        } else {
          console.log("Add friend worked");
          res.json().then(data => setMe(data));
        }
      });
    } else {

    }
  }

  const handleDeleteNotification = (username, timestamp, uuid) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username,
          timestamp: timestamp,
          uuid: uuid
        })
    };
    fetch('/deletenotification', requestOptions)
    .then(res => {
      if (!res.ok) {
        res.text().then(text => console.log(text));
      } else {
        setNotifications(notifications.filter(notification => {
          return notification.username.S !== username || notification.timestamp.N !== timestamp || notification.uuid.S !== uuid
        }));
      }
    });
  }
  
  const handleLogOut = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username
      })
    };
    console.log(requestOptions);
    fetch('/logout', requestOptions)
    .then(res => {
      if (!res.ok) {
        res.text().then(text => console.log(text));
      } else {
        console.log("Logout successful");
      }
    });
    localStorage.removeItem('username');
    navigate("/");
  }
  return (
    <>
    <div className='root'>
    <div className='navbar'>
      {me ? <h3>Welcome, {me.fullname.S}</h3> : null}
      <div className='nav-bar-buttons'>
        <div tabIndex={"0"} onFocus={() => {setViewNotifications(true); clearTimeout(timeoutId1); }} onBlur={() => timeoutId1 = setTimeout(() => setViewNotifications(false))}>
          <button style={{height:'30px'}}>Notifications: {notifications.length}</button>
          {viewNotifications && <ul className='dropdown-list'>
            {notifications.map(notification => {
              return (<li className="dropdown-element"
              key={notification.uuid.S}>
                <div>{notification.message.S}</div>
                <div>
                <button className='action-btn' 
                  onClick={() => handleAcceptNotification(notification)} >
                  Accept
                </button>
                <button className='action-btn'
                  onClick={() => handleDeleteNotification(notification.username.S, notification.timestamp.N, notification.uuid.S)}>Reject</button>
                </div>
              </li>)
            })}
          </ul>}
        </div>
        &nbsp;&nbsp;
        <button style={{height:'30px'}} onClick={() => navigate(`/${me.username.S}/wall`)}>My Wall</button>
        &nbsp;&nbsp;
        <button style={{height:'30px'}} onClick={routeChange}>Settings</button>
        &nbsp;&nbsp;
        <button style={{height:'30px'}} onClick={() => handleLogOut()}>Logout</button>
      </div>
    </div>
    <div className='center'>
      <div className='searchbar-container' tabIndex={"0"} onFocus={() => {setSearchSelected(true); clearTimeout(timeoutId2); }} onBlur={() => timeoutId2 = setTimeout(() => setSearchSelected(false))}>
        <input type="text" className='friend-search' onChange={e => handleSearch(e)} />
        {searchSelected && <ul className='dropdown-list'>
          {users.map(user => {
            return (<li className="dropdown-element" key={user.username.S} onClick={() => handleNotifyAddFriend(user.username.S)}>{user.fullname.S}</li>)
          })}
        </ul>}
      </div>
    </div>
    <div className='main-area-root'>
      <div className='sidebar-root'>
        <h2>Menu</h2>
        <button>News</button>
      </div>
      <div className='posts-root'>
        <h2>Posts</h2>
        {posts && posts.map(p => 
          <Post key={p.timestamp.S} type={p.type.S} creator={p.creator.S} recipient={p.recipient.S} 
          date={p.date.S} title={p.title.S} description={p.description.S} timestamp={p.timestamp.S} commentroot={p.commentroot.S}/>)}
      </div>
      <div className='friends-root'>
        <h2>Friends</h2>
        {me && me.friends && friends && friends.length === me.friends.L.length && me.friends.L.map((friend, index) => {
          return (
            <div key={friend.S} className='friend-entry'>
              <p><a href={'/' + friend.S + '/wall'}><b>{friends[index].fullname.S}</b></a> {(friends[index].active.N === '1') ? <font color='green'>is active</font> : <font color='red'>is not active</font>}</p>
              <button onClick={() => handleDeleteFriend(me.username.S, friend.S)}>Delete friendship</button>
            </div>
          );
        })}
      </div>
    </div>
    </div>
    </>
  )
}
