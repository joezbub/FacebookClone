import React, { useEffect, useState } from 'react'

import {
    Input,
    Box,
    Tag, 
    TagLabel,
    TagCloseButton,
    Button,
    Heading,
    Grid,
    GridItem,
    Alert,
    AlertIcon,
    Flex,
    useColorModeValue
} from '@chakra-ui/react'

import { AddIcon, CloseIcon } from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { RegisterContext } from './RegisterPageChakra'

export default function CategorySelection() {

    const news = ['MEDIA', 'ARTS', 'DIVORCE', 'BUSINESS', 'ENVIRONMENT', 'HEALTHY LIVING', 'COLLEGE', 'BLACK VOICES', 'PARENTING', 'STYLE', 'RELIGION', 'WORLD NEWS', 'FIFTY', 'HOME & LIVING', 'GOOD NEWS', 'WELLNESS', 'LATINO VOICES', 'IMPACT', 'FOOD & DRINK', 'TRAVEL', 'THE WORLDPOST', 'COMEDY', 'GREEN', 'POLITICS', 'WOMEN', 'EDUCATION', 'PARENTS', 'SCIENCE', 'TASTE', 'STYLE & BEAUTY', 'WEIRD NEWS', 'MONEY', 'CULTURE & ARTS', 'SPORTS', 'WORLDPOST', 'QUEER VOICES', 'ARTS & CULTURE', 'WEDDINGS', 'CRIME', 'ENTERTAINMENT', 'TECH']
    
    const [selected, setSelected] = useState([]);
    const [err, setErr] = useState(null);
    const { data } = useContext(RegisterContext);
    const navigate = useNavigate();

    const handleClick = (c) => {
        const newArray = [...selected]
        console.log(newArray)
        if (newArray.includes(c)) {
            const ret = newArray.filter(v => v !== c)
            setSelected(ret)
        } else {
            newArray.push(c)
            setSelected(newArray)
        }
    }

    var handleRegister = () => {
        const news = selected;
        if (news.length < 2) {
          alert('Please select at least two news categories');
          return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: data.username,
              password: data.password,
              fullname: data.fullname, 
              address: data.address, 
              affiliation: data.affiliation, 
              birthday: data.birthday,
              news: news
            })
        };
        fetch('/createaccount', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => setErr(text));
              } else {
                localStorage.setItem('username', data.username)
                navigate("/homepage")
                setErr(null)
              }
            })
        }

  return (
    <Flex bg={useColorModeValue('gray.100', 'gray.700')} align="center" justify="center" h="100vh">
        <Box bg={useColorModeValue('white', '#273040')} p={6} rounded="md" width="80%">
            <Box textAlign="center" width="full" marginBottom="20px">
                <Heading size='lg'>Select News Categories</Heading>
            </Box>
                {news.map(str => {
                    const color = selected.includes(str) ? 'green' : 'gray';
                        return <Tag _hover={{cursor: 'pointer'}}  borderRadius={'full'} key={str} marginRight="10px" marginBottom="10px" height='30px' colorScheme={color} onClick={() => handleClick(str)}>
                            {str}
                            {selected.includes(str) && <TagCloseButton/>}
                        </Tag>
                })}
            <Box width="full" textAlign="center">
                {err && <Alert status='error'>
                    <AlertIcon />
                    {err}
                </Alert>}
                <Button colorScheme="blue" onClick={() => handleRegister()}>Register</Button>
            </Box>
        </Box>
    </Flex>
    
  )
}
