import { Avatar, AvatarBadge, Box, Button, Flex, Spacer, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import ChatPreview from './ChatPreview';

export default function ChatSideBarGroupChatIcon({chat, handleChangeOpenChat}) {
    const color1 = useColorModeValue("gray.100", "gray.600");
    const color2 = useColorModeValue("gray.50", "gray.700");
    const { getUser, openChat, setOpenChat } = ChatState();

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
            <Flex h="100%" pr={2}>
                <Avatar
                    size='sm'
                    name={chat.name.S.replaceAll('_', ' ')}
                    src='https://bit.ly/tioluwani-kolawole'
                    mr={'10px'}
                >
                </Avatar>
            </Flex>
            <Flex flexDir='column'>
                <Text fontSize='large'>
                    {chat.name.S}
                </Text>
                <ChatPreview chat={chat}/>
            </Flex>
            
        </Flex>
    )
}
