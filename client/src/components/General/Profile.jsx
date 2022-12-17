import { 
    Avatar,
    AvatarBadge,
    Flex,
    useColorModeValue,
    PopoverContent
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../context/ChatProvider';

export default function Profile({author, link}) {
    
    const navigate = useNavigate();

    return (
        author && 
        <Flex h="100%">
            <Avatar
                size='sm'
                name={author.fullname.S}
                src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${author.username.S}-profilepic-${author.profilepic?.S}`}
                marginRight='10px'
                onClick={link ? () => {navigate('/' + encodeURI(author.username.S) + '/wall'); navigate(0)} : null}
                _hover={{cursor: 'pointer'}}
            >
                {author.active.N === '1' && <AvatarBadge boxSize='1.25em' bg='green.500' />}
            </Avatar>
        </Flex>
  )
}