import React from "react"
import { Avatar, Box, Button, ButtonGroup, Flex, Heading, HStack, Stack, Text, useColorModeValue, useToast } from '@chakra-ui/react'

export default function AddFriendButton(props) {
    const {me, user} = props;
    const toast = useToast();

    const handleNotifyAddFriend = (friendUsername) => {
        if (me.username.S === friendUsername) {
          return;
        }
        console.log(friendUsername);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              me: me.username.S,
              other: friendUsername,
              type: 'friend'
            })
        };
        fetch('/notify', requestOptions)
        .then(res => {
          if (!res.ok) {
            res.text().then(text => {
              if (text === 'Already notified') {
                toast({
                  title: 'Already notified ' + user.fullname.S,
                  status: 'error',
                  duration: 2000,
                  isClosable: true,
                });
              } else if (text === 'Other person already notified you') {
                toast({
                  title: user.fullname.S + ' already notified you',
                  description: 'Check your notifications',
                  status: 'error',
                  duration: 2000,
                  isClosable: true,
                });
              }
            });
          } else {
            toast({
              title: 'Notified ' + user.fullname.S,
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
          }
        });
      }

      return (
        <Button colorScheme={'green'} mr={5} onClick={() => handleNotifyAddFriend(user.username.S)}>Add Friend</Button>
      )
}