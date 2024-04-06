import React, {PointerEvent, useMemo, useState} from 'react';

import {
  constrainToBox,
  getOffsetBBox,
  transformRect,
} from '@/lib/domGeometryUtils';

import './BedGroupControl.scss';

function getMousePositionInSvg(evt: PointerEvent<SVGElement>) {
  const CTM = evt.currentTarget.ownerSVGElement!.getScreenCTM()!;
  const point = new DOMPoint(evt.clientX, evt.clientY);
  return point.matrixTransform(CTM.inverse());
}

function getMousePositionInSvgElement(evt: PointerEvent<SVGGraphicsElement>) {
  const CTM = evt.currentTarget.getScreenCTM()!;
  const point = new DOMPoint(evt.clientX, evt.clientY);
  return point.matrixTransform(CTM.inverse());
}

export interface BedGroupControlOptions {
  x: number;
  y: number;
  rotation: number;
  length: number;
  width: number;
  count: number;
  spacing: number;
  active: boolean;
  onClick(): void;
  onMoved(x: number, y: number): void;
  onRotated(rotation: number): void;
}

export const BedGroupControl: React.FC<BedGroupControlOptions> = ({
  x,
  y,
  rotation: inputRotation,
  length,
  width,
  count,
  spacing,
  active,
  onClick,
  onMoved,
  onRotated,
}) => {
  const [position, setPosition] = useState({x, y});
  const [rotation, setRotation] = useState(inputRotation);
  const [rotating, setRotating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStartMousePosition, setDragStartMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  const [dragOffsetBBox, setDragOffsetBBox] = useState(new DOMRect(0, 0, 0, 0));
  const [dragRotation, setDragRotation] = useState(0);

  const bedXs = useMemo(
    () => [...Array(count).keys()].map(i => spacing + (width + spacing) * i),
    [count, width, spacing]
  );
  const totalWidth = useMemo(
    () => count * (width + spacing) + spacing,
    [count, width, spacing]
  );
  const totalHeight = useMemo(() => length + 2 * spacing, [length, spacing]);
  const center = useMemo(
    () => ({x: position.x + totalWidth / 2, y: position.y + totalHeight / 2}),
    [position, totalWidth, totalHeight]
  );

  function onDragStart(evt: PointerEvent<SVGGraphicsElement>) {
    const element = evt.currentTarget;
    element.setPointerCapture(evt.pointerId);
    const mousePosition = getMousePositionInSvg(evt);
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
      const mousePosition = getMousePositionInSvg(evt);
      if (rotating) {
        const angle =
          Math.atan2(
            dragStartMousePosition.x - center.x,
            dragStartMousePosition.y - center.y
          ) -
          Math.atan2(mousePosition.x - center.x, mousePosition.y - center.y);
        setDragRotation((angle * 180) / Math.PI);
      } else {
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
    } else {
      const mousePosition = getMousePositionInSvgElement(evt);
      const xp = mousePosition.x / totalWidth;
      const yp = mousePosition.y / totalHeight;
      setRotating(xp < 0.1 || xp > 0.9 || yp < 0.2 || yp > 0.8);
    }
  }

  function onDragEnd(evt: PointerEvent<SVGGraphicsElement>) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    if (dragging) {
      if (rotating) {
        const newRotation = (rotation + dragRotation) % 360;
        setRotation(newRotation);
        setDragRotation(0);
        onRotated(newRotation);
      } else {
        const newPosition = {
          x: dragOffset.x + position.x,
          y: dragOffset.y + position.y,
        };
        setPosition(newPosition);
        setDragOffset({x: 0, y: 0});
        onMoved(newPosition.x, newPosition.y);
      }
      setDragging(false);
    }
  }

  return (
    <g
      transform={
        `translate(${dragOffset.x}, ${dragOffset.y}) ` +
        `translate(${position.x}, ${position.y}) ` +
        `rotate(${rotation + dragRotation} ${totalWidth / 2} ${
          totalHeight / 2
        })`
      }
      onPointerMove={onDrag}
      onPointerDown={onDragStart}
      onPointerUp={onDragEnd}
      onClick={onClick}
      className={`bed-group-ctrl${active ? ' active' : ''}${
        rotating ? ' rotating' : ''
      }`}
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
