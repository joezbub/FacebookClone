import { Avatar, Box, Card, Flex, Input, InputGroup, InputLeftElement, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react'
import MsgComponent from '../components/Chat/MessageComponent';
import Reactions from '../components/Chat/Reaction';

export default function Test() {
  const reactors = [
    {
      "emoji" : '😡',
      "name" : 'Sahith'
    },
    {
      "emoji" : '😭',
      "name" : 'Joseph'
    }
  ]
  
  const EmojiCard = ({ array }) => {
    return (
      <Card p={4}>
        {array.map(item => { 
            return <Flex>
              {item.emoji}
              <Text ml={2}>
                {item.name}
              </Text>
            </Flex>
        })}
      </Card>
    )
  }
  return (
    <EmojiCard array={reactors}/>
  )
}
