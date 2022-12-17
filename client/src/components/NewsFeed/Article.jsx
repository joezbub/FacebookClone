import React, { useEffect } from 'react'
import { Card, CardHeader, Flex, Avatar, Box, Heading, Text, CardBody, Image, CardFooter, Button, useColorModeValue, Tooltip, Tag} from '@chakra-ui/react'
import { ChatIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import CommentSectionChakra from '../Comment/CommentSectionChakra';
import PostLikeButtonComponent from '../Post/PostLikeButtonComponent';
import { ChatState } from '../../context/ChatProvider';

export default function Article(props) {

  const { article } = props;
  var desc = article.short_description.S;
  if (desc.length > 175) {
    desc = desc.slice(0, 175) + '...';
  }

  const bgColor = useColorModeValue('white', 'gray.700')

  const [showComments, setShowComments] = useState(false);
  const { getUser, friendsCache, setFriendsCache } = ChatState();

  return (
    <Card width='99%' mb={3} ml={'auto'} mr={'auto'} bg={bgColor}>
      <CardBody>
        <Tag my={2} colorScheme='blue'>{article.category.S}</Tag>
        <Flex flexDir='column'>
          <Text fontSize={'3xl'} as={'b'}><a href={article.link.S} target='_blank'>{article.headline.S}</a></Text>
          <Text mt={2}>
            {desc}
          </Text>
        </Flex>
        <Flex justifyContent={'center'} mt={3} flexDir="column" w='auto'>
          <Image borderRadius={4} src={article.image} maxW='full'/>
          <Text mt={3} fontSize={'sm'} textAlign='right'><i><b>{article.authors.S && (article.authors.S + ",")}</b> {article.date.S}</i></Text>
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
        <PostLikeButtonComponent key={article.index.N} id={article.index.N} type='article'/>
        <Button flex='1' variant='ghost' leftIcon={<ChatIcon />} onClick={() => setShowComments(!showComments)}>
          Comment
        </Button>
      </Flex>
      {showComments && <CommentSectionChakra root={article.index.N + '-comment'} type={null}/>}
    </Card>
  )
}
