import { ArrowForwardIcon } from '@chakra-ui/icons'
import { Alert, AlertIcon, Box, Button, Flex, Heading, HStack, PinInput, PinInputField, Stack, useColorModeValue } from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { RegisterContext } from './RegisterPageChakra';

export default function PhoneNumberVerification() {
    const [pin, setPin] = useState('');
    const [err, setErr] = useState();

    const { sid, incrementStep, number } = useContext(RegisterContext);

    const checkVerificationCode = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: pin,
              sid: sid,
              number: number
            })
        }
        fetch(`/checkotp`, requestOptions)
            .then(res => res.json().then( response => {
                if (response.status === 'approved') {
                  incrementStep();
                } else {
                  setErr("Wrong OTP")
                }
              })
            ).catch(e => setErr(e))
        }

  return (
    <Flex bg={useColorModeValue('gray.100', 'gray.700')} align="center" justify="center" h="100vh">
        <Flex bg={useColorModeValue('white', '#273040')} p={6} rounded="md" w={'auto'} alignItems='center' justifyContent='center'>
            <Stack spacing={6} justifyContent='center'>
                <Flex justifyContent={'center'}>
                    <Heading size={'md'}>Enter OTP Below</Heading>
                </Flex>
                <HStack>
                <PinInput onChange={val => setPin(val)} value={pin}>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                </PinInput>
                </HStack>
                <Button mt={2} rightIcon={<ArrowForwardIcon/>} type="submit" colorScheme="blue" width="full" onClick={checkVerificationCode}>
                    Check OTP
                </Button>
                {err && <Alert status='error'>
                  <AlertIcon />
                  {err}
              </Alert>}
            </Stack> 
        </Flex>
    </Flex>
  )
}
