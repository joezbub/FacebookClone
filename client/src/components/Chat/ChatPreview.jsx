import { Avatar, AvatarBadge, Button, Flex, Spacer, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as moment from 'moment';

export default function ChatPreview(props) {
    const {chat} = props;    
    const bg = useColorModeValue("gray.600", "gray.100");

    const GetBody = () => {
        if (chat.preview) {
            const username = localStorage.getItem('username');
            const author = username === chat.preview.M.author.S ? 'You' : chat.preview.M.author.S;
            var message = author + ': '+ chat.preview.M.message.S;
            if (message.length > 25) {
                message = message.slice(0, 25) + '...';
            }
            return (
                <Text fontSize="small" color={bg} wordBreak={'break-all'}>
                        {message} &#x2022; {moment(parseInt(chat.timestamp.N)).fromNow(true)}
                </Text>
            );
        } else {
            return (
                <Text fontSize="small" color={bg}>
                    <i>Created</i> &nbsp; &#x2022; {moment(parseInt(chat.timestamp.N)).fromNow(true)}
                </Text>
            );
        }
    }

    return (
        <GetBody />
    );
}
