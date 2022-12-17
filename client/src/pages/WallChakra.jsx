import { Avatar, AvatarGroup, Box, Button, ButtonGroup, Flex, Heading, HStack, Stack, Spinner, Text, useColorModeValue, Image, Card } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostChakra from '../components/Post/PostChakra';
import CreatePostComponent from '../components/Wall/CreatePostComponent';
import UserInfoComponent from '../components/Wall/UserInfoComponent';
import NavBar from '../components/NavBar/NavBar';
import {HomeState} from '../context/HomeProvider'
import {ChatState} from '../context/ChatProvider'
import AddFriendButton from "../components/Wall/AddFriendButton";
import DeleteFriendButton from "../components/Wall/DeleteFriendButton";
import InfiniteScroll from 'react-infinite-scroll-component';
import IconButtonAttach from '../components/Wall/IconButtonAttach';
import IconButtonEdit from '../components/Wall/IconButtonEdit';

export default function WallChakra() {
    const {me, getMe, setMe} = HomeState();
    const {getUser} = ChatState();
    getMe();
    const navigate = useNavigate();

    const username = useParams().user;
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState(null);
    const [more, setMore] = useState(true);
    const [userFriends, setUserFriends] = useState(null);

    const bgColor = useColorModeValue('gray.200', 'gray.600')
    const bgColor2 = useColorModeValue('gray.50', 'gray.700') 
    const fontColor = useColorModeValue('gray.700', 'white') 
    const validTypes = ['image/jpg', 'image/png', 'image/jpeg']

    const getPosts = () => {
        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        fetch('/wallpage?username=' + encodeURI(username), requestOptions)
            .then(res => {
              res.json().then(data => {
                console.log('posts')
                console.log(data)
                setPosts(data);
              });
        });
      }
      

    const handleUploadProfilePic = async e => {
        const file = e.target.files[0];
        console.log(file)
        if (!validTypes.find(t => t === file.type)) {
            alert('not valid file type')
            return;
        }

        const form = new FormData();
        form.append('image', file)
        form.append('name', user.username.S)
        
        const requestOptions = {
            method: 'POST',
            body: form
        };
        await fetch('/uploadprofilepic', requestOptions)
            .then(res => {
                res.json().then(data => {
                    console.log(data);
                    window.location.reload();
                })
        });
    }

    const handleUploadCoverPhoto = async e => {
        const file = e.target.files[0];
        if (!validTypes.find(t => t === file.type)) {
            alert('not valid file type')
            return;
        }

        const form = new FormData();
        form.append('image', file)
        form.append('name', user.username.S)
        
        const requestOptions = {
            method: 'POST',
            body: form
        };
        await fetch('/uploadcoverphoto', requestOptions)
            .then(res => {
                res.json().then(data => {
                    console.log(data);
                    window.location.reload();
                })
        });
    }

    const fetchMoreArticles = () => {
        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        fetch('/wallpage?username=' + encodeURI(username) + '&timestamp=' + encodeURI(posts[posts.length - 1].timestamp.S), requestOptions)
            .then(res => {
              res.json().then(data => {
                if (data.length < 5) {
                    setMore(false);
                }
                setPosts(posts.concat(data));
              });
        });
    };

    useEffect(() => {
        if (user && user.friends) {
            var promises = [];
            for (const friend of user.friends.L) {
                promises.push(getUser(friend.S));
            }
            Promise.all(promises)
                .then(responses => {
                    Promise.all(responses.map(response => {
                        return response.json();
                      })).then(values => {
                        if (!userFriends || JSON.stringify(values) !== JSON.stringify(userFriends)) {
                          setUserFriends(values);
                        }
                      });
                });
        }
    }, [user])
    
     // Refresh state every 5 seconds
    useEffect(() => {
        const retrieveData = () => {
            const promise = getUser(username);
            promise.then(res => res.json().then(data => setUser(data)));
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

  const picHeight = 400;
  return (
    (me && user && posts) ? 
    <Box>
        <Box position="fixed" w="100%" zIndex={10000}>
        <NavBar/>
        </Box>

    <Box height={"93vh"} position='absolute' bottom='0' w='full'>
    <Box width={'full'}>
        <Box br={2} width={'full'} height={picHeight} bg={bgColor}>
            {user.coverphoto?.S && 
            <Image
                ml='20%'
                height={picHeight}
                width='60%'
                overflow='hidden'
                src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${user.username.S}-coverphoto-${user.coverphoto.S}`}
            /> }
            {user.username.S === me.username.S && 
                <Flex
                    position={'absolute'}
                    top={picHeight - 60}
                    left={'75%'}
                    zIndex={1100}
                >
                    <input type="file" style={{display: 'none'}} id="file-upload-cover-photo" onChange={e => handleUploadCoverPhoto(e)}/>
                    <label for='file-upload-cover-photo'>
                        <IconButtonEdit/>
                    </label>
                </Flex>
            }
        </Box>
        <Box br={2} width={'full'} height={'120px'} bg={bgColor2} />
        <Box ml={'20%'} mr={'20%'}>
            <Stack 
                position={'absolute'}
                zIndex={1000}
                top={picHeight - 30}
                w='60%'
            >
                <Flex>
                <input type={me.username.S === user.username.S && "file"} style={{display: 'none'}} id="file-upload-pfp"  onChange={e => me.username.S === user.username.S && handleUploadProfilePic(e)}/>
                <label for='file-upload-pfp' style={{padding: 'none', margin: 'none'}}>
                    <Avatar
                        name={user.fullname.S}
                        size={"2xl"}
                        src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${user.username.S}-profilepic-${user.profilepic?.S}`}
                        _hover={me.username.S === user.username.S && {cursor: 'pointer'}}
                    />
                </label>
                <Flex ml='4' width={'full'} height={'170px'} justifyContent={"space-between"} alignItems='center'>
                    <Stack spacing={1}>
                        <Heading as={'b'} size={"md"}>{user.fullname.S}</Heading>
                        <Text color={fontColor}>{user.username.S} &bull; <i>{user.friends ? user.friends.L.length : 0} friends</i></Text>
                        <AvatarGroup size='sm' max={10} spacing={'-0.5em'}>
                        {userFriends && 
                        (userFriends.length === 0
                            ? <Flex justifyContent={'center'}><Text>No Friends Yet!</Text></Flex>
                            : userFriends.map((friend, index) => {
                                return (
                                    <Avatar 
                                    borderWidth='0'
                                    name={friend.fullname.S} 
                                    key={friend.username.S}
                                    src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${friend.username.S}-profilepic-${friend.profilepic?.S}`}
                                    _hover={{cursor: 'pointer'}}
                                    // src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${friend}-profilepic-${user.friend.profilepic?.S}`} 
                                    onClick={() => {navigate(`/${friend.username.S}/wall`); 
                                    window.location.reload()}}/>
                                );
                            })
                        )}
                        </AvatarGroup>
                    </Stack>
                    <ButtonGroup> 
                    {username !== me.username.S && 
                      (!me.friends || me.friends.L.filter(friend => friend.S === username).length === 0 ? <AddFriendButton me={me} user={user}/> : <DeleteFriendButton me={me} user={user} setMe={setMe}/>)}
                    </ButtonGroup>
                </Flex>
                </Flex>
            </Stack>
        </Box>
        <HStack align={'top'} spacing={2} ml="20%" mr="20%" mt={8}>
            <Box width='40%'>
                <UserInfoComponent user={user}/>
            </Box>
            <Box width="60%" spacing={3}>
                {((me.friends && me.friends.L.filter(friend => friend.S === user.username.S).length === 1) 
                  || me.username.S === user.username.S)
                 && <CreatePostComponent getPosts={getPosts} recipient={username}/> }
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
                    <Text mt={10} textAlign={'center'}>No posts yet!</Text>
                }
            </Box>
        </HStack>
    </Box>
    </Box>
    </Box>
    : <Flex height='100vh' justifyContent={'center'} alignItems={'center'}>
      <Spinner
          size="md"
          margin="auto"
        />
      </Flex>
  )
}
