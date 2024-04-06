import React, {PointerEvent, useMemo, useState} from 'react';

import {
  constrainToBox,
  getOffsetBBox,
  transformRect,
} from '@/lib/domGeometryUtils';

import './BedGroupControl.scss';

function getMousePosition(evt: PointerEvent<SVGElement>) {
  const CTM = evt.currentTarget.ownerSVGElement!.getScreenCTM()!;
  const point = new DOMPoint(evt.clientX, evt.clientY);
  return point.matrixTransform(CTM.inverse());
}

export interface BedGroupControlOptions {
  x: number;
  y: number;
  length: number;
  width: number;
  count: number;
  spacing: number;
  active: boolean;
  onClick(): void;
  onMoved(x: number, y: number): void;
}

export const BedGroupControl: React.FC<BedGroupControlOptions> = ({
  x,
  y,
  length,
  width,
  count,
  spacing,
  active,
  onClick,
  onMoved,
}) => {
  const [position, setPosition] = useState({x, y});
  const [dragging, setDragging] = useState(false);
  const [dragStartMousePosition, setDragStartMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  const [dragOffsetBBox, setDragOffsetBBox] = useState(new DOMRect(0, 0, 0, 0));

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
    const element = evt.currentTarget;
    element.setPointerCapture(evt.pointerId);
    const mousePosition = getMousePosition(evt);
    setDragging(true);
    setDragOffset({x: 0, y: 0});
    setDragStartMousePosition({x: mousePosition.x, y: mousePosition.y});
    initOffsetBBox(element);
  }

  function initOffsetBBox(element: SVGGraphicsElement) {
    const svg = element.ownerSVGElement!;
    const clientBBox = element.getBoundingClientRect();
    const svgBBox = transformRect(clientBBox, svg.getScreenCTM()!.inverse());
    const viewBox = DOMRect.fromRect(svg.viewBox.baseVal!);
    setDragOffsetBBox(getOffsetBBox(svgBBox, viewBox));
  }

  function onDrag(evt: PointerEvent<SVGGraphicsElement>) {
    if (dragging) {
      evt.preventDefault();
      const mousePosition = getMousePosition(evt);
      const newOffset = new DOMPoint(
        mousePosition.x - dragStartMousePosition.x,
        mousePosition.y - dragStartMousePosition.y
      );
      const constrainedOffset = constrainToBox(newOffset, dragOffsetBBox);
      setDragOffset({
        x: constrainedOffset.x,
        y: constrainedOffset.y,
      });
    }
  }

  function onDragEnd(evt: PointerEvent<SVGGraphicsElement>) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    if (dragging) {
      const newPosition = {
        x: dragOffset.x + position.x,
        y: dragOffset.y + position.y,
      };
      setPosition(newPosition);
      setDragOffset({x: 0, y: 0});
      setDragging(false);
      onMoved(newPosition.x, newPosition.y);
    }
  }

  return (
    <g
      transform={
        `translate(${dragOffset.x}, ${dragOffset.y}) ` +
        `translate(${position.x}, ${position.y})`
      }
      onPointerMove={onDrag}
      onPointerDown={onDragStart}
      onPointerUp={onDragEnd}
      onClick={onClick}
      className={`bed-group-ctrl ${active ? 'active' : ''}`}
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
