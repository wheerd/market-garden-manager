import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {usePersistedState} from '@/lib/usePersistedState';
import {BedGroup, DEFAULT_BED_GROUP} from '@/model/beds';

import './index.scss';
import {BedGroupEditor} from './BedGroupEditor';

const Beds: React.FC = () => {
  const {t} = useTranslation();

  const [bedGroups, setBedGroups] = usePersistedState<BedGroup[]>(
    'bedGroups',
    []
  );
  const [locationImage] = usePersistedState<string>('locationImage', '');

  const [bedGroup, setBedGroup] = useState<BedGroup>({...DEFAULT_BED_GROUP});
  const [adding, setAdding] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState('');

  function onSave(newBedGroup: BedGroup) {
    if (adding) {
      setBedGroups((bedGroups ?? []).concat([newBedGroup]));
      setSelectedBedId(newBedGroup.id);
      setAdding(false);
    } else if (bedGroups?.length) {
      const index = bedGroups.findIndex(g => g.id === selectedBedId);
      if (index !== -1) {
        bedGroups[index] = newBedGroup;
        setBedGroups(bedGroups);
      }
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
    setBedGroup(bedGroup ?? {...DEFAULT_BED_GROUP});
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
                  aria-label={t('select_bed_group_label')}
                  size="lg"
                  disabled={adding || !bedGroups?.length}
                  value={selectedBedId}
                  onChange={e => setSelectedBedId(e.target.value)}
                >
                  {bedGroups?.map(b => (
                    <option key={b.id} value={b.id}>
                      {t('bed_group_select_option', {
                        label: b.label,
                        count: b.count,
                        length: b.lengthInMeters,
                        width: b.widthInCentimeters,
                      })}
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
                  {t('add_button')}
                </Button>
              </Col>
              <Col md="auto">
                <Button
                  variant="danger"
                  type="button"
                  size="lg"
                  disabled={adding || !selectedBedId}
                  onClick={onDelete}
                >
                  {t('delete_button')}
                </Button>
              </Col>
            </Form.Group>
            {bedGroups?.length || adding ? (
              <BedGroupEditor
                bedGroup={bedGroup}
                onSave={onSave}
                onCancel={onCancel}
                saveButtonText={adding ? t('add_button') : t('save_button')}
                cancelButtonText={
                  adding ? t('cancel_button') : t('reset_button')
                }
              />
            ) : (
              <Container>
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <p>{t('no_bed_groups')}</p>
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
                      {t('add_button_first')}
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
