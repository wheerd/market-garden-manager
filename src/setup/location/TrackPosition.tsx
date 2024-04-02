import React from "react";
import { useMapEvents } from 'react-leaflet/hooks';
import { GeoPosition } from "../../lib/geo";

export const TrackPosition: React.FC<{
    onMove: (p: GeoPosition) => void;
    onZoom: (z: number) => void;
}> = ({ onMove, onZoom }) => {
    const map = useMapEvents({
        move() {
            const center = map.getCenter();
            onMove({ latitude: +center.lat.toFixed(6), longitude: +center.lng.toFixed(6) });
        },
        zoom() {
            onZoom(map.getZoom());
        },
    });

    return null;
};
