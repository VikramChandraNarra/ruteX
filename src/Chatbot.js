import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Input, Button, VStack, IconButton, Text, Center, Textarea } from '@chakra-ui/react';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // Import microphone and stop icons
import Message from './Message';
import Direction from './Direction';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]); // Start with an empty message array
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);

  // Function to scroll to the bottom when a new message appears
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
        await sendAudioToDeepgram(audioBlob);
        audioChunksRef.current = []; // Clear the audio chunks
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
          'Authorization': `Token 4e5fba3a70b31cd5e060580028430781c372ad7a`,
          'Content-Type': 'multipart/form-data',
        },
        params: {
          model: 'nova-2',
          language: 'en',
          smart_format: true,
        },
      });

      const { transcript } = response.data.results.channels[0].alternatives[0];
      setUserInput(transcript); // Insert the transcribed text as the user input
    } catch (error) {
      console.error('Error sending audio to Deepgram:', error);
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      const newMessage = { text: userInput, sender: 'user', type: 'text' };
      setMessages([...messages, newMessage]);

      const requestData = { input: userInput };

      fetch('http://127.0.0.1:5000/generate_route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('API Response:', data);
          const botReply = {
            type: 'component',
            sender: 'bot',
            component: <Direction data={data.route1Info} route={data.route1} />,
          };
          setMessages((prevMessages) => [...prevMessages, botReply]);
        })
        .catch((error) => {
          console.error('Error:', error);
          const errorMessage = {
            text: 'Sorry, an error occurred while processing your request.',
            sender: 'bot',
            type: 'text',
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        });

      setUserInput(''); // Clear the input field
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

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
      {/* Conditional rendering: Show greeting when no messages yet */}
      {messages.length === 0 ? (
        <Center flexGrow={1} padding={4}>
          <VStack spacing={4} align="center">
            <Text fontSize="3xl" fontWeight="bold" textAlign="center" color="black">
              Where would you like to go today?
            </Text>
            <Flex borderTopWidth="1px" backgroundColor="white" align="center" width="100%">   
            <Textarea
              placeholder="Type your destination..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              minHeight="40px" // Minimum height
              borderRadius="md"
              color="black"
              backgroundColor="#F4F4F4"
              _placeholder={{ color: 'gray.500' }}
              overflow="show" // Prevents scrollbars
              resize="vertical" // Allow vertical resizing
              maxHeight="200px" // Set a max height for better UX
            />
              <Button colorScheme="blue" onClick={handleSendMessage} borderRadius="full">
                Send
              </Button>
            </Flex>
          </VStack>
        </Center>
      ) : (
        <Box flexGrow={1} padding={4} overflowY="auto">
          <VStack spacing={4} align="stretch">
            {messages.map((message, index) => (
              <Message
                key={index}
                text={message.text}
                sender={message.sender}
                type={message.type}
                component={message.component}
              />
            ))}
            <div ref={chatEndRef}></div>
          </VStack>
        </Box>
      )}

      {/* Input and controls at the bottom */}
      {/* <Flex padding={4} borderTopWidth="1px" backgroundColor="white" align="center">
        <Input
          placeholder="Send a message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          mr={2}
          borderRadius="full"
          color="black"
          backgroundColor="white"
          borderColor="black"
          _placeholder={{ color: 'gray.500' }}
        />
        <IconButton
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          icon={isRecording ? <FaStop /> : <FaMicrophone />}
          onClick={isRecording ? stopRecording : startRecording}
          colorScheme={isRecording ? 'red' : 'blue'}
          borderRadius="full"
          mr={2}
        />
        <Button colorScheme="blue" onClick={handleSendMessage} borderRadius="full">
          Send
        </Button>
      </Flex> */}
    </Flex>
  );
};

export default Chatbot;
