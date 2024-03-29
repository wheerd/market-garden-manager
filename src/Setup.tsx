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
                    <a href="#">Beds</a>
                </li>
                <li>
                    <a href="#">Crops</a>
                </li>
                <li>
                    <a href="#">Target Plan</a>
                </li>
                <li>
                    <a href="#">CSA</a>
                </li>
                <li>
                    <a href="#">Tasks</a>
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