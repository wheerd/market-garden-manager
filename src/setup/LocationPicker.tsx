import React, { useEffect, useRef, useState } from "react"

import Map, { MapboxEvent } from "react-map-gl"
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface LocationData {
    longitude: number,
    latitude: number,
    zoom: number,
    bearing: number,
}

interface LocationDialogParams {
    initialLocation: LocationData,
    onPickLocation: (l: LocationData) => void,
    isOpen: boolean,
    onHide: () => void,
}

const LocationDialog: React.FC<LocationDialogParams> =
    ({ initialLocation, onPickLocation, isOpen, onHide }) => {
        const [open, setOpen] = useState(isOpen);
        const [viewState, setViewState] = useState(initialLocation);
        useEffect(() => setViewState(initialLocation), [initialLocation]);
        useEffect(() => setOpen(isOpen), [isOpen]);

        const geocoderRef = useRef<MapboxGeocoder | null>();
        function onMapLoad(e: MapboxEvent): void {
            if (!geocoderRef.current) {
                geocoderRef.current = new MapboxGeocoder({
                    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "",
                    mapboxgl: mapboxgl
                });
            }
            if (!e.target.hasControl(geocoderRef.current)) {
                e.target.addControl(geocoderRef.current);
            }
        }

        function onSaveClick() {
            onPickLocation(viewState);
            setOpen(false);
            onHide();
        }

        function handleClose() {
            setViewState(initialLocation);
            setOpen(false);
            onHide();
        }

        function updateViewState(state: Partial<LocationData>) {
            setViewState({
                latitude: +(state.latitude?.toFixed(6) ?? viewState.latitude),
                longitude: +(state.longitude?.toFixed(6) ?? viewState.longitude),
                zoom: +(state.zoom?.toFixed(1) ?? viewState.zoom),
                bearing: +(state.bearing?.toFixed(0) ?? viewState.bearing),
            })
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
                                <Map
                                    onLoad={onMapLoad}
                                    mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                                    reuseMaps
                                    {...viewState}
                                    onMove={evt => updateViewState(evt.viewState)}
                                    style={{ width: 600, height: 400 }}
                                    mapStyle="mapbox://styles/mapbox/satellite-v9"
                                    maxPitch={0}
                                    minPitch={0}
                                /></Col>
                            <Col>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formLatitude">
                                        <Form.Label>Latitude</Form.Label>
                                        <Form.Control type="text" value={viewState.latitude} onChange={(event) => {
                                            updateViewState({ latitude: +(+event.target.value).toFixed(6) })
                                        }} />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formLongitude">
                                        <Form.Label>Longitude</Form.Label>
                                        <Form.Control type="text" value={viewState.longitude} onChange={(event) => {
                                            updateViewState({ longitude: +(+event.target.value).toFixed(6) })
                                        }} />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formZoom">
                                        <Form.Label>Zoom</Form.Label>
                                        <Form.Control type="text" value={viewState.zoom} onChange={(event) => {
                                            updateViewState({ zoom: +(+event.target.value).toFixed(1) })
                                        }} />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formBearing">
                                        <Form.Label>Bearing</Form.Label>
                                        <Form.Control type="text" value={viewState.bearing} onChange={(event) => {
                                            updateViewState({ bearing: +(+event.target.value).toFixed(0) })
                                        }} />
                                    </Form.Group>
                                </Form>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={onSaveClick}>Save changes</Button>
                </Modal.Footer>
            </Modal>
        )
    }

export default LocationDialog