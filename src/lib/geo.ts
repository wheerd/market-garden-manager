import { useState, useEffect } from "react";

export interface GeoPosition {
    longitude: number,
    latitude: number,
}

export const useBrowserLocation = (initialLocation?: GeoPosition) => {
    const [position, setPosition] = useState<GeoPosition>(initialLocation ?? {
        latitude: 47.21725,
        longitude: -1.55336,
    });
    useEffect(() => {
        if (!initialLocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    setPosition(coords);
                },
                () => {
                    const fetchByIp = async () => {
                        try {
                            const { data } = await (await fetch("https://ipapi.co/json")).json() as { data: GeoPosition };
                            setPosition(data);
                        } catch (err) {
                            console.error(err);
                        }
                    };
                    void fetchByIp();
                }
            );
        }
    }, [initialLocation]);
    return { position };
};