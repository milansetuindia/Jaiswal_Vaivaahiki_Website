// src/pages/Search/index.jsx

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Search.css";

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

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [biodatas, setBiodatas] = useState([]);
  const [filteredBiodatas, setFilteredBiodatas] = useState([]);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [incomeFrom, setIncomeFrom] = useState("");
  const [incomeTo, setIncomeTo] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [manglikStatus, setManglikStatus] = useState("");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [caste, setCaste] = useState("");
  const [subCaste, setSubCaste] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // READ FILTERS FROM URL
  // ======================================================

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setGender(searchParams.get("gender") || "");
    setAgeFrom(searchParams.get("ageFrom") || "");
    setAgeTo(searchParams.get("ageTo") || "");
    setIncomeFrom(searchParams.get("incomeFrom") || "");
    setIncomeTo(searchParams.get("incomeTo") || "");
    setMaritalStatus(
      searchParams.get("maritalStatus") || ""
    );
    setManglikStatus(
      searchParams.get("manglikStatus") || ""
    );
    setEducation(searchParams.get("education") || "");
    setOccupation(searchParams.get("occupation") || "");
    setCaste(searchParams.get("caste") || "");
    setSubCaste(searchParams.get("subCaste") || "");
    setState(searchParams.get("state") || "");
    setCity(searchParams.get("city") || "");
  }, [searchParams]);

  // ======================================================
  // FETCH BIODATA
  // ======================================================

  useEffect(() => {
    const fetchBiodatas = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/biodatas`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch biodata"
          );
        }

        const data = await response.json();

        if (data.success) {
          setBiodatas(
            data.biodatas || []
          );
        } else {
          throw new Error(
            data.message ||
              "Failed to fetch biodata"
          );
        }
      } catch (err) {
        console.error(
          "Search fetch error:",
          err
        );

        setError(
          "Unable to load biodata."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBiodatas();
  }, []);

  // ======================================================
  // FILTER BIODATA
  // ======================================================

  useEffect(() => {
    const searchText =
      search.trim().toLowerCase();

    const educationText =
      education.trim().toLowerCase();

    const occupationText =
      occupation.trim().toLowerCase();

    const casteText =
      caste.trim().toLowerCase();

    const subCasteText =
      subCaste.trim().toLowerCase();

    const stateText =
      state.trim().toLowerCase();

    const cityText =
      city.trim().toLowerCase();

    const minimumAge = ageFrom
      ? Number(ageFrom)
      : null;

    const maximumAge = ageTo
      ? Number(ageTo)
      : null;

    const minimumIncome = incomeFrom
      ? Number(incomeFrom)
      : null;

    const maximumIncome = incomeTo
      ? Number(incomeTo)
      : null;

    const results = biodatas.filter(
      (person) => {

        // Search by name, education or occupation
        const matchesSearch =
          !searchText ||
          person.name
            ?.toLowerCase()
            .includes(searchText) ||
          person.education
            ?.toLowerCase()
            .includes(searchText) ||
          person.occupation
            ?.toLowerCase()
            .includes(searchText);

        // Gender
        const matchesGender =
          !gender ||
          person.gender?.toLowerCase() ===
            gender.toLowerCase();

        // Minimum age
        const matchesAgeFrom =
          minimumAge === null ||
          Number(person.age) >= minimumAge;

        // Maximum age
        const matchesAgeTo =
          maximumAge === null ||
          Number(person.age) <= maximumAge;

        // Minimum income
        const matchesIncomeFrom =
          minimumIncome === null ||
          Number(person.income) >=
            minimumIncome;

        // Maximum income
        const matchesIncomeTo =
          maximumIncome === null ||
          Number(person.income) <=
            maximumIncome;

        // Marital status
        const matchesMaritalStatus =
          !maritalStatus ||
          person.maritalStatus
            ?.toLowerCase() ===
            maritalStatus.toLowerCase();

        // Manglik status
        const matchesManglikStatus =
          !manglikStatus ||
          person.manglikStatus
            ?.toLowerCase() ===
            manglikStatus.toLowerCase();

        // Education
        const matchesEducation =
          !educationText ||
          person.education
            ?.toLowerCase()
            .includes(educationText);

        // Occupation
        const matchesOccupation =
          !occupationText ||
          person.occupation
            ?.toLowerCase()
            .includes(occupationText);

        // State
        const matchesState =
          !stateText ||
          person.state
            ?.toLowerCase()
            .includes(stateText);

        // City
        const matchesCity =
          !cityText ||
          person.city
            ?.toLowerCase()
            .includes(cityText);

        // Caste
        const matchesCaste =
          !casteText ||
          person.caste
            ?.toLowerCase() ===
            casteText;

        // Sub-caste
        const matchesSubCaste =
          !subCasteText ||
          person.subCaste
            ?.toLowerCase()
            .includes(subCasteText);

        return (
          matchesSearch &&
          matchesGender &&
          matchesAgeFrom &&
          matchesAgeTo &&
          matchesIncomeFrom &&
          matchesIncomeTo &&
          matchesMaritalStatus &&
          matchesManglikStatus &&
          matchesEducation &&
          matchesOccupation &&
          matchesCaste &&
          matchesSubCaste &&
          matchesState &&
          matchesCity
        );
      }
    );

    setFilteredBiodatas(results);
  }, [
    search,
    gender,
    ageFrom,
    ageTo,
    incomeFrom,
    incomeTo,
    maritalStatus,
    manglikStatus,
    education,
    occupation,
    caste,
    subCaste,
    state,
    city,
    biodatas,
  ]);

  // ======================================================
  // UPDATE URL FILTER
  // ======================================================

  const updateFilter = (
    name,
    value
  ) => {
    const params =
      new URLSearchParams(
        searchParams
      );

    if (value.trim() === "") {
      params.delete(name);
    } else {
      params.set(
        name,
        value
      );
    }

    setSearchParams(params);
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {
    setSearch("");
    setGender("");
    setAgeFrom("");
    setAgeTo("");
    setIncomeFrom("");
    setIncomeTo("");
    setMaritalStatus("");
    setManglikStatus("");
    setEducation("");
    setOccupation("");
    setCaste("");
    setSubCaste("");
    setState("");
    setCity("");

    setSearchParams({});
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="search-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="search-header">

        <h1>
          Search Biodata
        </h1>

        <p>
          Find suitable profiles from
          Jaiswal Vaivaahiki.
        </p>

      </div>


      {/* ==================================================
          SEARCH FILTERS
      ================================================== */}

      <div className="search-filters">

        {/* ==================================================
            SEARCH CARD HEADER
        ================================================== */}

        <div className="search-filters-header">

          <div className="filters-title">

            <h2>
              Search Filters
            </h2>

            <p>
              Refine your search to find
              suitable profiles.
            </p>

          </div>


          {/* ==================================================
              BACK TO HOME
          ================================================== */}

          <Link
            to="/"
            className="back-home-btn"
          >
            ← Back to Home
          </Link>

        </div>


        {/* ==================================================
            GENERAL SEARCH
        ================================================== */}

        <div className="search-field">

          <label htmlFor="search">
            Search
          </label>

          <input
            id="search"
            type="text"
            placeholder="Name, education or occupation"
            value={search}
            onChange={(event) => {

              setSearch(
                event.target.value
              );

              updateFilter(
                "search",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            GENDER
        ================================================== */}

        <div className="search-field">

          <label htmlFor="gender">
            Gender
          </label>

          <select
            id="gender"
            value={gender}
            onChange={(event) => {

              setGender(
                event.target.value
              );

              updateFilter(
                "gender",
                event.target.value
              );

            }}
          >

            <option value="">
              All
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

          </select>

        </div>


        {/* ==================================================
            AGE FROM
        ================================================== */}

        <div className="search-field">

          <label htmlFor="ageFrom">
            Age From
          </label>

          <input
            id="ageFrom"
            type="number"
            min="18"
            max="100"
            placeholder="18"
            value={ageFrom}
            onChange={(event) => {

              setAgeFrom(
                event.target.value
              );

              updateFilter(
                "ageFrom",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            AGE TO
        ================================================== */}

        <div className="search-field">

          <label htmlFor="ageTo">
            Age To
          </label>

          <input
            id="ageTo"
            type="number"
            min="18"
            max="100"
            placeholder="35"
            value={ageTo}
            onChange={(event) => {

              setAgeTo(
                event.target.value
              );

              updateFilter(
                "ageTo",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            ANNUAL INCOME FROM
        ================================================== */}

        <div className="search-field">

          <label htmlFor="incomeFrom">
            Annual Income From (₹ Lakh)
          </label>

          <input
            id="incomeFrom"
            type="number"
            min="0"
            max="1000"
            step="0.1"
            placeholder="e.g. 5"
            value={incomeFrom}
            onChange={(event) => {

              setIncomeFrom(
                event.target.value
              );

              updateFilter(
                "incomeFrom",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            ANNUAL INCOME TO
        ================================================== */}

        <div className="search-field">

          <label htmlFor="incomeTo">
            Annual Income To (₹ Lakh)
          </label>

          <input
            id="incomeTo"
            type="number"
            min="0"
            max="1000"
            step="0.1"
            placeholder="e.g. 20"
            value={incomeTo}
            onChange={(event) => {

              setIncomeTo(
                event.target.value
              );

              updateFilter(
                "incomeTo",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            MARITAL STATUS
        ================================================== */}

        <div className="search-field">

          <label htmlFor="maritalStatus">
            Marital Status
          </label>

          <select
            id="maritalStatus"
            value={maritalStatus}
            onChange={(event) => {

              setMaritalStatus(
                event.target.value
              );

              updateFilter(
                "maritalStatus",
                event.target.value
              );

            }}
          >

            <option value="">
              All
            </option>

            <option value="Never Married">
              Never Married
            </option>

            <option value="Divorced">
              Divorced
            </option>

            <option value="Widowed">
              Widowed
            </option>

          </select>

        </div>


        {/* ==================================================
            MANGLIK STATUS
        ================================================== */}

        <div className="search-field">

          <label htmlFor="manglikStatus">
            Manglik Status
          </label>

          <select
            id="manglikStatus"
            value={manglikStatus}
            onChange={(event) => {

              setManglikStatus(
                event.target.value
              );

              updateFilter(
                "manglikStatus",
                event.target.value
              );

            }}
          >

            <option value="">
              All
            </option>

            <option value="Yes">
              Yes
            </option>

            <option value="No">
              No
            </option>

            <option value="Aanshik">
              Aanshik
            </option>

          </select>

        </div>


        {/* ==================================================
            EDUCATION
        ================================================== */}

        <div className="search-field">

          <label htmlFor="education">
            Education
          </label>

          <input
            id="education"
            type="text"
            placeholder="e.g. B.Tech"
            value={education}
            onChange={(event) => {

              setEducation(
                event.target.value
              );

              updateFilter(
                "education",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            OCCUPATION
        ================================================== */}

        <div className="search-field">

          <label htmlFor="occupation">
            Occupation
          </label>

          <input
            id="occupation"
            type="text"
            placeholder="e.g. Software Engineer"
            value={occupation}
            onChange={(event) => {

              setOccupation(
                event.target.value
              );

              updateFilter(
                "occupation",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            STATE
        ================================================== */}

        <div className="search-field">

          <label htmlFor="state">
            State
          </label>

          <input
            id="state"
            type="text"
            placeholder="e.g. Bihar"
            value={state}
            onChange={(event) => {

              setState(
                event.target.value
              );

              updateFilter(
                "state",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            CITY
        ================================================== */}

        <div className="search-field">

          <label htmlFor="city">
            City
          </label>

          <input
            id="city"
            type="text"
            placeholder="e.g. Patna"
            value={city}
            onChange={(event) => {

              setCity(
                event.target.value
              );

              updateFilter(
                "city",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            CASTE
        ================================================== */}

        <div className="search-field">

          <label htmlFor="caste">
            Caste
          </label>

          <select
            id="caste"
            value={caste}
            onChange={(event) => {

              setCaste(
                event.target.value
              );

              updateFilter(
                "caste",
                event.target.value
              );

            }}
          >

            <option value="">
              All
            </option>

            <option value="Kalar">
              Kalar
            </option>

            <option value="Kalwar">
              Kalwar
            </option>

            <option value="Kalal">
              Kalal
            </option>

          </select>

        </div>


        {/* ==================================================
            SUB-CASTE
        ================================================== */}

        <div className="search-field">

          <label htmlFor="subCaste">
            Sub-caste
          </label>

          <input
            id="subCaste"
            type="text"
            placeholder="Enter sub-caste"
            value={subCaste}
            onChange={(event) => {

              setSubCaste(
                event.target.value
              );

              updateFilter(
                "subCaste",
                event.target.value
              );

            }}
          />

        </div>


        {/* ==================================================
            CLEAR FILTERS
        ================================================== */}

        <button
          type="button"
          className="clear-filter-btn"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>


      {/* ==================================================
          RESULTS
      ================================================== */}

      <div className="search-results">

        <div className="results-heading">

          <h2>
            Biodata Profiles
          </h2>

          <span>
            {filteredBiodatas.length} profile
            {filteredBiodatas.length !== 1
              ? "s"
              : ""}
          </span>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="search-message">
            Loading biodata...
          </div>
        )}


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && !loading && (
          <div className="search-message error">
            {error}
          </div>
        )}


        {/* ==================================================
            NO RESULTS
        ================================================== */}

        {!loading &&
          !error &&
          filteredBiodatas.length === 0 && (
            <div className="search-message">
              No biodata found.
            </div>
          )}


        {/* ==================================================
            RESULTS
        ================================================== */}

        {!loading &&
          !error &&
          filteredBiodatas.length > 0 && (

            <div className="search-profile-grid">

              {filteredBiodatas.map(
                (person) => (

                  <div
                    className="search-profile-card"
                    key={person._id}
                  >

                    {/* PROFILE IMAGE */}

                    <div className="search-profile-image">

                      {person.photo ? (

                        <img
                          src={getFileUrl(
                            person.photo
                          )}
                          alt={person.name}
                        />

                      ) : (

                        <div className="no-photo">
                          No Photo
                        </div>

                      )}

                      <span className="search-badge">

                        {person.gender ===
                        "Female"
                          ? "Bride"
                          : "Groom"}

                      </span>

                    </div>


                    {/* PROFILE CONTENT */}

                    <div className="search-profile-content">

                      <h3>
                        {person.name}
                      </h3>

                      <p>
                        🎂 <strong>Age:</strong>{" "}
                        {person.age} Years
                      </p>

                      <p>
                        🎓 <strong>Education:</strong>{" "}
                        {person.education ||
                          "Not specified"}
                      </p>

                      <p>
                        💼 <strong>Occupation:</strong>{" "}
                        {person.occupation ||
                          "Not specified"}
                      </p>

                      <p>
                        📍 <strong>City:</strong>{" "}
                        {person.city ||
                          "Not specified"}
                      </p>

                      <p>
                        🧬 <strong>Caste:</strong>{" "}
                        {person.caste ||
                          "Not specified"}
                      </p>

                      <p>
                        🔹 <strong>Sub-caste:</strong>{" "}
                        {person.subCaste ||
                          "Not specified"}
                      </p>

                      <p>
                        📅 <strong>Added:</strong>{" "}

                        {person.createdAt
                          ? new Date(
                              person.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Date not available"}

                      </p>


                      {/* VIEW BIODATA */}

                      <Link
                        to={`/biodata/${person._id}`}
                        className="search-view-btn"
                      >
                        View Biodata
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </div>

    </div>
  );
}

export default Search;
