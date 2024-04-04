import React, {lazy, useEffect, useMemo, useState} from 'react';
import {usePersistedState} from '@/lib/usePersistedState';
import {
  DayOfYear,
  fetchWeatherData,
  getGroupedStats,
  getMinTemperatureProbabilities,
} from '@/lib/weatherData';

const LocationDialog = lazy(() => import('./LocationDialog'));
const WeatherChart = lazy(() => import('./WeatherChart'));

import './index.scss';
import {
  GeoPosition,
  getElevation,
  getSatelliteImageAsDataUri,
  getTimeZone,
  metersPerPixel,
} from '@/lib/geo';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Skeleton from 'react-loading-skeleton';

interface LocationData {
  longitude: number;
  latitude: number;
  zoom: number;
  totalSizeInMeters?: number;
}

interface RawWeatherDataCache {
  cacheKey: string;
  data: {
    [day: DayOfYear]: number[];
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
    const data = rawTemperatureData?.data ?? {};
    return getGroupedStats(data);
  }, [rawTemperatureData]);

  const frostProbabilities = useMemo(() => {
    const data = rawTemperatureData?.data ?? {};
    return getMinTemperatureProbabilities(data, 0);
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
          hourly: 'temperature_2m',
        }).then(data => setRawTemperatureData({cacheKey, data}), console.error);
      }
    }
  }, [location, elevation, timezone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Container fluid className="setup-location">
        <Row>
          <Col md="auto">
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
                    {location?.longitude.toFixed(6)}{' '}
                    {location?.latitude.toFixed(6)}
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
          </Col>
          <Col>
            <p>
              Elevation: {elevation ? `${elevation.toFixed(0)}m` : <Skeleton />}
            </p>
            <p>Time Zone: {timezone ?? <Skeleton />}</p>
            {rawTemperatureData ? (
              <div>
                <WeatherChart
                  temperatureStats={temperatureStats}
                  frostProbabilities={frostProbabilities}
                />
              </div>
            ) : (
              <Skeleton height={400} />
            )}
          </Col>
        </Row>
      </Container>
      <LocationDialog
        initialLocation={
          location && {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        }
        initialZoom={location?.zoom}
        onPickLocation={updateLocation}
        isOpen={pickerOpen}
        onHide={() => {
          setPickerOpen(false);
        }}
      />
    </>
  );
};

export default Location;
