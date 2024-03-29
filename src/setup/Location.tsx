import React from "react"
import Map from "react-map-gl"

import 'mapbox-gl/dist/mapbox-gl.css';

const Location: React.FC = () => {
    const [viewState, setViewState] = React.useState({
        longitude: -100,
        latitude: 40,
        zoom: 3.5
    });

    return (
        <div>
            Location
            <p>Lat: {viewState.latitude} | Lon: {viewState.longitude} | Zoom: {viewState.zoom}</p>
            <Map
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