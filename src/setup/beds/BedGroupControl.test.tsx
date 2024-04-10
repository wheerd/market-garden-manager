import {render, screen} from '@testing-library/react';
import {describe, expect, test, vi} from 'vitest';

import {BedGroupControl, BedGroupControlOptions} from './BedGroupControl';

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
});
