// src/routes/AppRoutes.jsx

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Gallery from "../pages/Gallery";
import Search from "../pages/Search";

import Admin from "../pages/Admin";
import AdminLogin from "../pages/Admin/Login";
import AddBiodata from "../pages/Admin/AddBiodata";
import ManageBiodata from "../pages/Admin/ManageBiodata";
import EditBiodata from "../pages/Admin/EditBiodata";

import ProtectedAdminRoute from "../components/admin/ProtectedAdminRoute";

import NotFound from "../pages/NotFound";
import Contact from "../pages/Contact";
import Biodata from "../pages/Biodata";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================
            PUBLIC ROUTES
        ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/gallery"
          element={<Gallery />}
        />

        <Route
          path="/search"
          element={<Search />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/biodata/:id"
          element={<Biodata />}
        />


        {/* =========================================
            ADMIN LOGIN
            This page remains public.
        ========================================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =========================================
            PROTECTED ADMIN ROUTES
        ========================================= */}

        <Route element={<ProtectedAdminRoute />}>

          <Route
            path="/admin"
            element={<Admin />}
          />

          <Route
            path="/admin/biodata/add"
            element={<AddBiodata />}
          />

          <Route
            path="/admin/biodata/manage"
            element={<ManageBiodata />}
          />

          <Route
            path="/admin/biodata/edit/:id"
            element={<EditBiodata />}
          />

        </Route>


        {/* =========================================
            404
        ========================================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;