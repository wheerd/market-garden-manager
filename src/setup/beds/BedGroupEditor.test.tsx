import {describe, test, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {BedGroupEditor, BedGroupEditorOptions} from './BedGroupEditor';
import {BedGroup, DEFAULT_BED_GROUP} from '@/model/beds';

describe('Button Group Editor', () => {
  const onSave = vi.fn();
  const onCancel = vi.fn();

  const editor = (
    group: Partial<BedGroup> = {},
    options: Partial<BedGroupEditorOptions> = {}
  ) => (
    <BedGroupEditor
      bedGroup={{...DEFAULT_BED_GROUP, ...group}}
      onSave={onSave}
      onCancel={onCancel}
      saveButtonText={options.saveButtonText ?? 'Save Button'}
      cancelButtonText={options.cancelButtonText ?? 'Cancel Button'}
    />
  );

  test('Renders Save Button', () => {
    render(editor({}, {saveButtonText: 'Save Button'}));

    expect(screen.getByText(/Save Button/)).toBeDefined();
  });

  test('Renders Cancel Button', () => {
    render(editor({}, {cancelButtonText: 'Cancel Button'}));

    expect(screen.getByText(/Cancel Button/)).toBeDefined();
  });

  describe('Bed count field', () => {
    test('Has value from input model', () => {
      render(editor({count: 42}));
      const input = screen.getByLabelText(/Bed Count/) as HTMLInputElement;

      expect(input.value).toBe('42');
    });

    test('Changes value on edit', () => {
      render(editor({count: 42}));
      const input = screen.getByLabelText(/Bed Count/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(input.value).toBe('24');
    });

    test('Does not modify input model on edit', () => {
      const e = editor({count: 42});
      render(e);
      const input = screen.getByLabelText(/Bed Count/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(e.props.bedGroup.count).toBe(42);
    });

    test('Updates value if input model changes', () => {
      const {rerender} = render(editor({count: 42}));
      const input = screen.getByLabelText(/Bed Count/) as HTMLInputElement;

      rerender(editor({count: 23}));

      expect(input.value).toBe('23');
    });
  });

  describe('Bed length field', () => {
    test('Has value from input model', () => {
      render(editor({lengthInMeters: 42}));
      const input = screen.getByLabelText(/Bed Length/) as HTMLInputElement;

      expect(input.value).toBe('42');
    });

    test('Changes value on edit', () => {
      render(editor({lengthInMeters: 42}));
      const input = screen.getByLabelText(/Bed Length/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(input.value).toBe('24');
    });

    test('Does not modify input model on edit', () => {
      const e = editor({lengthInMeters: 42});
      render(e);
      const input = screen.getByLabelText(/Bed Length/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(e.props.bedGroup.lengthInMeters).toBe(42);
    });

    test('Updates value if input model changes', () => {
      const {rerender} = render(editor({lengthInMeters: 42}));
      const input = screen.getByLabelText(/Bed Length/) as HTMLInputElement;

      rerender(editor({lengthInMeters: 23}));

      expect(input.value).toBe('23');
    });
  });

  test('Form submit calls onSave handler', () => {
    render(editor({label: 'valid'}));

    const form = screen.getByTestId('form') as HTMLFormElement;
    expect(form.checkValidity()).toBeTruthy();

    fireEvent.submit(form);

    expect(onSave).toHaveBeenCalled();
  });
});
