import React from 'react';
import {useMapEvents} from 'react-leaflet/hooks';

import {GeoPosition} from '@/lib/geo';

export interface TrackPositionOptions {
  onMove: (newPosition: GeoPosition) => void;
  onZoom: (newZoom: number) => void;
}

export const TrackPosition: React.FC<TrackPositionOptions> = ({
  onMove,
  onZoom,
}) => {
  const map = useMapEvents({
    move() {
      const center = map.getCenter();
      onMove({
        latitude: +center.lat.toFixed(6),
        longitude: +center.lng.toFixed(6),
      });
    },
    zoom() {
      onZoom(map.getZoom());
    },
  });

  return null;
};
