export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

export interface GeoPosition {
    longitude: number,
    latitude: number,
}

const convertBlobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
});

export async function getSatelliteImageAsDataUri(position: GeoPosition, zoom: number, width: number, height: number): Promise<string> {
    const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${position.longitude.toFixed(6)},${position.latitude.toFixed(6)},${zoom.toFixed(1)},0},0/${width.toFixed(0)}x${height.toFixed(0)}?access_token=${MAPBOX_ACCESS_TOKEN}`)
    return await convertBlobToBase64(await response.blob())
}

export const metersPerPixel = (position: GeoPosition, zoom: number) => 40007000 * Math.cos(position.latitude * Math.PI / 180) / (512 * Math.pow(2, zoom));

interface ElevationResponse {
    results: {
        "latitude": number,
        "longitude": number,
        "elevation": number
    }[]
}

export async function getElevation(location: GeoPosition) {
    const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${location.latitude},${location.longitude}`);
    const data = await response.json() as ElevationResponse;
    return data.results[0].elevation;
}

interface TimeZoneResponse {
    "countryCode": string,
    "timezoneId": string
}

export async function getTimeZone(location: GeoPosition) {
    const response = await fetch(`https://secure.geonames.org/timezoneJSON?lat=${location.latitude}&lng=${location.longitude}&username=wheerd`);
    const data = await response.json() as TimeZoneResponse;
    return data.timezoneId;
}

interface GeoIPResponse {
    "ip": string,
    "city": string,
    "region_code": string,
    "country_code": string,
    "postal": string,
    "latitude": number,
    "longitude": number,
    "timezone": string,
    "currency": string,
    "languages": string
}

export async function getGeoPositionByIp(): Promise<GeoPosition> {
    const { latitude, longitude } = await (await fetch("https://ipapi.co/json")).json() as GeoIPResponse;
    return { latitude, longitude };
}