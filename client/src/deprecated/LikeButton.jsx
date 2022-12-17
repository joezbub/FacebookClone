import React, { useEffect, useState } from 'react'
import '../css/main.css'

export default function LikeButton(props) {
  const {postId} = props;
  const username = localStorage.getItem('username');
  const [liked, setLiked] = useState(false);
  const [reactors, setReactors] = useState([]);
  const [hover, setHover] = useState(false);

  const getReactors = () => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch('/comment?id=' + encodeURI(postId), requestOptions)
    .then(res => {
      if (!res.ok) {
        res.text().then(text => console.log(text));
      } else {
        res.json().then(data => {
          data && setReactors(data.likes.L)
        });
      }
    });
  }

  // Refresh like button state every 10 seconds
  useEffect(() => {
    const retrieveData = () => {
      getReactors();
    };
    retrieveData();
    // const interval = setInterval(retrieveData, 10000);
    // return () => {
    //   clearInterval(interval);
    // }
  }, []);


  const handleClick = () => {
    if (!liked) {
      // User liked this post
      const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId,
              username: username,
            })
        };
        fetch('/like', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => console.log(text));
              } else {
                res.json().then(reactors => {
                  console.log('like returned');
                  console.log(reactors);
                  setReactors(reactors)
                });
              }
            });
    } else {
      // User undo like
      const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId,
              username: username,
            })
        };
        fetch('/undolike', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => console.log(text));
              } else {
                res.json().then(reactors => {
                  console.log('undo like returned');
                  console.log(reactors);
                  setReactors(reactors)
                });
              }
            })
    }
    setLiked(!liked);
  };

  useEffect(() => {
    reactors && setLiked(reactors.map(reactor => reactor.S).indexOf(username) >= 0);
  }, [reactors]);

  return (
    <div onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} >
      <button onClick={() => handleClick()}>
        {liked ? "Liked" : "Like"} ({reactors ? reactors.length : 0} liked)
      </button>
      {hover && <ul className='dropdown-list'>
            {reactors.map(reactor => {
              return (<li className="dropdown-element">
                <p>{reactor.S}</p>
              </li>)
            })}
          </ul>}
    </div>
    
  )
}
