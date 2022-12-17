import {
    Box,
    Flex,
    Text,
    IconButton,
    Button,
    Stack,
    Collapse,
    Icon,
    Link,
    Popover,
    PopoverTrigger,
    PopoverContent,
    useColorModeValue,
    useBreakpointValue,
    useDisclosure,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Avatar,
    Heading,
    Image
  } from '@chakra-ui/react';
  import {
    HamburgerIcon,
    CloseIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    BellIcon,
    StarIcon, 
    ExternalLinkIcon,
    ChatIcon
  } from '@chakra-ui/icons';
  
  import PostChakra from '../components/PostChakra'
  export default function Test() {
    const { isOpen, onToggle } = useDisclosure();
  
    return (
      // <><Box>
      //   <Flex
      //     bg={useColorModeValue('white', 'gray.800')}
      //     color={useColorModeValue('gray.600', 'white')}
      //     minH={'60px'}
      //     py={{ base: 2 }}
      //     px={{ base: 4 }}
      //     borderBottom={1}
      //     borderStyle={'solid'}
      //     borderColor={useColorModeValue('gray.200', 'gray.900')}
      //     align={'center'}>
      //     <Flex
      //       flex={{ base: 1, md: 'auto' }}
      //       ml={{ base: -2 }}
      //       display={{ base: 'flex', md: 'none' }}>
      //       <IconButton
      //         onClick={onToggle}
      //         icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
      //         variant={'ghost'}
      //         aria-label={'Toggle Navigation'} />
      //     </Flex>
      //     <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
      //       <Text
      //         textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
      //         fontFamily={'heading'}
      //         color={useColorModeValue('gray.800', 'white')}>
      //         Logo
      //       </Text>

      //       <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
      //         <DesktopNav />
      //       </Flex>
      //     </Flex>

      //     <Stack
      //       flex={{ base: 1, md: 0 }}
      //       justify={'flex-end'}
      //       direction={'row'}
      //       spacing={6}>
      //       <Button
      //         as={'a'}
      //         fontSize={'sm'}
      //         fontWeight={400}
      //         variant={'link'}
      //         href={'#'}>
      //         Sign In
      //       </Button>
      //       <Button
      //         display={{ base: 'none', md: 'inline-flex' }}
      //         fontSize={'sm'}
      //         fontWeight={600}
      //         color={'white'}
      //         bg={'pink.400'}
      //         href={'#'}
      //         _hover={{
      //           bg: 'pink.300',
      //         }}>
      //         Sign Up
      //       </Button>
      //     </Stack>
      //   </Flex>
      <PostChakra/>
    );
  }
  
  const DesktopNav = () => {
    const linkHoverColor = useColorModeValue('gray.800', 'white');
    const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  
    return (
      <Stack direction={'row'} spacing={4}>
        {NAV_ITEMS.map((navItem) => (
          <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'}>
              <PopoverTrigger>
              <Button
                    p={2}
                    fontSize={'sm'}
                    fontWeight={500}
                    backgroundColor='white'
                    _hover={{
                        textDecoration: 'none',
                        color: linkHoverColor,
                    }}
                    rightIcon={<BellIcon/>}
                    >
                        {navItem.label}
                </Button>
              </PopoverTrigger>
  
              {navItem.children && (
                <PopoverContent
                  border={0}
                  boxShadow={'xl'}
                  bg={popoverContentBgColor}
                  p={4}
                  rounded={'xl'}
                  >
                  <Stack>
                    {navItem.children.map((child) => (
                      <DesktopSubNav key={child.subLabel} {...child} />
                    ))}
                  </Stack>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        ))}
      </Stack>
    );
  };
  
  const DesktopSubNav = ({ label, href, subLabel }) => {
    return (
      <Link
        href={href}
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('gray.50', 'gray.900') }}>
        <Stack direction='column'>
            <Stack direction={'row'} align={'center'}>
            <Box>
                <Text
                transition={'all .3s ease'}
                _groupHover={{ color: 'black' }}
                fontWeight={500}>
                {label}
                </Text>
                <Text fontSize={'sm'}>{subLabel}</Text>
            </Box>
            </Stack>
            <Flex
                justifyContent={'center'}
                width="full"
            >
                <Button marginRight="5px" colorScheme='green'>Accept</Button>
                <Button marginLeft="5px" colorScheme='red'>Reject</Button>
            </Flex>
        </Stack>
      </Link>
    );
  };

  const Post = ({description=""}) => {
    <Heading>Hello</Heading>
    // <Card maxW='md'>
    //   <CardHeader>
    //     <Flex spacing='4'>
    //       <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'>
    //         <Avatar name='Segun Adebayo' src='https://bit.ly/sage-adebayo' />

    //         <Box>
    //           <Heading size='sm'>Segun Adebayo</Heading>
    //           <Text>Creator, Chakra UI</Text>
    //         </Box>
    //       </Flex>
    //     </Flex>
    //   </CardHeader>
    //   <CardBody>
    //     <Text>
    //       With Chakra UI, I wanted to sync the speed of development with the speed
    //       of design. I wanted the developer to be just as excited as the designer to
    //       create a screen.
    //     </Text>
    //   </CardBody>
    //   <Image
    //     objectFit='cover'
    //     src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
    //     alt='Chakra UI'
    //   />

    //   <CardFooter
    //     justify='space-between'
    //     flexWrap='wrap'
    //     sx={{
    //       '& > button': {
    //         minW: '136px',
    //       },
    //     }}
    //   >
    //     <Button flex='1' variant='ghost' leftIcon={<StarIcon />}>
    //       Like
    //     </Button>
    //     <Button flex='1' variant='ghost' leftIcon={<ChatIcon />}>
    //       Comment
    //     </Button>
    //     <Button flex='1' variant='ghost' leftIcon={<ExternalLinkIcon />}>
    //       Share
    //     </Button>
    //   </CardFooter>
    // </Card>
  }
  
  const NAV_ITEMS = [
    {
      label: 'Notifications',
      children: [
        {
          label: 'You have a Friend Request!',
          subLabel: 'Alex wants to be your friend',
          href: '#',
        },
        {
        label: 'You have a Friend Request!',
        subLabel: 'Sahith wants to be your friend',
        href: '#',
        },
      ],
    },
  ];