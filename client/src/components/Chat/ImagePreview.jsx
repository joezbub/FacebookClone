import { Box, IconButton, Image, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { CloseIcon } from '@chakra-ui/icons'

export default function ImagePreview({link}) {
  return (
    <Box bg={useColorModeValue('gray.100, gray.600')} borderRadius={2} zIndex={2} mb={6} position={'relative'}>
        <Image
            src='https://pennbookusermedia.s3.us-east-1.amazonaws.com/posts/565174a1-36ff-4fa5-b394-0d2770a9dbc3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDQaCXVzLWVhc3QtMSJHMEUCIANQJ7%2FBSVOqX0DWYmYV3aS76I%2F2Jun9CER%2BTLSWviuVAiEAuKUabTDnAywEkoUQYGoja8k01r4hfpeh9vE0arWM0Y4q%2BwIIbRAAGgw3OTc1NzIwMjc1ODciDPxISwwxZosF7BoTfirYAqxGcOXoOWrowGTs2NQWvublKM%2BChP9Lwa0I2iqiwQ4h%2FmWYd59WY5Mbl0day1E9NCXkIixk0R%2BJEoWQFK%2FOzGXYveVLOzBYXYWgLueEjl6K8gXI6uTiQAwiJ%2FOvEcV%2Fte3kfeBO%2B%2BbehNOP1JCKHsbE6kGEMGmxtcq8etl5FxQ5ljzuHtfUa6SeEW0WPyWytnHyGZDGgX4wvDtSNcAXXllS5qzjM657Trvro1zNpAxJxdKH0PaTGF5ZKZX3k0O6lvWKEvRbzruGfmCzXHlIeiSbnLbKV5PkiqWXTYC8XqwzUrGMxx3nxtUSc8qmnktyRlFIDTnNvMDjlZ0nwY5nGDctOVX5Gdh1qoJUAF68Qa5m5yPfelo8OPRZq3K7zLB9yVE95sES2qPT6ASxY%2BxoW3XkcBRrd6EM9LLvRy5%2BNHB0Xp9Ow7PvO8szyFQUALtJ3dOJAyfSS2iaMLnchJ0GOrMCwM6q7hOEmMJttRvWfLAb%2F5L%2FdiU7M4NPvxUspVrd8VKA%2BB8VhYuzDGarjUliWB6lkuHL7klNDHM0dqnekM60cbFIl30tSfqm1APJp%2FX9slkTWYrIheXa8IBgRNlYEj3zvwPDCViOYBOWTCx5ro9LyB3eFZoonCyg9faYK5EjGZ%2Fcka4Ub0D5NlzWwKZkSQIXY2T2sVyXDPOnLH1C68wTbDWBUOhhfC3FTdKgA8g%2FNVWaS1p5%2BfrnXOo68ooP4hVlhbFseOiYEeVIk3I%2BqhJTy7IY4EQb1pR3T%2BnXjMMYuZAu6VapJHywLRj8GQzJb5W4CwWLL4lB1Hbv70kIzL8U%2BlMM2M6oPUk7mRAGpJvgJo947RzNYAfycOCXyEt%2F4MIxEIBgZ22ZE0AZ%2BU3tF4FtRLoVLQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20221220T033852Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIA3TMX7KTBYHC6IRRS%2F20221220%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4f32cd5e83caa9e7ec61cd30626213c9e37bb9f7ad5eec5a5f60124b88e43925'
            maxH={'100px'}
            borderRadius={6}
        >
            
        </Image>
        <IconButton icon={<CloseIcon/>} position='absolute' top={0} zIndex={300} left={0} ml={120} mt={-3} borderRadius="full" colorScheme={'red'} size='sm'/>
    </Box>
  )
}
