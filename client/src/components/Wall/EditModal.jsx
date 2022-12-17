import React, { useEffect, useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    FormControl,
    FormLabel,
    Input,
    ModalFooter,
    Button,
    Tag,
    Text
} from '@chakra-ui/react'
import ToggleTag from './ToggleTag'
import { HomeState } from '../../context/HomeProvider'
import { useNavigate } from 'react-router-dom';

export default function EditModal({isOpen, setOpen}) {

  const {me} = HomeState();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState(""); 
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [affiliation, setAffiliation] = useState(""); 
  const cats = ['MEDIA', 'ARTS', 'DIVORCE', 'BUSINESS', 'ENVIRONMENT', 'HEALTHY LIVING', 'COLLEGE', 'BLACK VOICES', 'PARENTING', 'STYLE', 'RELIGION', 'WORLD NEWS', 'FIFTY', 'HOME & LIVING', 'GOOD NEWS', 'WELLNESS', 'LATINO VOICES', 'IMPACT', 'FOOD & DRINK', 'TRAVEL', 'THE WORLDPOST', 'COMEDY', 'GREEN', 'POLITICS', 'WOMEN', 'EDUCATION', 'PARENTS', 'SCIENCE', 'TASTE', 'STYLE & BEAUTY', 'WEIRD NEWS', 'MONEY', 'CULTURE & ARTS', 'SPORTS', 'WORLDPOST', 'QUEER VOICES', 'ARTS & CULTURE', 'WEDDINGS', 'CRIME', 'ENTERTAINMENT', 'TECH']
  const [selection, setSelection] = useState(cats.map(cat => {
        return me.news.L.some(item => item.S === cat);
      }));

  const [passwordText, setPasswordText] = useState(null); 

  const handlePasswordChange = (password) => {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'password', value: password })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => console.log(err));
                } else {
                  setPasswordText(null);
                }
              });
  }

  const handleEmailChange = (email) => {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'email', value: email })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => console.log(err));
                }
              });
  }

  const handleAffiliationChange = (affl) => {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'affiliation', value: affl })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => alert(err));
                } else {
                  const title = me.fullname.S + ' updated his affiliation to ' + affl;
                  const params = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title,
                      description: "",
                      creator: me.username.S, 
                      recipient: me.username.S,
                      imageid: ""
                    })
                  }
                  fetch('/createpost', params);
                }
              });
  }

  const handleNewsChange = (selectedCats) => {
      if (selectedCats.length < 2) {
        alert("Please select at least two news categories");
      } else {
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: me.username.S, attribute: 'news', value: selectedCats })
          };
          fetch('/changeaccount', requestOptions)
              .then(res => {
                if (!res.ok) {
                  res.text().then(err => alert(err));
                } else {
                  var categories = "";
                  for (var i = 0; i < selectedCats.length; ++i) {
                    if (i > 0) {
                      categories = categories.concat(', ' + selectedCats[i]);
                    } else {
                      categories = categories.concat(' ' + selectedCats[i]);
                    }
                  }
                  const title = me.username.S + ' updated his news categories:';
                  const params = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title,
                      description: categories,
                      creator: me.username.S, 
                      recipient: me.username.S,
                      imageid: ""
                    })
                  }
                  fetch('/createpost', params);
                }
              });
      }
  }

  const handleSave = () => {
    if (emailAddress !== "") {
      console.log('Changing email');
      handleEmailChange(emailAddress);
    }

    if (newPassword && retypePassword) {
       if (newPassword === "" || retypePassword === "") {
          setPasswordText("Password is empty");
        } else if (newPassword !== retypePassword) {
          setPasswordText("Passwords are different");
        } else {
          console.log('Changing password');
          handlePasswordChange(newPassword);
        }
    }

    if (affiliation !== "" && affiliation !== me.affiliation.S) {
      console.log('Changing afiiliation');
      handleAffiliationChange(affiliation);
    }

    var selectedCats = [];
    selection.forEach((val, index) => {
      if (val) {
        selectedCats.push(cats[index]);
      }
    });
    console.log(selectedCats);
    if (JSON.stringify(me.news.L.map(item => item.S)) !== JSON.stringify(selectedCats)) {
      console.log("Changing news categories");
      handleNewsChange(selectedCats);
    }

    setNewPassword("");
    setEmailAddress("");
    setRetypePassword("");
    setAffiliation("");
  }

  return (
    <Modal
        isOpen={isOpen}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change your Information</ModalHeader>
          <ModalCloseButton onClick={() => setOpen(false)}/>
          <ModalBody pb={6}>

            <FormControl>
              <FormLabel>Email Address</FormLabel>
              <Input placeholder='Email Address' type='email' value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>New Password</FormLabel>
              <Input placeholder='New Password' type={'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Retype New Password</FormLabel>
              <Input placeholder='Retype New Password' type={'password'} value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} />
            </FormControl>

            {passwordText && <Text mt={2} fontSize={'sm'} color='red'>{passwordText}</Text>}

            <FormControl mt={4}>
              <FormLabel>Affiliation</FormLabel>
              <Input placeholder='Affiliation' value={affiliation} onChange={(e) => setAffiliation(e.target.value)} />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Change News Categories</FormLabel>
                {selection.map((val, index) => 
                  <ToggleTag key={index} val={cats[index]} initial={val} selection={selection} setSelection={setSelection} index={index} />)}
            </FormControl>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={() => handleSave()}>
              Save
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  )
}
