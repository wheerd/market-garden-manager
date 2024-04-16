import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {useTranslation} from 'react-i18next';
import Skeleton from 'react-loading-skeleton';

import {type CultivationGroup} from '@/Crops';

import './index.scss';

interface CropInfo {
  id: string;
  name: string;
  taxonomicName: string;
  description: string;
  cultivationGroup: CultivationGroup;
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

  const [crops, setCrops] = useState<CropInfo[]>([]);

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
            }) as CropInfo
        )
      );
    });
  });

  return (
    <>
      {crops.length > 0 ? (
        <Row xs={1} md={4} className="g-4">
          {crops.map(crop => (
            <Col key={crop.id}>
              <Card
                bg={colors[crop.cultivationGroup]}
                text={
                  (colors[crop.cultivationGroup] ?? 'light') === 'light'
                    ? 'dark'
                    : 'white'
                }
              >
                <Card.Img variant="top" src="holder.js/100px180" />
                <Card.Body>
                  <Card.Title>{crop.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {crop.taxonomicName}
                  </Card.Subtitle>
                  <Card.Text>{crop.description}</Card.Text>
                  <Button variant="primary">Go somewhere</Button>
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
