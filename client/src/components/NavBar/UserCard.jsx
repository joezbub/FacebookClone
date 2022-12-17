import { Avatar, Box, Card, Flex, Heading, Icon, Stack, StackDivider, Text, useColorModeValue } from '@chakra-ui/react'
import {ChatIcon, PlusSquareIcon} from '@chakra-ui/icons'
import React from 'react'
import { IonIcon } from '@ionic/react';
import { chatbubbles, chatbubblesOutline, newspaper, newspaperOutline, peopleOutline, personOutline } from 'ionicons/icons'
import { useNavigate } from 'react-router-dom';

export default function UserCard({ username, fullname, profilepic }) {

  const navigate = useNavigate();

  const UserCardItem = ({name, icon, url}) => {
    return (
      <Box
        _hover={{bg: useColorModeValue('gray.50', 'gray.600'), cursor: 'pointer'}}
        onClick={() => navigate(url)}
      >  
        <Flex h={'60px'} alignItems='center' pl={6} ml='3'>
          {icon}
          <Text ml={5} size={'xl'}>
            {name}
          </Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Card h={'500px'}>
        <Box h='15%' bg={useColorModeValue('gray.100', 'gray.600')} br={5}/>
        <Flex mt={-15} top={0} left={0} justifyContent='center' style={{transform: 'translate(-50%, -50%);'}}>
          <Stack justify={'center'} alignItems='center'>
            <Avatar
              name={fullname}
              size={'lg'}
              src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${username}-profilepic-${profilepic}`}
            >
            </Avatar>
            <Stack spacing={0} mt={1} alignItems={'center'}>
              <Heading size={"md"}>
                {fullname}
              </Heading>
              <Text>
                {username}
              </Text>
            </Stack>
          </Stack>
        </Flex>
        <Stack divider={<StackDivider/>} mt={3}>
            <UserCardItem name="Wall" url={`/${encodeURI(username)}/wall`} icon={<IonIcon icon={personOutline} size={'large'}/>}/>
            <UserCardItem name="News" url={'/news'} icon={<IonIcon icon={newspaperOutline} size={'large'}/>}/>
            <UserCardItem name="Chats" url={'/chats'} icon={<IonIcon icon={chatbubblesOutline} size={'large'}/>}/>
            <UserCardItem name="Friend Visualizer" url={'/friendvisualizer'} icon={<IonIcon icon={peopleOutline} size={'large'}/>}/>
        </Stack>
      </Card>
  )
}
