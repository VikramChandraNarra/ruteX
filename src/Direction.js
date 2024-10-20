import React from 'react';
import { Box, Flex, Text, Icon, VStack, HStack } from '@chakra-ui/react';
import { FaWalking, FaBus, FaBicycle, FaCar, FaDollarSign} from 'react-icons/fa';
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

  const handleBoxClick = () => {
    navigate('/map', { state: { route } });
  };

  const isValidValue = (value) => value !== null && value !== '';


  const modes = data.expression.split('|').map((mode) => mode.trim()); // Split and clean the expression

  // Function to convert total minutes to hours and minutes
  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding={4}
      backgroundColor="white"
      boxShadow="md"
      maxW="400px"
      cursor="pointer"
      onClick={handleBoxClick}
      _hover={{ backgroundColor: 'gray.100' }}
    >
      {/* Time and Distance */}
      <Flex align="center" justify="space-between" mb={4}>
        <VStack align="start" spacing={0}>
          <Text fontSize="3xl" fontWeight="bold" color="black">
            {formatTime(data.totalTime)}
          </Text>
          <Text fontSize="md" color="gray.600">
            {data.distance}
          </Text>
        </VStack>

        {/* Transport Icons in Sequential Order */}
        <HStack spacing={2}>
          {modes.map((mode, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Icon as={MdArrowForward} boxSize={5} color="gray.500" />}
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
        {isValidValue(data.efficiency) && (
          <HStack spacing={3}>
            <Icon as={MdAlarm} color="red.500" boxSize={5} />
            <Text fontSize="md" color="black">
              <Text as="span" fontWeight="bold">{data.efficiency}</Text>
            </Text>
          </HStack>
        )}

        {/* Health */}
        {isValidValue(data.health) && (
          <HStack spacing={3}>
            <Icon as={FaWalking} color="green.500" boxSize={5} />
            <Text fontSize="md" color="black">
              <Text as="span" fontWeight="bold">{data.health}</Text> burned
            </Text>
          </HStack>
        )}

        {/* Effectiveness */}
        {isValidValue(data.efficiency) && (
          <HStack spacing={3}>
            <Icon as={FaDollarSign} color="yellow.500" boxSize={5} />
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
