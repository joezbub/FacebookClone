import { Box, useColorModeValue, Button, Flex, Icon, IconButton, Input, InputGroup, InputLeftElement, Spacer, Stack, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import * as moment from 'moment';
import ChatSideBarGroupChatIcon from './ChatSideBarGroupChatIcon';
import ChatSideBarDMIcon from './ChatSideBarDMIcon';
import { ArrowBackIcon } from '@chakra-ui/icons'
import { IonIcon } from '@ionic/react';
import { personCircle } from 'ionicons/icons';

export default function ChatSideBarBody(props) {
  const bg = useColorModeValue("gray.300", "gray.800");
  const searchBg = useColorModeValue("gray.100", "gray.600");

  const { chats, openChat, setOpenChat, searchChat, setSearchChat, socket } = ChatState();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchString, setSearchString] = useState("");

  const reset = () => {
    setSearchString("");
    setSearchResults([]);
    setSearchChat(false);
  }

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    const s = e.target.value.toLowerCase();
    if (!s || s.length === 0) {
      setSearchResults([]);
    } else if (chats) {
      var results = [];
      chats.forEach(chat => {
        // Check if chat name matches
        var name = chat.name.S;
        if (chat.type.S === 'create') {
          name = 'DM:';
        }
        name = name.toLowerCase();
        if (name.includes(s)) {
          results.push(chat);
          return;
        }

        // Check if any members match
        const l = JSON.parse(chat.people.S);
        for (const person of l) {
          if (person.toLowerCase().startsWith(s)) {
            results.push(chat);
            return;
          }
        }
      });
      setSearchResults(results);
    }
  }

  const handleChangeOpenChat = (chat) => {
    var leave = null;
    if (openChat) {
      leave = openChat.uuid.S;
    }
    socket.emit("setup", {uuid: chat.uuid.S, leave: leave});
    setOpenChat(chat);
  }

  return (
    <Flex h='full' flexDir={'column'}>
      <Flex flexDir={'row'} p={4} borderBottom={scrollPosition !== 0 ? '1px' : null} borderColor={scrollPosition !== 0 ? bg : null}>
          {searchChat && <IconButton bg='inherit' mr={2} onClick={reset} icon={<ArrowBackIcon/>} />}
            <InputGroup>
              <InputLeftElement
                  children={<IonIcon icon={personCircle} size="100"/>}
              />
              <Input bg={searchBg} value={searchString} placeholder='Search who to chat with' onClick={() => setSearchChat(true)} onChange={handleSearch}/>
          </InputGroup>
      </Flex>
      <Box
            d="flex"
            flexDir="column"
            p={3}
            h={'100%'}
            w="100%"
            overflowY={'scroll'}
            onScroll={(e) => setScrollPosition(e.target.scrollTop)}
          >
      {
        searchChat ? 
            <Stack onClick={reset}>
              {searchResults.map((chat) => (
                chat.type.S === 'add'
                ? <ChatSideBarGroupChatIcon key={chat.uuid.S} chat={chat} handleChangeOpenChat={handleChangeOpenChat}/> 
                : <ChatSideBarDMIcon key={chat.uuid.S} chat={chat} handleChangeOpenChat={handleChangeOpenChat}/>
              ))}
            </Stack>
        :
          chats && chats.length > 0 ? (
            <Stack >
              {chats.map((chat) => (
                chat.type.S === 'add' 
                ? <ChatSideBarGroupChatIcon key={chat.uuid.S} chat={chat} handleChangeOpenChat={handleChangeOpenChat}/> 
                : <ChatSideBarDMIcon key={chat.uuid.S} chat={chat} handleChangeOpenChat={handleChangeOpenChat}/>
              ))}
            </Stack>
          ) : (
            <Flex justifyContent={'center'}><Text>No Chats Yet!</Text></Flex>
          )
        }
        </Box>  
      </Flex>
      
  )
}
