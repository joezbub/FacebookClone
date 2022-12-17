import React, { useRef, useState, useEffect } from 'react'
import CommentInputComponentChakra from './CommentInputComponentChakra';
import { IonIcon } from '@ionic/react'
import { heart } from 'ionicons/icons'
import * as moment from 'moment';

import { Box,
    Avatar,
    Stack,
    Text,
    Flex,
    HStack,
    Button,
    AvatarBadge,
    IconButton, 
    Input, 
    InputGroup,
    InputRightElement,
    Popover,
    PopoverTrigger,
    ButtonGroup,
    PopoverContent,
    PopoverCloseButton,
    useDisclosure,
    PopoverArrow,
    useColorModeValue,
    Badge
 } from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons' 
import CommentLikeButtonComponent from './CommentLikeButtonComponent';
import { setNestedObjectValues } from 'formik';
import Profile from '../General/Profile';
import { ChatState } from '../../context/ChatProvider';

export default function CommentComponentChakra({ id, margin, name, date, replies, deleted, level, description }) {
    const bgColor = useColorModeValue("white", "gray.700")
    const username = localStorage.getItem('username');
    const [isResponding, setIsResponding] = useState(false);
    const [showChildren, setShowChildren] = useState(false);
    const [btnValue, setBtnValue] = useState("Show");
    const [edit, setEdit] = useState(false);
    const [finalDesc, setFinalDesc] = useState(description);
    const [children, setChildren] = useState([]);
    const [replyCount, setReplyCount] = useState(replies);
    const [checkDeleted, setCheckDeleted] = useState(deleted);

    const getComments = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        fetch('/childcomments?id=' + encodeURI(id), requestOptions)
        .then(res => {
          if (!res.ok) {
            res.text().then(text => console.log(text));
          } else {
            res.json().then(data => {
              setChildren(data);
            });
          }
        });
      };
    
    useEffect(() => {
      setReplyCount(children.length);
    }, [children])

    const [author, setAuthor] = useState(null);
    const { getUser, friendsCache, setFriendsCache } = ChatState();

    const getUserAttributes = () => {
        if (friendsCache[name]) {
            setAuthor(friendsCache[name]);
        } else {
            var newCache = friendsCache;
            const promise = getUser(name);
            promise.then(res => res.json().then(data => {
                newCache[name] = data;
                setAuthor(data);
            }));
            setFriendsCache(newCache);
        }
    }
    
    useEffect(() => {
        const retrieveData = () => {
          getComments();
        };
        getUserAttributes();
        retrieveData();
        const interval = setInterval(retrieveData, 5000);
        return () => {
          clearInterval(interval);
        }
      }, []);

  const handleEditComment = (desc) => {
      if (desc) {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: desc, id: id})
          };
          fetch('/editcomment', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => console.log(err));
                } else {
                  console.log('edited');
                }
              });
      }
    }

    const handleDelete = () => {
      setCheckDeleted("true");
      const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id})
          };
          fetch('/deletecomment', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => console.log(err));
                } else {
                  console.log('deleted');
                }
              });
    }

  return (
    author && 
    <>
    <div style={{marginLeft: margin, marginBottom: 5, borderRadius: 10}}>
        {
          checkDeleted === "true" ? 
          (
            <Flex h='full'>
              <Profile author={author} link={true} />
              <Box>
                  <Flex justifyContent={'space-between'} bg={bgColor} borderRadius={5} pl={2}>
                      <Stack p={2} borderRadius={5} mb={2} maxW={300}>
                          <Text><em>This comment was deleted.</em></Text>
                      </Stack>
                      
                      <Badge h='min' mt={2}>{}</Badge>
                  </Flex>
                  <HStack spacing='5px' mt={2}>
                      <CommentLikeButtonComponent id={id} type={'comment'}/>
                      {level <= 2 && 
                        (
                          <React.Fragment bg={bgColor}>
                            <Button h={7} onClick={() => setIsResponding(!isResponding)}>Reply</Button>
                            <Button h={7} disabled={replyCount === 0} onClick={() => {
                              setShowChildren(!showChildren);
                              const val = showChildren ? 'Show' : 'Hide';
                              setBtnValue(val)
                            }}>{btnValue} {replyCount} Replies</Button>
                          </React.Fragment>
                        )
                      }
                  </HStack>
              </Box>
            </Flex>
          )
          :
          (
          <Flex h='full'>
              <Profile author={author} link={true} />
              <Box>
                  <Flex justifyContent={'space-between'} bg={bgColor} borderRadius={5} pl={2}>
                      <Stack p={2} borderRadius={5} mb={2} maxW={300}>
                          <Text><b>{author.fullname.S}</b> &nbsp; {moment(date).fromNow()}</Text>
                          {
                            edit ? 
                            <Box>
                              <Input
                              pr='4.5rem'
                              type='text'
                              value={finalDesc}
                              onChange={(e) => setFinalDesc(e.target.value)}
                            />
                            <ButtonGroup mt={2}>
                                <Button h='1.75rem' size='sm' colorScheme="blue" onClick={() => {handleEditComment(finalDesc); setEdit(false)}} p={2}>
                                Edit
                              </Button>
                              <Button h='1.75rem' size='sm' colorScheme="red" onClick={handleDelete} p={2}>
                                Delete
                              </Button>
                            </ButtonGroup>
                            </Box>
                            : <Text>{finalDesc}</Text>
                          }
                      </Stack>
                      
                      <Badge h='min' mt={2}>{}</Badge>

                      {username === name && <IconButton size='sm' bg={bgColor} icon={<EditIcon />} onClick={() => setEdit(!edit)}/>}

                  </Flex>
                  
                  <HStack spacing='5px' mt={2}>
                      <CommentLikeButtonComponent id={id} type={'comment'}/>
                      {level <= 2 && 
                        (
                          <React.Fragment>
                            <Button h={7} onClick={() => setIsResponding(!isResponding)}>Reply</Button>
                            <Button h={7} disabled={replyCount === 0} onClick={() => {
                              setShowChildren(!showChildren);
                              const val = showChildren ? 'Show' : 'Hide';
                              setBtnValue(val)
                            }}>{btnValue} {replyCount} Replies</Button>
                          </React.Fragment>
                        )
                      }
                  </HStack>
                  <Box w={'full'} h={0} mb={2}></Box>
                  {isResponding && <CommentInputComponentChakra parent={id} margin={0} name={localStorage.getItem('username')} getComments={getComments}/>}
              </Box>
          </Flex>
          )}
    </div>
    {showChildren && children &&
        children.map(c =>
        <CommentComponentChakra
            id={c.uuid.S}
            key={c.uuid.S}
            date={c.date.S}
            replies={parseInt(c.replies.N)}
            deleted={c.deleted.S}
            level={parseInt(c.level.N)}
            name={c.author.S}
            margin={margin + 45}
            description={c.message.S}/>
        )}
    </>
  )
}
