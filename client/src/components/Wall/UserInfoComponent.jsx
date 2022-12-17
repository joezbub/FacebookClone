import React from 'react'
import {
    Heading,
    Text,
    Flex, 
    Card,
    CardHeader,
    StackDivider,
    CardBody,
    Stack,
    Box,
    Tag,
    TagLabel,
    TagCloseButton,
    IconButton
} from '@chakra-ui/react'
import { IonIcon } from '@ionic/react'
import { person } from 'ionicons/icons'
import { calendar, mail, school, cafe } from 'ionicons/icons'
import { EditIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import EditModal from './EditModal'
import CreatePostComponent from './CreatePostComponent'

export default function UserInfoComponent(props) {
    const { user } = props;
    const [open, setOpen] = useState(false);

    const AttrRow = ({attr, value, icon}) => {
        return (
            <Flex justifyContent={'space-between'}>
                <Flex>
                    {icon}
                    <Heading size='xs' textTransform='uppercase' p={0} ml={2}>
                        {attr}
                    </Heading>
                </Flex>
                <Text pt='2' fontSize='sm' p={0}>
                    {value}
                </Text>
            </Flex>
        )
    }

    const TagRow = ({attr, tags, icon}) => {
        return (
            <Box justifyContent={'space-between'}>
                <Flex>
                    {icon}
                    <Heading size='xs' textTransform='uppercase' p={0} ml={2}>
                        {attr}
                    </Heading>
                </Flex>
                <Box w={'full'} mt={3}>
                    {tags.map(t => 
                        <Tag
                            borderRadius='full'
                            variant='solid'
                            colorScheme='green'
                            mb={'1'}
                            mr={1}
                            key={t}
                            >
                            <TagLabel>{t}</TagLabel>
                        </Tag>
                    )}
                    </Box>
            </Box>
        )
    }

  return (
    <>
        <Card size='md'>
            <CardHeader>
                <Flex justifyContent={'space-between'}>
                    <Heading size='md' p={0}>Information</Heading>
                    {localStorage.getItem('username') === user.username.S &&
                     <IconButton size={'sm'} icon={<EditIcon />} onClick={() => setOpen(true)} />}
                </Flex>
            </CardHeader>
            <CardBody>
                <Stack divider={<StackDivider />} spacing={4}>
                    <AttrRow attr={"name"} value={user.fullname.S} icon={<IonIcon icon={person}/>}/>
                    <AttrRow attr={"Email Address"} value={user.email.S} icon={<IonIcon icon={mail} />} />
                    <AttrRow attr={"Birthday"} value={user.birthday.S} icon={<IonIcon icon={calendar} />} />
                    <AttrRow attr={"Affiliation"} value={user.affiliation.S} icon={<IonIcon icon={school} />} />
                    <TagRow attr={"News Categories"} tags={user.news.L.map(cat => cat.S)} icon={<IonIcon icon={cafe} />} />
                </Stack>
            </CardBody>
        </Card>
        {localStorage.getItem('username') === user.username.S && <EditModal isOpen={open} setOpen={setOpen} />}
      </>
  )
}
