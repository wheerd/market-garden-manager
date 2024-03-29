import React, { useEffect, useMemo } from "react"
import Map, { MapboxEvent } from "react-map-gl"
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import { usePersistedState } from "../lib/usePersistedState";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface LocationData {
    longitude: number,
    latitude: number,
    zoom: number
}

const Location: React.FC = () => {
    const defaultLocation = useMemo(() => ({
        longitude: -100,
        latitude: 40,
        zoom: 3.5
    }), [])

    const [location, setLocation] = usePersistedState<LocationData>("location", defaultLocation);

    const [viewState, setViewState] = React.useState(defaultLocation);

    useEffect(() => {
        if (typeof location !== "undefined") {
            setViewState(location)
        }
    }, [location])

    function onLoad(e: MapboxEvent) {
        var geocoder = new MapboxGeocoder({
            accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "",
            mapboxgl: mapboxgl
        });
        e.target.addControl(geocoder);
    }

    return (
        <div>
            Location
            <p>
                Lat:
                <input type="text" value={viewState.latitude} onChange={(event) => {
                    setViewState({ ...viewState, latitude: +event.target.value })
                }}></input>
                | Lon:
                <input type="text" value={viewState.longitude} onChange={(event) => {
                    setViewState({ ...viewState, longitude: +event.target.value })
                }}></input>
                | Zoom: {viewState.zoom}
                <button onClick={() => setLocation(viewState)}>Save Location</button>
            </p>
            <Map
                onLoad={onLoad}
                mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                reuseMaps
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: 600, height: 400 }}
                mapStyle="mapbox://styles/mapbox/satellite-v9"
            />
        </div>
    )
}

export default Location