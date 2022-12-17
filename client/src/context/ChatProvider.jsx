import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { HomeState } from "./HomeProvider";

// const ENDPOINT = "http://ec2-54-234-180-4.compute-1.amazonaws.com:3001";
const ENDPOINT = "http://localhost:3001";
var socket = io(ENDPOINT);

const ChatContext = createContext();

const ChatProvider = ({children}) => {
    const [openChat, setOpenChat] = useState(null);
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [searchChat, setSearchChat] = useState(false);
    const [reactionClicked, setReactionClicked] = useState(false);
    const [friendsCache, setFriendsCache] = useState({});

    const {me} = HomeState();

    const getUser = (username) => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        return fetch('/user?username=' + encodeURI(username), requestOptions);
    };

    const getChats = (username) => {
        const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
        };
        fetch('/chats?username=' + encodeURI(username), requestOptions)
            .then(res => {
            res.json().then(data => {
                if (JSON.stringify(data) !== JSON.stringify(chats)) {
                    setChats(data);
                }
            });
        });
    }

    useEffect(() => {
        setUser(me);
    }, [me])

    useEffect(() => {
        if (!user) return;
        var usernamesToCache = [];
        if (user.friends) usernamesToCache = user.friends.L.map(friend => friend.S);
        for (const [friend, _] of Object.entries(friendsCache)) {
            if (usernamesToCache.indexOf(friend) < 0) {
            usernamesToCache.push(friend);
            }
        }
        usernamesToCache.push(localStorage.getItem('username'));
        var promises = [];
        for (const friend of usernamesToCache) {
            promises.push(getUser(friend));
        }
        Promise.all(promises)
            .then(responses => Promise.all(responses.map(data => data.json())))
            .then(data => {
            var newCache = {};
            data.forEach(friend => newCache[friend.username.S] = friend);
            return newCache;
            })
            .then(newCache => {
            if (JSON.stringify(newCache) !== JSON.stringify(friendsCache)) {
                console.log('Friends cache different');
                setFriendsCache(newCache);
            } 
            })
    }, [user]);

    // Refresh state every 5 seconds
    useEffect(() => {
        const retrieveData = () => {
            if (!localStorage.getItem('username')) {
                return;
            }
            getChats(localStorage.getItem('username'));
        };
        retrieveData();
        const interval = setInterval(retrieveData, 5000);
        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
    <ChatContext.Provider
        value={{
            openChat,
            setOpenChat,
            user,
            setUser,
            chats,
            setChats,
            getUser,
            getChats,
            searchChat,
            setSearchChat,
            reactionClicked,
            setReactionClicked,
            socket,
            friendsCache,
            setFriendsCache
        }}
    >
        {children}
    </ChatContext.Provider>
    );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;