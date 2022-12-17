import { Box, Input, InputGroup, InputLeftElement, Stack, useColorModeValue, useOutsideClick } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { IonIcon } from '@ionic/react'
import { personCircle } from 'ionicons/icons'
import UserBoxComponent from './UserBoxComponent';
import LoadingUserBoxComponent from './LoadingUserBoxComponent';

export default function UserSearchBarComponent() {
    const searchBg = useColorModeValue("white", "gray.600");
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const bgColor = useColorModeValue("white", "gray.700")
    const searchBarRef = useRef(null);

    const ref = React.useRef();
    useOutsideClick({
        ref: ref,
        handler: () => setOpen(false),
    })

    const handleSearch = (e) => {
        setLoading(true)
        const str = e.target.value;
        if (str.length == 0) setLoading(false);
        fetch('/search?string=' + encodeURI(str) + '&type=user')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setUsers(data);
                setLoading(false);
            })
      }

  return (
    <Box ref={ref} >
        <InputGroup >
            <InputLeftElement
                children={<IonIcon icon={personCircle} size="100"/>}
            />
            <Input bg={searchBg} placeholder='Search users'
                onChange={e => handleSearch(e)} onClick={() => setOpen(true)}
                ref={searchBarRef}
            />
        </InputGroup>
        <Box>
            <Stack spacing={1} position={"absolute"} zIndex={10000} bg={bgColor} borderRadius={4} boxShadow={'xl'}
                width={searchBarRef.current ? searchBarRef.current.offsetWidth : '500px'}>
                {open && users && users.map(u =>  
                    loading ? <LoadingUserBoxComponent/> : 
                    <UserBoxComponent key={u.M.username.S} username={u.M.username.S} fullname={u.M.fullname.S} />
                )}
            </Stack>
        </Box>
    </Box>
  )
}
