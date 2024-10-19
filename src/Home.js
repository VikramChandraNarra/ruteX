import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
  Stack,
  VStack,
} from '@chakra-ui/react';
import {
  FaTimes,
  FaBars,
  FaWalking,
  FaBus,
  FaTrain,
  FaCar,
  FaBicycle,
  FaRobot,
} from 'react-icons/fa';
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  TrafficLayer,
} from '@react-google-maps/api';
import { GiBrain } from 'react-icons/gi';

const center = { lat: 48.8584, lng: 2.2945 };

function Home() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDmFTRzH4UebgjP7ifLPTpo8WAmC0qXux8', // Replace with your actual API key
    libraries: ['places'],
  });

  const [map, setMap] = useState(null);
  const [directionsResponses, setDirectionsResponses] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [steps, setSteps] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [isTraffic, setIsTraffic] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);

  const originRef = useRef();
  const destinationRef = useRef();

  const travelModes = ['DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT', 'AI'];

  useEffect(() => {
    if ((directionsResponse || directionsResponses) && travelMode) {
      calculateRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelMode]);

  if (!isLoaded) {
    return <SkeletonText />;
  }


  async function calculateRoute() {
    if (!originRef.current.value || !destinationRef.current.value) {
      return;
    }

    if (travelMode === 'AI') {
      try {
        const response = await fetch('http://127.0.0.1:5000/generate_route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input:
              'Give me a route from ' +
              originRef.current.value +
              ' to ' +
              destinationRef.current.value,
          }),
        });

        const data = await response.json();
        const directionsService = new window.google.maps.DirectionsService();
        const allDirections = [];

        for (const subRoute of data.route1) {
          const { start, end, modeOfTransport } = subRoute;

          let mode;
          switch (modeOfTransport.toLowerCase()) {
            case 'driving':
              mode = window.google.maps.TravelMode.DRIVING;
              break;
            case 'transit':
              mode = window.google.maps.TravelMode.TRANSIT;
              break;
            case 'bicycling':
              mode = window.google.maps.TravelMode.BICYCLING;
              break;
            case 'walking':
              mode = window.google.maps.TravelMode.WALKING;
              break;
            default:
              mode = window.google.maps.TravelMode.DRIVING;
          }

          const result = await directionsService.route({
            origin: start,
            destination: end,
            travelMode: mode,
          });

          if (result.status === 'OK') {
            allDirections.push(result);
          } else {
            console.error('Directions request failed due to ', result.status);
          }
        }

        setDirectionsResponses(allDirections);
        setDirectionsResponse(null); // Clear the standard directions response
        setDistance(data.route1Info.distance);
        setDuration(`${data.route1Info.totalTime} mins`);
        setIsTraffic(false);
        setRouteInfo(data.route1Info);
        setRouteSteps(data.route1);

        // Adjust the map to fit all routes
        if (map && allDirections.length > 0) {
          computeAndFitBounds(allDirections);
        }
      } catch (error) {
        console.error('Error fetching AI route:', error);
      }
    } else {
      const directionsService = new window.google.maps.DirectionsService();
      const request = {
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: window.google.maps.TravelMode[travelMode],
      };

      if (travelMode === 'DRIVING') {
        request.drivingOptions = {
          departureTime: new Date(),
          trafficModel: 'bestguess',
        };
      }

      const results = await directionsService.route(request);
      setDirectionsResponse(results);
      setDirectionsResponses(null); // Clear the AI directions responses
      setDistance(results.routes[0].legs[0].distance.text);

      if (
        travelMode === 'DRIVING' &&
        results.routes[0].legs[0].duration_in_traffic
      ) {
        setDuration(results.routes[0].legs[0].duration_in_traffic.text);
        setIsTraffic(
          results.routes[0].legs[0].duration.value <
          results.routes[0].legs[0].duration_in_traffic.value
        );
      } else {
        setDuration(results.routes[0].legs[0].duration.text);
        setIsTraffic(false);
      }

      setSteps(results.routes[0].legs[0].steps);
      setRouteInfo(null);
      setRouteSteps([]);

      // Adjust the map to fit the route
      if (map && results) {
        computeAndFitBounds([results]);
      }
    }
  }

  function computeAndFitBounds(directionsArray) {
    const bounds = new window.google.maps.LatLngBounds();
    directionsArray.forEach((response) => {
      const route = response.routes[0];
      route.overview_path.forEach((point) => {
        bounds.extend(point);
      });
    });
    map.fitBounds(bounds);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDirectionsResponses(null);
    setDistance('');
    setDuration('');
    setSteps([]);
    setIsTraffic(false);
    setRouteInfo(null);
    setRouteSteps([]);
    originRef.current.value = '';
    destinationRef.current.value = '';
  }

  function getTransportIcon(mode, isSelected) {
    const color = isSelected ? 'white' : 'black'; // White if selected, black otherwise
    switch (mode.toLowerCase()) {
      case 'walking':
        return <FaWalking color={color} />;
      case 'transit':
        return <FaBus color={color} />;
      case 'driving':
        return <FaCar color={color} />;
      case 'bicycling':
        return <FaBicycle color={color} />;
      case 'ai':
        return <FaRobot color={color} />;
      default:
        return <FaCar color={color} />;
    }
  }

  return (
    <Flex height="100vh" overflow="hidden">
      {/* Left side - Controls (Filters) */}
      <Box
        width="400px"
        minWidth="400px" // Ensure it doesn't shrink below 400px
        bgColor="white"
        shadow="base"
        p={4}
        zIndex="modal"
        overflowY="auto"
        overflowX="hidden" // Prevent horizontal scroll
      >
        <IconButton
          icon={showFilters ? <FaTimes /> : <FaBars />}
          aria-label="Toggle Filters"
          mb={4}
          onClick={() => setShowFilters(!showFilters)}
          bgColor="white"
          color="black"
        />
  
        {showFilters && (
          <>
            <VStack spacing={2} mb={4}>
              <Box flexGrow={1} width="80%" zIndex="modal">
                <Autocomplete>
                  <Input
                    type="text"
                    placeholder="Origin"
                    ref={originRef}
                    color="black"
                    bgColor="white"
                    borderColor="gray.300"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </Autocomplete>
              </Box>
              <Box flexGrow={1} width="80%" zIndex="modal">
                <Autocomplete>
                  <Input
                    type="text"
                    placeholder="Destination"
                    ref={destinationRef}
                    color="black"
                    bgColor="white"
                    borderColor="gray.300"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </Autocomplete>
              </Box>
  
              <Button color="#6581BF" width="80%" onClick={calculateRoute}>
                Calculate Route
              </Button>
            </VStack>
  
            <ButtonGroup isAttached variant="outline" mb={4} width="100%">
              {travelModes.map((mode) => (
                <IconButton
                  key={mode}
                  onClick={() => setTravelMode(mode)}
                  colorScheme={travelMode === mode ? 'pink' : 'gray'}
                  bg={travelMode === mode ? '#6581BF' : 'white'}
                  color={travelMode === mode ? 'white' : 'black'}
                  icon={getTransportIcon(mode, travelMode === mode)}
                  aria-label={mode}
                  width="100%"
                />
              ))}
            </ButtonGroup>
  
            <VStack align="flex-start" spacing={2} mt={2}>
              <HStack spacing={4} alignItems="center">
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={isTraffic ? 'red' : 'black'}
                >
                  {duration}
                </Text>
                {distance && (
                  <Text fontSize="lg" color="gray.500">
                    ({distance})
                  </Text>
                )}
              </HStack>
  
              {routeInfo && (
                <Box mt={4}>
                  <Text fontSize="md" fontWeight="semibold" color="black">
                    {routeInfo.description}
                  </Text>
                  {routeInfo.efficiency && (
                    <Text fontSize="sm" color="gray.600">
                      Efficiency: {routeInfo.efficiency}
                    </Text>
                  )}
                  {routeInfo.health && (
                    <Text fontSize="sm" color="gray.600">
                      Health: {routeInfo.health}
                    </Text>
                  )}
                </Box>
              )}
  
              {routeSteps && routeSteps.length > 0 && (
                <Box mt={4} w="100%">
                  <Text fontSize="lg" fontWeight="bold" mb={2} color="black">
                    Steps:
                  </Text>
                  <Stack spacing={4}>
                    {routeSteps.map((step, index) => (
                      <HStack
                        key={index}
                        p={3}
                        borderWidth="1px"
                        borderRadius="lg"
                        alignItems="flex-start"
                        spacing={4}
                      >
                        <Box fontSize="2xl">
                          {getTransportIcon(step.modeOfTransport)}
                        </Box>
                        <Box>
                          <Text
                            fontWeight="semibold"
                            fontSize="md"
                            color="black"
                          >
                            {step.modeOfTransport.charAt(0).toUpperCase() +
                              step.modeOfTransport.slice(1)}{' '}
                            - {step.timeTaken}
                          </Text>
                          {step.nameOfTransport && (
                            <Text fontSize="sm" color="gray.600">
                              {step.nameOfTransport}
                            </Text>
                          )}
                          <Text fontSize="sm" color="gray.600">
                            From: {step.start}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            To: {step.end}
                          </Text>
                          {step.calories && (
                            <Text fontSize="sm" color="gray.600">
                              Calories Burned: {step.calories}
                            </Text>
                          )}
                          {step.totalCost && (
                            <Text fontSize="sm" color="gray.600">
                              Cost: ${step.totalCost}
                            </Text>
                          )}
                        </Box>
                      </HStack>
                    ))}
                  </Stack>
                </Box>
              )}
            </VStack>
          </>
        )}
      </Box>
  
      {/* Right side - Google Map */}
      <Box flex="1" position="relative" overflow="hidden">
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          <TrafficLayer />
          <Marker position={center} />
  
          {travelMode === 'AI' ? (
            directionsResponses &&
            directionsResponses.map((response, index) => (
              <DirectionsRenderer
                key={index}
                directions={response}
                options={{ preserveViewport: true }}
              />
            ))
          ) : (
            directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{ preserveViewport: false }}
              />
            )
          )}
        </GoogleMap>
      </Box>
    </Flex>
  );
  

}

export default Home;
