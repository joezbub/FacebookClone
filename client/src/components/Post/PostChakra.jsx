import React, { useEffect } from 'react'

import { Card, CardHeader, Flex, Avatar, Box, Heading, Text, CardBody, Image, CardFooter, Button, useColorModeValue, Tag, ButtonGroup} from '@chakra-ui/react'
import { ChatIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import CommentSectionChakra from '../Comment/CommentSectionChakra';
import PostLikeButtonComponent from './PostLikeButtonComponent';
import * as moment from 'moment';
import { ChatState } from '../../context/ChatProvider';
import Profile from '../General/Profile';

export default function PostChakra(props) {

  const {
  creator, 
  recipient, 
  date,
  title,
  description,
  timestamp,
  commentRoot,
  imageid  } = props;

  const bgColor = useColorModeValue('white', 'gray.700')

  const [showComments, setShowComments] = useState(false);
  const [author, setAuthor] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const { getUser, friendsCache, setFriendsCache } = ChatState();

  const getUserAttributes = () => {
        if (friendsCache[creator]) {
            setAuthor(friendsCache[creator]);
        } else {
            var newCache = friendsCache;
            const promise = getUser(creator);
            promise.then(res => res.json().then(data => {
                newCache[creator] = data;
                setAuthor(data);
            }));
            setFriendsCache(newCache);
        }
        if (friendsCache[recipient]) {
            setReceiver(friendsCache[recipient]);
        } else {
            var newCache = friendsCache;
            const promise = getUser(recipient);
            promise.then(res => res.json().then(data => {
                newCache[recipient] = data;
                setReceiver(data);
            }));
            setFriendsCache(newCache);
        }
    }
  
    useEffect(() => {
        getUserAttributes();
    }, []);

  return (
    <Card width='99%' mb={3} ml={'auto'} mr={'auto'} bg={bgColor}>
      <CardBody>
      {/* <Tag mb={3}>{(recipient === creator ? 'STATUS UPDATE' : (receiver.fullname.S.toUpperCase() + '\'S WALL'))}</Tag> */}
        <Flex spacing='4'>
          {author && receiver ? <Flex flex='1' gap='2' >
            <Profile author={author} link={true}/>
            <Box>
              <Text size='sm'><b>{author.fullname.S}</b> {(recipient === creator ? 'made a status update' : ('posted on ' + receiver.fullname.S + '\'s wall'))}</Text>
              <Text mt={1}>{moment(date).fromNow()}</Text>
            </Box>
          </Flex>
            : 
            <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'>
              <Flex h="100%">
            <Avatar
                size='sm'
                name={creator}
            />
            </Flex>
            <Box>
              <Heading size='sm'>{creator}</Heading>
              <Text>{moment(date).fromNow()}</Text>
            </Box>
          </Flex>
          }
        </Flex>
      <Flex mt={3} flexDir='column'>
        <Text fontSize={'lg'} as={'b'}>{title}</Text>
        {description && <Text mt={5}>
          {description}
        </Text>}
         { imageid && imageid?.length > 0 && <Image
          mt={5}
          maxHeight={'500px'}
          objectFit='contain'
          src={`https://pennbookusermedia.s3.amazonaws.com/posts/${imageid}`}
          alt='Chakra UI'
      /> }
        </Flex>
      </CardBody>
      
      <Flex
        justify='space-between'
        flexWrap='wrap'
        sx={{
          '& > button': {
            minW: '136px',
          },
        }}
        mb={3}
      >
        <ButtonGroup justifyContent={'space-between'} w='full' pl={3} pr={3}>
          <PostLikeButtonComponent key={timestamp} id={timestamp} type='post' />
          <Button flex='1' variant='ghost' leftIcon={<ChatIcon />} onClick={() => setShowComments(!showComments)}>
            Comment
          </Button>
        </ButtonGroup>
      </Flex>
      {showComments && <CommentSectionChakra root={commentRoot} />}
    </Card>
  )
}
