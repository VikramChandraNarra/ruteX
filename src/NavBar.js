import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Image,
  Text,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Links = [
  { name: 'Home', path: '/' },
  { name: 'Chat', path: '/chat' },
  { name: 'Map', path: '/map' },
  { name: 'Speech', path: '/speech' },
  { name: 'Voice', path: '/voice' },
];

const NavLink = ({ to, children, onClick }) => (
  <Link
    as={RouterLink}
    to={to}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.200',
    }}
    onClick={onClick} // Close drawer on click
  >
    {children}
  </Link>
);

const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation(); // Tracks the current route

  // Conditionally hide NavBar on certain routes if needed
  const hideNavOnRoutes = ['/login']; // Add any routes where NavBar shouldn't appear
  if (hideNavOnRoutes.includes(location.pathname)) {
    return null; // Don't render the NavBar on these routes
  }

  return (
    <>
      {/* Hamburger Icon for opening the drawer */}
      <IconButton
        aria-label="Open Menu"
        icon={<HamburgerIcon />}
        size="lg"
        position="fixed"
        bottom={4} // Align at the bottom
        left={4}   // Align at the left side
        onClick={onOpen}
        bg="blue.500"
        color="white"
        _hover={{ bg: 'blue.600' }}
        zIndex={1000} // Ensures the icon stays on top
      />

      {/* Drawer for the NavBar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay zIndex={999} /> {/* Overlay to ensure drawer stays on top */}
        <DrawerContent zIndex={1000}>
          <DrawerCloseButton />
          <DrawerHeader display="flex" alignItems="center">
            <Image
              boxSize="30px"
              src="/logo.png" // Replace with your logo
              alt="ruteX Logo"
              mr={2}
            />
            <Text fontSize="xl" fontWeight="bold">
              ruteX
            </Text>
          </DrawerHeader>

          <DrawerBody>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.name} to={link.path} onClick={onClose}>
                  {link.name}
                </NavLink>
              ))}
              <Button
                as={RouterLink}
                to="/login" // Example login route
                colorScheme="teal"
                variant="solid"
                onClick={onClose} // Close drawer on click
              >
                Login
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NavBar;
