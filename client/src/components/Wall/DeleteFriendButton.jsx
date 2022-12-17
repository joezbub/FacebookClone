import React from "react"
import { Avatar, Box, Button, ButtonGroup, Flex, Heading, HStack, Stack, Text, useColorModeValue, useToast } from '@chakra-ui/react'
import { ellipsisVerticalOutline, navigate } from 'ionicons/icons'

export default function DeleteFriendButton(props) {
    const {me, user, setMe} = props;
    const toast = useToast();


    const handleDeleteFriend = () => {
        const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: me.username.S,
            friend: user.username.S
        })
        };
        fetch('/deletefriend', requestOptions)
        .then(res => {
        if (!res.ok) {
            res.text().then(text => console.log(text));
        } else {
             toast({
                title: 'Deleted friend: ' + user.fullname.S,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            res.json().then(data => setMe(data));
        }
        });
    }

      return (
        <Button colorScheme={'red'} mr={5} onClick={() => {
            handleDeleteFriend();
        }}>Delete Friend</Button>
      )
}