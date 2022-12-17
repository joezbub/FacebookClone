import React, { useEffect, useState } from 'react'
import { Box, Stack, useColorModeValue } from '@chakra-ui/react'
import CommentComponentChakra from './CommentComponentChakra'
import CommentInputComponentChakra from './CommentInputComponentChakra'
import { useContext } from 'react'
import { HomeState } from '../../context/HomeProvider';

export default function CommentSectionChakra(props) {
  const bgColor = useColorModeValue("gray.100", "#1f2633");
  const {root} = props;
  const [comments, setComments] = useState([]);

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

  useEffect(() => {
    const retrieveData = () => {
      getComments();
    };
    retrieveData();
    const interval = setInterval(retrieveData, 5000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  return (
    <Box p={2} bg={bgColor}>
      <Box w={'full'} h={0} mb={2}></Box>
      <CommentInputComponentChakra parent={root} margin={10} getComments={getComments}/>
        {
          comments.map(
            r => {
              return <CommentComponentChakra
                id={r.uuid.S}
                key={r.uuid.S}
                date={r.date.S}
                replies={parseInt(r.replies.N)}
                deleted={r.deleted.S}
                level={parseInt(r.level.N)}
                name={r.author.S}
                margin={10}
                description={r.message.S}
              />
            })
        }
    </Box>
  )
}
