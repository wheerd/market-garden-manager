import React, { useEffect } from "react";
import { useMap } from 'react-leaflet/hooks';
import { MAPBOX_ACCESS_TOKEN } from "../../lib/geo";

import { GeoSearchControl, MapBoxProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

export const GeocoderControl: React.FC = () => {
    const map = useMap();
    const provider = new MapBoxProvider({
        params: {
            access_token: MAPBOX_ACCESS_TOKEN,
        },
    });
    const control = GeoSearchControl({
        provider,
        style: 'bar'
    });
    useEffect(() => {
        map.addControl(control);
        return () => void map.removeControl(control);
    }, [map, control]);
    return null;
};
