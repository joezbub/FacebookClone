import { 
    Box,
    Button,
    ButtonGroup,
    Flex,
    Text,
    Stack,
    IconButton,
    Input,
    HStack,
    Popover,
    PopoverTrigger,
    useColorModeValue,
    PopoverContent
} from '@chakra-ui/react';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import Reactions from './Reaction';
import { AddIcon } from '@chakra-ui/icons'
import ReactionBar from './ReactionBar';
import Profile from '../General/Profile';

export default function MessageComponent({index, message, changeMessage}) {
    const username = localStorage.getItem('username');
    const received = message.author.S !== username;
    const [author, setAuthor] = useState(null);
    const order = ['heart', 'happy', 'laugh', 'angry'];
    const color1 = useColorModeValue("gray.100", "gray.600");
    const color2 = useColorModeValue("white", "black");
    const color3 = useColorModeValue("black", "white");

    const { getUser, user, openChat, friendsCache, setFriendsCache, reactionClicked, setReactionClicked, socket } = ChatState();

    const getUserAttributes = () => {
        if (friendsCache[message.author.S]) {
            setAuthor(friendsCache[message.author.S]);
        } else {
            var newCache = friendsCache;
            const promise = getUser(message.author.S);
            promise.then(res => res.json().then(data => {
                newCache[message.author.S] = data;
                setAuthor(data);
            }));
            setFriendsCache(newCache);
        }
    }

    useEffect(() => {
        if (received) {
            getUserAttributes();
        }
        else {
            setAuthor(user);
        }
    }, []);

    const handleReact = (key) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: message.uuid.S,
              timestamp: message.timestamp.N,
              emoji: key,
              name: user.fullname.S
            })
        };
        fetch('/react', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => console.log(text));
              } else {
                res.json().then(newMessage => {
                    socket.emit('new reaction', 
                        {uuid: openChat.uuid.S, message: newMessage, index: index} );
                    changeMessage(index, newMessage);
                });
              }
            });
    };

    const edit = false;
    return (
    <Flex width="full" p={3} justifyContent={received ? "left" : "right"}>
              {received && 
              <Flex h="100%">
                    {author && 
                        <Profile author={author} link={true} />
                    }
              </Flex>}

              <Box>
                  <Flex justifyContent={'space-between'} bg={received ? color1 : "blue.500" } borderRadius={20} pl={3} pr={3}>
                      <Stack p={2} borderRadius={5} mb={2} maxW={300}>
                          <Text color={received ? color3 : "white"}><b>{author && author.fullname.S}</b> 
                          &nbsp; <small>{moment(parseInt(message.timestamp.N)).fromNow(true)}</small></Text>
                          {
                            edit ? 
                            <Box>
                              <Input
                              pr='4.5rem'
                              type='text'
                              bgColor={'white'}
                              borderColor={'white'}
                            />
                            <ButtonGroup mt={2}>
                                <Button h='1.75rem' size='sm' colorScheme="blue" p={2}>
                                Edit
                              </Button>
                              <Button h='1.75rem' size='sm' colorScheme="red" p={2}>
                                Delete
                              </Button>
                            </ButtonGroup>
                            </Box>
                            : 
                            <Text color={received ? color3 : 'white'}>{message.message.S}</Text>
                          }
                      </Stack>
                  </Flex>
                  <HStack mt={1}>
                    {order.map((emoji, ind) => {
                        var people = [];
                        if (message[emoji]) {
                            people = JSON.parse(message[emoji].S);
                        }
                        if (people.length) {
                            return <Reactions key={ind} handleReact={handleReact} emoji={emoji} people={people} />
                        } else {
                            return <></>
                        }
                    })}
                        
                    <Popover
                        placement={'top'}
                        closeOnBlur={false}
                    >
                        <PopoverTrigger>
                            <IconButton onClick={() => setReactionClicked(!reactionClicked)} borderRadius={'full'} size={'sm'} icon={<AddIcon/>}/>
                        </PopoverTrigger>
                        <PopoverContent borderRadius={'full'} w={'auto'}>
                            <ReactionBar message={message} handleReact={handleReact}/>
                        </PopoverContent>
                    </Popover>  
                  </HStack>
              </Box>
          </Flex>
  )
}
