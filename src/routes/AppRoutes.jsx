
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
import AdminLogin from "../pages/Admin/login";
import AddBiodata from "../pages/Admin/AddBiodata";
import ManageBiodata from "../pages/Admin/ManageBiodata";
import EditBiodata from "../pages/Admin/EditBiodata";

import UserAddBiodata from "../pages/User/AddBiodata";

import UserForgotPassword from "../pages/User/ForgotPassword";

import ProtectedAdminRoute from "../components/admin/ProtectedAdminRoute";



// ======================================================
// NEW USER PORTAL
// ======================================================

import UserRegister from "../pages/User/Register";
import UserVerifyEmail from "../pages/User/VerifyEmail";
import UserLogin from "../pages/User/Login";
import UserDashboard from "../pages/User/Dashboard";

import ProtectedUserRoute from "../components/user/ProtectedUserRoute";

// ======================================================
// OTHER EXISTING PAGES
// ======================================================

import NotFound from "../pages/NotFound";
import Contact from "../pages/Contact";
import Biodata from "../pages/Biodata";

import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";

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
          path="/privacy"
          element={<Privacy />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        <Route
          path="/biodata/:id"
          element={<Biodata />}
        />

        {/* =========================================
            NEW USER REGISTRATION / LOGIN
        ========================================= */}

        <Route
          path="/user/register"
          element={<UserRegister />}
        />

        <Route
          path="/user/verify-email"
          element={<UserVerifyEmail />}
        />

        <Route
          path="/user/login"
          element={<UserLogin />}
        />

        {/* =========================================
            PROTECTED USER PORTAL
        ========================================= */}

        <Route
          element={<ProtectedUserRoute />}
        >
          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />
          <Route
            path="/user/biodata/add"
            element={<UserAddBiodata />}
          />
        </Route>


        <Route
          path="/user/forgot-password"
          element={<UserForgotPassword />}
        />


        {/* =========================================
            ADMIN LOGIN
        ========================================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =========================================
            PROTECTED ADMIN ROUTES
        ========================================= */}

        <Route
          element={<ProtectedAdminRoute />}
        >
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
            PAGE NOT FOUND
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
