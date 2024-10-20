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
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import {
  FaTimes,
  FaBars,
  FaWalking,
  FaBus,
  FaBicycle,
  FaCar,
  FaRobot,
} from 'react-icons/fa';
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  DirectionsRenderer,
  TrafficLayer,
  Autocomplete,
} from '@react-google-maps/api';
import Direction from './Direction'; // Import the Direction component

const center = { lat: 37.7842, lng: -122.4019 };
const mapStyles = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#424242' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#424242' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#373737' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3c3c3c' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d3d' }],
  },
];


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
  const [selectedRouteType, setSelectedRouteType] = useState(1); // Track selected route type (0, 1, 2)



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


  function clearRoute() {
    setDirectionsResponse(null);
    setDirectionsResponses(null);
    setDistance('');
    setDuration('');
    setSteps([]);
    setIsTraffic(false);
    setRouteInfo(null);
    setRouteSteps([]);
  
    // Check if originRef and destinationRef are defined before accessing their value
    if (originRef.current) {
      originRef.current.value = '';
    }
    if (destinationRef.current) {
      destinationRef.current.value = '';
    }
  }
  



  async function calculateRoute() {
    if (!originRef.current.value || !destinationRef.current.value) {
      return;
    }
    if (travelMode === 'AI') {
      setDirectionsResponse(null);
      setDirectionsResponses(null);
      setDistance('');
      setDuration('');
      setSteps([]);
      setIsTraffic(false);
      setRouteInfo(null);
      setRouteSteps([]);

      try {
        let routeTypeText = '';
        switch (selectedRouteType) {
          case 0:
            routeTypeText = ' Allow multimodal transport where I can drive a car to a station, and prioritize the fastest route with reasonable travel time.';
            break;
          case 1:
            routeTypeText = ' Allow multimodal transport where I can drive a car to a station, and optimize for the most cost-effective route while keeping travel time reasonable.';
            break;
          case 2:
            routeTypeText = ' Include light physical activity for about 25 minutes, but avoid excessive travel time.';
            break;
          default:
            routeTypeText = 'find a balanced route with no specific preference.';
            break;
        }

        const response = await fetch('/post/route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: `Give me a route from ${originRef.current.value} to ${destinationRef.current.value}. ${routeTypeText}`,
          }),
        });

        const data = await response.json();
        const directionsService = new window.google.maps.DirectionsService();
        const allDirections = [];

        for (const subRoute of data.response.route1) {
          const { start, end, modeOfTransport } = subRoute;

          const mode = window.google.maps.TravelMode[modeOfTransport.toUpperCase()] ||
            window.google.maps.TravelMode.DRIVING;

          const result = await directionsService.route({
            origin: start,
            destination: end,
            travelMode: mode,
          });

          if (result.status === 'OK') {
            allDirections.push(result);
          } else {
            console.error('Directions request failed:', result.status);
          }
        }

        setDirectionsResponses(allDirections);
        setDirectionsResponse(null); // Clear the standard directions response
        setDistance(data.response.route1Info.distance);
        setDuration(`${data.response.route1Info.totalTime} mins`);
        setRouteInfo(data.response.route1Info);
        setRouteSteps(data.response.route1);

        if (map && allDirections.length > 0) {
          computeAndFitBounds(allDirections);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
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
            {travelMode === 'AI' && (
  <Flex 
    justify="center" // Center horizontally
    align="center" // Center vertically
    w="100%" // Ensure it takes full width
    mt={4} // Optional margin from the top
  >
    <Tabs
      onChange={(index) => setSelectedRouteType(index)}
      variant="soft-rounded"
      colorScheme="blue"
      
      defaultIndex={1} // Set the default tab to be 'Cheapest'
    >
      <TabList>
        <Tab>Fastest</Tab>
        <Tab>Cheapest</Tab>
        <Tab>Healthiest</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          {routeInfo && <Direction data={routeInfo} route={routeSteps} />}
        </TabPanel>
        <TabPanel>
          {routeInfo && <Direction data={routeInfo} route={routeSteps} />}
        </TabPanel>
        <TabPanel>
          {routeInfo && <Direction data={routeInfo} route={routeSteps} />}
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Flex>
)}
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
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          <TrafficLayer />


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
