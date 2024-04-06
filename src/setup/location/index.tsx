import React, {lazy, useEffect, useMemo, useState} from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import {useTranslation} from 'react-i18next';
import Skeleton from 'react-loading-skeleton';

import {
  GeoPosition,
  getElevation,
  getSatelliteImageAsDataUri,
  getTimeZone,
  metersPerPixel,
} from '@/lib/geo';
import {usePersistedState} from '@/lib/usePersistedState';
import {
  DayOfYear,
  fetchWeatherData,
  getGroupedStats,
  getMinTemperatureProbabilities,
} from '@/lib/weatherData';

import './index.scss';

const LocationDialog = lazy(() => import('./LocationDialog'));
const WeatherChart = lazy(() => import('./WeatherChart'));

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
  const {t} = useTranslation();
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
                    {t('location_position_label', {
                      lat: location?.latitude.toFixed(6),
                      lon: location?.longitude.toFixed(6),
                    })}
                  </span>
                }
                <span className="prompt">{t('location_change_prompt')}</span>
                {location?.totalSizeInMeters && (
                  <span className="size">
                    {t('location_size_label', {
                      size: location.totalSizeInMeters.toFixed(2),
                    })}
                  </span>
                )}
              </div>
            </div>
          </Col>
          <Col>
            <p>
              {elevation
                ? t('elevation_with_label', {elevation: elevation.toFixed(0)})
                : t('elevation_unknown')}
            </p>
            <p>
              {timezone
                ? t('timezone_with_label', {timezone})
                : t('timezone_unknown')}
            </p>
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
