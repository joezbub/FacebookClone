import React from 'react'
import { useToast } from '@chakra-ui/react'

export default function Toast(props) {
    const {name} = props
    const toast = useToast()
    return (
          toast({
            title: 'You have a friend request!',
            description: `${name} has sent you a friend request.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
        })
    )
  }