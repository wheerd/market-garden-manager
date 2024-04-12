import {PointerEvent} from 'react';

export interface Point {
  x: number;
  y: number;
}

export function getMousePositionInSvg(evt: PointerEvent<SVGElement>): Point {
  const CTM = evt.currentTarget.ownerSVGElement!.getScreenCTM()!;
  const point = new DOMPoint(evt.clientX, evt.clientY);
  const transformed = point.matrixTransform(CTM.inverse());
  return {x: transformed.x, y: transformed.y};
}

export function getMousePositionInSvgElement(
  evt: PointerEvent<SVGGraphicsElement>
): Point {
  const CTM = evt.currentTarget.getScreenCTM()!;
  const point = new DOMPoint(evt.clientX, evt.clientY);
  const transformed = point.matrixTransform(CTM.inverse());
  return {x: transformed.x, y: transformed.y};
}
