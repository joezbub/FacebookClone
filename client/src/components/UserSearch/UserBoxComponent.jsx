import { Avatar, Box, Stack, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../context/ChatProvider';
import { useEffect, useState } from 'react'

export default function UserBoxComponent({username, fullname}) {
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.700", "gray.100")
  const { getUser, friendsCache, setFriendsCache } = ChatState();
  const [result, setResult] = useState(null);
  
  const getUserAttributes = () => {
        if (friendsCache[username]) {
            setResult(friendsCache[username]);
        } else {
            var newCache = friendsCache;
            const promise = getUser(username);
            promise.then(res => res.json().then(data => {
                newCache[username] = data;
                setResult(data);
            }));
            setFriendsCache(newCache);
        }
    }

    useEffect(() => {
      getUserAttributes();
    }, []);

  return (
    <Box pr={2} pl={2} p={1}>
       <Flex
        p={2}
        borderRadius={5}
        width={'full'}
        _hover={
          { bg: useColorModeValue('gray.50', 'gray.900'), cursor:"pointer" }
        }
        onClick={() => {navigate('/' + encodeURI(username) + '/wall'); navigate(0);}}
       >
        <Avatar
            name={fullname}
            mr={2}
            src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${username}-profilepic-${result?.profilepic?.S}`}
        >
        </Avatar>
        <Stack spacing={0}>
            <Text as={"b"}>{fullname}</Text>
            <Text color={bgColor}>{username}</Text>
        </Stack>
      </Flex>
    </Box>
  )
}
