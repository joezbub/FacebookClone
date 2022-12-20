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
} from "@chakra-ui/react";
import { IonIcon } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../context/ChatProvider";
import { HomeState } from "../../context/HomeProvider";
import ChatMainHeaderDMIcon from "./ChatMainHeaderDMIcon";
import InviteFriends from "./InviteFriends";

export default function ChatMainHeader() {
  const bg = useColorModeValue("gray.50", "gray.700");
  const username = localStorage.getItem("username");
  const { openChat, setOpenChat, getUser, user, setUser, getChats } =
    ChatState();
  const { me, setMe } = HomeState();
  const [peopleString, setPeopleString] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  var navigate = useNavigate();

  useEffect(() => {
    const l = JSON.parse(openChat.people.S).filter(
      (element) => element !== username
    );
    var s = l.join(", ");
    s = "You, ".concat(s);
    setPeopleString(s);
  }, [openChat]);

  const handleLeaveChat = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        id: openChat.uuid.S,
      }),
    };
    fetch("/leavechat", requestOptions).then((res) => {
      if (res.ok) {
        getChats(username);
        setOpenChat(null);
      }
    });
  };

  const joinCall = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: openChat.uuid.S,
        username: user.username.S,
      }),
    };

    fetch("/joincall", requestOptions).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setOpenChat(data.chat);
          setMe(data.user);
          setUser(data.user);
          navigate("/call/" + encodeURI(openChat.uuid.S));
        });
      }
    });
  };

  return (
    <>
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)}>
        <ModalOverlay />
        <ModalContent zIndex={"10000"}>
          <ModalHeader>Invite friends</ModalHeader>
          <ModalCloseButton />
          <InviteFriends setIsInviteOpen={setIsInviteOpen} />
        </ModalContent>
      </Modal>
      <Flex
        alignItems={"center"}
        height={"7%"}
        bg={bg}
        boxShadow={"0 7px 7px -10px black"}
        padding={"10px"}
        justify-content={"space-between"}
        width={"full"}
      >
        {openChat.type.S === "add" ? (
          <>
            <Flex
              h="100%"
              paddingLeft={"10px"}
              alignItems="center"
              justifyContent={"center"}
            >
              <Avatar
                size="sm"
                name={openChat.name.S.replaceAll("_", " ")}
                src="https://bit.ly/tioluwani-kolawole"
              ></Avatar>
            </Flex>
            <Text pl={2} fontSize={"large"} fontWeight={"bold"}>
              {openChat.name.S}
            </Text>
            <Text pl={3} textOverflow={"ellipsis"} fontSize={"small"}>
              {peopleString}
            </Text>
          </>
        ) : (
          <ChatMainHeaderDMIcon chat={openChat} />
        )}

        <Spacer />

        <Button
          ml={3}
          onClick={joinCall}
          disabled={(user.call?.S || openChat.uuid.S) !== openChat.uuid.S}
          colorScheme="green"
        >
          {!openChat.call || JSON.parse(openChat.call?.S || []).length === 0
            ? "Call"
            : "Join"}
        </Button>
        <Button ml={3} onClick={() => setIsInviteOpen(true)} colorScheme="blue">
          Invite
        </Button>
        <Button ml={3} onClick={handleLeaveChat} colorScheme="red">
          Leave
        </Button>
      </Flex>
    </>
  );
}
