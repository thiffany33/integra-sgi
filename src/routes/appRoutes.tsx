import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "../pages/home/home";
import Login from "../pages/login/login";
import Register from "../pages/register/register";
import SelectSystems from "../pages/selectSystems/selectSystems";
import Dashboard from "../pages/dashboard/dashboard";
import Requirement from "../pages/requirement/requirement";
import Downloads from "../pages/downloads/downloads";
import Contact from "../pages/contact/contact";
import NotFound from "../pages/notFound/notFound";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/select-systems" element={<SelectSystems />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/requirement" element={<Requirement />} />

                <Route path="/downloads" element={<Downloads />} />

                <Route path="/contact" element={<Contact />} />

                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;