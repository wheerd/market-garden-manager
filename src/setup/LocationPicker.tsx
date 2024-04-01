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

import { useAsyncState } from "../lib/useAsyncState";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

interface LocationData {
    longitude: number,
    latitude: number,
    zoom: number,
    bearing: number,
}

interface LocationDialogParams {
    initialLocation: LocationData,
    onPickLocation: (l: LocationData, imageString: string, totalSizeInMeters: number) => void,
    isOpen: boolean,
    onHide: () => void,
}

const convertBlobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
});

const LocationDialog: React.FC<LocationDialogParams> =
    ({ initialLocation, onPickLocation, isOpen, onHide }) => {
        const [open, setOpen] = useState(isOpen);
        const [viewState, setViewState] = useState(initialLocation);
        useEffect(() => { setViewState(initialLocation); }, [initialLocation]);
        useEffect(() => { setOpen(isOpen); }, [isOpen]);

        const geocoderRef = useRef<MapboxGeocoder | null>();
        function onMapLoad(e: MapboxEvent): void {
            const map = e.target;

            if (!geocoderRef.current) {
                geocoderRef.current = new MapboxGeocoder({
                    accessToken: MAPBOX_ACCESS_TOKEN || "",
                    mapboxgl: mapboxgl
                });
            }
            if (!map.hasControl(geocoderRef.current)) {
                map.addControl(geocoderRef.current);
            }
        }

        async function onSave() {
            const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${viewState.longitude.toFixed(6)},${viewState.latitude.toFixed(6)},${viewState.zoom.toFixed(1)},${viewState.bearing.toFixed(0)},0/800x800?access_token=${MAPBOX_ACCESS_TOKEN}`)
            const base64 = await convertBlobToBase64(await response.blob())

            const metersPerPixel = 40007000 * Math.cos(viewState.latitude * Math.PI / 180) / (512 * Math.pow(2, viewState.zoom));
            const totalSizeInMeters = metersPerPixel * 400;

            onPickLocation(viewState, base64, totalSizeInMeters);

            setOpen(false);
            onHide();
        }

        const [isSaving, onSaveClick] = useAsyncState(onSave)

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
                                    mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                                    reuseMaps
                                    {...viewState}
                                    onMove={evt => { updateViewState(evt.viewState); }}
                                    style={{ width: 400, height: 400 }}
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
                    <Button variant="primary" disabled={isSaving} onClick={onSaveClick}>
                        {isSaving ? 'Saving…' : 'Save changes'}
                        </Button>
                </Modal.Footer>
            </Modal>
        )
    }

export default LocationDialog