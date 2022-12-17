import { Flex, IconButton, Text, Box, FormLabel, FormControl, Code, Button, ModalBody, ModalFooter, Input, Spacer } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import {
  Select,
} from "chakra-react-select";

export default function InviteFriends({setIsInviteOpen}) {

    const { openChat, user } = ChatState();

    const username = localStorage.getItem('username');
    const [selected, setSelected] = useState([]);
    const [chatName, setChatName] = useState(null);

    var people = JSON.parse(openChat.people.S);
    var options = [];
    if (user) {
        options = user.friends.L
            .filter(friend => {
                return people.indexOf(friend.S) < 0;
            })
            .map(friend => {
            return {
                id: friend.S, 
                label: friend.S,
                value: friend.S
        }});
    }

    const notifyFriend = (friendUsername) => {
        const peopleList = JSON.parse(openChat.people.S);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                me: username,
                other: friendUsername,
                type: "add",
                name: chatName,
                people: peopleList
            })
        };
        fetch('/notify', requestOptions)
            .then(res => {
                if (!res.ok) {
                    res.text().then(text => console.log(text));
                }
            });
    }

    const handleNotifyFriends = () => {
        for (const friend of selected) {
            notifyFriend(friend.value);
        }
        setIsInviteOpen(false);
    };

    return (
        <>
            <ModalBody>
                <Flex width='full'>
                    <FormControl p={4}>
                        <Input mb={5} placeholder='Chat Name' onChange={(e) => setChatName(e.target.value)}/>
                        <Select
                            isMulti
                            name="colors"
                            options={options}
                            placeholder="Search"
                            closeMenuOnSelect={false}
                            size="sm"
                            onChange={(values) => setSelected(values)}
                        />
                    </FormControl>
                </Flex>
            </ModalBody>

            <ModalFooter>
                <Button colorScheme={'blue'} onClick={() => handleNotifyFriends()} >Notify</Button>
            </ModalFooter>
        </>
        
    )
}
