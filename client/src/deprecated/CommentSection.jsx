import React, { useEffect, useState } from 'react'
import '../css/main.css'
import CommentInput from './CommentInput';
import DeleteButton from './DeleteButton';
import EditInput from './EditInput';
import LikeButton from './LikeButton';

export default function CommentSection(props) {
  const {root, type} = props;
  const username = localStorage.getItem('username');
  const [opened, setOpened] = useState(false);
  const [comments, setComments] = useState([]);

  let timeoutId = null;

  const getComments = () => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch('/childcomments?id=' + encodeURI(root), requestOptions)
    .then(res => {
      if (!res.ok) {
        res.text().then(text => console.log(text));
      } else {
        res.json().then(data => {
          setComments(data);
        });
      }
    });
  };

  // Refresh like button state every 10 seconds
  useEffect(() => {
    const retrieveData = () => {
      getComments();
    };
    retrieveData();
    // const interval = setInterval(retrieveData, 10000);
    // return () => {
    //   clearInterval(interval);
    // }
  }, []);

  return (
    <React.Fragment>
        <CommentInput parentId={root} type={type} getComments={getComments} />
        <div tabIndex={"0"} onFocus={() => {setOpened(true); clearTimeout(timeoutId); }} onBlur={() => timeoutId = setTimeout(() => setOpened(false))}>
          <button>Open {comments.length} {type}</button>
          {opened && <ul className='dropdown-list'>
            {comments.map(comment => {
              return (<li className="dropdown-element"
                key={comment.uuid.S}>
                {comment.deleted.S === 'true' 
                  ? <div>This comment was deleted</div> 
                  : (<div>
                      <div>{comment.author.S} wrote at {comment.date.S}: </div> 
                      <br></br>
                      <div>{comment.message.S}</div>
                      <LikeButton postId={comment.uuid.S}/>
                      {username === comment.author.S && <EditInput id={comment.uuid.S} getComments={getComments}/>}
                      <br></br>
                      {username === comment.author.S && <DeleteButton commentId={comment.uuid.S} getComments={getComments}/>}
                    </div>)
                }
                
                <CommentSection root={comment.uuid.S} type='replies'/>
                </li>)
            })}
          </ul>}
        </div>
      </React.Fragment>
  )
}
