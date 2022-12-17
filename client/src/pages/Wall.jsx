import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Post from '../deprecated/Post';
import FormComponent from '../components/FormComponent'

export default function Wall() {

  const username = useParams().user;
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState();

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

  const getPosts = () => {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    fetch('/wallpage?username=' + encodeURI(username), requestOptions)
        .then(res => {
          res.json().then(data => {
            setPosts(data);
          });
    });
  }

  // Refresh state every 5 seconds
  useEffect(() => {
    const retrieveData = () => {
      getUser();
      getPosts();
    };
    retrieveData();
    const interval = setInterval(retrieveData, 10000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  var handleCreatePost = (e) => {
        e.preventDefault()
        const title = e.target[0].value
        const description = e.target[1].value
        if (!title || !description) {
          return;
        }
        const creator = localStorage.getItem('username');
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title,
              description: description,
              creator: creator, 
              recipient: username,
            })
        };
        fetch('/createpost', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => console.log(text));
              } else {
                res.json().then(post => {
                  console.log(post);
                  setPosts([post].concat(posts));
                });
              }
            })
        }

  return (
    <div className='posts-root'>
        <h2>{user && user.fullname.S}'s Wall</h2>
        <form className='form-container' onSubmit={e => handleCreatePost(e)}>
          <h2>Create Post</h2>
          <FormComponent name="Title" />
          <FormComponent name="Description" />
          <button className="btn btn-submit" type='submit'>Create</button>
        </form>
        {posts && posts.map(p => 
          <Post key={p.timestamp.S} type={p.type.S} creator={p.creator.S} recipient={p.recipient.S} 
            date={p.date.S} title={p.title.S} description={p.description.S} timestamp={p.timestamp.S} commentroot={p.commentroot.S} />)}
    </div>
  )
}
