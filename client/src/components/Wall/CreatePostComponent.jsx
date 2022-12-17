import { Avatar, Box, Button, Card, Flex, FormControl, FormLabel, Heading, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, Textarea, useColorModeValue } from '@chakra-ui/react'
import React, { useState } from 'react'
import { IonIcon } from '@ionic/react'
import { cameraOutline, videocamOutline } from 'ionicons/icons'
import { HomeState } from '../../context/HomeProvider'
import Profile from '../General/Profile'
import { AttachmentIcon } from '@chakra-ui/icons'
import IconButtonAttach from './IconButtonAttach'
const { v4: uuidv4 } = require('uuid');

export default function CreatePostComponent({getPosts, recipient}) {

    const {me} = HomeState();
    const [open, setOpen] = useState();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const titleLabel = "What's on your mind, " + me.fullname.S.split(' ')[0] + "?"
    const validTypes = ['image/jpg', 'image/png', 'image/jpeg']
    const [isUploaded, setIsUploaded] = useState(false)
    
    const reset = () => {
      setTitle("");
      setBody("");
      setOpen(false);
      setIsUploaded(false);
      localStorage.removeItem('imageid')
    }

    const handlePost = () => {
      const imageid = localStorage.getItem('imageid') ? localStorage.getItem('imageid') : "";
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title,
              description: body,
              creator: me.username.S, 
              recipient: recipient,
              imageid: imageid
            })
        };
        fetch('/createpost', requestOptions)
            .then(res => {
              if (!res.ok) {
                res.text().then(text => console.log(text));
              } else {
                res.json().then(post => {
                  getPosts();
                });
              }
            });
        reset();
    }

    const handleUpload = async e => {
      localStorage.setItem('imageid', uuidv4())
      const file = e.target.files[0];
      console.log(file)
      if (!validTypes.find(t => t === file.type)) {
          alert('not valid file type')
          return;
      }

      const form = new FormData();
      form.append('postimage', file)
      form.append('id', localStorage.getItem('imageid'))
      
      const requestOptions = {
          method: 'POST',
          body: form
      };
      await fetch('/uploadpostpicture', requestOptions)
          .then(res => {
              res.json().then(data => setIsUploaded(true))
      });
  }

  return (
    <>
        <Card width={'100%'} p={4} mb={2}>
            <Box>
                <Flex alignItems={'center'}>
                    <Profile author={me} link={false}/>
                    <Button width='full' colorScheme={'gray'} borderRadius={'50px'} fontWeight={'normal'}
                        fontSize='md' color={useColorModeValue('gray.600', 'gray.400')} onClick={() => setOpen(true)}
                        >
                        {titleLabel}
                    </Button>
                </Flex>
            </Box>
        </Card>
        <Modal
            isOpen={open}
        >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={'center'}>Create Post</ModalHeader>
          <ModalCloseButton onClick={() => reset()}/>
          <ModalBody pb={6}>

            <FormControl>
                <Input name="title" id="title" placeholder={titleLabel} 
                  onChange={(e) => setTitle(e.target.value)}/>
            </FormControl>
            <FormControl mt={4}>
                <Textarea id='description' br={'full'} name='fullname' placeholder={"Tell us more"} 
                  onChange={(e) => setBody(e.target.value)}/>
            </FormControl>
            <input type="file" style={{display: 'none'}} id="file-upload-wall-post" onChange={e => handleUpload(e)}/>
                <label for='file-upload-wall-post'>
                  <IconButtonAttach uploaded={isUploaded}/>
                </label>
            <Flex justifyContent='center'>
                <Button disabled={title === ""} w='full' my={5} colorScheme="blue" 
                  onClick={() => handlePost()}>Post!</Button>
            </Flex>

          </ModalBody>

        </ModalContent>
      </Modal>
    </>
  )
}