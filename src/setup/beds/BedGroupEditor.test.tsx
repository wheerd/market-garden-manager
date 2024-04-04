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
      saveButtonText={options.saveButtonText ?? 'XXX'}
      cancelButtonText={options.cancelButtonText ?? 'XXX'}
    />
  );

  describe('Label field', () => {
    test('Has value from input model', () => {
      render(editor({label: 'Some Label'}));
      const input = screen.getByLabelText(/Label/) as HTMLInputElement;

      expect(input.value).toBe('Some Label');
    });

    test('Changes value on edit', () => {
      render(editor({label: 'Some Label'}));
      const input = screen.getByLabelText(/Label/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: 'New Label'}});

      expect(input.value).toBe('New Label');
    });

    test('Does not modify input model on edit', () => {
      const e = editor({label: 'Some Label'});
      render(e);
      const input = screen.getByLabelText(/Label/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: 'New Label'}});

      expect(e.props.bedGroup.label).toBe('Some Label');
    });

    test('Updates value if input model changes', () => {
      const {rerender} = render(editor({label: 'Some Label'}));
      const input = screen.getByLabelText(/Label/) as HTMLInputElement;

      rerender(editor({label: 'New Label'}));

      expect(input.value).toBe('New Label');
    });

    test('Focusses field when model changes and new label is empty', () => {
      const {container, rerender} = render(editor({id: 'old'}));
      const input = screen.getByLabelText(/Label/) as HTMLInputElement;

      rerender(editor({id: 'new', label: ''}));

      expect(input).toBe(container.ownerDocument.activeElement);
    });
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

    test('Limits value to one decimal on edit', () => {
      render(editor());
      const input = screen.getByLabelText(/Bed Length/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24.12'}});

      expect(input.value).toBe('24.1');
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

  describe('Bed width field', () => {
    test('Has value from input model', () => {
      render(editor({widthInCentimeters: 42}));
      const input = screen.getByLabelText(/Bed Width/) as HTMLInputElement;

      expect(input.value).toBe('42');
    });

    test('Changes value on edit', () => {
      render(editor({widthInCentimeters: 42}));
      const input = screen.getByLabelText(/Bed Width/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(input.value).toBe('24');
    });

    test('Does not modify input model on edit', () => {
      const e = editor({widthInCentimeters: 42});
      render(e);
      const input = screen.getByLabelText(/Bed Width/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(e.props.bedGroup.widthInCentimeters).toBe(42);
    });

    test('Updates value if input model changes', () => {
      const {rerender} = render(editor({widthInCentimeters: 42}));
      const input = screen.getByLabelText(/Bed Width/) as HTMLInputElement;

      rerender(editor({widthInCentimeters: 23}));

      expect(input.value).toBe('23');
    });
  });

  describe('Bed spacing field', () => {
    test('Has value from input model', () => {
      render(editor({spacingInCentimeters: 42}));
      const input = screen.getByLabelText(/Bed Spacing/) as HTMLInputElement;

      expect(input.value).toBe('42');
    });

    test('Changes value on edit', () => {
      render(editor({spacingInCentimeters: 42}));
      const input = screen.getByLabelText(/Bed Spacing/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(input.value).toBe('24');
    });

    test('Does not modify input model on edit', () => {
      const e = editor({spacingInCentimeters: 42});
      render(e);
      const input = screen.getByLabelText(/Bed Spacing/) as HTMLInputElement;

      fireEvent.input(input, {target: {value: '24'}});

      expect(e.props.bedGroup.spacingInCentimeters).toBe(42);
    });

    test('Updates value if input model changes', () => {
      const {rerender} = render(editor({spacingInCentimeters: 42}));
      const input = screen.getByLabelText(/Bed Spacing/) as HTMLInputElement;

      rerender(editor({spacingInCentimeters: 23}));

      expect(input.value).toBe('23');
    });
  });

  describe('Form submit', () => {
    test('When valid then call onSave handler with model', () => {
      const validBedGroup: BedGroup = {
        id: 'some-id',
        label: 'Some Label',
        lengthInMeters: 1,
        count: 2,
        spacingInCentimeters: 3,
        widthInCentimeters: 4,
      };
      render(editor(validBedGroup));

      const form = screen.getByTestId('form') as HTMLFormElement;
      expect(form.checkValidity()).toBeTruthy();

      fireEvent.submit(form);

      expect(onSave).toHaveBeenCalledWith(validBedGroup);
    });

    test('When invalid then do not call onSave handler', () => {
      const invalidBedGroup: BedGroup = {
        id: 'some-id',
        label: '',
        lengthInMeters: 0,
        count: 0,
        spacingInCentimeters: 0,
        widthInCentimeters: 0,
      };
      render(editor(invalidBedGroup));

      const form = screen.getByTestId('form') as HTMLFormElement;
      expect(form.checkValidity()).toBeFalsy();

      fireEvent.submit(form);

      expect(onSave).not.toBeCalled();
    });

    test('Renders Save Button', () => {
      render(editor({}, {saveButtonText: 'Save Button'}));

      expect(screen.getByText(/Save Button/)).toBeDefined();
    });

    test('Save button submits form', () => {
      render(editor({}, {saveButtonText: 'Save Button'}));

      const saveButton = screen.getByText(/Save Button/) as HTMLButtonElement;
      expect(saveButton.type).toBe('submit');
    });
  });

  describe('Cancel button', () => {
    test('Renders', () => {
      render(editor({}, {cancelButtonText: 'Cancel Button'}));

      expect(screen.getByText(/Cancel Button/)).toBeDefined();
    });

    test('When clicked onCancel callback is called', () => {
      render(editor({}, {cancelButtonText: 'Cancel Button'}));

      fireEvent.click(screen.getByText(/Cancel Button/));

      expect(onCancel).toHaveBeenCalled();
    });

    test('When invalid then do not call onSave handler', () => {
      const beforeBedGroup: BedGroup = {
        id: 'some',
        label: 'Old Label',
        lengthInMeters: 1,
        count: 2,
        spacingInCentimeters: 3,
        widthInCentimeters: 4,
      };
      render(editor(beforeBedGroup, {cancelButtonText: 'Cancel Button'}));
      const input = screen.getByLabelText(/Label/) as HTMLInputElement;
      fireEvent.input(input, {target: {value: 'New Label'}});

      fireEvent.click(screen.getByText(/Cancel Button/));

      expect(input.value).toBe('Old Label');
    });
  });
});
