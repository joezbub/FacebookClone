import { AttachmentIcon, CheckIcon } from '@chakra-ui/icons'
import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

export default function UploadImageIcon() {
  return (
    <Flex
        borderRadius={5}
        w={10}
        bg={useColorModeValue('gray.200', 'gray.600')}
        p={2}
        h={10}
        ml={2}
        alignItems='center'
        justifyContent='center'     
        _hover={{bg: useColorModeValue('gray.300', '#3c4657'), cursor: 'pointer', transition: '1s smooth'}}  
    >
        <AttachmentIcon/>
    </Flex>
  )
}
