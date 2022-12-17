import { Flex, Box, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import ChatMain from "../components/Chat/ChatMain";
import ChatSideBar from "../components/Chat/ChatSideBar";
import { ChatState } from "../context/ChatProvider";
import NavBar from "../components/NavBar/NavBar";
import { HomeState } from "../context/HomeProvider";
import { useNavigate, useParams } from "react-router-dom";

const CallPage = () => {
  const session = useParams().sessionid;
  const { user } = ChatState();
  const { me } = HomeState();
  var navigate = useNavigate();

  // Authentication - make sure user can enter room
  useEffect(() => {
    if (me) {
      if (!me.chats.L.some((id) => session === id.S)) {
        navigate("/");
      }
    }
  }, [me]);

  return me && user ? (
    <Box>
      <NavBar />
      <Flex height={"90vh"} align={"center"} justifyContent={"center"}>
        <Flex
          width={"80%"}
          height={"90%"}
          overflow={"hidden"}
          borderRadius={"10px"}
          boxShadow={"xl"}
        >
          <div>
            {me.fullname.S} in call room for chat id {session}
          </div>
        </Flex>
      </Flex>
    </Box>
  ) : (
    <Flex height="100vh" justifyContent={"center"} alignItems={"center"}>
      <Spinner size="md" margin="auto" />
    </Flex>
  );
};

export default CallPage;
