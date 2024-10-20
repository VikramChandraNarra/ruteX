import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Center,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import Message2 from './Message2';
import Direction from './Direction';
import axios from 'axios';
import { keyframes } from '@emotion/react';

const Voice = () => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        await handleAudioProcessing(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcessing = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const transcript = await sendAudioToDeepgram(audioBlob);
      if (transcript) {
        const newMessage = { text: transcript, sender: 'user', type: 'text' };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        await sendMessageToBackend(transcript);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages((prevMessages) => [...prevMessages, {
        text: 'Sorry, an error occurred while processing your voice input.',
        sender: 'bot',
        type: 'text',
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendAudioToDeepgram = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    try {
      const response = await axios.post('https://api.deepgram.com/v1/listen', formData, {
        headers: {
          'Authorization': 'Token 4e5fba3a70b31cd5e060580028430781c372ad7a',
          'Content-Type': 'multipart/form-data',
        },
        params: { model: 'nova-2', language: 'en', smart_format: true },
      });

      return response.data.results.channels[0].alternatives[0].transcript;
    } catch (error) {
      console.error('Error sending audio to Deepgram:', error);
      return null;
    }
  };

  const sendMessageToBackend = async (transcript) => {
    setLoading(true); // Set loading to true when the fetch request starts
    try {
      const response = await fetch('/post/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript }),
      });
      const data = await response.json();

      const routeInfo = data.response.route1Info.information;

      // Add the Direction component to messages when the response is received
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: 'component',
          sender: 'bot',
          component: <Direction data={data.response.route1Info} route={data.response.route1} />,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Sorry, an error occurred while processing your request.',
          sender: 'bot',
          type: 'text',
        },
      ]);
    } finally {
      setLoading(false); // Set loading to false when the fetch completes
    }
  };

  const pulseGlow = keyframes`
    0% { box-shadow: 0 0 5px #4FD1C5; }
    50% { box-shadow: 0 0 20px #38B2AC; }
    100% { box-shadow: 0 0 5px #4FD1C5; }
  `;

  const bounce = keyframes`
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  `;

  const LoadingAnimation = () => (
    <Flex justify="center" align="center" height="50px">
      <Box as="span" animation={`${bounce} 1.4s infinite`} mr="4px" bg="teal.500" borderRadius="50%" width="10px" height="10px" />
      <Box as="span" animation={`${bounce} 1.4s infinite 0.2s`} mr="4px" bg="teal.500" borderRadius="50%" width="10px" height="10px" />
      <Box as="span" animation={`${bounce} 1.4s infinite 0.4s`} bg="teal.500" borderRadius="50%" width="10px" height="10px" />
    </Flex>
  );

  return (
    <Flex
      direction="column"
      maxW="100%"
      height="100vh"
      margin="0 auto"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      backgroundColor="gray.50"
    >
      {messages.length === 0 ? (
        <Center flexGrow={1} padding={4}>
          <VStack spacing={4} align="center">
            <Text fontSize="3xl" fontWeight="bold" textAlign="center" color="black">
              Where would you like to go today?
            </Text>
            <Text color="gray.600">Tap the glowing button below to start speaking</Text>
            <Box
              as="button"
              onClick={isRecording ? stopRecording : startRecording}
              backgroundColor="teal.400"
              width="80px"
              height="80px"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              animation={isRecording ? `${pulseGlow} 1.5s infinite` : 'none'}
              transition="all 0.3s ease"
              _hover={{ backgroundColor: 'teal.500' }}
            >
              {isRecording ? <FaStop size="32px" color="white" /> : <FaMicrophone size="32px" color="white" />}
            </Box>
          </VStack>
        </Center>
      ) : (
        <Box flexGrow={1} padding={4} overflowY="auto">
          <VStack spacing={4} align="stretch">
            {messages.map((message, index) => (
              <Message2
                key={index}
                text={message.text}
                sender={message.sender}
                type={message.type}
                component={message.component}
              />
            ))}
            {loading && <LoadingAnimation />}
            <div ref={chatEndRef}></div>
          </VStack>
        </Box>
      )}
    </Flex>
  );
};

export default Voice;
