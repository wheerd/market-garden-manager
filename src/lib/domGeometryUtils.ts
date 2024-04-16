export function transformRect(rect: DOMRect, matrix: DOMMatrix): DOMRect {
  const topLeft = new DOMPoint(rect.left, rect.top).matrixTransform(matrix);
  const bottomRight = new DOMPoint(rect.right, rect.bottom).matrixTransform(
    matrix
  );
  return new DOMRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y
  );
}

export function constrainToBox(point: DOMPoint, box: DOMRect): DOMPoint {
  const constrainedX = Math.max(Math.min(point.x, box.right), box.left);
  const constrainedY = Math.max(Math.min(point.y, box.bottom), box.top);
  return new DOMPoint(constrainedX, constrainedY);
}

export function getOffsetBBox(inner: DOMRect, outer: DOMRect): DOMRect {
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
