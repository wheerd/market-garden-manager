import {PointerEvent} from 'react';

import {transformRect} from './domGeometryUtils';

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
export function getBoundingBoxInSvg(element: SVGGraphicsElement) {
  const svg = element.ownerSVGElement!;
  const clientBBox = element.getBoundingClientRect();
  const svgBBox = transformRect(clientBBox, svg.getScreenCTM()!.inverse());
  return svgBBox;
}
export function getSvgViewBox(element: SVGGraphicsElement) {
  return DOMRect.fromRect(element.ownerSVGElement!.viewBox.baseVal!);
}
