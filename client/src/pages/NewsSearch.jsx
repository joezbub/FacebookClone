import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useResolvedPath } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component';
import '../css/main.css'
import PostChakra from '../components/Post/PostChakra';
import FriendComponent from '../components/Friend/FriendComponent';
import {
  Heading, useColorMode, useToast, Button, Box, Flex, Card, CardHeader, SimpleGrid, Stack, useColorModeValue, Avatar, Text, Spacer, Spinner, Center, IconButton
} from '@chakra-ui/react'
import NavBar from '../components/NavBar/NavBar';
import CreatePostComponent from '../components/Wall/CreatePostComponent';
import UserCard from '../components/NavBar/UserCard';
import { HomeState } from '../context/HomeProvider'
import NewsSearchBar from '../components/NewsSearch/NewsSearchBar';
import Article from '../components/NewsFeed/Article';
import { ArrowBackIcon } from '@chakra-ui/icons';

export default function NewsSearch() {
  const username = localStorage.getItem('username');
  const input = useParams().input;
  
  const {me} = HomeState();

  const [articles, setArticles] = useState([]);
  const [more, setMore] = useState(true);
  const [amount, setAmount] = useState(null);
  const btnColor = useColorModeValue('white', 'gray.800')

  const navigate = useNavigate();


  const fetchMoreArticles = async () => {
    const page = (articles.length + 5) / 5;
    console.log(page);
      const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
      let data = await (await 
        fetch('/search?type=news&string=' + encodeURI(input) + '&username='
         + encodeURI(username) + '&page=' + page.toString(), requestOptions)).json();
      console.log(data);
      if (!amount) {
        setAmount(data.count);
      }
      if (data.data.length < 5) {
        setMore(false);
      }
      setArticles(articles.concat(data.data));
    
  };

  useEffect(() => {
    fetchMoreArticles();
  }, [])

  return (
    (me && amount != null ? 
    <Box>
    <Box position="fixed" w="100%" zIndex={10000}>
      <NavBar/>
    </Box>

    <Box height={"91vh"} position='absolute' bottom='0' w="100%">
    <Flex justifyContent={'center'}>
      <Flex flexDir='column' width='40%' alignItems='center'>
        <Flex p={5} mt={5} width='full' justifyContent={'center'}>
          <NewsSearchBar />
        </Flex>
        <Flex justifyContent={'center'} alignItems='center' w='full'>
          <Text mr={2} textAlign={'center'} my={6}>{amount === 0 ? 'No Results' : (amount && 'Showing ' + amount + ' Search Results')}</Text>
          &bull;
          <Button bg={btnColor} ml={2} onClick={() => navigate('/news')} width='25%'>Back to Feed</Button>
        </Flex>
        <InfiniteScroll
          dataLength={articles.length}
          next={fetchMoreArticles}
          hasMore={more}
          loader={<h4>Loading...</h4>}
        >
          {articles.map((article) => {
            return <Article key={article.index.N} article={article} />;
          })}
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
