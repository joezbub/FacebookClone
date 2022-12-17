import React, { useEffect, useState } from 'react'

import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    Badge,
    Link,
    Popover,
    PopoverTrigger,
    PopoverContent,
    useColorModeValue,
    useOutsideClick,
    Spacer,
    AvatarBadge,
    IconButton,
    Avatar
  } from '@chakra-ui/react';
  import {
    BellIcon,
  } from '@chakra-ui/icons';
import * as moment from 'moment';


export default function Notifications({notifications, handleAcceptNotification, handleDeleteNotification}) {
    const bgColor = useColorModeValue("white", "gray.750");
    const bellColor = useColorModeValue("balck", "white")
    const [open, setOpen] = useState(false);
    const username = localStorage.getItem('username');

    const ref = React.useRef();
    useOutsideClick({
        ref: ref,
        handler: () => setOpen(false),
    })

    const DesktopNav = () => {
        const linkHoverColor = useColorModeValue('gray.800', 'white');
        const popoverContentBgColor = useColorModeValue('white', 'gray.800');
      
        return (
          <Stack ref={ref} direction={'row'} spacing={4}>
              <Box>
                <Popover isOpen={open} placement={'bottom-start'}>
                <PopoverTrigger>
                    <Button
                        _hover={{
                          textDecoration: 'none',
                          color: linkHoverColor,
                        }}
                        onClick={() => setOpen((prev) => !prev)}
                        color={bellColor}
                        >
                          <BellIcon>
                          </BellIcon>
                          {notifications.length > 0 && <Badge position='absolute' mt={4} ml={4} borderRadius='full' boxSize='0.75em' bg='red' />}
                          
                    </Button>
                  </PopoverTrigger>
                    <PopoverContent
                      border={0}
                      boxShadow={'xl'}
                      bg={popoverContentBgColor}
                      p={4}
                      rounded={'xl'}
                      >
                      <Stack>
                        {notifications.length > 0 ? notifications.map((n) => (
                          <DesktopSubNav key={n.uuid.S} notification={n} />
                        ))
                        : <Text>No new notifications</Text>
                        }
                      </Stack>
                    </PopoverContent>
                </Popover>
              </Box>
          </Stack>
        );
      };

    const DesktopSubNav = ({notification }) => {
      const friendRequest = notification.type.S === 'friend';
      return (
          <Link
          role={'group'}
          display={'block'}
          p={2}
          rounded={'md'}
          _hover={{ bg: useColorModeValue('gray.50', 'gray.900') }}>
          <Stack direction='column'>
              <Stack direction={'row'} align={'center'}>
              <Box width='full'>
                  <Text
                  align={'center'}
                  transition={'all .3s ease'}
                  fontWeight={500}>
                  You have a {friendRequest ? 'friend request' : 'chat invite'}!
                  </Text>
                  <Text my={1} fontSize={'sm'}>{notification.message.S} &#x2022; <i>{moment(parseInt(notification.timestamp.N)).fromNow()}</i></Text>
              </Box>
              </Stack>
              <Flex
                  justifyContent={'center'}
                  width="full"
              >
                  <Button marginRight="5px" colorScheme='green' onClick={() => handleAcceptNotification(notification)}>Accept</Button>
                  <Button marginLeft="5px" colorScheme='red' 
                    onClick={() => handleDeleteNotification(username, notification.timestamp.N, notification.uuid.S)}>Reject</Button>
              </Flex>
          </Stack>
          </Link>
      );
    };

  return (
    <Box>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>
    </Box>
  )
}
