import React, { useMemo, useState } from "react"
import { usePersistedState } from "../lib/usePersistedState";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import LocationDialog from "./LocationPicker";

import "./Location.css";

interface LocationData {
    longitude: number,
    latitude: number,
    zoom: number,
    bearing: number,
    totalSizeInMeters?: number,
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
    const [pickerOpen, setPickerOpen] = useState(false)

    function updateLocation(newLocation: LocationData, locationImage: string, totalSizeInMeters: number) {
        setLocation({ ...newLocation, totalSizeInMeters });
        setLocationImage(locationImage);
    }

    return (
        <div>
            <h1>Location</h1>
            <div className="locationImage" onClick={() => setPickerOpen(true)}>
                <div style={({ backgroundImage: locationImage ? `url(${locationImage})` : undefined })}>
                    {location && <span className="coordinates">{location.longitude.toFixed(6)} {location.latitude.toFixed(6)}</span>}
                    <span className="prompt">Change Location</span>
                    {location.totalSizeInMeters && <span className="size">{location.totalSizeInMeters.toFixed(2)}x{location.totalSizeInMeters.toFixed(2)}m</span>}
                </div>
            </div>
            <LocationDialog
                initialLocation={location}
                onPickLocation={updateLocation}
                isOpen={pickerOpen}
                onHide={() => setPickerOpen(false)}
            />
        </div>
    )
}

export default Location