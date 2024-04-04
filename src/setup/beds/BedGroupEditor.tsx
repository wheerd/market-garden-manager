import React, {FormEvent, useEffect, useRef, useState} from 'react';
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
  const [bedGroup, setBedGroup] = useState<BedGroup>({...inputBedGroup});
  useEffect(() => {
    if (bedGroup.id !== inputBedGroup.id && !inputBedGroup.label) {
      labelInput?.current?.focus();
    }
    setBedGroup({...inputBedGroup});
  }, [inputBedGroup]);

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
          Label
        </Form.Label>
        <Col sm={10}>
          <Form.Control
            required
            type="text"
            placeholder="Enter label"
            value={bedGroup.label}
            onChange={e => setBedGroup({...bedGroup, label: e.target.value})}
            ref={labelInput}
          />
          <Form.Control.Feedback tooltip type="invalid">
            Please enter a label.
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formCount">
        <Form.Label column sm={2}>
          Bed Count
        </Form.Label>
        <Col sm={10}>
          <Form.Control
            required
            type="number"
            min={1}
            placeholder="Enter bed count"
            value={bedGroup.count}
            onChange={e => setBedGroup({...bedGroup, count: +e.target.value})}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formBedLength">
        <Form.Label column sm={2}>
          Bed Length
        </Form.Label>
        <Col sm={10}>
          <InputGroup className="mb-2">
            <Form.Control
              required
              type="number"
              min={0}
              step="any"
              placeholder="Enter bed length"
              value={bedGroup.lengthInMeters}
              onChange={e =>
                setBedGroup({
                  ...bedGroup,
                  lengthInMeters: +(+e.target.value).toFixed(1),
                })
              }
            />
            <InputGroup.Text>m</InputGroup.Text>
          </InputGroup>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formBedWidth">
        <Form.Label column sm={2}>
          Bed Width
        </Form.Label>
        <Col sm={10}>
          <InputGroup className="mb-2">
            <Form.Control
              required
              type="number"
              min={1}
              placeholder="Enter bed width"
              value={bedGroup.widthInCentimeters}
              onChange={e =>
                setBedGroup({
                  ...bedGroup,
                  widthInCentimeters: +e.target.value,
                })
              }
            />
            <InputGroup.Text>cm</InputGroup.Text>
          </InputGroup>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formBedSpacing">
        <Form.Label column sm={2}>
          Bed Spacing
        </Form.Label>
        <Col sm={10}>
          <InputGroup className="mb-2">
            <Form.Control
              required
              type="number"
              min={0}
              placeholder="Enter bed spacing"
              value={bedGroup.spacingInCentimeters}
              onChange={e =>
                setBedGroup({
                  ...bedGroup,
                  spacingInCentimeters: +e.target.value,
                })
              }
            />
            <InputGroup.Text>cm</InputGroup.Text>
          </InputGroup>
        </Col>
      </Form.Group>
      <Row>
        <Col md="auto">
          <Button variant="primary" type="submit" style={{width: '5em'}}>
            {saveButtonText}
          </Button>
        </Col>
        <Col md="auto">
          <Button
            variant="secondary"
            type="reset"
            onClick={onCancelClick}
            style={{width: '5em'}}
          >
            {cancelButtonText}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
