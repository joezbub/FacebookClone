import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ChatSideBarHeader from './ChatSideBarHeader';
import ChatSideBarBody from './ChatSideBarBody';

export default function ChatSideBar(props) {
  const bg = useColorModeValue("gray.50", "gray.700");

  return (
    <Flex flex={'1'} bg={bg} flexDir={'column'}>
        <ChatSideBarHeader/>
        <Box h={'93%'}>
          <ChatSideBarBody/>
        </Box>
    </Flex>
  )
}
