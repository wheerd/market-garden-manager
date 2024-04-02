import React, { useEffect } from "react";
import { useMap } from 'react-leaflet/hooks';
import L from "leaflet";

import 'leaflet.locatecontrol'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'

export const LocateControl: React.FC = () => {
    const map = useMap();
    const control = L.control.locate({ setView: "once", position: "topright" });
    useEffect(() => {
        map.addControl(control);
        return () => void map.removeControl(control);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
};
