import { Avatar, AvatarBadge, Box, Button, Flex, Spacer, Stack, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import Profile from '../General/Profile';

export default function ChatMainHeaderDMIcon({chat}) {

    const { getUser, friendsCache } = ChatState();
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
        <>
            {other && 
            <>
            <Flex h="100%" paddingLeft={'10px'} alignItems='center' justifyContent={'center'}>
                <Profile author={other} link={true} />
            </Flex>
            <Text pl={2} fontSize={'large'} fontWeight={'bold'}>DM with {other.fullname.S}</Text>
            </>
            }
        </>
    )
}
