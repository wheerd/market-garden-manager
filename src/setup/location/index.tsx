import React, {lazy, useEffect, useMemo, useState} from 'react';
import {usePersistedState} from '@/lib/usePersistedState';
import {fetchWeatherData, getGroupedStats} from '@/lib/weatherData';

import {DataFrame} from 'data-forge';

const LocationDialog = lazy(() => import('./LocationDialog'));
const WeatherChart = lazy(() => import('./WeatherChart'));

import './index.scss';
import {useAsyncState} from '@/lib/useAsyncState';
import {
  GeoPosition,
  getElevation,
  getSatelliteImageAsDataUri,
  getTimeZone,
  metersPerPixel,
} from '@/lib/geo';
import {format} from 'date-fns';

interface LocationData {
  longitude: number;
  latitude: number;
  zoom: number;
  totalSizeInMeters?: number;
}

interface RawWeatherDataCache {
  cacheKey: string;
  data: {
    times: number[];
    temperature_2m: number[];
  };
}

const Location: React.FC = () => {
  const [location, setLocation] = usePersistedState<LocationData | null>(
    'location',
    null
  );
  const [locationImage, setLocationImage] = usePersistedState<string>(
    'locationImage',
    ''
  );
  const [timezone, setTimezone] = usePersistedState<string>('timezone', '');
  const [elevation, setElevation] = usePersistedState<number>('elevation', 0);
  const [rawTemperatureData, setRawTemperatureData] =
    usePersistedState<RawWeatherDataCache | null>('rawTemperatureData', null);
  const temperatureStats = useMemo(() => {
    const data = rawTemperatureData?.data ?? {times: [], temperature_2m: []};
    type Row = {times: number; temperature_2m: number};
    const df = new DataFrame<Row>({columns: data});
    const groupedByDayOfYear = df
      .generateSeries<Row & {dayOfYear: string}>({
        dayOfYear: row => {
          return format(row.times, 'MM-dd');
        },
      })
      .groupBy(r => r.dayOfYear)
      .toObject(
        g => g.first().dayOfYear,
        g => g.select(r => r.temperature_2m).toArray()
      );
    return getGroupedStats(groupedByDayOfYear);
  }, [rawTemperatureData]);

  const [pickerOpen, setPickerOpen] = useState(false);

  async function updateLocation(position: GeoPosition, zoom: number) {
    const locationImage = await getSatelliteImageAsDataUri(
      position,
      zoom,
      800,
      800
    );
    const totalSizeInMeters = metersPerPixel(position, zoom) * 800;

    setLocation({...position, zoom, totalSizeInMeters});
    setLocationImage(locationImage);

    setElevation(await getElevation(position));
    setTimezone(await getTimeZone(position));
  }

  useEffect(() => {
    if (location && elevation && timezone && rawTemperatureData !== undefined) {
      const cacheKey = `${location.latitude.toFixed(
        6
      )},${location.longitude.toFixed(6)}`;
      if (cacheKey !== rawTemperatureData?.cacheKey) {
        setRawTemperatureData(null);

        fetchWeatherData({
          latitude: location.latitude,
          longitude: location.longitude,
          start_date: '2000-01-01',
          end_date: '2023-12-31',
          elevation,
          timezone,
          hourly: ['temperature_2m'],
        }).then(data => setRawTemperatureData({cacheKey, data}), console.error);
      }
    }
  }, [location, elevation, timezone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [isLoading, onUpdateLocation] = useAsyncState(updateLocation);

  return (
    <div>
      <h1>Location</h1>
      <div
        className="locationImage"
        onClick={() => {
          setPickerOpen(true);
        }}
      >
        <div
          style={{
            backgroundImage: locationImage
              ? `url(${locationImage})`
              : undefined,
          }}
        >
          {
            <span className="coordinates">
              {location?.longitude.toFixed(6)} {location?.latitude.toFixed(6)}
            </span>
          }
          <span className="prompt">Change Location</span>
          {location?.totalSizeInMeters && (
            <span className="size">
              {location.totalSizeInMeters.toFixed(2)}x
              {location.totalSizeInMeters.toFixed(2)}m
            </span>
          )}
        </div>
      </div>
      <LocationDialog
        initialLocation={
          location && {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        }
        initialZoom={location?.zoom}
        onPickLocation={onUpdateLocation}
        isOpen={pickerOpen}
        onHide={() => {
          setPickerOpen(false);
        }}
      />
      {!isLoading && (
        <div>
          <p>Elevation: {elevation}m</p>
          <p>Time Zone: {timezone}</p>
          <p>
            Weather Data:{' '}
            {typeof rawTemperatureData !== 'undefined' ? 'yes' : 'no'}
          </p>
        </div>
      )}
      {isLoading && <p>Loading data...</p>}
      {rawTemperatureData && (
        <div>
          <WeatherChart temperatureStats={temperatureStats} />
        </div>
      )}
    </div>
  );
};

export default Location;
