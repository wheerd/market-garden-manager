import React, { lazy } from "react"
import { NavLink, Route, Routes } from "react-router-dom"
import Nav from "react-bootstrap/Nav"

const Location = lazy(() => import("./location"))
import "./index.css"

const Setup: React.FC = () =>
    <div>
        <Nav variant="tabs" className="justify-content-center">
            <Nav.Item>
                <Nav.Link as={NavLink} to="location">Location</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#beds">Beds</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#crops">Crops</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#plan">Target Plan</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#csa">CSA</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#tasks">Tasks</Nav.Link>
            </Nav.Item>
        </Nav>

        <div className="content-wrapper">
            <Routes>
                <Route path="location" element={<Location />} />
            </Routes>
        </div>
    </div>

export default Setup