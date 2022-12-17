import { Box, FormControl, Input, InputGroup, InputLeftElement, Stack, useColorModeValue, useOutsideClick } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { newspaper } from 'ionicons/icons'

export default function NewsSearchBar() {
    const searchBg = useColorModeValue("white", "gray.600");
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key !== 'Enter' || input.length === 0) {
            return;
        }
        navigate('/newssearch/' + encodeURI(input));
        setInput("");
        navigate(0);
      }

  return (
    <Box width='60%'>
        <FormControl
        onKeyDown={handleSearch}
        isRequired
        >
            <InputGroup>
                <InputLeftElement
                    children={<IonIcon icon={newspaper} size="100"/>}
                />
                <Input placeholder='Search news articles' bg={searchBg} onChange={(e) => setInput(e.target.value)} />
            </InputGroup>
        </FormControl>
    </Box>
  )
}
