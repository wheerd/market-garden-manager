import React, {FormEvent, useEffect, useState} from 'react';

import {usePersistedState} from '@/lib/usePersistedState';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import {BedGroup} from '@/model/beds';

import './index.scss';

const DEFAULT_BED_GROUP: BedGroup = {
  id: '',
  label: '',
  lengthInMeters: 10,
  count: 1,
  spacingInCentimeters: 30,
  widthInCentimeters: 60,
};

const Beds: React.FC = () => {
  const [bedGroups, setBedGroups] = usePersistedState<BedGroup[]>(
    'bedGroups',
    []
  );
  const [locationImage] = usePersistedState<string>('locationImage', '');

  const [bedGroup, setBedGroup] = useState<BedGroup>({...DEFAULT_BED_GROUP});
  const [validated, setValidated] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() !== false) {
      if (adding) {
        setBedGroups((bedGroups ?? []).concat([bedGroup]));
        setSelectedBedId(bedGroup.id);
        setAdding(false);
      } else if (bedGroups?.length) {
        const index = bedGroups.findIndex(g => g.id === selectedBedId);
        if (index !== -1) {
          bedGroups[index] = {...bedGroup};
          setBedGroups(bedGroups);
        }
      }
      setValidated(false);
    } else {
      setValidated(true);
    }
  }

  function onAdd() {
    setAdding(true);
    setBedGroup({
      ...DEFAULT_BED_GROUP,
      id: Math.random().toString(36).substring(2),
    });
  }

  function onDelete() {
    if (bedGroups?.length) {
      setBedGroups(bedGroups.filter(g => g.id !== selectedBedId));
      setSelectedBedId('');
    }
  }

  function onCancel() {
    setAdding(false);
    resetBed();
  }

  function resetBed() {
    const bedGroup = bedGroups?.find(g => g.id === selectedBedId);
    setBedGroup({...(bedGroup ?? DEFAULT_BED_GROUP)});
    setValidated(false);
  }

  useEffect(resetBed, [selectedBedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedBedId && bedGroups?.length) {
      setSelectedBedId(bedGroups[0].id);
    } else if (!bedGroups?.length) {
      setSelectedBedId('');
    }
  }, [selectedBedId, bedGroups]);

  return (
    <>
      <Container fluid className="setup-beds">
        <Row>
          <Col md="auto">
            <div className="locationImage">
              <div
                style={{
                  backgroundImage: locationImage
                    ? `url(${locationImage})`
                    : undefined,
                }}
              ></div>
            </div>
          </Col>
          <Col>
            <Form.Group as={Row} className="mb-3 position-relative">
              <Col>
                <Form.Select
                  aria-label="Select bed group"
                  size="lg"
                  disabled={adding || !bedGroups?.length}
                  value={selectedBedId}
                  onChange={e => setSelectedBedId(e.target.value)}
                >
                  {bedGroups?.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.label} ({b.count} bed(s), {b.lengthInMeters}m&times;
                      {b.widthInCentimeters}cm)
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md="auto">
                <Button
                  variant="success"
                  type="button"
                  size="lg"
                  disabled={adding}
                  onClick={onAdd}
                >
                  Add
                </Button>
              </Col>
            </Form.Group>
            {bedGroups?.length || adding ? (
              <Form noValidate validated={validated} onSubmit={onSubmit}>
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
                      onChange={e =>
                        setBedGroup({...bedGroup, label: e.target.value})
                      }
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
                      onChange={e =>
                        setBedGroup({...bedGroup, count: +e.target.value})
                      }
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
                        step={0.1}
                        placeholder="Enter bed length"
                        value={bedGroup.lengthInMeters}
                        onChange={e =>
                          setBedGroup({
                            ...bedGroup,
                            lengthInMeters: +e.target.value,
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
                <Form.Group
                  as={Row}
                  className="mb-3"
                  controlId="formBedSpacing"
                >
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
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!adding && !selectedBedId}
                    >
                      {adding ? 'Add' : 'Save'}
                    </Button>
                  </Col>
                  <Col md="auto">
                    <Button variant="secondary" type="reset" onClick={onCancel}>
                      {adding ? 'Cancel' : 'Reset'}
                    </Button>
                  </Col>
                  <Col md="auto">
                    <Button
                      variant="danger"
                      type="button"
                      disabled={adding || !selectedBedId}
                      onClick={onDelete}
                    >
                      Delete
                    </Button>
                  </Col>
                </Row>
              </Form>
            ) : (
              <Container>
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <p>There are currently no bed groups defined</p>
                  </Col>
                </Row>
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <Button
                      variant="success"
                      type="button"
                      size="lg"
                      disabled={adding}
                      onClick={onAdd}
                    >
                      Add first bed group
                    </Button>
                  </Col>
                </Row>
              </Container>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Beds;
