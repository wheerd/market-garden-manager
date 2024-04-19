import React, {useEffect, useMemo, useState} from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import {useTranslation} from 'react-i18next';
import Skeleton from 'react-loading-skeleton';

import {type CultivationGroup} from '@/Crops';

import testSvg from './crops.svg';

import './index.scss';

interface CropInfo {
  id: string;
  name: string;
  taxonomicName: string;
  description: string;
  cultivationGroup: CultivationGroup;
  image?: string;
}

const colors: Record<CultivationGroup, string> = {
  Allium: 'primary',
  Brassica: 'secondary',
  Chenopodiaceae: 'success',
  Cucurbit: 'danger',
  Lamiaceae: 'warning',
  Legume: 'info',
  Salad: 'light',
  Solanaceae: 'dark',
  Solanum: 'light',
  Umbelliferae: 'dark',
};

const Crops: React.FC = () => {
  const {t} = useTranslation();

  const [filter, setFilter] = useState('');

  const [crops, setCrops] = useState<CropInfo[]>([]);

  const filteredCrops = useMemo(() => {
    const f = filter.toLowerCase();
    return crops.filter(
      c =>
        c.name.toLowerCase().indexOf(f) !== -1 ||
        c.taxonomicName.toLowerCase().indexOf(f) !== -1
    );
  }, [filter, crops]);

  useEffect(() => {
    import('@/Crops').then(cm => {
      setCrops(
        cm.crops_infos.map(
          c =>
            ({
              name: c.commonName,
              taxonomicName: c.taxonomicName,
              description: c.description,
              id: c.id,
              cultivationGroup: c.cultivationGroup,
              image: c.imageId,
            }) as CropInfo
        )
      );
    });
  });

  return (
    <>
      <Form>
        <Form.Group
          as={Row}
          className="mb-3 position-relative"
          controlId="formLabel"
        >
          <Form.Label column sm={2}>
            {t('filter_crops_label')}
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder={t('filter_crops_placeholder')}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </Col>
          <Col sm={2}>
            <p>
              {t('total_crops_count', 'Showing {{count}}/{{total}} crops', {
                count: filteredCrops.length,
                total: crops.length,
              })}
            </p>
          </Col>
        </Form.Group>
      </Form>
      {crops.length > 0 ? (
        <Row xs={1} md={4} className="g-4">
          {filteredCrops.map(crop => (
            <Col key={crop.id}>
              <Card border={colors[crop.cultivationGroup]}>
                {crop.cultivationGroup && (
                  <Card.Header
                    className={
                      'bg-' +
                      colors[crop.cultivationGroup] +
                      ' text-' +
                      ((colors[crop.cultivationGroup] ?? 'light') === 'light'
                        ? 'dark'
                        : 'white')
                    }
                  >
                    {crop.cultivationGroup}
                  </Card.Header>
                )}
                {crop.image && (
                  <Card.Img variant="top" as="svg" className="crop-img">
                    <use xlinkHref={`${testSvg}#${crop.image}`}></use>
                  </Card.Img>
                )}
                <Card.Body>
                  <Card.Title>{crop.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {crop.taxonomicName}
                  </Card.Subtitle>
                  <Card.Text>{crop.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Skeleton />
      )}
    </>
  );
};

export default Crops;
