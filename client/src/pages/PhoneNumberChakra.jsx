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
  InputGroup,
  InputLeftAddon,
  FormHelperText,
  StylesProvider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import {ArrowForwardIcon, ExternalLinkIcon} from '@chakra-ui/icons';
import { RegisterContext } from "./RegisterPageChakra";

export default function PhoneNumberChakra() {

    const [err, setErr] = useState();
    const [categories, setCategories] = useState([])
    const { incrementStep, setSid, sid, jumpToEnd, setNumber } = useContext(RegisterContext);
    const sendVerificationCode = (number) => {
        const requestOptionsGetSid = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }
        fetch('/getsid', requestOptionsGetSid)
          .then(res => {
            res.json().then(service => {
              const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sid: service.sid,
                    number: number
                })
              }
              setSid(service.sid)
              fetch('/sendotp', requestOptions)
                .then(res => {
                  if (!res.ok) {
                    res.text().then(text => setErr(text));
                  } else {
                    incrementStep();
                  }
                })
            });
          })
        }


  const formik = useFormik({
    initialValues: {
      phonenumber: ""
    },
    onSubmit: (values) => {
        console.log(values)
        setNumber(`+1${values.phonenumber}`);
        sendVerificationCode(`+1${values.phonenumber}`)
    }
  });
  return (
    <Flex bg={useColorModeValue('gray.100', 'gray.700')} align="center" justify="center" h="100vh">
      <Box bg={useColorModeValue('white', '#273040')} p={6} rounded="md" w={'30%'}>
        <form onSubmit={formik.handleSubmit}>
            <FormControl>
              <FormLabel htmlFor="username">Phone Number</FormLabel>
              <InputGroup>
                <InputLeftAddon children='+1' />
                <Input
                    id="phonenumber"
                    name="phonenumber"
                    onChange={formik.handleChange}
                    value={formik.values.phonenumber}
                />
                </InputGroup>
                <FormHelperText>
                  This step is optional.
                </FormHelperText>
            </FormControl>
            <Button mt={2} rightIcon={<ArrowForwardIcon/>} type="submit" colorScheme="blue" width="full">
              Get OTP
            </Button>
            <Button mt={2} rightIcon={<ArrowForwardIcon/>} onClick={jumpToEnd} colorScheme="gray" width="full">
              Or Continue
            </Button>
        </form>
      </Box>
    </Flex>
  );
}