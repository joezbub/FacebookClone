import { Card, Flex, HStack, Popover, PopoverContent, PopoverTrigger, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../../context/ChatProvider';

export default function Reaction ({ handleReact, emoji, people }) {

  const emojis = {'heart': '❤️', 'happy': '😀', 'laugh': '😂', 'angry': '😡'};

  const EmojiCard = ({ array }) => {
    return (
      <Card p={4}>
        {array.map(item => { 
            return <Flex key={item}>
              <Text ml={2}>
                {item}
              </Text>
            </Flex>
        })}
      </Card>
    )
  }

  return (
    <Popover trigger={'hover'}>
      <PopoverTrigger>
        <Flex
          borderRadius={'full'}
          bg={useColorModeValue('gray.200', 'gray.700')}
          w={'50px'}
          p={1}
          alignItems='center'
          justifyContent={'center'}
          _hover={{ bg: 'gray.600', cursor: 'pointer', transition: '0.3s ease' }}
          onClick={() => handleReact(emoji)}
        >
          {emojis[emoji]}
          <Text ml={2} as={'b'}>{people.length}</Text>
        </Flex>
      </PopoverTrigger>
      <PopoverContent w={'150px'}>
        <EmojiCard array={people} />
      </PopoverContent>
    </Popover>
  )
}
