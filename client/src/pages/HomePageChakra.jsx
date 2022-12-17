import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useResolvedPath } from 'react-router-dom'
import '../css/main.css'
import PostChakra from '../components/Post/PostChakra';
import FriendComponent from '../components/Friend/FriendComponent';
import {
  Heading, useColorMode, useToast, Button, Box, Flex, Card, CardHeader, SimpleGrid, Stack, Spinner, useColorModeValue, Avatar, Text, CardBody
} from '@chakra-ui/react'
import NavBar from '../components/NavBar/NavBar';
import CreatePostComponent from '../components/Wall/CreatePostComponent';
import UserCard from '../components/NavBar/UserCard';
import { HomeState } from '../context/HomeProvider'
import InfiniteScroll from 'react-infinite-scroll-component';

export default function HomePage() {
  const toast = useToast();

  const username = localStorage.getItem('username');
  
  const {me, getMe, setMe, friends} = HomeState();
  getMe();

  const [posts, setPosts] = useState(null);
  const [more, setMore] = useState(true);

    const getPosts = () => {
        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        fetch('/homepage?username=' + encodeURI(username), requestOptions)
            .then(res => {
              res.json().then(data => {
                console.log(data)
                setPosts(data);
              });
        });
      }

      const fetchMoreArticles = () => {
        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        fetch('/homepage?username=' + encodeURI(username) + '&timestamp=' + encodeURI(posts[posts.length - 1].timestamp.S), requestOptions)
            .then(res => {
              res.json().then(data => {
                if (data.length < 5) {
                    setMore(false);
                }
                setPosts(posts.concat(data));
              });
        });
    };
    
     // Refresh state every 5 seconds
    useEffect(() => {
        const retrieveData = () => {
          if (window.pageYOffset < 1000) {
            getPosts();
          }
        };
        getPosts();
        retrieveData();
        const interval = setInterval(retrieveData, 5000);
        return () => {
        clearInterval(interval);
        }
    }, [])


  return (
    (me && friends && posts ? 
      <Box>
    <Box position="fixed" w="100%" zIndex={10000}>
      <NavBar/>
    </Box>
    <Box height={"91vh"} position='absolute' width='full' bottom='0'>
    <SimpleGrid columns={5} gridTemplateColumns='1fr 2fr 4fr 2fr 1fr' spacing={10} h='90%'>
      <Box>
      </Box>
      <UserCard username={username} fullname={me.fullname.S} profilepic={me.profilepic?.S}/>
      <Box>
        <CreatePostComponent getPosts={getPosts} recipient={me.username.S}/>
          {posts.length > 0
            ? 
          <InfiniteScroll
              dataLength={posts.length}
              next={fetchMoreArticles}
              hasMore={more}
              loader={<h4>Loading...</h4>}
              >
              {posts.map((p) => {
                  return <PostChakra key={p.timestamp.S} creator={p.creator.S} recipient={p.recipient.S} 
                  date={p.date.S} title={p.title.S} description={p.description.S} timestamp={p.timestamp.S} commentRoot={p.commentroot.S}
                  imageid={p.imageid?.S}/>;
              })}
          </InfiniteScroll>
            : 
          <Text mt={10} textAlign={'center'}>No posts yet!</Text>}
      </Box>
      <Box>
        <Card p={1}>  
          <CardHeader>
            <Heading size="md">Friends</Heading>
          </CardHeader>
          <CardBody>
          <Stack spacing={1}>
              {me.friends && friends.length === me.friends.L.length && me.friends.L.length > 0
                ? me.friends.L.map((friend, index) => {
                return (
                  <FriendComponent key={friend.S} toast={toast} username={friend.S} fullname={friends[index].fullname.S} 
                    isActive={friends[index].active.N === '1'} profilepic={friends[index].profilepic?.S} setMe={setMe}/>
                );
              })
              : <Flex mb={4} justifyContent={'center'}><Text>No Friends Yet!</Text></Flex>
            }
          </Stack>
          </CardBody>
        </Card>
        <Box>

        </Box>
      </Box>
      <Box/>
    </SimpleGrid>
    </Box>
    </Box>
    :
      <Flex height='100vh' justifyContent={'center'} alignItems={'center'}>
      <Spinner
          size="md"
          margin="auto"
        />
      </Flex>
    )
  )
}
