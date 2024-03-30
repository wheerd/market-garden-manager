import React, { useMemo, useState } from "react"
import { usePersistedState } from "../lib/usePersistedState";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { fetchWeatherApi } from 'openmeteo';

import LocationDialog from "./LocationPicker";

import "./Location.css";

interface LocationData {
    longitude: number,
    latitude: number,
    zoom: number,
    bearing: number,
    totalSizeInMeters?: number,
}

interface ElevationResponse {
    results: {
        "latitude": number,
        "longitude": number,
        "elevation": number
    }[]
}

async function getElevation(location: LocationData) {
    const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${location.latitude},${location.longitude}`);
    const data = await response.json() as ElevationResponse;
    return data.results[0].elevation;
}

interface TimeZoneResponse {
    "countryCode": string,
    "timezoneId": string
}

async function getTimeZone(location: LocationData) {
    const response = await fetch(`http://api.geonames.org/timezoneJSON?lat=${location.latitude}&lng=${location.longitude}&username=wheerd`);
    const data = await response.json() as TimeZoneResponse;
    return data.timezoneId;
}

interface WeatherDataRaw {
    tempMin: number[],
    tempMax: number[],
    tempMean: number[],
    rainSum: number[],

}

type GroupedRawWeatherData = Record<string, WeatherDataRaw>

async function fetchWeatherData(location: LocationData, elevation: number, timeZone: string): Promise<GroupedRawWeatherData> {
    const params = {
        "latitude": location.latitude,
        "longitude": location.longitude,
        "start_date": "1950-01-01",
        "end_date": "2023-12-31",
        "daily": ["temperature_2m_max", "temperature_2m_min", "temperature_2m_mean", "rain_sum"],
        "timezone": timeZone,
        "elevation": elevation,
    };
    const url = "https://archive-api.open-meteo.com/v1/archive";
    const responses = await fetchWeatherApi(url, params);
    const daily = responses[0].daily()!;

    const temperature2mMax = daily.variables(0)!.valuesArray()!
    const temperature2mMin = daily.variables(1)!.valuesArray()!
    const temperature2mMean = daily.variables(2)!.valuesArray()!
    const rainSum = daily.variables(3)!.valuesArray()!

    const groupedData: GroupedRawWeatherData = {}

    const start = Number(daily.time()) * 1000;
    const end = Number(daily.timeEnd()) * 1000;
    const interval = daily.interval() * 1000

    const dateFormatOptions = { timeZone: timeZone, month: "2-digit", day: "2-digit" } as Intl.DateTimeFormatOptions

    let i = 0;
    for (let day = start; day < end; day += interval) {
        const date = new Date(day);
        const dayId = date.toLocaleDateString("en-us", dateFormatOptions).split("/").slice(0, 2).join('-')

        if (!groupedData[dayId]) groupedData[dayId] = { tempMin: [], tempMean: [], tempMax: [], rainSum: []}
        groupedData[dayId].tempMin.push(temperature2mMin[i])
        groupedData[dayId].tempMean.push(temperature2mMean[i])
        groupedData[dayId].tempMax.push(temperature2mMax[i])
        groupedData[dayId].rainSum.push(rainSum[i])

        i++;
    }

    return groupedData;
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
    const [timezone, setTimezone] = usePersistedState<string>("timezone", "");
    const [elevation, setElevation] = usePersistedState<number>("elevation", 0);
    const [rawWeatherData, setRawWeatherData] = usePersistedState<GroupedRawWeatherData | undefined>("rawWeatherData", undefined);

    const [pickerOpen, setPickerOpen] = useState(false)

    async function updateLocation(newLocation: LocationData, locationImage: string, totalSizeInMeters: number) {
        setLocation({ ...newLocation, totalSizeInMeters });
        setLocationImage(locationImage);

        setRawWeatherData(undefined)

        setElevation(await getElevation(newLocation));
        setTimezone(await getTimeZone(newLocation));

        setRawWeatherData(await fetchWeatherData(newLocation, elevation, timezone))
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
            <p>Elevation: {elevation}m</p>
            <p>Time Zone: {timezone}</p>
            <p>Weather Data: {typeof rawWeatherData !== "undefined" ? "yes" : "no"}</p>
        </div>
    )
}

export default Location