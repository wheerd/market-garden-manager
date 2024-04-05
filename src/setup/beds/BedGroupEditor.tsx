import React, {FormEvent, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import {BedGroup} from '@/model/beds';

export interface BedGroupEditorOptions {
  bedGroup: BedGroup;
  onSave(bedGroup: BedGroup): void;
  onCancel(): void;
  saveButtonText: string;
  cancelButtonText: string;
}

export const BedGroupEditor: React.FC<BedGroupEditorOptions> = ({
  bedGroup: inputBedGroup,
  onSave,
  onCancel,
  saveButtonText,
  cancelButtonText,
}) => {
  const {t} = useTranslation();

  const [bedGroup, setBedGroup] = useState<BedGroup>({...inputBedGroup});
  useEffect(() => {
    if (bedGroup.id !== inputBedGroup.id && !inputBedGroup.label) {
      labelInput?.current?.focus();
    }
    setBedGroup({...inputBedGroup});
  }, [inputBedGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  const [validated, setValidated] = useState(false);

  const labelInput = useRef<HTMLInputElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() !== false) {
      setValidated(false);
      onSave({...bedGroup});
    } else {
      setValidated(true);
    }
  }

  function onCancelClick() {
    resetBed();
    onCancel();
  }

  function resetBed() {
    setBedGroup({...inputBedGroup});
    setValidated(false);
  }

  return (
    <Form
      noValidate
      validated={validated}
      onSubmit={onSubmit}
      data-testid="form"
    >
      <Form.Group
        as={Row}
        className="mb-3 position-relative"
        controlId="formLabel"
      >
        <Form.Label column sm={2}>
          {t('label_label')}
        </Form.Label>
        <Col sm={10}>
          <Form.Control
            required
            type="text"
            placeholder={t('label_placeholder')}
            value={bedGroup.label}
            onChange={e => setBedGroup({...bedGroup, label: e.target.value})}
            ref={labelInput}
          />
          <Form.Control.Feedback tooltip type="invalid">
            {t('label_feedback')}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formCount">
        <Form.Label column sm={2}>
          {t('bed_count_label')}
        </Form.Label>
        <Col sm={10}>
          <Form.Control
            required
            type="number"
            min={1}
            placeholder={t('bed_count_placeholder')}
            value={bedGroup.count}
            onChange={e => setBedGroup({...bedGroup, count: +e.target.value})}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formBedLength">
        <Form.Label column sm={2}>
          {t('bed_length_label')}
        </Form.Label>
        <Col sm={10}>
          <InputGroup className="mb-2">
            <Form.Control
              required
              type="number"
              min={0}
              step="any"
              placeholder={t('bed_length_placeholder')}
              value={bedGroup.lengthInMeters}
              onChange={e =>
                setBedGroup({
                  ...bedGroup,
                  lengthInMeters: +(+e.target.value).toFixed(1),
                })
              }
            />
            <InputGroup.Text>{t('unit_meter_short')}</InputGroup.Text>
          </InputGroup>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formBedWidth">
        <Form.Label column sm={2}>
          {t('bed_width_label')}
        </Form.Label>
        <Col sm={10}>
          <InputGroup className="mb-2">
            <Form.Control
              required
              type="number"
              min={1}
              placeholder={t('bed_width_placeholder')}
              value={bedGroup.widthInCentimeters}
              onChange={e =>
                setBedGroup({
                  ...bedGroup,
                  widthInCentimeters: +e.target.value,
                })
              }
            />
            <InputGroup.Text>{t('unit_centimeter_short')}</InputGroup.Text>
          </InputGroup>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formBedSpacing">
        <Form.Label column sm={2}>
          {t('bed_spacing_label')}
        </Form.Label>
        <Col sm={10}>
          <InputGroup className="mb-2">
            <Form.Control
              required
              type="number"
              min={0}
              placeholder={t('bed_spacing_placeholder')}
              value={bedGroup.spacingInCentimeters}
              onChange={e =>
                setBedGroup({
                  ...bedGroup,
                  spacingInCentimeters: +e.target.value,
                })
              }
            />
            <InputGroup.Text>{t('unit_centimeter_short')}</InputGroup.Text>
          </InputGroup>
        </Col>
      </Form.Group>
      <Row>
        <Col md="auto">
          <Button variant="primary" type="submit">
            {saveButtonText}
          </Button>
        </Col>
        <Col md="auto">
          <Button variant="secondary" type="reset" onClick={onCancelClick}>
            {cancelButtonText}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
