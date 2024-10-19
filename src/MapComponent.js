import React, { useEffect, useState } from "react";
import { GoogleMap, useLoadScript, DirectionsRenderer } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";

const Map = () => {
  const location = useLocation();
  const { route } = location.state || {};

  const [directionsResponses, setDirectionsResponses] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 43.774, lng: -79.231 });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDmFTRzH4UebgjP7ifLPTpo8WAmC0qXux8", // Replace with your actual API key
  });

  useEffect(() => {
    const calculateRoutes = async () => {
      if (!isLoaded) return; // Ensure the script is loaded
      if (!route || route.length === 0) return;

      try {
        const directionsService = new window.google.maps.DirectionsService();
        const allDirections = [];

        for (const subRoute of route) {
          const { start, end, modeOfTransport } = subRoute;

          let travelMode;
          switch (modeOfTransport) {
            case "driving":
              travelMode = window.google.maps.TravelMode.DRIVING;
              break;
            case "transit":
              travelMode = window.google.maps.TravelMode.TRANSIT;
              break;
            case "bicycling":
              travelMode = window.google.maps.TravelMode.BICYCLING;
              break;
            case "walking":
              travelMode = window.google.maps.TravelMode.WALKING;
              break;
            default:
              travelMode = window.google.maps.TravelMode.DRIVING;
          }

          const result = await directionsService.route({
            origin: start,
            destination: end,
            travelMode,
          });

          if (result.status === "OK") {
            allDirections.push(result);
            if (allDirections.length === 1) {
              setMapCenter(result.routes[0].legs[0].start_location);
            }
          } else {
            console.error("Directions request failed due to ", result.status);
          }
        }

        setDirectionsResponses(allDirections);
      } catch (error) {
        console.error("Error fetching directions: ", error);
      }
    };

    calculateRoutes();
  }, [route, isLoaded]);

  if (!isLoaded) return <div>Loading...</div>; // Show a loading indicator while the script loads

  return (
    <>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={mapCenter}
        zoom={12}
      >
        {directionsResponses.map((response, index) => (
          <DirectionsRenderer key={index} directions={response} />
        ))}
      </GoogleMap>
      <div>{location.state.route[0].start}</div>
    </>
  );
};

export default Map;
