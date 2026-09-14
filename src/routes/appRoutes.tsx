import { lazy, Suspense } from "react";
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

// Requisito 4
const Requirement4 = lazy(
  () => import("../pages/requirement4/requirement4")
);

const Requirement4_1 = lazy(
  () => import("../pages/requirement4_1/requirement4_1")
);

const Requirement4_2 = lazy(
  () => import("../pages/requirement4_2/requirement4_2")
);

const Requirement4_3 = lazy(
  () => import("../pages/requirement4_3/requirement4_3")
);

const Requirement4_4 = lazy(
  () => import("../pages/requirement4_4/requirement4_4")
);

// Requisito 5
const Requirement5 = lazy(
  () => import("../pages/requirement5/requirement5")
);

const Requirement5_1 = lazy(
  () => import("../pages/requirement5_1/requirement5_1")
);

const Requirement5_2 = lazy(
  () => import("../pages/requirement5_2/requirement5_2")
);

const Requirement5_3 = lazy(
  () => import("../pages/requirement5_3/requirement5_3")
);

const Requirement5_4 = lazy(
  () => import("../pages/requirement5_4/requirement5_4")
);

// Requisito 6
const Requirement6 = lazy(
  () => import("../pages/requirement6/requirement6")
);

const Requirement6_1_Quality = lazy(
  () => import("../pages/requirement6_1/requirement6_1_quality/requirement6_1_quality")
);

const Requirement6_1_Environment = lazy(
  () =>
    import(
      "../pages/requirement6_1/requirement6_1_environment/requirement6_1_environment"
    )
);

const Requirement6_1_Sst = lazy(
  () => import("../pages/requirement6_1/requirement6_1_sst/requirement6_1_sst")
);

const Requirement6_2 = lazy(
  () => import("../pages/requirement6_2/requirement6_2")
);

// Requisito 7
const Requirement7 = lazy(
  () => import("../pages/requirement7/requirement7")
);

const Requirement7_1 = lazy(
  () => import("../pages/requirement7_1/requirement7_1")
);

const Requirement7_2 = lazy(
  () => import("../pages/requirement7_2/requirement7_2")
);

const Requirement7_3 = lazy(
  () => import("../pages/requirement7_3/requirement7_3")
);

const Requirement7_4 = lazy(
  () => import("../pages/requirement7_4/requirement7_4")
);

const Requirement7_5 = lazy(
  () => import("../pages/requirement7_5/requirement7_5")
);

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>A carregar...</div>}>
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

            {/* Requisito 4 */}
            <Route path="/requirement4" element={<Requirement4 />} />
            <Route path="/requirement4_1" element={<Requirement4_1 />} />
            <Route path="/requirement4_2" element={<Requirement4_2 />} />
            <Route path="/requirement4_3" element={<Requirement4_3 />} />
            <Route path="/requirement4_4" element={<Requirement4_4 />} />

            {/* Requisito 5 */}
            <Route path="/requirement5" element={<Requirement5 />} />
            <Route path="/requirement5_1" element={<Requirement5_1 />} />
            <Route path="/requirement5_2" element={<Requirement5_2 />} />
            <Route path="/requirement5_3" element={<Requirement5_3 />} />
            <Route path="/requirement5_4" element={<Requirement5_4 />} />

            {/* Requisito 6 */}
            <Route path="/requirement6" element={<Requirement6 />} />

            <Route
              path="/requirement6_1_quality"
              element={<Requirement6_1_Quality />}
            />

            <Route
              path="/requirement6_1_environment"
              element={<Requirement6_1_Environment />}
            />

            <Route
              path="/requirement6_1_sst"
              element={<Requirement6_1_Sst />}
            />

            <Route
              path="/requirement6_2"
              element={<Requirement6_2 />}
            />

            {/* Requisito 7 */}
            <Route path="/requirement7" element={<Requirement7 />} />
            <Route path="/requirement7_1" element={<Requirement7_1 />} />
            <Route path="/requirement7_2" element={<Requirement7_2 />} />
            <Route path="/requirement7_3" element={<Requirement7_3 />} />
            <Route path="/requirement7_4" element={<Requirement7_4 />} />
            <Route path="/requirement7_5" element={<Requirement7_5 />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;