import React, {TouchEvent, MouseEvent, useMemo, useState} from 'react';

interface BedGroupOptions {
  x: number;
  y: number;
  length: number;
  width: number;
  count: number;
  spacing: number;
}

type SvgDragEvent =
  | MouseEvent<SVGGraphicsElement>
  | TouchEvent<SVGGraphicsElement>;

function getMousePosition(evt: SvgDragEvent) {
  var CTM = evt.currentTarget.ownerSVGElement!.getScreenCTM()!;
  const point =
    'touches' in evt
      ? new DOMPoint(evt.touches[0].clientX, evt.touches[0].clientY)
      : new DOMPoint(evt.clientX, evt.clientY);
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
    () => [...Array(count).keys()].map(i => (width + spacing) * i),
    [count, width, spacing]
  );

  function onDragStart(evt: SvgDragEvent) {
    setDragging(true);
    const mousePosition = getMousePosition(evt);
    setInitialMouse({x: mousePosition.x, y: mousePosition.y});
    setOffset({x: 0, y: 0});
  }

  function onDrag(evt: SvgDragEvent) {
    if (dragging) {
      evt.preventDefault();
      var mousePosition = getMousePosition(evt);
      setOffset({
        x: mousePosition.x - initialMouse.x,
        y: mousePosition.y - initialMouse.y,
      });
    }
  }

  function onDragEnd() {
    setCoordinates({x: offset.x + coordinates.x, y: offset.y + coordinates.y});
    setOffset({x: 0, y: 0});
    setDragging(false);
  }

  return (
    <g>
      <g
        transform={`translate(${offset.x}, ${offset.y}) translate(${coordinates.x}, ${coordinates.y})`}
        onMouseMove={onDrag}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDrag}
        onTouchMove={onDrag}
        onTouchEnd={onDragEnd}
        onTouchCancel={onDragEnd}
        className="draggable-group"
      >
        {bedXs.map((xOff, i) => (
          <rect
            key={`bed${i}`}
            x={xOff}
            y={0}
            width={width}
            height={length}
            fill="black"
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
    >
      <BedGroup x={30} y={30} width={0.6} length={10} count={8} spacing={0.3} />
    </svg>
  );
};
