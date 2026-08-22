// src/pages/Admin/ManageBiodata/index.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ITEMS_PER_PAGE = 20;

function ManageBiodata() {
  // ==================================================
  // STATE
  // ==================================================

  const [biodatas, setBiodatas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);


  // ==================================================
  // FETCH BIODATA
  // ==================================================

  const fetchBiodatas = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_URL}/api/biodatas`
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch biodata"
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
          "Unable to load biodata"
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // LOAD BIODATA
  // ==================================================

  useEffect(() => {
    fetchBiodatas();
  }, []);


  // ==================================================
  // SEARCH / FILTER
  // ==================================================

  const filteredBiodatas = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase();


    // If search is empty,
    // show all biodata.

    if (!search) {
      return biodatas;
    }


    return biodatas.filter(
      (biodata) => {

        const searchableText = [

          biodata.name,

          biodata.city,

          biodata.state,

          biodata.education,

          biodata.occupation,

          biodata.caste,

          biodata.subCaste,

          biodata.age,

          biodata.gender,

          biodata.maritalStatus,

        ]
          .filter(
            (value) =>
              value !== undefined &&
              value !== null
          )
          .join(" ")
          .toLowerCase();


        return searchableText.includes(
          search
        );

      }
    );

  }, [
    biodatas,
    searchTerm,
  ]);


  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages =
    Math.ceil(
      filteredBiodatas.length /
        ITEMS_PER_PAGE
    );


  const paginatedBiodatas =
    filteredBiodatas.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,

      currentPage *
        ITEMS_PER_PAGE
    );


  // ==================================================
  // RESET PAGE WHEN SEARCH CHANGES
  // ==================================================

  useEffect(() => {

    setCurrentPage(1);

  }, [searchTerm]);


  // ==================================================
  // PREVENT INVALID PAGE
  //
  // Example:
  // Page 3 has 1 profile.
  // Delete that profile.
  // Now only 2 pages exist.
  // Automatically move back to page 2.
  // ==================================================

  useEffect(() => {

    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {

      setCurrentPage(
        totalPages
      );

    }

  }, [
    currentPage,
    totalPages,
  ]);


  // ==================================================
  // DELETE BIODATA
  // ==================================================

  const handleDelete = async (
    id,
    name
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${name}'s biodata?\n\nThis will permanently delete the biodata, photo and PDF.`
      );


    if (!confirmed) {
      return;
    }


    try {

      const response =
        await fetch(
          `${API_URL}/api/biodatas/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${localStorage.getItem(
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
            "Failed to delete biodata"
        );

      }


      alert(
        "Biodata deleted successfully."
      );


      // Remove the deleted profile
      // immediately from the screen.

      setBiodatas(
        (previous) =>
          previous.filter(
            (item) =>
              item._id !== id
          )
      );

    } catch (err) {

      console.error(
        "Delete error:",
        err
      );

      alert(
        err.message ||
          "Failed to delete biodata."
      );

    }
  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatAddedDate = (
    date
  ) => {

    if (!date) {
      return "Not available";
    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "Not available";

    }


    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ==================================================
  // CLEAR SEARCH
  // ==================================================

  const handleClearSearch = () => {

    setSearchTerm("");

    setCurrentPage(1);

  };


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div className="admin-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="admin-header">

        <div>

          <h1>
            Manage Biodata
          </h1>

          <p>
            Jaiswal Vaivaahiki Admin Panel
          </p>

        </div>


        <Link
          to="/admin"
          className="admin-logout"
        >
          Back to Dashboard
        </Link>

      </div>


      {/* ==================================================
          BIODATA LIST
      ================================================== */}

      <div className="admin-recent">

        <h2>
          All Biodata
        </h2>


        {/* ==================================================
            SEARCH SECTION
        ================================================== */}

        {!loading &&
          !error &&
          biodatas.length > 0 && (

            <div className="manage-search-box">


              {/* SEARCH HEADER */}

              <div className="manage-search-header">

                <div>

                  <h3>
                    Search Biodata
                  </h3>

                  <p>
                    Search by name, city,
                    education, occupation,
                    caste or other details.
                  </p>

                </div>


                <span
                  className="search-result-count"
                >

                  {filteredBiodatas.length}

                  {" "}

                  {filteredBiodatas.length === 1
                    ? "profile"
                    : "profiles"}

                </span>

              </div>


              {/* SEARCH CONTROLS */}

              <div className="manage-search-controls">


                {/* INPUT */}

                <div
                  className="manage-search-input-wrapper"
                >

                  <span
                    className="search-icon"
                    aria-hidden="true"
                  >
                    🔎
                  </span>


                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search by name, city, education, occupation..."
                    className="manage-search-input"
                    aria-label="Search biodata"
                  />


                  {/* X BUTTON */}

                  {searchTerm && (

                    <button
                      type="button"
                      className="search-clear-icon"
                      onClick={
                        handleClearSearch
                      }
                      aria-label="Clear search"
                    >
                      ×
                    </button>

                  )}

                </div>


                {/* CLEAR SEARCH BUTTON */}

                {searchTerm && (

                  <button
                    type="button"
                    className="manage-clear-search-btn"
                    onClick={
                      handleClearSearch
                    }
                  >
                    Clear Search
                  </button>

                )}

              </div>

            </div>

          )}


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <p className="admin-message">
            Loading biodata...
          </p>

        )}


        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading &&
          error && (

            <div className="admin-error">
              {error}
            </div>

          )}


        {/* ==================================================
            NO BIODATA
        ================================================== */}

        {!loading &&
          !error &&
          biodatas.length === 0 && (

            <p className="admin-message">
              No biodata has been uploaded yet.
            </p>

          )}


        {/* ==================================================
            NO SEARCH RESULTS
        ================================================== */}

        {!loading &&
          !error &&
          biodatas.length > 0 &&
          filteredBiodatas.length === 0 && (

            <div
              className="admin-message search-no-results"
            >

              <div className="no-results-icon">
                🔎
              </div>


              <h3>
                No biodata found
              </h3>


              <p>
                No profile matches
                {" "}
                "{searchTerm}".
              </p>


              <button
                type="button"
                className="manage-clear-search-btn"
                onClick={
                  handleClearSearch
                }
              >
                Clear Search
              </button>

            </div>

          )}


        {/* ==================================================
            BIODATA TABLE
        ================================================== */}

        {!loading &&
          !error &&
          paginatedBiodatas.length > 0 && (

            <>

              <div
                className="admin-table-wrapper"
              >

                <div className="admin-table">


                  {/* ==================================================
                      TABLE HEADER
                  ================================================== */}

                  <div
                    className="admin-table-header"
                  >

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


                  {/* ==================================================
                      BIODATA ROWS
                  ================================================== */}

                  {paginatedBiodatas.map(
                    (biodata) => (

                      <div
                        className="admin-table-row"
                        key={
                          biodata._id
                        }
                      >


                        {/* NAME */}

                        <span>
                          {biodata.name ||
                            "Not specified"}
                        </span>


                        {/* AGE */}

                        <span>
                          {biodata.age ||
                            "Not specified"}
                        </span>


                        {/* CITY */}

                        <span>
                          {biodata.city ||
                            "Not specified"}
                        </span>


                        {/* ADDED ON */}

                        <span
                          className="admin-added-date"
                        >
                          {formatAddedDate(
                            biodata.createdAt
                          )}
                        </span>


                        {/* ACTIONS */}

                        <div
                          className="admin-table-actions"
                        >


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
                                biodata._id,
                                biodata.name
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {totalPages > 1 && (

                <div
                  className="manage-pagination"
                >


                  {/* PREVIOUS */}

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page - 1
                      )
                    }
                  >
                    ← Previous
                  </button>


                  {/* PAGE INFO */}

                  <div
                    className="pagination-info"
                  >

                    Page{" "}

                    <strong>
                      {currentPage}
                    </strong>

                    {" "}of{" "}

                    <strong>
                      {totalPages}
                    </strong>

                  </div>


                  {/* NEXT */}

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1
                      )
                    }
                  >
                    Next →
                  </button>

                </div>

              )}

            </>

          )}

      </div>

    </div>

  );
}

export default ManageBiodata;
