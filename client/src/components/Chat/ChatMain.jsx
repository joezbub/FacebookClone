import { Flex, IconButton, Text, Box, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import ChatMainBody from './ChatMainBody';
import ChatMainHeader from './ChatMainHeader';

export default function ChatMain(props) {
  const bg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.400");
  const { openChat } = ChatState();
  
  return (
    <Flex flex={'3'} bg={bg} borderLeft='1px' borderColor={borderColor}>
      {openChat ? (
        <>
          <Flex flexDir={'column'} width={'full'}>
            <ChatMainHeader />
            <ChatMainBody/>
          </Flex>
        </>
      ) : (
        <Flex d="flex" alignItems="center" justifyContent="center" h='full' w='full'>
          <Text fontSize="xx-large">
            Welcome to chats!
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
