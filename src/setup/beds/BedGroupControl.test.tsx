import {render, screen} from '@testing-library/react';
import {UserEvent, userEvent} from '@testing-library/user-event';
import {beforeEach, describe, expect, test, vi} from 'vitest';

import {
  getBoundingBoxInSvg,
  getMousePositionInSvg,
  getMousePositionInSvgElement,
  getSvgViewBox,
} from '@/lib/svgHelpers';

import {BedGroupControl, BedGroupControlOptions} from './BedGroupControl';

vi.mock('@/lib/svgHelpers', () => ({
  getMousePositionInSvg: vi.fn(),
  getMousePositionInSvgElement: vi.fn(),
  getBoundingBoxInSvg: vi.fn(),
  getSvgViewBox: vi.fn(),
}));

describe('Button Group Editor', () => {
  const onClick = vi.fn();
  const onMoved = vi.fn();
  const onRotated = vi.fn();

  const DEFAULT_OPTIONS: BedGroupControlOptions = {
    active: false,
    count: 1,
    length: 1,
    rotation: 0,
    spacing: 1,
    width: 1,
    x: 0,
    y: 0,
    onClick,
    onMoved,
    onRotated,
  };

  const control = (options: Partial<BedGroupControlOptions> = {}) => (
    <svg version="1.1" viewBox={'0 0 100 100'}>
      <BedGroupControl {...{...DEFAULT_OPTIONS, ...options}} />
    </svg>
  );

  describe('Active field', () => {
    test('If active is true group is rendered as active', () => {
      render(control({active: true}));
      const group = screen.getByTestId('bed-group');

      expect(group.classList).toContain('active');
    });

    test('If active is false group is rendered as inactive', () => {
      render(control({active: false}));
      const group = screen.getByTestId('bed-group');

      expect(group.classList).not.toContain('active');
    });
  });

  describe('Outline', () => {
    test('Width is sum all all bed widths plus the spacing between and outside', () => {
      render(control({spacing: 5, width: 12, count: 2}));
      const outline = screen.getByTestId('outline');

      expect(outline.getAttribute('width')).toEqual('39'); // 5 + 12 + 5 + 12 + 5
    });

    test('Height is bed length plus the spacing on each side', () => {
      render(control({spacing: 5, length: 12}));
      const outline = screen.getByTestId('outline');

      expect(outline.getAttribute('height')).toEqual('22'); // 5 + 12 + 5
    });
  });

  describe('Beds', () => {
    test('Each bed has the given width', () => {
      render(control({width: 23, count: 2}));
      const bed1 = screen.getByTestId('bed0');
      const bed2 = screen.getByTestId('bed1');

      expect(bed1.getAttribute('width')).toEqual('23');
      expect(bed2.getAttribute('width')).toEqual('23');
    });

    test('Each bed has the given length as height', () => {
      render(control({length: 23, count: 2}));
      const bed1 = screen.getByTestId('bed0');
      const bed2 = screen.getByTestId('bed1');

      expect(bed1.getAttribute('height')).toEqual('23');
      expect(bed2.getAttribute('height')).toEqual('23');
    });

    test('Each bed is offset by spacing from previous', () => {
      render(control({width: 13, spacing: 5, count: 3}));
      const bed1 = screen.getByTestId('bed0');
      const bed2 = screen.getByTestId('bed1');
      const bed3 = screen.getByTestId('bed2');

      expect(bed1.getAttribute('x')).toEqual('5');
      expect(bed2.getAttribute('x')).toEqual('23'); // 5 + 13 + 5
      expect(bed3.getAttribute('x')).toEqual('41'); // 5 + 13 + 5 + 13 + 5
    });
  });

  describe('Initial setup', () => {
    test('Group is positioned based on x and y', () => {
      render(control({x: 12, y: 23}));
      const group = screen.getByTestId('bed-group');

      expect(group.getAttribute('transform')).toContain('translate(12, 23)');
    });

    test('Group is rotated around the center', () => {
      render(
        control({rotation: 90, width: 5, length: 3, spacing: 1, count: 1})
      );
      const group = screen.getByTestId('bed-group');

      expect(group.getAttribute('transform')).toContain('rotate(90 3.5 2.5)');
    });
  });

  describe('Mode', () => {
    let user: UserEvent;
    let group: HTMLElement;

    beforeEach(() => {
      user = userEvent.setup();
      render(control({width: 10, length: 20}));
      group = screen.getByTestId('bed-group');
    });

    test('If mouse over top edge then mode is "rotation"', async () => {
      vi.mocked(getMousePositionInSvgElement).mockReturnValue({x: 5, y: 2});

      await user.hover(group);

      expect(group.classList).toContain('mode-rotation');
    });

    test('If mouse over bottom edge then mode is "rotation"', async () => {
      vi.mocked(getMousePositionInSvgElement).mockReturnValue({x: 5, y: 18});

      await user.hover(group);

      expect(group.classList).toContain('mode-rotation');
    });

    test('If mouse over left edge then mode is "rotation"', async () => {
      vi.mocked(getMousePositionInSvgElement).mockReturnValue({x: 1, y: 10});

      await user.hover(group);

      expect(group.classList).toContain('mode-rotation');
    });

    test('If mouse over right edge then mode is "rotation"', async () => {
      vi.mocked(getMousePositionInSvgElement).mockReturnValue({x: 11, y: 10});

      await user.hover(group);

      expect(group.classList).toContain('mode-rotation');
    });

    test('If mouse over middle then mode is "movement"', async () => {
      vi.mocked(getMousePositionInSvgElement).mockReturnValue({x: 5, y: 10});

      await user.hover(group);

      expect(group.classList).toContain('mode-movement');
    });
  });

  describe('Dragging', () => {
    let user: UserEvent;
    let group: HTMLElement;

    beforeEach(() => {
      user = userEvent.setup();
      render(control({width: 10, length: 10}));
      group = screen.getByTestId('bed-group');
    });

    test('If group is dragged it is displayed in new position afterwards', async () => {
      vi.mocked(getMousePositionInSvg)
        .mockReturnValueOnce({x: 5, y: 2})
        .mockReturnValueOnce({x: 15, y: 22});

      vi.mocked(getBoundingBoxInSvg).mockReturnValue(
        new DOMRect(30, 30, 20, 20)
      );

      vi.mocked(getSvgViewBox).mockReturnValue(new DOMRect(0, 0, 100, 100));

      await user.pointer([
        {
          keys: '[TouchA>]',
          target: group,
          coords: {x: 100, y: 50},
        },
        {pointerName: 'TouchA', coords: {x: 150, y: 50}},
        '[/TouchA]',
      ]);

      expect(group.getAttribute('transform')).toContain('translate(10, 20)');
    });
  });
});
