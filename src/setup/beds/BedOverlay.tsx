import React, {PointerEvent, useMemo, useState} from 'react';

import './BedOverlay.scss';

interface BedGroupOptions {
  x: number;
  y: number;
  length: number;
  width: number;
  count: number;
  spacing: number;
}

function getMousePosition(evt: PointerEvent<SVGGraphicsElement>) {
  const CTM = evt.currentTarget.ownerSVGElement!.getScreenCTM()!;
  const point = new DOMPoint(evt.clientX, evt.clientY);
  return point.matrixTransform(CTM.inverse());
}

const BedGroup: React.FC<BedGroupOptions> = ({
  x,
  y,
  length,
  width,
  count,
  spacing,
}) => {
  const [dragging, setDragging] = useState(false);
  const [coordinates, setCoordinates] = useState({x, y});
  const [initialMouse, setInitialMouse] = useState({x: 0, y: 0});
  const [offset, setOffset] = useState({x: 0, y: 0});

  const bedXs = useMemo(
    () => [...Array(count).keys()].map(i => spacing + (width + spacing) * i),
    [count, width, spacing]
  );
  const totalWidth = useMemo(
    () => count * (width + spacing) + spacing,
    [count, width, spacing]
  );
  const totalHeight = useMemo(() => length + 2 * spacing, [length, spacing]);

  function onDragStart(evt: PointerEvent<SVGGraphicsElement>) {
    setDragging(true);
    evt.currentTarget.setPointerCapture(evt.pointerId);
    const mousePosition = getMousePosition(evt);
    setInitialMouse({x: mousePosition.x, y: mousePosition.y});
    setOffset({x: 0, y: 0});
  }

  function onDrag(evt: PointerEvent<SVGGraphicsElement>) {
    if (dragging) {
      evt.preventDefault();
      const mousePosition = getMousePosition(evt);
      setOffset({
        x: mousePosition.x - initialMouse.x,
        y: mousePosition.y - initialMouse.y,
      });
    }
  }

  function onDragEnd(evt: PointerEvent<SVGGraphicsElement>) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    if (dragging) {
      setCoordinates({
        x: offset.x + coordinates.x,
        y: offset.y + coordinates.y,
      });
      setOffset({x: 0, y: 0});
      setDragging(false);
    }
  }

  return (
    <g>
      <g
        transform={`translate(${offset.x}, ${offset.y}) translate(${coordinates.x}, ${coordinates.y})`}
        onPointerMove={onDrag}
        onPointerDown={onDragStart}
        onPointerUp={onDragEnd}
      >
        <rect
          x={0}
          y={0}
          width={totalWidth}
          height={totalHeight}
          className="group-outline"
        ></rect>
        {bedXs.map((xOff, i) => (
          <rect
            key={`bed${i}`}
            x={xOff}
            y={spacing}
            width={width}
            height={length}
            className="bed"
          ></rect>
        ))}
      </g>
    </g>
  );
};

interface BedOverlayOptions {
  sizeInMeters: number;
}
export const BedOverlay: React.FC<BedOverlayOptions> = ({sizeInMeters}) => {
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
      <BedGroup x={10} y={10} width={0.6} length={10} count={8} spacing={0.3} />
    </svg>
  );
};
