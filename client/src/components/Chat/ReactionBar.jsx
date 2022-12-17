import { Button, Flex } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../../context/ChatProvider';

export default function ReactionBar({message, handleReact}) {
  const { user } = ChatState();

  const userDidNotReactAlready = (emoji) => {
    return !message[emoji] || JSON.parse(message[emoji].S).indexOf(user.fullname.S) < 0;
  }

  return (
    <Flex p={2} borderRadius={'full'}>
        {userDidNotReactAlready('heart') && 
          <Button key='heart' onClick={() => handleReact('heart')} borderRadius={'full'} bg={'none'} p={1}>❤️</Button>}
        {userDidNotReactAlready('happy') && 
          <Button key='happy' onClick={() => handleReact('happy')} borderRadius={'full'} bg={'none'} p={1}>😀</Button>}
        {userDidNotReactAlready('laugh') && 
          <Button key='laugh' onClick={() => handleReact('laugh')} borderRadius={'full'} bg={'none'} p={1}>😂</Button>}
        {userDidNotReactAlready('angry') && 
          <Button key='angry' onClick={() => handleReact('angry')} borderRadius={'full'} bg={'none'} p={1}>😡</Button>}
    </Flex>
  )
}
