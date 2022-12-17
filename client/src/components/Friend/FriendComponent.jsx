import React, { useState } from 'react'
import {
    Box,
    Flex,
    Avatar,
    AvatarBadge,
    Text,
    IconButton,
    PopoverContent,
    PopoverTrigger,
    Button,
    Popover,
    useColorModeValue,
    PopoverArrow,
    useOutsideClick,
    Stack
} from '@chakra-ui/react'
import { IonIcon } from '@ionic/react'
import { ellipsisVerticalOutline, navigate } from 'ionicons/icons'
import { useNavigate } from 'react-router-dom'

export default function FriendComponent(props) {
    const bgColor = useColorModeValue("white", "gray.700")
    const linkHoverColor = useColorModeValue('gray.50', 'gray.600');
    const me = localStorage.getItem('username');
    const {toast, username, fullname, isActive, setMe, profilepic} = props
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const ref = React.useRef();
    useOutsideClick({
        ref: ref,
        handler: () => setOpen(false),
    })

    const handleChatInvite = () => {
        const peopleList = [me];
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                me: me,
                other: username,
                type: "create",
                people: peopleList
            })
        };
        fetch('/notify', requestOptions)
            .then(res => {
                if (!res.ok) {
                    toast({
                        title: 'Unable to invite ' + fullname,
                        description: 'Chat already exists',
                        status: 'error',
                        duration: 2000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: 'Notified ' + fullname,
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                    });
                }
            });
    }

    const handleDeleteFriend = () => {
        const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: me,
            friend: username
        })
        };
        fetch('/deletefriend', requestOptions)
        .then(res => {
        if (!res.ok) {
            res.text().then(text => console.log(text));
        } else {
            toast({
                title: 'Deleted friend: ' + fullname,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            res.json().then(data => {
                setMe(data);
            });
        }
        });
    }
    
  return (
        <Popover    
                placement='right'
                isOpen={open}
            >
                <PopoverTrigger>
                <Box
                    borderRadius={'full'}
                    p={2}
                    w='full'
                    _hover={{bg: linkHoverColor, cursor: 'pointer'}}
                    onClick={() => setOpen(!open)}
                >
                    <Flex justifyContent={'space-between'}>
                        <Flex alignItems={'center'} justifyContent='center'>
                            <Avatar 
                                size='md'
                                name={fullname}
                                marginRight='10px'
                                src={`https://pennbookusermedia.s3.amazonaws.com/profilepictures/${username}-profilepic-${profilepic}`}
                            >
                                {isActive && <AvatarBadge boxSize='1.25em' bg='green.500' />}
                            </Avatar>
                            <Stack spacing={0}>
                                <Text as={'b'}>
                                    {fullname}
                                </Text>
                                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                                    {username}
                                </Text>
                            </Stack>
                        </Flex>
                    </Flex>
                </Box>
                </PopoverTrigger>
                <PopoverContent p={5} width={'175px'}>
                    <PopoverArrow />
                    <Button mb={2} colorScheme={'blue'} onClick={() => navigate('/' + encodeURI(username) + '/wall')}>View Wall</Button>
                    <Button mb={2} colorScheme={'green'} onClick={() => handleChatInvite()}>Invite to Chat</Button>
                    <Button colorScheme={'red'} onClick={() => handleDeleteFriend()}>Delete</Button>
                </PopoverContent>
            </Popover>
  )
}
