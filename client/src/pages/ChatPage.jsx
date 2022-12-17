import { Flex, Box, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import ChatMain from "../components/Chat/ChatMain";
import ChatSideBar from "../components/Chat/ChatSideBar";
import { ChatState } from "../context/ChatProvider";
import NavBar from '../components/NavBar/NavBar';
import { HomeState } from "../context/HomeProvider";

const ChatPage = () => {
  const { user } = ChatState();
  const {me} = HomeState();

  return (
    (me && user ?
    <Box>
      <NavBar/>
    <Flex height={'90vh'} align={'center'} justifyContent={'center'} >
      <Flex width={'80%'} height={'90%'} overflow={'hidden'} borderRadius={'10px'} boxShadow={'xl'}>
        <ChatSideBar />
        <ChatMain/>
      </Flex>
    </Flex>
    </Box>
    : <Flex height='100vh' justifyContent={'center'} alignItems={'center'}>
      <Spinner
          size="md"
          margin="auto"
        />
      </Flex>)
  );
};

export default ChatPage;
