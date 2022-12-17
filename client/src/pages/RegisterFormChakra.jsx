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
  MenuButton,
  MenuItemOption,
  MenuOptionGroup,
  Menu,
  MenuList,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {ArrowForwardIcon, ExternalLinkIcon} from '@chakra-ui/icons';
import { useContext } from "react";
import { RegisterContext } from "./RegisterPageChakra";

export default function RegisterFormChakra() {

    const navigate = useNavigate();
    const [err, setErr] = useState();
    const { incrementStep, setData } = useContext(RegisterContext);

    const handleContinue = (username, password, fullname, birthday, address, affiliation) => {
      const data = {
        "username": username,
        "password": password,
        "fullname": fullname,
        "birthday": birthday, 
        "address": address,
        "affiliation": affiliation
      }
      setData(data);
      incrementStep();
    }

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      fullname: "", 
      birthday: "", 
      address: "",
      affiliation: ""
    },
    onSubmit: (values) => {
        console.log(values)
        handleContinue(values.username, values.password, values.fullname, values.birthday, values.address, values.affiliation)
    }
  });
  return (
    <Flex bg={useColorModeValue('gray.100', 'gray.700')} align="center" justify="center" h="100vh">
      <Box bg={useColorModeValue('white', '#273040')} p={6} rounded="md" w={'30%'}>
        <Box textAlign="center" width="full" marginBottom="10px">
            <Heading size='md'>Register</Heading>
        </Box>
        <form onSubmit={formik.handleSubmit}>
          <Box>
          <VStack spacing={4} align="flex-start" marginRight="10px" marginBottom='20px'>
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
            <HStack width='full'>
              <FormControl isRequired>
                <FormLabel htmlFor="fullname">Full Name</FormLabel>
                <Input
                  id="fullname"
                  name="fullname"
                  variant="filled"
                  onChange={formik.handleChange}
                  value={formik.values.fullname}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="birthday">Birthday</FormLabel>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  variant="filled"
                  onChange={formik.handleChange}
                  value={formik.values.birthday}
                />
              </FormControl>
            </HStack>
            <FormControl isRequired>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="address"
                name="address"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.address}
              />
              </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="affiliation">Affiliation</FormLabel>
              <Input
                id="affiliation"
                name="affiliation"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.affiliation}
              />
            </FormControl>
            {err && <Alert status='error'>
                  <AlertIcon />
                  {err}
              </Alert>}
            <Button mt={2} rightIcon={<ArrowForwardIcon/>} type="submit" colorScheme="blue" width="full">
              Continue
            </Button>
          </VStack>
          </Box>
        </form>
      </Box>
    </Flex>
  );
}