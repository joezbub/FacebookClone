import React, { useEffect } from 'react'
import CommentComponentChakra from './CommentComponentChakra'

import { Box, Avatar, Stack, Text, Flex, HStack, Button, InputGroup, Input, InputRightElement, useColorModeValue } from '@chakra-ui/react'
import { useState } from 'react';
import { HomeState } from '../../context/HomeProvider';

export default function CommentInputComponentChakra({ parent, margin, getComments }) {
    const bgColor = useColorModeValue("white", "gray.600");
    const [str, setStr] = useState("");

    const {me} = HomeState();

    const handleChange = (e) => {
        setStr(e.target.value);
    }

    const handleCreateComment = () => {
          const message = str;
          if (message) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message, parent: parent, author: localStorage.getItem('username') })
            };
            fetch('/createcomment', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => console.log(err));
                } else {
                  getComments();
                }
              });
          }
          setStr("");
      }

  return (
    me && 
    <div style={{marginLeft: margin}}>
        <Flex h='full'>
            <Flex h="100%">
                <Avatar
                    size='sm'
                    name={me.fullname.S}
                    src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${me.username.S}-profilepic-${me.profilepic?.S}`}
                    marginRight='10px'
                ></Avatar>
            </Flex>
            <Box width='full' mb={2}>
                <InputGroup w='full'>
                    <Input bg={bgColor} variant='filled' pr='4.5rem' onChange={(e) => handleChange(e)} value={str}/>
                    <InputRightElement width='4.5rem' >
                        <Button colorScheme={'blue'} h='1.75rem' size={'sm'} mr={2} onClick={() => handleCreateComment()}>Post</Button>
                    </InputRightElement>
                </InputGroup>
            </Box>
        </Flex>
    </div>
  )
}
