import React from "react"
import Map, { MapboxEvent } from "react-map-gl"
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const Location: React.FC = () => {
    const [viewState, setViewState] = React.useState({
        longitude: -100,
        latitude: 40,
        zoom: 3.5
    });

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
            <p>Lat: {viewState.latitude} | Lon: {viewState.longitude} | Zoom: {viewState.zoom}</p>
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