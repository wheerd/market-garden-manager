import L from 'leaflet';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useMap} from 'react-leaflet/hooks';

import {getGeoPositionByIp} from '@/lib/geo';

import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';

export const LocateControl: React.FC<{autoStart?: boolean}> = ({
  autoStart = false,
}) => {
  const {t} = useTranslation();
  const map = useMap();
  const control = L.control.locate({
    setView: 'always',
    position: 'topright',
    flyTo: true,
    onLocationError() {
      getGeoPositionByIp().then(p => {
        map.flyTo([p.latitude, p.longitude], 12);
      }, console.error);
    },
    strings: {
      title: t('location_locate_title'),
      popup: t('location_locate_popup'),
      metersUnit: t('location_locate_meters'),
      feetUnit: t('location_locate_feet'),
    },
  });
  useEffect(() => {
    map.addControl(control);
    return () => void map.removeControl(control);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    if (autoStart && !hasStarted) {
      control.start();
      setHasStarted(true);
    }
  }, [autoStart, hasStarted, control]);
  return null;
};
