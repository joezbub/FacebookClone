import { AttachmentIcon, CheckIcon } from '@chakra-ui/icons'
import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

export default function IconButtonAttach({uploaded}) {
  return (
    <Flex
        borderRadius={5}
        bg={useColorModeValue('gray.200', 'gray.600')}
        p={4}
        pt={3}
        pb={3}
        mt={4}
        w={'auto'}
        alignItems='center'
        justifyContent='center'     
        _hover={{bg: useColorModeValue('gray.300', '#3c4657'), cursor: 'pointer', transition: '1s smooth'}}  
    >
        <Text as='b' mr={3}>
            {uploaded ? "Image Added!" : "Attach Image"}
        </Text>
        {uploaded ? <CheckIcon color={'green.400'}/> : <AttachmentIcon/>}
    </Flex>
  )
}
