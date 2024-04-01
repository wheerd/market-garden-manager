import React, { lazy, useMemo, useState } from "react"
import { usePersistedState } from "../lib/usePersistedState";
import { GroupedRawWeatherData, fetchWeatherData } from "../lib/weatherData";

const LocationDialog = lazy(() => import("./LocationPicker"));
const WeatherChart  = lazy(() => import("./WeatherChart"));

import "./Location.css";
import { useAsyncState } from "../lib/useAsyncState";

interface LocationData {
    longitude: number,
    latitude: number,
    zoom: number,
    bearing: number,
    totalSizeInMeters?: number,
}

interface ElevationResponse {
    results: {
        "latitude": number,
        "longitude": number,
        "elevation": number
    }[]
}

async function getElevation(location: LocationData) {
    const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${location.latitude},${location.longitude}`);
    const data = await response.json() as ElevationResponse;
    return data.results[0].elevation;
}

interface TimeZoneResponse {
    "countryCode": string,
    "timezoneId": string
}

async function getTimeZone(location: LocationData) {
    const response = await fetch(`https://secure.geonames.org/timezoneJSON?lat=${location.latitude}&lng=${location.longitude}&username=wheerd`);
    const data = await response.json() as TimeZoneResponse;
    return data.timezoneId;
}

const Location: React.FC = () => {
    const defaultLocation = useMemo(() => ({
        longitude: -100,
        latitude: 40,
        zoom: 3.5,
        bearing: 0
    }), [])

    const [location, setLocation] = usePersistedState<LocationData>("location", defaultLocation);
    const [locationImage, setLocationImage] = usePersistedState<string>("locationImage", "");
    const [timezone, setTimezone] = usePersistedState<string>("timezone", "");
    const [elevation, setElevation] = usePersistedState<number>("elevation", 0);
    const [rawWeatherData, setRawWeatherData] = usePersistedState<GroupedRawWeatherData | undefined>("rawWeatherData", undefined);

    const [pickerOpen, setPickerOpen] = useState(false)

    async function updateLocation(newLocation: LocationData, locationImage: string, totalSizeInMeters: number) {
        setLocation({ ...newLocation, totalSizeInMeters });
        setLocationImage(locationImage);

        setRawWeatherData(undefined)

        setElevation(await getElevation(newLocation));
        setTimezone(await getTimeZone(newLocation));

        setRawWeatherData(await fetchWeatherData(newLocation.latitude, newLocation.longitude, elevation, timezone))
    }

    const [isLoading, onUpdateLocation] = useAsyncState(updateLocation)

    return (
        <div>
            <h1>Location</h1>
            <div className="locationImage" onClick={() => { setPickerOpen(true); }}>
                <div style={({ backgroundImage: locationImage ? `url(${locationImage})` : undefined })}>
                    {<span className="coordinates">{location.longitude.toFixed(6)} {location.latitude.toFixed(6)}</span>}
                    <span className="prompt">Change Location</span>
                    {location.totalSizeInMeters && <span className="size">{location.totalSizeInMeters.toFixed(2)}x{location.totalSizeInMeters.toFixed(2)}m</span>}
                </div>
            </div>
            <LocationDialog
                initialLocation={location}
                onPickLocation={onUpdateLocation}
                isOpen={pickerOpen}
                onHide={() => { setPickerOpen(false); }}
            />
            {!isLoading &&
                <div>
                    <p>Elevation: {elevation}m</p>
                    <p>Time Zone: {timezone}</p>
                    <p>Weather Data: {typeof rawWeatherData !== "undefined" ? "yes" : "no"}</p>
                    <div>
                        <WeatherChart rawWeatherData={rawWeatherData} />
                    </div>
                </div>
            }
            {isLoading &&
                <p>Loading data...</p>
            }
        </div>
    )
}

export default Location