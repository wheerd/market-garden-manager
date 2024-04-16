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
  getMousePositionInSvgElement: vi.fn(() => ({x: 0, y: 0})),
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
      render(control({x: 30, y: 30}));
      group = screen.getByTestId('bed-group');

      vi.mocked(getBoundingBoxInSvg).mockReturnValue(
        new DOMRect(30, 30, 20, 20)
      );
      vi.mocked(getSvgViewBox).mockReturnValue(new DOMRect(0, 0, 100, 100));
      vi.mocked(getMousePositionInSvg).mockImplementation(e => ({
        x: e.clientX,
        y: e.clientY,
      }));
    });

    test('Group is displayed in new position after dragging', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 35, y: 32},
        },
        {pointerName: 'mouse', coords: {x: 45, y: 52}},
        '[/MouseLeft]',
      ]);

      expect(group.getAttribute('transform')).toContain('translate(40, 50)');
    });

    test('After dragging onMoved callback is called with new position', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 35, y: 32},
        },
        {pointerName: 'mouse', coords: {x: 45, y: 52}},
        '[/MouseLeft]',
      ]);

      expect(onMoved).toHaveBeenCalledWith(40, 50);
    });

    test('Only the last mouse position is relevant for the resulting position', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 35, y: 32},
        },
        {pointerName: 'mouse', coords: {x: 45, y: 52}},
        {pointerName: 'mouse', coords: {x: 25, y: 22}},
        '[/MouseLeft]',
      ]);

      expect(group.getAttribute('transform')).toContain('translate(20, 20)');
    });

    describe('Dragging is constrained by the SVG bounds', () => {
      test('On the left', async () => {
        await user.pointer([
          {
            keys: '[MouseLeft>]',
            target: group,
            coords: {x: 35, y: 32},
          },
          {pointerName: 'mouse', coords: {x: -1, y: 32}},
          '[/MouseLeft]',
        ]);

        expect(group.getAttribute('transform')).toContain('translate(0, 30)');
      });

      test('On the right', async () => {
        await user.pointer([
          {
            keys: '[MouseLeft>]',
            target: group,
            coords: {x: 35, y: 32},
          },
          {pointerName: 'mouse', coords: {x: 100, y: 32}},
          '[/MouseLeft]',
        ]);

        expect(group.getAttribute('transform')).toContain('translate(80, 30)');
      });

      test('On the top', async () => {
        await user.pointer([
          {
            keys: '[MouseLeft>]',
            target: group,
            coords: {x: 35, y: 32},
          },
          {pointerName: 'mouse', coords: {x: 35, y: -1}},
          '[/MouseLeft]',
        ]);

        expect(group.getAttribute('transform')).toContain('translate(30, 0)');
      });

      test('On the bottom', async () => {
        await user.pointer([
          {
            keys: '[MouseLeft>]',
            target: group,
            coords: {x: 35, y: 32},
          },
          {pointerName: 'mouse', coords: {x: 35, y: 100}},
          '[/MouseLeft]',
        ]);

        expect(group.getAttribute('transform')).toContain('translate(30, 80)');
      });
    });

    test('While dragging the group moves with the mouse', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 40, y: 40},
        },
        {pointerName: 'mouse', coords: {x: 30, y: 50}},
      ]);

      expect(group.getAttribute('transform')).toContain(
        'translate(-10, 10) translate(30, 30)'
      );
    });

    test('After dragging the group is not moving with the mouse anymore', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 40, y: 40},
        },
        {pointerName: 'mouse', coords: {x: 30, y: 50}},
        '[/MouseLeft]',
        {pointerName: 'mouse', coords: {x: 50, y: 30}},
      ]);

      expect(group.getAttribute('transform')).toContain(
        'translate(0, 0) translate(20, 40)'
      );
    });
  });

  describe('Rotating', () => {
    let user: UserEvent;
    let group: HTMLElement;

    beforeEach(async () => {
      user = userEvent.setup();
      render(
        control({
          x: 40,
          y: 40,
          width: 20,
          length: 20,
          spacing: 0,
          count: 1,
          rotation: 45,
        })
      );
      group = screen.getByTestId('bed-group');

      vi.mocked(getMousePositionInSvgElement).mockReturnValueOnce({
        x: 45,
        y: 41,
      });
      await user.hover(group); // Activate rotation mode

      vi.mocked(getMousePositionInSvg).mockImplementation(e => ({
        x: e.clientX,
        y: e.clientY,
      }));
    });

    test('Group is displayed in new rotation after rotating', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 0, y: 50},
        },
        {pointerName: 'mouse', coords: {x: 50, y: 0}},
        '[/MouseLeft]',
      ]);

      expect(group.getAttribute('transform')).toContain('rotate(135 10 10)'); // 45° + 90°
    });

    test('After rotating onRotated callback is called with new rotation', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 0, y: 50},
        },
        {pointerName: 'mouse', coords: {x: 50, y: 0}},
        '[/MouseLeft]',
      ]);

      expect(onRotated).toHaveBeenCalledWith(135); // 45° + 90°
    });

    test('While the button is pressed group rotates with mouse', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 0, y: 50},
        },
        {pointerName: 'mouse', coords: {x: 50, y: 100}},
      ]);

      expect(group.getAttribute('transform')).toContain('rotate(315 10 10)'); // 45° + 270°
    });

    test('After button is released group is not rotating with mouse anymore', async () => {
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: group,
          coords: {x: 0, y: 50},
        },
        {pointerName: 'mouse', coords: {x: 50, y: 100}},
        '[/MouseLeft]',
        {pointerName: 'mouse', coords: {x: 50, y: 0}},
      ]);

      expect(group.getAttribute('transform')).toContain('rotate(315 10 10)'); // 45° + 270°
    });
  });
});
