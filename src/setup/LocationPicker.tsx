import React, { useEffect, useState } from "react"

import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import 'leaflet.locatecontrol'
import { GeoSearchControl, MapBoxProvider } from 'leaflet-geosearch';
import L from "leaflet"

import "leaflet/dist/leaflet.css";
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import 'leaflet-geosearch/dist/geosearch.css';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { GeoPosition, useBrowserLocation } from "../lib/geo";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

interface LocationDialogParams {
    initialLocation?: GeoPosition,
    initialZoom?: number,
    initialBearing?: number,
    onPickLocation: (location: GeoPosition, zoom: number) => void,
    isOpen: boolean,
    onHide: () => void,
}

const TrackPosition: React.FC<{
    onMove: (p: GeoPosition) => void,
    onZoom: (z: number) => void,
}> = ({ onMove, onZoom }) => {
    const map = useMapEvents({
        move() {
            const center = map.getCenter();
            onMove({ latitude: +center.lat.toFixed(6), longitude: +center.lng.toFixed(6) })
        },
        zoom() {
            onZoom(map.getZoom())
        },
    })

    return null
}

const LocateControl: React.FC = () => {
    const map = useMap()
    const control = L.control.locate({ setView: "once", position: "topright" });
    useEffect(() => {
        map.addControl(control);
        return () => void map.removeControl(control)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    return null
}

const GeocoderControl: React.FC = () => {
    const map = useMap()
    const provider = new MapBoxProvider({
        params: {
            access_token: MAPBOX_ACCESS_TOKEN,
        },
    })
    const control = GeoSearchControl({
        provider,
        style: 'bar'
    });
    useEffect(() => {
        map.addControl(control);
        return () => void map.removeControl(control)
    }, [map, control])
    return null
}

const DEFAULT_ZOOM = 13

const LocationDialog: React.FC<LocationDialogParams> =
    ({ initialLocation, initialZoom, onPickLocation, isOpen, onHide }) => {
        const { position: inputPosition } = useBrowserLocation(initialLocation);
        const [position, setPosition] = useState<GeoPosition | undefined>()
        const [zoom, setZoom] = useState(initialZoom ?? DEFAULT_ZOOM)

        const [open, setOpen] = useState(isOpen);
        useEffect(() => { setOpen(isOpen); }, [isOpen]);
        useEffect(() => { if (!position) setPosition(inputPosition); }, [position, inputPosition]);

        function onSave() {
            if (!position) return;
            onPickLocation(position, zoom);
            setOpen(false);
            onHide();
        }

        function handleClose() {
            setPosition(initialLocation)
            setZoom(initialZoom ?? DEFAULT_ZOOM)
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
                                <MapContainer
                                    center={[inputPosition.latitude, inputPosition.longitude]}
                                    zoom={zoom}
                                    scrollWheelZoom={true}
                                    style={{ width: 400, height: 400 }}
                                >
                                    <TileLayer
                                        attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                                        url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`}
                                    />
                                    <TrackPosition onMove={setPosition} onZoom={setZoom} />
                                    <LocateControl />
                                    <GeocoderControl />
                                </MapContainer>
                            </Col>
                            <Col>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formLatitude">
                                        <Form.Label>Latitude</Form.Label>
                                        <Form.Control type="text" value={position?.latitude ?? ""} onChange={(event) => {
                                            setPosition({
                                                latitude: +(+event.target.value).toFixed(6),
                                                longitude: position?.longitude ?? inputPosition.longitude
                                            })
                                        }} />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formLongitude">
                                        <Form.Label>Longitude</Form.Label>
                                        <Form.Control type="text" value={position?.longitude ?? ""} onChange={(event) => {
                                            setPosition({
                                                latitude: position?.latitude ?? inputPosition.latitude,
                                                longitude: +(+event.target.value).toFixed(6)
                                            })
                                        }} />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formZoom">
                                        <Form.Label>Zoom</Form.Label>
                                        <Form.Control type="text" value={zoom} onChange={(event) => {
                                            setZoom(+(+event.target.value).toFixed(1))
                                        }} />
                                    </Form.Group>
                                </Form>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={onSave}>Save changes</Button>
                </Modal.Footer>
            </Modal>
        )
    }

export default LocationDialog