import { Avatar, AvatarBadge, Box, Button, Flex, Input, useColorModeValue, InputGroup, InputLeftElement, Spacer, Stack, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { personCircle } from 'ionicons/icons'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../context/ChatProvider';
import { IonIcon } from '@ionic/react';

export default function ChatSideBarHeader(props) {
  const bg = useColorModeValue("gray.200", "gray.700");
  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    navigate('/');
  }

  return (
    <>
    <Flex alignItems={'center'} h='7%' bg={bg} boxShadow={'0 7px 7px -10px black'}
       padding={'10px'} justify-content={'space-between'} width={'full'}>
      <Text p={4} fontSize={'x-large'} fontWeight={'bold'}>Chats</Text>
      <Spacer></Spacer>
    </Flex>
    </>
  )
}
