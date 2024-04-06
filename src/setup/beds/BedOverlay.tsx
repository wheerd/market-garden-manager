import React, {PointerEvent, useMemo, useState} from 'react';

import {BedGroup} from '@/model/beds';

import './BedOverlay.scss';

interface BedGroupOptions {
  x: number;
  y: number;
  length: number;
  width: number;
  count: number;
  spacing: number;
  active: boolean;
}

function transformRect(rect: DOMRect, svg: SVGSVGElement): DOMRect {
  const inverseCTM = svg.getScreenCTM()!.inverse();
  const topLeft = new DOMPoint(rect.left, rect.top).matrixTransform(inverseCTM);
  const bottomRight = new DOMPoint(rect.right, rect.bottom).matrixTransform(
    inverseCTM
  );
  return new DOMRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y
  );
}

function getMousePosition(evt: PointerEvent<SVGGraphicsElement>) {
  const CTM = evt.currentTarget.ownerSVGElement!.getScreenCTM()!;
  const point = new DOMPoint(evt.clientX, evt.clientY);
  return point.matrixTransform(CTM.inverse());
}

function constrainToBox(point: DOMPoint, box: DOMRect): DOMPoint {
  const constrainedX = Math.max(Math.min(point.x, box.right), box.left);
  const constrainedY = Math.max(Math.min(point.y, box.bottom), box.top);
  return new DOMPoint(constrainedX, constrainedY);
}

function getOffsetBBox(inner: DOMRect, outer: DOMRect): DOMRect {
  const offsetMinX = outer.left - inner.left;
  const offsetMaxX = outer.right - inner.right;
  const offsetMinY = outer.top - inner.top;
  const offsetMaxY = outer.bottom - inner.bottom;
  return new DOMRect(
    offsetMinX,
    offsetMinY,
    offsetMaxX - offsetMinX,
    offsetMaxY - offsetMinY
  );
}

const BedGroup: React.FC<BedGroupOptions> = ({
  x,
  y,
  length,
  width,
  count,
  spacing,
  active,
}) => {
  const [dragging, setDragging] = useState(false);
  const [coordinates, setCoordinates] = useState({x, y});
  const [initialMouse, setInitialMouse] = useState({x: 0, y: 0});
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [offsetBBox, setOffsetBBox] = useState<DOMRect>(
    new DOMRect(0, 0, 0, 0)
  );

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
    const element = evt.currentTarget,
      svg = element.ownerSVGElement!;
    element.setPointerCapture(evt.pointerId);
    const mousePosition = getMousePosition(evt);
    setInitialMouse({x: mousePosition.x, y: mousePosition.y});
    setOffset({x: 0, y: 0});

    const clientBBox = element.getBoundingClientRect();
    const svgBBox = transformRect(clientBBox, svg);
    const viewBox = DOMRect.fromRect(svg.viewBox.baseVal!);
    setOffsetBBox(getOffsetBBox(svgBBox, viewBox));
  }

  function onDrag(evt: PointerEvent<SVGGraphicsElement>) {
    if (dragging) {
      evt.preventDefault();
      const mousePosition = getMousePosition(evt);
      const newOffset = new DOMPoint(
        mousePosition.x - initialMouse.x,
        mousePosition.y - initialMouse.y
      );
      const constrainedOffset = constrainToBox(newOffset, offsetBBox);
      setOffset({
        x: constrainedOffset.x,
        y: constrainedOffset.y,
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
    <g
      transform={`translate(${offset.x}, ${offset.y}) translate(${coordinates.x}, ${coordinates.y})`}
      onPointerMove={onDrag}
      onPointerDown={onDragStart}
      onPointerUp={onDragEnd}
      className={active ? 'active' : ''}
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
  );
};

interface BedOverlayOptions {
  sizeInMeters: number;
  bedGroups: BedGroup[];
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
