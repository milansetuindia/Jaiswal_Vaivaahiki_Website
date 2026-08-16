import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function ManageBiodata() {
  const [biodatas, setBiodatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const result = await response.json();

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
            "Failed to delete biodata"
        );
      }

      alert(
        "Biodata deleted successfully."
      );

      // Refresh the list
      fetchBiodatas();
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
  // FORMAT ADDED DATE
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

        {error && (
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
            BIODATA TABLE
        ================================================== */}

        {!loading &&
          !error &&
          biodatas.length > 0 && (

            <div className="admin-table-wrapper">

              <div className="admin-table">

                {/* ==================================================
                    TABLE HEADER
                ================================================== */}

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


                {/* ==================================================
                    BIODATA ROWS
                ================================================== */}

                {biodatas.map(
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

                      <span className="admin-added-date">
                        {formatAddedDate(
                          biodata.createdAt
                        )}
                      </span>


                      {/* ACTIONS */}

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
          )}

      </div>

    </div>
  );
}

export default ManageBiodata;
