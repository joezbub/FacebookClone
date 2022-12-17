import { useToast } from "@chakra-ui/react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRef } from "react";

const HomeContext = createContext();

const HomeProvider = ({children}) => {

    const toast = useToast();
    const [me, setMe] = useState(null);
    const [friends, setFriends] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const getMe = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        fetch('/user?username=' + encodeURI(localStorage.getItem('username')), requestOptions)
            .then(res => {
              res.json().then(data => {
                if (JSON.stringify(data) !== JSON.stringify(me)) {
                  setMe(data);
                }
              });
        });
      };
    
      const getNotifications = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        fetch('/notifications?username=' + encodeURI(localStorage.getItem('username')), requestOptions)
        .then(res => {
          if (!res.ok) {
            res.text().then(text => console.log(text));
          } else {
            res.json().then(data => {
              if (JSON.stringify(data) !== JSON.stringify(notifications)) {
                setNotifications(data);
                if (localStorage.getItem('last_seen_notification_timestamp')) {
                  data.forEach(notification => {
                    const last_time = localStorage.getItem('last_seen_notification_timestamp');
                    if (parseInt(notification.timestamp.N) <= last_time) {
                      return;
                    }
                    if (notification.type.S === 'friend') {
                      toast({
                        title: 'You have a friend request!',
                        description: notification.message.S,
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                      });
                    } else {
                      toast({
                        title: 'You have a chat invite!',
                        description: notification.message.S,
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                      });
                    }
                  })
                }
              }
              localStorage.setItem('last_seen_notification_timestamp', parseInt(new Date().getTime().toString()));
            });
          }
        });
      }
    
      useEffect(() => {
        if (me && me.friends) {
            var promises = [];

          for (const item of me.friends.L) {
            const requestOptions = {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            };
            promises.push(fetch('/user?username=' + encodeURI(item.S), requestOptions));
          }
          Promise.all(promises).then(responses => {
            Promise.all(responses.map(response => {
              return response.json();
            })).then(values => {
              if (JSON.stringify(values) !== JSON.stringify(friends)) {
                setFriends(values);
              }
            });
          });
        }
      }, [me]);
    
      // Refresh state every 5 seconds
      useEffect(() => {
        const retrieveData = () => {
          if (!localStorage.getItem('username')) {
            return;
          }
          getMe();
          getNotifications();
        };
        retrieveData();
        const interval = setInterval(retrieveData, 5000);
        return () => {
          clearInterval(interval);
        }
      }, []);

    
    return (
    <HomeContext.Provider
        value={{
            me,
            getMe,
            setMe,
            friends,
            setFriends,
            notifications,
            setNotifications
        }}
    >
        {children}
    </HomeContext.Provider>
    );
};

export const HomeState = () => {
  return useContext(HomeContext);
};

export default HomeProvider;