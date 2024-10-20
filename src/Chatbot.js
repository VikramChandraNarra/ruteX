import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Button,
  VStack,
  Text,
  Center,
  Textarea,
  Stack,
  List,
  ListItem,
  IconButton,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { FaBars, FaPlus, FaEllipsisV } from 'react-icons/fa';
import Message from './Message';
import Direction from './Direction';
import { keyframes } from '@emotion/react';

// Bounce animation keyframes (from Voice.js)
const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

// Loading Animation Component
const LoadingAnimation = () => (
  <Flex justify="center" align="center" height="50px">
    <Box
      as="span"
      animation={`${bounce} 1.4s infinite`}
      mr="4px"
      bg="teal.500"
      borderRadius="50%"
      width="10px"
      height="10px"
    />
    <Box
      as="span"
      animation={`${bounce} 1.4s infinite 0.2s`}
      mr="4px"
      bg="teal.500"
      borderRadius="50%"
      width="10px"
      height="10px"
    />
    <Box
      as="span"
      animation={`${bounce} 1.4s infinite 0.4s`}
      bg="teal.500"
      borderRadius="50%"
      width="10px"
      height="10px"
    />
  </Flex>
);

const Chatbot = () => {
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    return savedSessions ? JSON.parse(savedSessions) : {};
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const lastSession = localStorage.getItem('lastSession');
    return lastSession || generateSessionId();
  });

  const [messages, setMessages] = useState(() => sessions[currentSessionId] || []);
  const [userInput, setUserInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [editSessionId, setEditSessionId] = useState(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    setMessages(sessions[currentSessionId] || []);
    localStorage.setItem('lastSession', currentSessionId);
  }, [currentSessionId, sessions]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateSessionId = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      const newMessage = { text: userInput, sender: 'user', type: 'text' };
      const updatedMessages = [...messages, newMessage];

      updateSession(currentSessionId, updatedMessages);
      setIsLoading(true); // Start loading animation

      const requestData = { text: userInput };

      fetch('/post/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((data) => {
          const botReply = {
            type: 'route',
            sender: 'bot',
            data: data.response.route1Info,
            route: data.response.route1,
          };
          const updatedMessagesWithBot = [...updatedMessages, botReply];

          // Check if steps are still needed
          if (data.response.route1Info.stepsNeeded > 0) {
            const stepsMessage = {
              text: `Looks like you still need ${data.response.route1Info.stepsNeeded} steps to meet your daily goal. Would you like to get some steps in on your way?`,
              sender: 'bot',
              type: 'text',
            };
            updatedMessagesWithBot.push(stepsMessage); // Add follow-up message
          }

          setMessages(updatedMessagesWithBot);
          updateSession(currentSessionId, updatedMessagesWithBot);
        })
        .catch(() => {
          const errorMessage = {
            text: 'Sorry, an error occurred while processing your request.',
            sender: 'bot',
            type: 'text',
          };
          const updatedMessagesWithError = [...updatedMessages, errorMessage];

          setMessages(updatedMessagesWithError);
          updateSession(currentSessionId, updatedMessagesWithError);
        })
        .finally(() => {
          setIsLoading(false); // Stop loading animation
        });

      setUserInput(''); // Clear input
    }
  };

  const updateSession = (sessionId, updatedMessages) => {
    setSessions((prevSessions) => ({
      ...prevSessions,
      [sessionId]: updatedMessages,
    }));
  };

  const startNewChat = () => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    setSessions((prevSessions) => ({
      ...prevSessions,
      [newSessionId]: [],
    }));
  };

  const deleteChat = (sessionId) => {
    const updatedSessions = { ...sessions };
    delete updatedSessions[sessionId];
    setSessions(updatedSessions);

    if (sessionId === currentSessionId) {
      const newCurrentSessionId = Object.keys(updatedSessions)[0] || generateSessionId();
      setCurrentSessionId(newCurrentSessionId);
    }
  };

  const renderMessage = (message, index) => {
    if (message.type === 'route') {
      return <Direction key={index} data={message.data} route={message.route} />;
    }
    return <Message key={index} text={message.text} sender={message.sender} type={message.type} />;
  };

  return (
    <Flex height="100vh" backgroundColor="gray.50">
      {isMenuOpen && (
        <Box width="25%" borderRight="1px solid lightgray" padding={4} overflowY="auto">
          {/* Menu Content */}
        </Box>
      )}

      <Flex direction="column" width={isMenuOpen ? '75%' : '100%'} padding={4}>
        <Box flexGrow={1} overflowY="auto" padding={4}>
          {messages.length === 0 ? (
            <Center flexGrow={1}>
              <VStack spacing={4}>
                <Text fontSize="3xl" fontWeight="bold">Where would you like to go today?</Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {messages.map((message, index) => renderMessage(message, index))}
              {isLoading && <LoadingAnimation />}
              <div ref={chatEndRef} />
            </VStack>
          )}
        </Box>

        {/* Input Section */}
        <Flex gap={2} padding={3} backgroundColor="white" borderTop="1px solid #E2E8F0">
          <Textarea
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            flex={1}
            minHeight="50px"
            borderRadius="md"
          />
          <Button onClick={handleSendMessage} colorScheme="blue">Send</Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Chatbot;
