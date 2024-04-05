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
  /*
  const [origin, setOrigin] = useState({x, y});
  const [offset, setOffset] = useState({x: 0, y: 0});
  */

  const bedXs = useMemo(
    () => [...Array(count).keys()].map(i => (width + spacing) * i),
    [count, width, spacing]
  );

  const [selectedElement, setSelectedElement] =
    useState<SVGGraphicsElement | null>(null);
  const [offset, setOffset] = useState<DOMPointReadOnly>(
    new DOMPointReadOnly(0, 0)
  );
  const [transform, setTransform] = useState<SVGTransform | null>(null);

  function initialiseDragging(
    evt: SvgDragEvent,
    selectedElement: SVGGraphicsElement
  ) {
    setSelectedElement(selectedElement);
    const offset = getMousePosition(evt);

    // Make sure the first transform on the element is a translate transform
    var transforms = selectedElement.transform.baseVal;

    if (
      transforms.length === 0 ||
      transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
    ) {
      // Create an transform that translates by (0, 0)
      var translate = evt.currentTarget.ownerSVGElement!.createSVGTransform();
      translate.setTranslate(0, 0);
      selectedElement.transform.baseVal.insertItemBefore(translate, 0);
    }

    // Get initial translation
    const transform = transforms.getItem(0);
    console.log(offset, transform.matrix);
    setTransform(transform);
    const newOffset = new DOMPointReadOnly(
      offset.x - transform.matrix.e,
      offset.y - transform.matrix.f
    );
    setOffset(newOffset);
    console.log(newOffset);
  }

  function onDragStart(evt: SvgDragEvent) {
    if (
      evt.currentTarget.classList.contains('draggable') ||
      evt.currentTarget.classList.contains('draggable-group')
    ) {
      initialiseDragging(evt, evt.currentTarget);
    } else {
      const parent = evt.currentTarget.parentNode;
      if (
        parent &&
        'classList' in parent &&
        (parent.classList as DOMTokenList).contains('draggable-group')
      ) {
        initialiseDragging(evt, parent as SVGGraphicsElement);
      }
    }
  }

  function onDrag(evt: SvgDragEvent) {
    if (selectedElement) {
      evt.preventDefault();
      var coord = getMousePosition(evt);
      transform?.setTranslate(coord.x - offset.x, coord.y - offset.y);
    }
  }

  function onDragEnd(evt: SvgDragEvent) {
    setSelectedElement(null);
  }

  return (
    <g>
      <g
        transform={`translate(${coordinates.x}, ${coordinates.y}) rotate(20)`}
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
  metersPerPixel: number;
}
export const BedOverlay: React.FC<BedOverlayOptions> = ({metersPerPixel}) => {
  return (
    <svg version="1.1" width="100%" height="100%" viewBox="0 0 100 100">
      <BedGroup x={30} y={30} width={20} length={50} count={2} spacing={5} />
    </svg>
  );
};
