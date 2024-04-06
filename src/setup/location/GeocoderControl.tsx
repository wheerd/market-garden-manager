import {GeoSearchControl, MapBoxProvider} from 'leaflet-geosearch';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useMap} from 'react-leaflet/hooks';

import {MAPBOX_ACCESS_TOKEN} from '@/lib/geo';

import 'leaflet-geosearch/dist/geosearch.css';

export const GeocoderControl: React.FC = () => {
  const {t} = useTranslation();
  const map = useMap();
  const provider = new MapBoxProvider({
    params: {
      access_token: MAPBOX_ACCESS_TOKEN,
    },
  });
  const control = GeoSearchControl({
    provider,
    style: 'bar',
    searchLabel: t('geo_search_label'),
    clearSearchLabel: t('geo_clear_search_label'),
    notFoundMessage: t('geo_not_found_message'),
  });
  useEffect(() => {
    map.addControl(control);
    return () => void map.removeControl(control);
  }, [map, control]);
  return null;
};
