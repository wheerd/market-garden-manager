import React from 'react';

import {usePersistedState} from '@/lib/usePersistedState';
import {BedGroup, BedGroupGuiPosition} from '@/model/beds';

import {BedGroupControl} from './BedGroupControl';

import './BedOverlay.scss';

export interface BedOverlayOptions {
  sizeInMeters: number;
  bedGroups: BedGroup[];
  selectedBedId: string;
  onSelectBed(id: string): void;
}

export const BedOverlay: React.FC<BedOverlayOptions> = ({
  sizeInMeters,
  bedGroups,
  selectedBedId,
  onSelectBed,
}) => {
  const [guiPositions, setGuiPositions] = usePersistedState<
    Record<string, BedGroupGuiPosition>
  >('bedGroupsGui', {});

  function updateGroupPosition(id: string, pos: Partial<BedGroupGuiPosition>) {
    const allIds = bedGroups.map(g => g.id);
    const guiPositionsWithExistingIds = Object.fromEntries(
      Object.entries(guiPositions ?? {}).filter(([id]) => allIds.includes(id))
    );
    setGuiPositions({
      ...guiPositionsWithExistingIds,
      [id]: {
        ...(guiPositions?.[id] ?? {x: 0, y: 0, rotation: 0}),
        ...pos,
      },
    });
  }

  function onBedMoved(id: string, x: number, y: number): void {
    updateGroupPosition(id, {x, y});
  }
  function onBedRotated(id: string, rotation: number): void {
    updateGroupPosition(id, {rotation});
  }

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
        <BedGroupControl
          active={g.id === selectedBedId}
          key={g.id}
          x={guiPositions?.[g.id]?.x ?? 0}
          y={guiPositions?.[g.id]?.y ?? 0}
          rotation={guiPositions?.[g.id]?.rotation ?? 0}
          width={g.widthInCentimeters / 100}
          length={g.lengthInMeters}
          count={g.count}
          spacing={g.spacingInCentimeters / 100}
          onClick={() => onSelectBed(g.id)}
          onMoved={(x, y) => onBedMoved(g.id, x, y)}
          onRotated={r => onBedRotated(g.id, r)}
        />
      ))}
    </svg>
  );
};
