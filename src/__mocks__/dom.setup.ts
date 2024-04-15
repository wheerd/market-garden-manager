import {beforeAll, vi} from 'vitest';

class DOMPoint {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
    public w = 0
  ) {}

  static fromPoint(other?: DOMPointInit): DOMPoint {
    return new DOMPoint(other?.x, other?.y, other?.z, other?.w);
  }

  matrixTransform() {
    return this;
  }

  toJSON() {
    return JSON.stringify(this);
  }
}

class DOMRect {
  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0
  ) {}

  bottom: number = this.y + this.height;
  left: number = this.x;
  right: number = this.x + this.width;
  top: number = this.y;

  static fromRect(other?: DOMRectInit): DOMRect {
    return new DOMRect(other?.x, other?.y, other?.width, other?.height);
  }

  toJSON() {
    return JSON.stringify(this);
  }
}

beforeAll(() => {
  globalThis.DOMRect = DOMRect;
  globalThis.DOMPoint = DOMPoint;

  globalThis.Element.prototype.setPointerCapture = vi.fn();
  globalThis.Element.prototype.releasePointerCapture = vi.fn();
});
