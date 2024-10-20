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
} from '@chakra-ui/react';
import { FaBars, FaPlus, FaEllipsisV } from 'react-icons/fa';
import Message from './Message';
import Direction from './Direction';

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
  
      // Ensure we update the current session only, no new session created here.
      updateSession(currentSessionId, updatedMessages);
  
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
  
          // Update messages for the correct session only
          setMessages(updatedMessagesWithBot);
          updateSession(currentSessionId, updatedMessagesWithBot);  // Correct session
        })
        .catch(() => {
          const errorMessage = {
            text: 'Sorry, an error occurred while processing your request.',
            sender: 'bot',
            type: 'text',
          };
          const updatedMessagesWithError = [...updatedMessages, errorMessage];
  
          // Make sure the current session remains consistent
          setMessages(updatedMessagesWithError);
          updateSession(currentSessionId, updatedMessagesWithError);
        });
  
      setUserInput('');  // Clear the input after sending
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

  const renameChat = (sessionId) => {
    const updatedSessions = { ...sessions };
    updatedSessions[newSessionName] = updatedSessions[sessionId];
    delete updatedSessions[sessionId];
    setSessions(updatedSessions);
    setCurrentSessionId(newSessionName);
    setEditSessionId(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
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
          <HStack justifyContent="space-between" marginBottom={4}>
            <IconButton
              icon={<FaBars />}
              onClick={toggleMenu}
              aria-label="Collapse Menu"
              size="md"
              colorScheme="blue"
            />
            <IconButton
              icon={<FaPlus />}
              onClick={startNewChat}
              aria-label="Start New Chat"
              size="md"
              colorScheme="green"
            />
          </HStack>
          <List spacing={2}>
            {Object.keys(sessions).map((sessionId) => (
              <ListItem
                key={sessionId}
                padding={2}
                borderRadius="md"
                backgroundColor={sessionId === currentSessionId ? 'blue.100' : 'white'}
                cursor="pointer"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => setCurrentSessionId(sessionId)}
              >
                <Text>{sessionId}</Text>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FaEllipsisV />}
                    size="sm"
                    colorScheme="gray"
                    aria-label="Options"
                  />
                  <MenuList>
                    <MenuItem onClick={() => setEditSessionId(sessionId)}>
                      Edit Name
                    </MenuItem>
                    <MenuItem onClick={() => deleteChat(sessionId)}>
                      Delete Chat
                    </MenuItem>
                  </MenuList>
                </Menu>
              </ListItem>
            ))}
          </List>

          {editSessionId && (
            <Flex marginTop={4}>
              <Input
                placeholder="New session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
              <Button onClick={() => renameChat(editSessionId)} colorScheme="blue" marginLeft={2}>
                Save
              </Button>
            </Flex>
          )}
        </Box>
      )}

      <Flex direction="column" width={isMenuOpen ? '75%' : '100%'} padding={4}>
        <Box flexGrow={1} overflowY="auto" padding={4}>
          {messages.length === 0 ? (
            <Center flexGrow={1} padding={4}>
              <VStack spacing={4} align="center">
                <Text fontSize="3xl" fontWeight="bold" textAlign="center" color="black">
                  Where would you like to go today?
                </Text>
                <Flex
                  align="center"
                  gap={2}
                  width="100%"
                  padding={2}
                  backgroundColor="#F4F4F4"
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <Textarea
                    placeholder="Type your destination..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    flex={1}
                    minHeight="40px"
                    borderRadius="lg"
                    color="black"
                    backgroundColor="#F4F4F4"
                    resize="vertical"
                    maxHeight="150px"
                    borderColor="transparent"
                    focusBorderColor="blue.300"
                  />
                  <Button colorScheme="blue" onClick={handleSendMessage} borderRadius="md" paddingX={6} height="40px">
                    Send
                  </Button>
                </Flex>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch" >
              {messages.map((message, index) => renderMessage(message, index))}
              <div ref={chatEndRef}></div>
              <Flex
                  align="center"
                  gap={2}
                  width="100%"
                  padding={2}
                  backgroundColor="#F4F4F4"
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <Textarea
                    placeholder="Type your destination..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    flex={1}
                    minHeight="40px"
                    borderRadius="lg"
                    color="black"
                    backgroundColor="#F4F4F4"
                    resize="vertical"
                    maxHeight="150px"
                    borderColor="transparent"
                    focusBorderColor="blue.300"
                  />
                  <Button colorScheme="blue" onClick={handleSendMessage} borderRadius="md" paddingX={6} height="40px">
                    Send
                  </Button>
                </Flex>
            </VStack>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Chatbot;
