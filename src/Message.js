import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

const Message = ({ text, sender, type, component }) => {
  const isUser = sender === 'user';

  return (
    <Flex
      justify={isUser ? 'flex-end' : 'flex-start'}
      px={4} // Add horizontal padding to bring messages closer to the center
    >
      <Box
        maxW="70%" // Slightly reduce the max width for better appearance
        bg={type === 'component' ? 'transparent' : isUser ? 'blue.500' : 'gray.100'}
        color={isUser ? 'white' : 'black'}
        px={4}
        py={2}
        borderRadius="lg"
        borderBottomRightRadius={isUser ? 0 : 'lg'}
        borderBottomLeftRadius={!isUser ? 0 : 'lg'}
        marginY={2} // Add some vertical space between messages
      >
        {type === 'component' ? component : <Text fontSize="md">{text}</Text>}
      </Box>
    </Flex>
  );
};

export default Message;
