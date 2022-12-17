import { Avatar, AvatarBadge, Button, Flex, useColorModeValue, FormControl, Input, Spacer, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Lottie from "lottie-react";
import { ChatState } from '../../context/ChatProvider';
import animationData from './animations/pinjump.json'
import Messages from './Messages';
import UploadImageIcon from './UploadImageIcon';

export default function ChatMainBody(props) {

  const bg = useColorModeValue("gray.200", "gray.500");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const username = localStorage.getItem('username');
  const { openChat, setOpenChat, user, getChats, searchChat, reactionClicked, socket } = ChatState();

  const getMessages = () => {
    setLoading(true);
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch('/messages?id=' + encodeURI(openChat.uuid.S), requestOptions)
        .then(res => {
          res.json().then(data => {
            setLoading(false);
            setMessages(data);
          });
    });
  }

  useEffect(() => {
    setInputMessage("");
    getMessages();

    socket.on("connected", () => {setSocketConnected(true)});
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, [openChat])

  useEffect(() => {
    socket.on("message received", (message) => {
      setMessages([...messages, message]);
    });
    socket.on("reaction received", (data) => {
      var newMessages = [...messages];
      newMessages[data.index] = data.message;
      setMessages(newMessages);
    });
  });

  const sendMessage = (e) => {
    if (e.key !== 'Enter' || inputMessage.length === 0) {
      return;
    }
    socket.emit('stop typing', openChat.uuid.S);
    const author = username;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author,
          message: inputMessage,
          id: openChat.uuid.S,
        })
    };
    setInputMessage("");
    fetch('/message', requestOptions)
        .then(res => {
          if (!res.ok) {
            res.text().then(text => console.log(text));
          } else {
            res.json().then(data => {
              socket.emit('new message', {uuid: openChat.uuid.S, message: data} );
              setMessages([...messages, data])
              getChats(username);
            });
          }
        })
    }

  const typingHandler = (e) => {
    setInputMessage(e.target.value)

    if (!socketConnected) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit('typing', openChat.uuid.S);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 5000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        setTyping(false);
        socket.emit('stop typing', openChat.uuid.S);
      }
    }, timerLength);
  };


  return (
    <Flex flexDir={'column'} justifyContent={'flex-end'} height={'full'} padding={'10px'} width={'full'} overflowY={'hidden'}>
      {loading ? (
        <Spinner
          size="md"
          justifyContent={'center'}
          alignItems={'center'}
          margin="auto"
        />
      ) : (
        <>
        {
          messages.length === 0 
          ?
          <Flex margin='auto' justifyContent={'center'} alignItems={'center'}>
            <Text fontSize='lg'>No Messages Yet!</Text>
          </Flex>
          :
          <Flex flexDirection={'column'} overflowY={'scroll'}>
            <Messages messages={messages} setMessages={setMessages}/>
          </Flex>
        }
        </>
      )}

      <FormControl
        onKeyDown={sendMessage}
        isRequired
        mt={3}
      >
        
        {istyping ? (
          <Flex>
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ marginBottom: 15, marginLeft: 10 }}
            />
          </Flex>
        ) : (
          <></>
        )}
        <Flex>
          <Input
            variant="filled"
            bg={bg}
            p={3}
            value={inputMessage}
            placeholder="Enter a message"
            onChange={typingHandler}
            ref={(searchChat || reactionClicked) ? null : input => input && input.focus()}
          /> 
        </Flex>
      </FormControl>
    </Flex>
  )
}
