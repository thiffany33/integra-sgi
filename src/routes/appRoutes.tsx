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
import Layout from "../components/layout/layout";
import Representative from "../pages/representative/representative";
import Requirement4 from "../pages/requirement4/requirement4";
import Requirement4_1 from "../pages/requirement4_1/requirement4_1";
import Requirement4_2 from "../pages/requirement4_2/requirement4_2";
import Requirement4_3 from "../pages/requirement4_3/requirement4_3";
import Requirement4_4 from "../pages/requirement4_4/requirement4_4";

function AppRoutes() {
    return (
       <BrowserRouter>
            <Routes>

                <Route element={<Layout />}>

                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/register" element={<Register />} />

                    <Route path="/select-systems" element={<SelectSystems />} />

                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/requirement" element={<Requirement />} />

                    <Route path="/downloads" element={<Downloads />} />

                    <Route path="/contact" element={<Contact />} />

                    <Route path="/representative" element={<Representative />} />

                    <Route 
                        path="/requiriment4"
                        element={<Requirement4 />}
                    />

                    <Route
                        path="/requirement4_1"
                        element={<Requirement4_1 />}
                    />

                    <Route
                        path="/requirement4_2"
                        element={<Requirement4_2 />}
                    />

                    <Route
                        path="/requirement4_3"
                        element={<Requirement4_3 />}
                    />

                    <Route
                        path="/requirement4_4"
                        element={<Requirement4_4 />}
                    />

                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>

            
            
        </BrowserRouter>
    );
}   
export default AppRoutes;