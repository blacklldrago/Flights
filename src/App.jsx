import React, { useState } from "react";
import {
  TextField,
  Autocomplete,
  Button,
  MenuItem,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import "./App.css";
import ConnectingAirportsIcon from "@mui/icons-material/Flight";
import Loader from "./components/Loader";

function App() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");
  const [departureDate, setDepartureDate] = useState(dayjs());
  const [flights, setFlights] = useState({});

  const [idx1, setIdx1] = useState("");
  const [idx2, setIdx2] = useState(0);
  const [idx3, setIdx3] = useState("");
  const [idx4, setIdx4] = useState(0);
  const [loading, setLoading] = useState(false);

  const [originDebounceTimeout, setOriginDebounceTimeout] = useState(null);
  const [destinationDebounceTimeout, setDestinationDebounceTimeout] =
    useState(null);

  const fetchAirports = async (query, setOptions, st1, st2) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${query}&locale=en-US`,
        {
          headers: {
            "x-rapidapi-key":
              "153ba37c08mshdc6351fdb478ee2p18ac66jsn9898e45a25f5",
            "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );

      // Map the airport data and update state
      const options = response.data.data.map((e) => ({
        label: `${e.presentation.subtitle}, ${e.presentation.title}`,
        skyId: e.skyId,
        entityId: e.entityId,
      }));

      setOptions(options);
      setLoading(false)
      
      // Save the first option's skyId and entityId to the state
      if (options.length > 0) {
        st1(options[0].skyId); // Assuming st1 is a state setter for skyId
        st2(options[0].entityId); // Assuming st2 is a state setter for entityId
      }
    } catch (error) {
      setLoading(false)
      console.error("Error fetching airports: ", error);
    }
  };

  const handleOriginInputChange = (event, value) => {
    setOrigin(value);
    if (value) {
      if (originDebounceTimeout) clearTimeout(originDebounceTimeout);

      const timeout = setTimeout(() => {
        fetchAirports(value, setOriginOptions, setIdx1, setIdx2);
        
      }, 500); // 500ms debounce delay
      setOriginDebounceTimeout(timeout);
    }
  };

  const handleDestinationInputChange = (event, value) => {
    setDestination(value);
    if (value) {
      if (destinationDebounceTimeout) clearTimeout(destinationDebounceTimeout);

      // Set a new timeout
      const timeout = setTimeout(() => {
        fetchAirports(value, setDestinationOptions, setIdx3, setIdx4);

      }, 500); // 500ms debounce delay
      setDestinationDebounceTimeout(timeout);
    }
  };

  const handleSearch = async () => {
    // console.log(origin);
    // console.log(idx1);
    // console.log(idx2);

    // console.log(destination);
    // console.log(idx3);
    // console.log(idx4);
    // console.log(cabinClass);
    // console.log(passengers);

    // Format the departure date
    setLoading(true)
    const formattedDate = departureDate.format("YYYY-MM-DD");

    try {
      const response = await axios.get(
        `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights`,
        {
          headers: {
            "x-rapidapi-key":
              "153ba37c08mshdc6351fdb478ee2p18ac66jsn9898e45a25f5",
            "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
          },
          params: {
            originSkyId: idx1,
            destinationSkyId: idx3,
            originEntityId: idx2,
            destinationEntityId: idx4,
            date: formattedDate, // Change from fromDate to date
            cabinClass: cabinClass,
            adults: passengers,
            sortBy: "best",
            currency: "USD",
            market: "en-US",
            countryCode: "US",
          },
        }
      );

      setFlights(response?.data?.data || {});
      setLoading(false)
    } catch (error) {
      console.error("Error fetching flights:", error);
      setLoading(false)
    }
  };

  // console.log(originOptions);

  console.log(flights.destinationImageUrl);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <img
          className="w-[90%] m-auto"
          src="https://www.gstatic.com/travel-frontend/animation/hero/flights_nc_4.svg"
          alt=""
        />
        <h1 className="text-[black] text-[56px] text-center mt-[-50px]">
          Flights
        </h1>
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          {/* Origin Input */}
          <Autocomplete
            freeSolo
            sx={{ mb: "15px" }}
            options={originOptions}
            onInputChange={handleOriginInputChange}
            renderInput={(params) => (
              <TextField {...params} label="Origin" fullWidth />
            )}
          />

          {/* Destination Input */}
          <Autocomplete
            freeSolo
            sx={{ mb: "15px" }}
            options={destinationOptions}
            onInputChange={handleDestinationInputChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Destination"
                fullWidth
                className="mt-4"
              />
            )}
          />

          {/* Date Picker */}
          <DatePicker
            sx={{ mb: "15px" }}
            label="Departure Date"
            value={departureDate}
            onChange={(newValue) => setDepartureDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth className="mt-4" />
            )}
          />

          {/* Passengers Input */}
          <TextField
            label="Passengers"
            sx={{ mb: "15px" }}
            type="number"
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            fullWidth
            className="mt-4"
            inputProps={{ min: 1 }} // Prevent negative numbers
          />

          <TextField
            select
            label="Cabin Class"
            sx={{ mb: "15px" }}
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
            fullWidth
            className="mt-4"
          >
            <MenuItem value="economy">Economy</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="first">First Class</MenuItem>
          </TextField>

          {/* Search Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            className="mt-6"
            onClick={handleSearch}
            endIcon={<ConnectingAirportsIcon />}
          >
            Search Flights
          </Button>
        </div>

        <div className="max-w-4xl mt-8 w-full px-4">
          {flights.destinationImageUrl ? (
            <>
              <Card className="mb-4">
                <CardContent>
                  <img src="" alt="" />
                  <Typography variant="h6" component="div">
                    {/* {e.originName} ({e.originIata}) → {e.destinationName} (
                {e.destinationIata}) */}
                  </Typography>
                  <Typography color="text.secondary">
                    {/* Departure: {e.departureTime} */}
                  </Typography>
                  <Typography variant="body2">
                    {/* Price: ${e.price.amount} {e.price.currency} */}
                  </Typography>
                  <img src={flights.destinationImageUrl} alt="" />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="mb-4">
              <CardContent>
                <Typography variant="h6" component="div" color="black" textAlign="center">
                  No Results
                </Typography>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {loading == true? <Loader/>:null}
    </LocalizationProvider>
  );
}

export default App;
