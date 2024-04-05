import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import {useTranslation} from 'react-i18next';
import {ZoomControl} from 'react-leaflet';
import {MapContainer} from 'react-leaflet/MapContainer';
import {TileLayer} from 'react-leaflet/TileLayer';

import {type GeoPosition, MAPBOX_ACCESS_TOKEN} from '@/lib/geo';

import {GeocoderControl} from './GeocoderControl';
import {LocateControl} from './LocateControl';
import {TrackPosition} from './TrackPosition';

import 'leaflet/dist/leaflet.css';

interface LocationDialogParams {
  initialLocation?: GeoPosition | null;
  initialZoom?: number;
  initialBearing?: number;
  onPickLocation: (location: GeoPosition, zoom: number) => void;
  isOpen: boolean;
  onHide: () => void;
}

const DEFAULT_ZOOM = 0;

const LocationDialog: React.FC<LocationDialogParams> = ({
  initialLocation,
  initialZoom,
  onPickLocation,
  isOpen,
  onHide,
}) => {
  const {t} = useTranslation();
  const [position, setPosition] = useState<GeoPosition | undefined>();
  const [zoom, setZoom] = useState(initialZoom ?? DEFAULT_ZOOM);

  const [open, setOpen] = useState(isOpen);
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  useEffect(() => {
    if (!position) {
      if (initialLocation === null) {
        setPosition({latitude: 0, longitude: 0});
      } else {
        setPosition(initialLocation);
      }
    }
  }, [position, initialLocation]);
  useEffect(() => {
    setZoom(initialZoom ?? DEFAULT_ZOOM);
  }, [initialZoom]);

  function onSave() {
    if (!position) return;
    onPickLocation(position, zoom);
    setOpen(false);
    onHide();
  }

  function handleClose() {
    setPosition(initialLocation ?? undefined);
    setZoom(initialZoom ?? DEFAULT_ZOOM);
    setOpen(false);
    onHide();
  }

  return (
    <Modal show={open} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{t('location_dialog_title')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Container>
          <Row>
            <Col>
              {position && (
                <MapContainer
                  center={[position.latitude, position.longitude]}
                  zoom={zoom}
                  scrollWheelZoom={true}
                  style={{width: 400, height: 400}}
                  zoomControl={false}
                >
                  <TileLayer
                    tileSize={512}
                    maxZoom={20}
                    zoomOffset={-1}
                    id="mapbox/satellite-v9"
                    accessToken={MAPBOX_ACCESS_TOKEN}
                    attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                    url={`https://api.mapbox.com/styles/v1/{id}/tiles/512/{z}/{x}/{y}?access_token={accessToken}`}
                  />
                  <TrackPosition onMove={setPosition} onZoom={setZoom} />
                  <LocateControl autoStart={open && initialLocation === null} />
                  <GeocoderControl />
                  <ZoomControl
                    zoomInText={t('location_zoom_in_button', {
                      defaultValue: '+',
                    })}
                    zoomOutText={t('location_zoom_out_button', {
                      defaultValue: '-',
                    })}
                    zoomInTitle={t('location_zoom_in_tooltip')}
                    zoomOutTitle={t('location_zoom_out_tooltip')}
                  />
                </MapContainer>
              )}
            </Col>
            <Col>
              <Form>
                <Form.Group className="mb-3" controlId="formLatitude">
                  <Form.Label>{t('location_latitude_label')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={position?.latitude ?? ''}
                    onChange={event => {
                      setPosition({
                        latitude: +(+event.target.value).toFixed(6),
                        longitude:
                          position?.longitude ??
                          initialLocation?.longitude ??
                          0,
                      });
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formLongitude">
                  <Form.Label>{t('location_longitude_label')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={position?.longitude ?? ''}
                    onChange={event => {
                      setPosition({
                        latitude:
                          position?.latitude ?? initialLocation?.latitude ?? 0,
                        longitude: +(+event.target.value).toFixed(6),
                      });
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formZoom">
                  <Form.Label>{t('location_zoom_label')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={zoom}
                    onChange={event => {
                      setZoom(+(+event.target.value).toFixed(1));
                    }}
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Container>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t('location_close_button')}
        </Button>
        <Button variant="primary" onClick={onSave}>
          {t('location_save_button')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationDialog;
