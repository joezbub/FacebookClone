import { Flex, IconButton, Text, Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import MessageComponent from './MessageComponent';
import { ChatState } from '../../context/ChatProvider';

export default function Messages(props) {

  const {messages, setMessages} = props;

  const changeMessage = (ind, message) => {
    var tmp = [...messages];
    tmp[ind] = message;
    console.log(tmp);
    setMessages(tmp);
  }
  
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <MessageComponent key={i} index={i} message={m} changeMessage={changeMessage} />
        ))}
    </ScrollableFeed>
  )
}
