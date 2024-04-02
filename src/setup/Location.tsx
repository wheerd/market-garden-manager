import React, { lazy, useMemo, useState } from "react"
import { usePersistedState } from "../lib/usePersistedState";
import { GroupedRawWeatherData, fetchWeatherData } from "../lib/weatherData";

const LocationDialog = lazy(() => import("./LocationPicker"));
const WeatherChart  = lazy(() => import("./WeatherChart"));

import "./Location.css";
import { useAsyncState } from "../lib/useAsyncState";
import { GeoPosition, getElevation, getSatelliteImageAsDataUri, getTimeZone, metersPerPixel } from "../lib/geo";

interface LocationData {
    longitude: number,
    latitude: number,
    zoom: number,
    totalSizeInMeters?: number,
}

const Location: React.FC = () => {
    const defaultLocation = useMemo(() => ({
        longitude: -100,
        latitude: 40,
        zoom: 3.5
    }), [])

    const [location, setLocation] = usePersistedState<LocationData>("location", defaultLocation);
    const [locationImage, setLocationImage] = usePersistedState<string>("locationImage", "");
    const [timezone, setTimezone] = usePersistedState<string>("timezone", "");
    const [elevation, setElevation] = usePersistedState<number>("elevation", 0);
    const [rawWeatherData, setRawWeatherData] = usePersistedState<GroupedRawWeatherData | undefined>("rawWeatherData", undefined);

    const [pickerOpen, setPickerOpen] = useState(false)

    async function updateLocation(position: GeoPosition, zoom: number) {
        setRawWeatherData(undefined)

        const locationImage = await getSatelliteImageAsDataUri(position, zoom, 800, 800)
        const totalSizeInMeters = metersPerPixel(position, zoom) * 800

        setLocation({ ...position, zoom, totalSizeInMeters });
        setLocationImage(locationImage);

        setElevation(await getElevation(position));
        setTimezone(await getTimeZone(position));

        setRawWeatherData(await fetchWeatherData(position.latitude, position.longitude, elevation, timezone))
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
                initialLocation={({latitude: location.latitude, longitude: location.longitude})}
                initialZoom={location.zoom}
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