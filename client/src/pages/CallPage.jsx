import { Flex, Box, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import ChatMain from "../components/Chat/ChatMain";
import ChatSideBar from "../components/Chat/ChatSideBar";
import { ChatState } from "../context/ChatProvider";
import NavBar from "../components/NavBar/NavBar";
import { HomeState } from "../context/HomeProvider";
import { useNavigate, useParams } from "react-router-dom";
import CallBottomBar from "../components/Chat/Call/CallBottomBar";

const CallPage = () => {
  const session = useParams().sessionid;
  const [socketConnected, setSocketConnected] = useState(false);
  const { user, callChat, setCallChat, socket } = ChatState();
  const { me } = HomeState();
  var navigate = useNavigate();

  // Authentication - make sure user can enter room
  useEffect(() => {
    if (me) {
      if (me.call.S !== session) {
        navigate("/");
      } else {
        socket.emit("join call", session);
      }
    }
  }, [me]);

  const getCallChat = () => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/chat?id=" + encodeURI(session), requestOptions).then((res) => {
      res.json().then((data) => {
        setCallChat(data);
      });
    });
  };

  useEffect(() => {
    getCallChat();

    socket.on("connected to call", () => {
      getCallChat();
      setSocketConnected(true);
    });
  }, []);

  return me && user && callChat ? (
    <Box>
      <NavBar />
      <Flex height={"90vh"} align={"center"} justifyContent={"center"}>
        <Flex
          width={"80%"}
          height={"90%"}
          overflow={"hidden"}
          borderRadius={"10px"}
          boxShadow={"xl"}
          flexDir={"column"}
          justifyContent="space-between"
        >
          <div>
            {me.fullname.S} in call room for chat id {session}
          </div>
          <CallBottomBar />
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
