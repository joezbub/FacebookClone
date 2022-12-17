import { SettingsIcon } from '@chakra-ui/icons'
import { Stack, Menu, Badge, MenuItem, MenuButton, Avatar, AvatarBadge, MenuList, Center, MenuDivider, Box, Button, ButtonGroup, Flex, Grid, GridItem, useColorMode, useDisclosure, useColorModeValue, Link, Image, useToast} from '@chakra-ui/react'
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom'
import UserSearchBarComponent from '../UserSearch/UserSearchBarComponent'
import Notifications from './Notifications'
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { HomeState } from '../../context/HomeProvider'
import { ChatState } from '../../context/ChatProvider';

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navBg = useColorModeValue('gray.50', 'gray.700');

  const NavLink = ({ children }) => (
    <Link
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      href={'#'}>
      {children}
    </Link>
  );
  
  const username = localStorage.getItem('username');
  const [viewNotifications, setViewNotifications] = useState(false);
  const isMounted = useRef(false);
  const toast = useToast();
  
  const {me, setMe, setNotifications, notifications } = HomeState();
  const {setOpenChat} = ChatState();
  
  const handleAcceptNotification = (notification) => {
    handleDeleteNotification(notification.username.S, notification.timestamp.N, notification.uuid.S);
    if (notification.type.S === 'friend') {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          me: notification.username.S,
          other: notification.other.S 
        })
      };
      fetch('/addfriend', requestOptions)
      .then(res => {
        if (!res.ok) {
          res.text().then(text => console.log(text));
        } else {
          console.log("Add friend worked");
          res.json().then(data => setMe(data));
        }
      });
    } else {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          people: JSON.parse(notification.people.S),
          type: notification.type.S,
          name: (notification.name ? notification.name.S : null)
        })
      };
      fetch('/createchat', requestOptions)
      .then(res => {
        if (!res.ok) {
          res.text().then(text => console.log(text));
        } else {
          console.log("Create chat worked");
          res.json().then(data => console.log("new chat: " + data));
        }
      });
    }
  }
  
  const handleDeleteNotification = (username, timestamp, uuid) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username,
          timestamp: timestamp,
          uuid: uuid
        })
    };
    fetch('/deletenotification', requestOptions)
    .then(res => {
      if (!res.ok) {
        res.text().then(text => console.log(text));
      } else {
        setNotifications(notifications.filter(notification => {
          return notification.username.S !== username || notification.timestamp.N !== timestamp && notification.uuid.S !== uuid
        }));
      }
    });
  }

  const handleLogOut = () => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: localStorage.getItem('username')
        })
      };
      fetch('/logout', requestOptions)
      .then(res => {
        if (!res.ok) {
          res.text().then(text => console.log(text));
        } else {
          console.log("Logout successful");
        }
      });
      setOpenChat(null);
      localStorage.removeItem('username');
      navigate("/");
    }

  return (
      <Grid templateColumns={'repeat(3, 1fr)'} gap={2} width="full" alignItems={'center'} pl={4} pr={4} pt={1} pb={1} mb={2} bg={navBg}>
      <GridItem>  
        <Box>
          <Image src={require("./logo3.png")} htmlWidth='150px' m={2} borderRadius={'20px'} 
           _hover={{cursor: 'pointer'}} alt="PennBook" onClick={() => navigate(`/homepage`)} />
        </Box>

      </GridItem>
      <GridItem>
        <UserSearchBarComponent/>
      </GridItem>
      <GridItem>
        <Flex justifyContent={'right'}>
          <ButtonGroup alignItems={'center'}>
              <Notifications
                  notifications={notifications}
                  handleAcceptNotification={handleAcceptNotification}
                  handleDeleteNotification={handleDeleteNotification}
              />
              <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={7}>
            <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>

            <Menu alignItems={'center'}>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                alignItems={'center'}
                minW={0}>
                <Avatar
                  size='sm'
                  name={me.fullname.S}
                  src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${me.username.S}-profilepic-${me.profilepic?.S}`}
                >
                  <AvatarBadge boxSize='1.25em' bg='green.500' />
                </Avatar>
              </MenuButton>
              <MenuList alignItems={'center'}>
                <MenuItem alignItems={'center'} onClick={() => {navigate(`/homepage`); navigate(0);}}>Home</MenuItem>
                <MenuItem alignItems={'center'} onClick={() => {navigate(`/${me.username.S}/wall`); navigate(0);}}>My Wall</MenuItem>
                <MenuItem alignItems={'center'} onClick={() => {navigate(`/news`); navigate(0);}}>News</MenuItem>
                <MenuItem alignItems={'center'} onClick={() => {navigate(`/chats`); navigate(0);}}>Chats</MenuItem>
                <MenuItem alignItems={'center'} onClick={() => {navigate(`/friendvisualizer`); navigate(0);}}>Friend Visualizer</MenuItem>
                <MenuItem alignItems={'center'} onClick={handleLogOut}>Log out</MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Flex>
          </ButtonGroup>
        </Flex>
      </GridItem>
    </Grid>
  )
}


