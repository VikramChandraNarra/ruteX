// App.js
import React, { useState, useRef } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import {
  Box,
  Image,
  Button,
  Text,
  VStack,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react'; // Correct import for keyframes
import axios from 'axios';

const Voice = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToDeepgram(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const sendAudioToDeepgram = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    try {
      const response = await axios.post('https://api.deepgram.com/v1/listen', formData, {
        headers: {
          Authorization: `Token 4e5fba3a70b31cd5e060580028430781c372ad7a`,
          'Content-Type': 'multipart/form-data',
        },
        params: {
          model: 'nova-2',
          language: 'en',
          smart_format: true,
        },
      });

      const { transcript } = response.data.results.channels[0].alternatives[0];
      setTranscript(transcript);
    } catch (error) {
      console.error('Error sending audio to Deepgram:', error);
    }
  };

  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  `;

  const recordingAnimation = isRecording
    ? `${pulse} 1s infinite`
    : undefined;

  const buttonBg = useColorModeValue('green.400', 'green.500');
  const recordingBg = useColorModeValue('red.400', 'red.500');

  return (
    <Center height="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <VStack spacing={6}>
        <Box
          boxSize="150px"
          borderRadius="full"
          overflow="hidden"
          boxShadow="lg"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bg="white"
        >
          <Image
            src="https://www.shutterstock.com/image-vector/cheerful-funny-cartoon-childrens-robot-600nw-2407552137.jpg"
            alt="Robot"
            objectFit="cover"
            boxSize="100%"
          />
        </Box>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          bg={isRecording ? recordingBg : buttonBg}
          color="white"
          borderRadius="full"
          boxSize="80px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          fontSize="32px"
          animation={recordingAnimation}
          _hover={{ transform: 'scale(1.1)' }}
        >
          <FaMicrophone />
        </Button>
        <Text fontSize="lg" color={useColorModeValue('gray.700', 'gray.300')}>
          Transcript: {transcript}
        </Text>
      </VStack>
    </Center>
  );
};

export default Voice;
