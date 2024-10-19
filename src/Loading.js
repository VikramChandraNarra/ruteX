// src/Loading.js
import React from 'react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import Typewriter from 'typewriter-effect';
import background from './background.jpg'; // Import the image

const Loading = () => {
  return (
    <Box
      height="100vh"
      width="100vw"
      backgroundImage={`url(${background})`} // Replace with your image URL
      backgroundPosition="center"
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
    >
      <Flex
        height="100%"
        align="center"
        justify="center"
        backgroundColor="rgba(0, 0, 0, 0.5)" // Optional: Overlay to darken the background
      >
        <Text
          fontSize="4xl"
          fontWeight="bold"
          color="white"
          textAlign="center"
        >
        <Typewriter
        options={{
            strings: [
            'ruteX', 
            'disrupt Google Maps', 
            'Navigate Smarter with AI',
            'Your Route, Your Way',
            'The Future of Navigation',
            'Find the Fastest Route Every Time',
            'AI-Powered Journeys'
            ],
            autoStart: true,
            loop: true,
            deleteSpeed: 50,
            delay: 75,
        }}
        />
        </Text>
      </Flex>
    </Box>
  );
};

export default Loading;
