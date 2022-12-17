import { SkeletonCircle, Box, SkeletonText, Flex, HStack, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

export default function LoadingUserBoxComponent() {
  const bgColor = useColorModeValue("white", "gray.700")
  return (
    <Box padding='6' boxShadow='lg' bg={bgColor} position={"absolute"} width='full'>
        <SkeletonText mt='2' noOfLines={3} spacing='4' skeletonHeight='2' />
    </Box>
  )
}
