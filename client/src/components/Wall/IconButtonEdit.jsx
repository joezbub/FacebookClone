import { AttachmentIcon, CheckIcon, EditIcon } from '@chakra-ui/icons'
import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react'
import { IonIcon } from '@ionic/react'
import { camera } from 'ionicons/icons'
import React from 'react'


export default function IconButtonEdit() {
  return (
    <Flex
        borderRadius={5}
        bg={useColorModeValue('gray.300', 'gray.500')}
        p={3}
        mb={4}
        w={'auto'}
        alignItems='center'
        justifyContent='center'     
        _hover={{bg: useColorModeValue('gray.400', '#7c8091'), cursor: 'pointer', transition: '1s smooth'}}  
    >
        <IonIcon icon={camera} size="100"/>
    </Flex>
  )
}
