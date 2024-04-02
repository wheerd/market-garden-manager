import React, { useEffect, useState } from "react";
import { useMap } from 'react-leaflet/hooks';
import L from "leaflet";

import { getGeoPositionByIp } from "../../lib/geo";

import 'leaflet.locatecontrol'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'

export const LocateControl: React.FC<{ autoStart?: boolean }> = ({ autoStart = false }) => {
    const map = useMap();
    const control = L.control.locate({
        setView: "always",
        position: "topright",
        flyTo: true,
        onLocationError() {
            getGeoPositionByIp().then(
                (p) => {
                    map.flyTo([p.latitude, p.longitude], 12)
                },
                console.error
            )
        },
    });
    useEffect(() => {
        map.addControl(control);
        return () =>  void map.removeControl(control)
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [hasStarted, setHasStarted] = useState(false)
    useEffect(() => {
        console.log('autostart', autoStart)
        if (autoStart && !hasStarted) {
            control.start()
            setHasStarted(true)
        }
    }, [autoStart, hasStarted, control])
    return null;
};
