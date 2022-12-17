import { useFormik } from "formik";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading, 
  Alert,
  AlertIcon,
  Link,
  useColorModeValue
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {ExternalLinkIcon} from '@chakra-ui/icons';

export default function App() {

  const navigate = useNavigate();
  const [err, setErr] = useState();

  useEffect(() => {
    localStorage.getItem('username') && navigate("/homepage");
  })

  var handleSubmit = (username, password) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    };
    fetch('/login', requestOptions)
        .then(res => {
            if (!res.ok) {
                res.text().then(text => setErr(text));
            } else {
                setErr(null)
                localStorage.setItem('username', username);
                navigate("/homepage");
            }
        });
  }

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      rememberMe: false
    },
    onSubmit: (values) => {
        console.log(values)
        handleSubmit(values.username, values.password)
    }
  });
  return (
    <Flex bg={useColorModeValue('gray.100', 'gray.700')} align="center" justify="center" h="100vh">
      <Box p={6} bg={useColorModeValue('white', '#273040')} rounded="md" w={'25%'}>
        <form onSubmit={formik.handleSubmit}>
          <VStack spacing={4} align="flex-start">
            <Box textAlign="center" width="full">
                <Heading size='md'>Sign In</Heading>
            </Box>
            <FormControl isRequired>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                name="username"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.username}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                name="password"
                type="password"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
            </FormControl>
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              onChange={formik.handleChange}
              isChecked={formik.values.rememberMe}
              colorScheme="teal"
            >
              Remember me?
            </Checkbox>
            {err && <Alert status='error'>
                <AlertIcon />
                {err}
            </Alert>}
            <Button type="submit" colorScheme="teal" width="full">
              Login
            </Button>
            <Box textAlign="center" width="full">
              or <Link href='/register' colorScheme="teal">Sign Up<ExternalLinkIcon mx='2px' /></Link>
            </Box>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}