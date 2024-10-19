import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

const Message = ({ text, sender, type, component }) => {
  const isUser = sender === 'user';

  if (type === 'component') {
    return (
      <Flex justify={isUser ? 'flex-end' : 'flex-start'}>
        <Box maxW="75%" borderRadius="lg" padding={2}>
          {component}
        </Box>
      </Flex>
    );
  }

  return (
    <Flex justify={isUser ? 'flex-end' : 'flex-start'}>
      <Box
        maxW="75%"
        bg={isUser ? 'blue.500' : 'gray.100'}
        color={isUser ? 'white' : 'black'}
        px={4}
        py={2}
        borderRadius="lg"
        borderBottomRightRadius={isUser ? 0 : 'lg'}
        borderBottomLeftRadius={!isUser ? 0 : 'lg'}
      >
        <Text fontSize="md">{text}</Text>
      </Box>
    </Flex>
  );
};

export default Message;
