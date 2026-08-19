import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LatestProfiles.css";

const API_URL = import.meta.env.VITE_API_URL;

const getFileUrl = (filePath) => {
  if (!filePath) {
    return "";
  }

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  return `${API_URL}${filePath}`;
};

function LatestProfiles() {
  const [biodatas, setBiodatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
            result.message || "Failed to fetch biodata"
          );
        }

        setBiodatas(result.biodatas || []);
      } catch (error) {
        console.error(
          "Error fetching biodatas:",
          error
        );

        setError(
          "Unable to load biodata. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBiodatas();
  }, []);

  return (
    <section className="latest-profiles">

      <h2>Recently Added Biodata</h2>

      {loading && (
        <p className="loading-message">
          Loading biodata...
        </p>
      )}

      {!loading && error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        biodatas.length === 0 && (
          <p className="empty-message">
            No biodata profiles have been added yet.
          </p>
        )}

      {!loading &&
        !error &&
        biodatas.length > 0 && (
          <div className="profile-grid">

            {biodatas.map((person) => (

              <div
                className="profile-card"
                key={person._id}
              >

                <div className="profile-image">

                  <img
                    src={getFileUrl(person.photo)}
                    alt={person.name}
                  />

                  <span className="badge">
                    {person.gender === "Female"
                      ? "Bride"
                      : "Groom"}
                  </span>

                </div>

                <div className="profile-content">

                  <h3>{person.name}</h3>

                  <div className="profile-info">

                    <p>
                      🎂 <strong>Age:</strong>{" "}
                      {person.age} Years
                    </p>

                    <p>
                      🎓 <strong>Education:</strong>{" "}
                      {person.education || "Not specified"}
                    </p>

                    <p>
                      💼 <strong>Occupation:</strong>{" "}
                      {person.occupation || "Not specified"}
                    </p>

                    <p>
                      📍 <strong>City:</strong>{" "}
                      {person.city || "Not specified"}
                    </p>

                  </div>

                  <Link
                    to={`/biodata/${person._id}`}
                    className="view-btn"
                  >
                    View Biodata
                  </Link>

                </div>

              </div>

            ))}

          </div>
        )}

    </section>
  );
}

export default LatestProfiles;