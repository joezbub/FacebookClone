import { Avatar, AvatarBadge, Box, Button, Flex, Spacer, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import Profile from '../General/Profile';
import ChatPreview from './ChatPreview';

export default function ChatSideBarDMIcon({chat, handleChangeOpenChat}) {
    const color1 = useColorModeValue("gray.100", "gray.600");
    const color2 = useColorModeValue("gray.50", "gray.700");
    const { getUser, openChat, friendsCache } = ChatState();
    const username = localStorage.getItem('username');
    const people = JSON.parse(chat.people.S);
    var otherUsername = (username === people[0]) ? people[1] : people[0];
    if (!otherUsername) {
        otherUsername = username;
    }
    const [other, setOther] = useState(null);

    useEffect(() => {
        if (friendsCache[otherUsername]) {
            setOther(friendsCache[otherUsername]);
        } else {
            console.log('Cache miss with ' + otherUsername + '!');
            const promise = getUser(otherUsername);
            promise.then(res => res.json().then(data => setOther(data)));
        }
    }, [chat]);

    return (
        <Flex
            onClick={() => handleChangeOpenChat(chat)}
            cursor="pointer"
            bg={(openChat && openChat.uuid.S === chat.uuid.S) ? color1 : color2}
            px={3}
            py={2}
            flexDir='row'
            key={chat.uuid.S}
            alignItems='center' 
        >   
            <Flex h='full' pr={2}>
                {other && 
                    <Profile author={other} link={false} />
                }
            </Flex>

            <Flex flexDir='column'>
                <Text fontSize='large'>
                    DM: {other && other.fullname.S}
                </Text>
                <ChatPreview chat={chat}/>
            </Flex>
            
        </Flex>
    )
}
