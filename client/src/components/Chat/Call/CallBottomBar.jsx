import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFocusScope,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/react";
import { IonIcon } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../../context/ChatProvider";
import { HomeState } from "../../../context/HomeProvider";

export default function CallBottomBar() {
  const bg = useColorModeValue("gray.50", "gray.700");
  const {
    openChat,
    setOpenChat,
    user,
    setUser,
    getUser,
    callChat,
    setCallChat,
    socket,
  } = ChatState();
  const { setMe } = HomeState();
  const [members, setMembers] = useState(null);
  var navigate = useNavigate();

  const handleLeave = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: callChat.uuid.S,
        username: user.username.S,
      }),
    };

    navigate("/chats");

    fetch("/leavecall", requestOptions).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          socket.emit("leave call", callChat.uuid.S);
          setCallChat(null);
          setMe(data.user);
          setUser(data.user);
        });
      }
    });
  };

  useEffect(() => {
    if (callChat) {
      var tmp = JSON.parse(callChat.call.S);
      setMembers(tmp);
    }
  }, [callChat]);

  return (
    <Flex
      alignItems={"center"}
      height={"7%"}
      bg={bg}
      padding={"10px"}
      justify-content={"space-between"}
      width={"full"}
    >
      <Button px={5} colorScheme="gray">
        Unmute
      </Button>
      <Button px={8} ml={3} colorScheme="gray">
        Show video
      </Button>
      <Popover placement="top">
        <PopoverTrigger>
          <Button px={8} ml={3} colorScheme="gray">
            {JSON.parse(callChat.call.S).length} members
          </Button>
        </PopoverTrigger>
        <PopoverContent p={3} width="175px">
          <PopoverArrow />
          {members &&
            members.map((item) => (
              <Text key={item.username}>{item.fullname}</Text>
            ))}
        </PopoverContent>
      </Popover>
      <Flex float="right" width="full" flexDir="row-reverse">
        <Button ml={3} onClick={handleLeave} colorScheme="red">
          Leave
        </Button>
      </Flex>
    </Flex>
  );
}
