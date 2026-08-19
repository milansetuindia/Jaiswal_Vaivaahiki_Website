// src/pages/Admin/index.jsx

import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const navigate = useNavigate();

  const [biodatas, setBiodatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH BIODATA
  // ======================================================

  const fetchBiodatas = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/biodatas`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch biodata."
        );
      }

      setBiodatas(
        result.biodatas || []
      );

    } catch (err) {
      console.error(
        "Fetch biodata error:",
        err
      );

      setError(
        err.message ||
          "Unable to load biodata."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD BIODATA WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    fetchBiodatas();
  }, []);

  // ======================================================
  // STATISTICS
  // ======================================================

  const totalBiodata =
    biodatas.length;

  const totalPhotos =
    biodatas.filter(
      (item) => item.photo
    ).length;

  const totalPDFs =
    biodatas.filter(
      (item) => item.biodataPdf
    ).length;

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    // Remove admin authentication data
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUsername"
    );

    // Redirect to admin login
    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );
  };

  // ======================================================
  // DELETE BIODATA
  // ======================================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this biodata?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/biodatas/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "adminToken"
            )}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete biodata."
        );
      }

      alert(
        "Biodata deleted successfully."
      );

      // Remove deleted biodata
      // immediately from dashboard
      setBiodatas(
        (previous) =>
          previous.filter(
            (item) =>
              item._id !== id
          )
      );

    } catch (err) {
      console.error(
        "Delete biodata error:",
        err
      );

      alert(
        err.message ||
          "Failed to delete biodata."
      );
    }
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="admin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="admin-header">

        <div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Jaiswal Vaivaahiki
          </p>

        </div>

        <button
          className="admin-logout"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>


      {/* ==================================================
          WELCOME
      ================================================== */}

      <div className="admin-welcome">

        <h2>
          Welcome, Admin
        </h2>

        <p>
          Manage biodata profiles, photos
          and biodata documents from this
          dashboard.
        </p>

      </div>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="admin-stats">

        {/* Total Biodata */}

        <div className="admin-stat-card">

          <h3>
            Total Biodata
          </h3>

          <p>
            {loading
              ? "..."
              : totalBiodata}
          </p>

        </div>


        {/* Total Photos */}

        <div className="admin-stat-card">

          <h3>
            Total Photos
          </h3>

          <p>
            {loading
              ? "..."
              : totalPhotos}
          </p>

        </div>


        {/* Total PDFs */}

        <div className="admin-stat-card">

          <h3>
            Total PDFs
          </h3>

          <p>
            {loading
              ? "..."
              : totalPDFs}
          </p>

        </div>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {/* ==================================================
          ADMIN ACTIONS
      ================================================== */}

      <div className="admin-actions">

        {/* Add Biodata */}

        <Link
          to="/admin/biodata/add"
          className="admin-action-card"
        >

          <div className="admin-action-icon">
            +
          </div>

          <h3>
            Add Biodata
          </h3>

          <p>
            Upload one person's profile
            information, one photo and one
            biodata PDF.
          </p>

        </Link>


        {/* Manage Biodata */}

        <Link
          to="/admin/biodata/manage"
          className="admin-action-card"
        >

          <div className="admin-action-icon">
            ☰
          </div>

          <h3>
            Manage Biodata
          </h3>

          <p>
            View, edit or delete existing
            biodata profiles.
          </p>

        </Link>

      </div>


      {/* ==================================================
          RECENTLY ADDED BIODATA
      ================================================== */}

      <div className="admin-recent">

        <h2>
          Recently Added Biodata
        </h2>


        {/* Loading */}

        {loading && (
          <p className="admin-message">
            Loading biodata...
          </p>
        )}


        {/* No Biodata */}

        {!loading &&
          biodatas.length === 0 && (
            <p className="admin-message">
              No biodata has been uploaded
              yet.
            </p>
          )}


        {/* Biodata Table */}

        {!loading &&
          biodatas.length > 0 && (

            <div className="admin-table">

              {/* Table Header */}

              <div className="admin-table-header">

                <span>
                  Name
                </span>

                <span>
                  Age
                </span>

                <span>
                  City
                </span>

                <span>
                  Added On
                </span>

                <span>
                  Action
                </span>

            </div>


              {/* MongoDB Records */}

              {biodatas
                .slice(0, 10)
                .map((biodata) => (

                  <div
                    className="admin-table-row"
                    key={biodata._id}
                  >

                    {/* Name */}

                    <span>
                      {biodata.name ||
                        "Not specified"}
                    </span>


                    {/* Age */}

                    <span>
                      {biodata.age ||
                        "Not specified"}
                    </span>


                    {/* City */}

                    <span>
                      {biodata.city ||
                        "Not specified"}
                    </span>

                    <span>
                      {biodata.createdAt
                        ? new Date(
                            biodata.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Not available"}
                    </span>


                    {/* Actions */}

                    <div className="admin-table-actions">

                      {/* VIEW */}

                      <Link
                        to={`/biodata/${biodata._id}`}
                        className="view-btn"
                      >
                        View
                      </Link>


                      {/* EDIT */}

                      <Link
                        to={`/admin/biodata/edit/${biodata._id}`}
                        className="edit-btn"
                      >
                        Edit
                      </Link>


                      {/* DELETE */}

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            biodata._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

            </div>

          )}

      </div>

    </div>
  );
}

export default Admin;