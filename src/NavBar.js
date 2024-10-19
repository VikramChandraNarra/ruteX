import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Image,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaHome, FaComments, FaMap, FaMicrophone, FaHeadphones } from 'react-icons/fa'; // Import icons

const Links = [
  { name: 'Home', path: '/', icon: <FaHome /> },
  { name: 'Chat', path: '/chat', icon: <FaComments /> },
  { name: 'Map', path: '/map', icon: <FaMap /> },
  { name: 'Speech', path: '/speech', icon: <FaMicrophone /> },
  { name: 'Voice', path: '/voice', icon: <FaHeadphones /> },
];

const NavLink = ({ to, icon, label }) => (
  <Tooltip label={label} placement="right" fontSize="md" openDelay={200}>
    <Flex
      as={RouterLink}
      to={to}
      align="center"
      justify="center"
      px={4}
      py={3}
      rounded="md"
      transition="background 0.2s"
      _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
      width="100%"
    >
      <Box as="span" fontSize="xl" color="black">
        {icon}
      </Box>
    </Flex>
  </Tooltip>
);

const NavBar = () => {
  const location = useLocation();

  // Conditionally hide NavBar on certain routes if needed
  const hideNavOnRoutes = ['/login']; // Add any routes where NavBar shouldn't appear
  if (hideNavOnRoutes.includes(location.pathname)) {
    return null; // Don't render the NavBar on these routes
  }

  return (
    <Flex
      as="nav"
      direction="column"
      align="center"
      bg="white"
      color="black"
      width="80px" // Fixed width
      height="100vh"
      py={4}
      position="fixed"
      left={0}
      top={0}
      boxShadow="md"
      borderRight="1px solid"
      borderColor="gray.200"
      zIndex={1000}
    >
      {/* Logo Section */}
      <HStack justify="center" mb={8}>
        <Image boxSize="40px" src="/logo.png" alt="ruteX Logo" />
      </HStack>

      {/* Navigation Links */}
      <VStack as="nav" spacing={4} align="stretch" width="100%">
        {Links.map((link) => (
          <NavLink key={link.name} to={link.path} icon={link.icon} label={link.name} />
        ))}
      </VStack>
    </Flex>
  );
};

export default NavBar;
