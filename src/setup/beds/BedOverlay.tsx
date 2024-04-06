import React from 'react';

import {BedGroup as BedGroupModel} from '@/model/beds';

import {BedGroup} from './BedGroup';

import './BedOverlay.scss';

export interface BedOverlayOptions {
  sizeInMeters: number;
  bedGroups: BedGroupModel[];
  selectedBedId: string;
}

export const BedOverlay: React.FC<BedOverlayOptions> = ({
  sizeInMeters,
  bedGroups,
  selectedBedId,
}) => {
  return (
    <svg
      version="1.1"
      width="100%"
      height="100%"
      viewBox={`0 0 ${sizeInMeters} ${sizeInMeters}`}
      className="bed-overlay"
    >
      <defs>
        <linearGradient id="bedGradient">
          <stop offset="0%" stopColor="#3f2915" />
          <stop offset="50%" stopColor="#654321" />
          <stop offset="100%" stopColor="#3f2915" />
        </linearGradient>
      </defs>
      {bedGroups.map(g => (
        <BedGroup
          active={g.id === selectedBedId}
          key={g.id}
          x={0}
          y={0}
          width={g.widthInCentimeters / 100}
          length={g.lengthInMeters}
          count={g.count}
          spacing={g.spacingInCentimeters / 100}
        />
      ))}
    </svg>
  );
};
