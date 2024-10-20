import React from 'react';
import { Box, Flex, Text, Icon, VStack, HStack } from '@chakra-ui/react';
import { FaWalking, FaBus, FaBicycle, FaCar } from 'react-icons/fa';
import { MdAlarm, MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const transportIcons = {
  walking: FaWalking,
  transit: FaBus,
  bicycling: FaBicycle,
  driving: FaCar,
};

const Direction = ({ data, route }) => {
  const navigate = useNavigate(); // React Router hook to navigate programmatically

  // Handle the click event to navigate to the /map route
  const handleBoxClick = () => {
    // Pass the data to the new route
    navigate('/map', { state: { route } });
};
  console.log(data)
  const modes = data.expression.split('|').map((mode) => mode.trim()); // Split and clean the expression

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding={4}
      backgroundColor="white"
      boxShadow="md"
      maxW="400px"
      cursor="pointer" // Make it clear the box is clickable
      onClick={handleBoxClick} // Navigate on click
      _hover={{ backgroundColor: 'gray.100' }} // Add hover effect
    >
      {/* Time and Distance */}
      <Flex align="center" justify="space-between" mb={4}>
        <VStack align="start" spacing={0}>
          <Text fontSize="3xl" fontWeight="bold" color="black">
            {data.totalTime}
            <Text as="span" fontSize="lg" fontWeight="normal" ml={1}>
              min
            </Text>
          </Text>
          <Text fontSize="md" color="gray.600">
            {data.distance}
          </Text>
        </VStack>

        {/* Transport Icons in Sequential Order */}
        <HStack spacing={2}>
          {modes.map((mode, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Icon as={MdArrowForward} boxSize={5} color="gray.500" />} {/* Arrow between icons */}
              <Icon as={transportIcons[mode]} boxSize={5} color="black" />
            </React.Fragment>
          ))}
        </HStack>
      </Flex>

      {/* Route Info */}
      <Text fontSize="md" color="gray.700" mb={4}>
        {data.description}
      </Text>

      {/* Details with Icons */}
      <VStack align="start" spacing={3}>
        {/* Efficiency */}
        {data.efficiency && (
          <HStack spacing={3}>
            <Icon as={MdAlarm} color="red.500" boxSize={5} />
            <Text fontSize="md" color="black">
              <Text as="span" fontWeight="bold">{data.efficiency}</Text>
            </Text>
          </HStack>
        )}

        {/* Health */}
        {data.health && (
          <HStack spacing={3}>
            <Icon as={FaWalking} color="green.500" boxSize={5} />
            <Text fontSize="md" color="black">
              <Text as="span" fontWeight="bold">{data.health}</Text> burned
            </Text>
          </HStack>
        )}

        {/* Effectiveness */}
        {data.effectiveness && (
          <HStack spacing={3}>
            <Icon as={FaWalking} color="yellow.500" boxSize={5} />
            <Text fontSize="md" color="black">
              <Text as="span" fontWeight="bold">{data.effectiveness}</Text>
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default Direction;
