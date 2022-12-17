import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useResolvedPath } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component';
import '../css/main.css'
import PostChakra from '../components/Post/PostChakra';
import FriendComponent from '../components/Friend/FriendComponent';
import {
  Heading, useColorMode, useToast, Button, Box, Flex, Card, CardHeader, SimpleGrid, Stack, useColorModeValue, Avatar, Text, Spacer, Spinner, Center, Grid, GridItem
} from '@chakra-ui/react'
import NavBar from '../components/NavBar/NavBar';
import CreatePostComponent from '../components/Wall/CreatePostComponent';
import UserCard from '../components/NavBar/UserCard';
import { HomeState } from '../context/HomeProvider'
import NewsSearchBar from '../components/NewsSearch/NewsSearchBar';
import Article from '../components/NewsFeed/Article';

export default function NewsFeed() {
  const username = localStorage.getItem('username');
  
  const {me, getMe, setMe} = HomeState();

  const [articles, setArticles] = useState(null);
  const [random, setRandom] = useState(false);

  const fetchMoreArticles = async () => {
    var additional = [];
    for (var i = 0; i < 3; ++i) {
      var data = null;
      if (!random) {
        console.log('fetching news feed article');
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: encodeURI(localStorage.getItem('username')),
              articles: articles?.concat(additional) || additional
            })
        };
        data = await (await fetch('/newsfeedarticle', requestOptions)).json();
      }

      if (!data || Object.keys(data).length === 0) {
        console.log('fetching random');
        setRandom(true);
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        var randomnumber = Math.floor(Math.random() * 209527);
        data = await (await fetch('/article?id=' + randomnumber, requestOptions)).json();
      }
      additional.push(data);
    }
    if (!articles) {
      setArticles(additional);
    } else setArticles(articles.concat(additional));
  };

  useEffect(() => {
    fetchMoreArticles();
  }, [])

  return (
    (me && articles ? 
    <Box>
    <Box position="fixed" w="100%" zIndex={10000}>
      <NavBar/>
    </Box>
    <Box height={"91vh"} position='absolute' bottom='0' w="100%">
    <Flex justifyContent={'center'}>
      <Flex flexDir='column' width='40%'>
      <Flex p={5} mb={5} justifyContent={'center'}><NewsSearchBar /></Flex>
          <InfiniteScroll
            dataLength={articles.length}
            next={fetchMoreArticles}
            hasMore={true}
            loader={<h4>Loading...</h4>}
          >
              {articles.map((article) => 
                <Article key={article.index.N} article={article} />)}
          </InfiniteScroll>
      </Flex>
    </Flex>
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
