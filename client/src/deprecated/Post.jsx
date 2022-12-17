import React from 'react'
import '../css/main.css'
import CommentInput from './CommentInput';
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';

export default function Post(props) {
  const {title, description, date, creator, type, recipient, timestamp, commentroot} = props;

  return (
    <div className='post-container'>
        <h2>{title}</h2>
        <h4>Created by {creator} for {recipient} on {date}</h4>
        <p>{description}</p>
        <div className='flex'>
            <LikeButton postId={timestamp}/>
            <button>Share</button>
        </div>
        <small>
          <p>Debug: {type}</p>
          <p>Timestamp: {timestamp}</p>
          <p>Comment Root: {commentroot}</p> 
        </small>
        <CommentSection root={commentroot} type='comments'/>
    </div>
  )
}
