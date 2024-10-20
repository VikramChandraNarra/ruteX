// Message.js
import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

const Message = ({ text, type, component }) => {
  return (
    <Flex
      justify="center" // Center-align the message horizontally
      px={4} // Horizontal padding to prevent messages from touching the edges
    >
      <Box
        maxW="70%" // Maximum width for the message box
        bg={type === 'component' ? 'transparent' : 'gray.100'} // Transparent background for component type
        color="black" // Text color
        px={4} // Horizontal padding inside the box
        py={2} // Vertical padding inside the box
        borderRadius="lg" // Rounded corners
        marginY={2} // Vertical margin between messages
        boxShadow="sm" // Subtle shadow for depth
        wordBreak="break-word" // Ensure long words break appropriately
      >
        {type === 'component' ? component : <Text fontSize="md">{text}</Text>}
      </Box>
    </Flex>
  );
};

export default Message;
