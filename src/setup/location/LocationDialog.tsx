import React, {useEffect, useState} from 'react';

import {MapContainer} from 'react-leaflet/MapContainer';
import {TileLayer} from 'react-leaflet/TileLayer';

import 'leaflet/dist/leaflet.css';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import {type GeoPosition, MAPBOX_ACCESS_TOKEN} from '@/lib/geo';
import {TrackPosition} from './TrackPosition';
import {LocateControl} from './LocateControl';
import {GeocoderControl} from './GeocoderControl';

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
        <Modal.Title>Pick a Location</Modal.Title>
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
                >
                  <TileLayer
                    attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                    url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`}
                  />
                  <TrackPosition onMove={setPosition} onZoom={setZoom} />
                  <LocateControl autoStart={open && initialLocation === null} />
                  <GeocoderControl />
                </MapContainer>
              )}
            </Col>
            <Col>
              <Form>
                <Form.Group className="mb-3" controlId="formLatitude">
                  <Form.Label>Latitude</Form.Label>
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
                  <Form.Label>Longitude</Form.Label>
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
                  <Form.Label>Zoom</Form.Label>
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
          Close
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationDialog;
