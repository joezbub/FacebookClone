import React, {useState, useEffect} from 'react'
import {useColorModeValue} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons' 
import { IonIcon } from '@ionic/react'
import { heart } from 'ionicons/icons'
import { heartOutline } from 'ionicons/icons'
import {
  Popover,
  PopoverTrigger, 
  PopoverContent,
  PopoverArrow
} from '@chakra-ui/react'

import {
    Button,
 } from '@chakra-ui/react'

export default function CommentLikeButtonComponent({ id, type }) {
  const bgColor = useColorModeValue("white", "gray.800")
    const username = localStorage.getItem('username');
    const [liked, setLiked] = useState(false);
    const [reactors, setReactors] = useState([]);
    const [hover, setHover] = useState(false);
  
    const getReactors = () => {
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      };
      fetch('/comment?id=' + encodeURI(id), requestOptions)
      .then(res => {
        if (!res.ok) {
          res.text().then(text => console.log(text));
        } else {
          res.json().then(data => {
            data && setReactors(data.likes.L)
          });
        }
      });
    }
  
    // Refresh like button state every 10 seconds
    useEffect(() => {
      const retrieveData = () => {
        getReactors();
      };
      retrieveData();
      const interval = setInterval(retrieveData, 5000);
      return () => {
        clearInterval(interval);
      }
    }, []);
  
  
    const handleClick = () => {
      if (!liked) {
        // User liked this post
        const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id,
                username: username,
                type: type
              })
          };
          fetch('/like', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(text => console.log(text));
                } else {
                  res.json().then(reactors => {
                    console.log('like returned');
                    console.log(reactors);
                    setReactors(reactors)
                  });
                }
              });
      } else {
        // User undo like
        const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id,
                username: username,
              })
          };
          fetch('/undolike', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(text => console.log(text));
                } else {
                  res.json().then(reactors => {
                    console.log('undo like returned');
                    console.log(reactors);
                    setReactors(reactors)
                  });
                }
              })
      }
      setLiked(!liked);
    };
  
    useEffect(() => {
      reactors && setLiked(reactors.map(reactor => reactor.S).indexOf(username) >= 0);
    }, [reactors]);

    const List = () => {
      return (
        reactors.map(r => {
          return <span>{r.S}</span>
        })
      )
    }
  
    return (
            <Popover    
                placement='top'
                isOpen={(hover && reactors.length > 0)}
                preventOverflow={true}
            >
                <PopoverTrigger>
                  <Button h={7}
                    onMouseOver={() => setHover(true)}
                    onMouseOut={() => setHover(false)}
                    onClick={handleClick}
                    leftIcon={liked ? <IonIcon icon={heart} color={'danger'}/> : <IonIcon icon={heartOutline}/>}>
                      {reactors ? reactors.length : 0}
                  </Button>
                </PopoverTrigger>
                <PopoverContent p={5} w={'auto'}>
                    <PopoverArrow />
                    <List/>
                </PopoverContent>
            </Popover>
    )
}


//<Button h={7} leftIcon={<IonIcon icon={heart} color={'danger'}/>}>{2}</Button>