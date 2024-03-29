import React from "react"
import { NavLink, Route, Routes } from "react-router-dom"
import Location from "./setup/Location"
import "./Setup.css"

const Setup: React.FC = () =>
    <div>
        <nav className="tabs">
            <ul>
                <li>
                    <NavLink to="location">Location</NavLink>
                </li>
                <li>
                    <a href="#beds">Beds</a>
                </li>
                <li>
                    <a href="#crops">Crops</a>
                </li>
                <li>
                    <a href="#plan">Target Plan</a>
                </li>
                <li>
                    <a href="#csa">CSA</a>
                </li>
                <li>
                    <a href="#tasks">Tasks</a>
                </li>
            </ul>
        </nav>

        <div className="content-wrapper">
            <Routes>
                <Route path="location" element={<Location />} />
            </Routes>
        </div>
    </div>

export default Setup