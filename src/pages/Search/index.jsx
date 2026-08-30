// src/pages/Search/index.jsx

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./Search.css";


const API_URL = import.meta.env.VITE_API_URL;


// ======================================================
// PROFILES PER PAGE
// ======================================================

const PROFILES_PER_PAGE = 30;


// ======================================================
// GET FILE URL
// ======================================================

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


// ======================================================
// COMPONENT
// ======================================================

function Search() {

  // ======================================================
  // NAVIGATION
  // ======================================================

  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams, setSearchParams] =
    useSearchParams();


  // ======================================================
  // REFS
  // ======================================================

  const searchResultsRef = useRef(null);

  const isRestoringRef = useRef(false);

  const hasRestoredRef = useRef(false);


  // ======================================================
  // PAGINATION STATE
  // ======================================================

  const [currentPage, setCurrentPage] =
    useState(
      () =>
        Number(
          location.state?.page
        ) || 1
    );


  const [shouldScroll, setShouldScroll] =
    useState(false);


  // ======================================================
  // BIODATA STATE
  // ======================================================

  const [biodatas, setBiodatas] =
    useState([]);

  const [filteredBiodatas, setFilteredBiodatas] =
    useState([]);


  // ======================================================
  // FILTER STATES
  // ======================================================

  const [search, setSearch] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [ageFrom, setAgeFrom] =
    useState("");

  const [ageTo, setAgeTo] =
    useState("");

  const [diet, setDiet] =
    useState("");

  const [incomeFrom, setIncomeFrom] =
    useState("");

  const [incomeTo, setIncomeTo] =
    useState("");

  const [maritalStatus, setMaritalStatus] =
    useState("");

  const [manglikStatus, setManglikStatus] =
    useState("");

  const [education, setEducation] =
    useState("");

  const [occupation, setOccupation] =
    useState("");

  const [caste, setCaste] =
    useState("");

  const [subCaste, setSubCaste] =
    useState("");

  const [state, setState] =
    useState("");

  const [city, setCity] =
    useState("");


  // ======================================================
  // LOADING / ERROR
  // ======================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ======================================================
  // READ FILTERS FROM URL
  // ======================================================

  useEffect(() => {

    setSearch(
      searchParams.get("search") || ""
    );

    setGender(
      searchParams.get("gender") || ""
    );

    setAgeFrom(
      searchParams.get("ageFrom") || ""
    );

    setAgeTo(
      searchParams.get("ageTo") || ""
    );

    setDiet(
      searchParams.get("diet") || ""
    );

    setIncomeFrom(
      searchParams.get("incomeFrom") || ""
    );

    setIncomeTo(
      searchParams.get("incomeTo") || ""
    );

    setMaritalStatus(
      searchParams.get("maritalStatus") || ""
    );

    setManglikStatus(
      searchParams.get("manglikStatus") || ""
    );

    setEducation(
      searchParams.get("education") || ""
    );

    setOccupation(
      searchParams.get("occupation") || ""
    );

    setCaste(
      searchParams.get("caste") || ""
    );

    setSubCaste(
      searchParams.get("subCaste") || ""
    );

    setState(
      searchParams.get("state") || ""
    );

    setCity(
      searchParams.get("city") || ""
    );

  }, [searchParams]);


  // ======================================================
  // FETCH BIODATAS
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


        const data =
          await response.json();


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


    const minimumAge =
      ageFrom
        ? Number(ageFrom)
        : null;


    const maximumAge =
      ageTo
        ? Number(ageTo)
        : null;


    const minimumIncome =
      incomeFrom
        ? Number(incomeFrom)
        : null;


    const maximumIncome =
      incomeTo
        ? Number(incomeTo)
        : null;


    const results =
      biodatas.filter(
        (person) => {

          // SEARCH

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


          // GENDER

          const matchesGender =
            !gender ||
            person.gender?.toLowerCase() ===
              gender.toLowerCase();


          // DIET

          const matchesDiet =
            !diet ||
            person.diet?.toLowerCase() ===
              diet.toLowerCase();


          // AGE FROM

          const matchesAgeFrom =
            minimumAge === null ||
            Number(person.age) >= minimumAge;


          // AGE TO

          const matchesAgeTo =
            maximumAge === null ||
            Number(person.age) <= maximumAge;


          // INCOME FROM

          const matchesIncomeFrom =
            minimumIncome === null ||
            Number(person.income) >=
              minimumIncome;


          // INCOME TO

          const matchesIncomeTo =
            maximumIncome === null ||
            Number(person.income) <=
              maximumIncome;


          // MARITAL STATUS

          const matchesMaritalStatus =
            !maritalStatus ||
            person.maritalStatus
              ?.toLowerCase() ===
              maritalStatus.toLowerCase();


          // MANGLIK STATUS

          const matchesManglikStatus =
            !manglikStatus ||
            person.manglikStatus
              ?.toLowerCase() ===
              manglikStatus.toLowerCase();


          // EDUCATION

          const matchesEducation =
            !educationText ||
            person.education
              ?.toLowerCase()
              .includes(educationText);


          // OCCUPATION

          const matchesOccupation =
            !occupationText ||
            person.occupation
              ?.toLowerCase()
              .includes(occupationText);


          // CASTE

          const matchesCaste =
            !casteText ||
            person.caste
              ?.toLowerCase() ===
              casteText;


          // SUB CASTE

          const matchesSubCaste =
            !subCasteText ||
            person.subCaste
              ?.toLowerCase()
              .includes(subCasteText);


          // STATE

          const matchesState =
            !stateText ||
            person.state
              ?.toLowerCase()
              .includes(stateText);


          // CITY

          const matchesCity =
            !cityText ||
            person.city
              ?.toLowerCase()
              .includes(cityText);


          return (

            matchesSearch &&
            matchesGender &&
            matchesAgeFrom &&
            matchesAgeTo &&
            matchesDiet &&
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


    setFilteredBiodatas(
      results
    );

  }, [

    search,
    gender,
    ageFrom,
    ageTo,
    diet,
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
  // RESTORE PAGE AFTER RETURNING FROM BIODATA
  // ======================================================

  useEffect(() => {

    if (
      !location.state?.restoreSearch
    ) {
      return;
    }


    const savedPage =
      Number(
        location.state.page
      ) || 1;


    isRestoringRef.current =
      true;


    hasRestoredRef.current =
      false;


    setCurrentPage(
      savedPage
    );

  }, [
    location.key,
  ]);


  // ======================================================
  // PAGINATION CALCULATIONS
  // ======================================================

  const totalPages =
    Math.ceil(
      filteredBiodatas.length /
      PROFILES_PER_PAGE
    );


  const startIndex =
    (currentPage - 1) *
    PROFILES_PER_PAGE;


  const visibleBiodatas =
    filteredBiodatas.slice(
      startIndex,
      startIndex +
      PROFILES_PER_PAGE
    );


  // ======================================================
  // VALIDATE CURRENT PAGE
  // ======================================================

  useEffect(() => {

    if (
      loading ||
      filteredBiodatas.length === 0
    ) {
      return;
    }


    if (
      currentPage > totalPages
    ) {

      setCurrentPage(
        totalPages
      );

    }


    if (
      currentPage < 1
    ) {

      setCurrentPage(1);

    }

  }, [
    loading,
    filteredBiodatas.length,
    currentPage,
    totalPages,
  ]);


  // ======================================================
  // RESTORE EXACT SCROLL POSITION
  // AFTER CORRECT PAGE HAS RENDERED
  // ======================================================

  useLayoutEffect(() => {

    if (
      !location.state?.restoreSearch
    ) {
      return;
    }


    if (
      loading ||
      filteredBiodatas.length === 0
    ) {
      return;
    }


    if (
      hasRestoredRef.current
    ) {
      return;
    }


    const savedPage =
      Number(
        location.state.page
      ) || 1;


    const validPage =
      Math.min(
        Math.max(
          savedPage,
          1
        ),
        totalPages
      );


    // Wait until correct pagination page is rendered

    if (
      currentPage !== validPage
    ) {
      return;
    }


    const savedScrollPosition =
      location.state.scrollPosition;


    if (
      typeof savedScrollPosition !==
      "number"
    ) {

      hasRestoredRef.current =
        true;

      isRestoringRef.current =
        false;

      return;

    }


    // Mark as restored before scrolling

    hasRestoredRef.current =
      true;


    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        window.scrollTo({

          top:
            savedScrollPosition,

          left: 0,

          behavior:
            "auto",

        });


        isRestoringRef.current =
          false;

      });

    });

  }, [

    location.key,
    loading,
    filteredBiodatas.length,
    currentPage,
    totalPages,

  ]);


  // ======================================================
  // RESET PAGE WHEN USER CHANGES FILTER
  // ======================================================

  useEffect(() => {

    if (
      isRestoringRef.current
    ) {
      return;
    }


    setCurrentPage(1);

  }, [

    search,
    gender,
    ageFrom,
    ageTo,
    diet,
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

  ]);


  // ======================================================
  // SCROLL TO SEARCH RESULTS AFTER PAGINATION
  // ======================================================

  useEffect(() => {

    if (
      !shouldScroll ||
      !searchResultsRef.current
    ) {
      return;
    }


    const headerOffset =
      80;


    const elementPosition =
      searchResultsRef.current
        .getBoundingClientRect()
        .top;


    const scrollPosition =
      elementPosition +
      window.scrollY -
      headerOffset;


    window.scrollTo({

      top:
        scrollPosition,

      behavior:
        "smooth",

    });


    setShouldScroll(false);

  }, [

    currentPage,
    shouldScroll,

  ]);


  // ======================================================
  // PREVIOUS PAGE
  // ======================================================

  const handlePrevious = () => {

    if (
      currentPage <= 1
    ) {
      return;
    }


    setShouldScroll(true);


    setCurrentPage(
      (previousPage) =>
        previousPage - 1
    );

  };


  // ======================================================
  // NEXT PAGE
  // ======================================================

  const handleNext = () => {

    if (
      currentPage >= totalPages
    ) {
      return;
    }


    setShouldScroll(true);


    setCurrentPage(
      (previousPage) =>
        previousPage + 1
    );

  };


  // ======================================================
  // OPEN BIODATA
  // ======================================================

  const handleViewBiodata = (
    personId
  ) => {

    navigate(
      `/biodata/${personId}`,
      {
        state: {

          // Identify Search as source

          fromSearch:
            true,


          // Save exact Search URL including filters

          returnTo:
            `${location.pathname}${location.search}`,


          // Save current pagination page

          page:
            currentPage,


          // Save exact scroll position

          scrollPosition:
            window.scrollY,


          // Save selected profile

          selectedProfileId:
            personId,

        },
      }
    );

  };


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


    if (
      value.trim() === ""
    ) {

      params.delete(name);

    } else {

      params.set(
        name,
        value
      );

    }


    setSearchParams(
      params
    );

  };


  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {

    setSearch("");
    setGender("");
    setAgeFrom("");
    setAgeTo("");
    setDiet("");
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

    setCurrentPage(1);

    setSearchParams({});

  };


  // ======================================================
  // PAGE
  // ======================================================

  return (

    <div className="search-page">


      {/* HEADER */}

      <div className="search-header">

        <h1>
          Search Biodata
        </h1>

        <p>
          Find suitable profiles from
          Jaiswal Vaivaahiki.
        </p>

      </div>


      {/* SEARCH FILTERS */}

      <div className="search-filters">


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


          <Link
            to="/"
            className="back-home-btn"
          >
            ← Back to Home
          </Link>

        </div>


        {/* SEARCH */}

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


        {/* GENDER */}

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


        {/* AGE FROM */}

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


        {/* AGE TO */}

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


        {/* DIET */}

        <div className="search-field">

          <label htmlFor="diet">
            Diet
          </label>

          <select
            id="diet"
            value={diet}
            onChange={(event) => {

              setDiet(
                event.target.value
              );

              updateFilter(
                "diet",
                event.target.value
              );

            }}
          >

            <option value="">
              All Diet Preferences
            </option>

            <option value="Vegetarian">
              Vegetarian
            </option>

            <option value="Non-Vegetarian">
              Non-Vegetarian
            </option>

          </select>

        </div>


        {/* INCOME FROM */}

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


        {/* INCOME TO */}

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


        {/* MARITAL STATUS */}

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


        {/* MANGLIK STATUS */}

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


        {/* EDUCATION */}

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


        {/* OCCUPATION */}

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


        {/* STATE */}

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


        {/* CITY */}

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


        {/* CASTE */}

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


        {/* SUB-CASTE */}

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


        {/* CLEAR FILTERS */}

        <button
          type="button"
          className="clear-filter-btn"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>


      {/* ==================================================
          SEARCH RESULTS
      ================================================== */}

      <div
        className="search-results-section"
        ref={searchResultsRef}
      >

        <h2>
          Search Results
        </h2>


        {loading && (

          <p className="search-loading-message">
            Loading biodatas...
          </p>

        )}


        {!loading && error && (

          <p className="search-error-message">
            {error}
          </p>

        )}


        {!loading &&
          !error &&
          filteredBiodatas.length === 0 && (

            <p className="no-results-message">
              No biodata profiles found.
            </p>

          )}


        {!loading &&
          !error &&
          filteredBiodatas.length > 0 && (

            <div className="search-results-grid">

              {visibleBiodatas.map(
                (person) => (

                  <div
                    className="search-profile-card"
                    key={person._id}
                    data-profile-id={person._id}
                  >

                    <div className="search-profile-image">

                      <img
                        src={getFileUrl(
                          person.photo
                        )}
                        alt={person.name}
                      />

                      <span className="search-profile-badge">

                        {person.gender === "Female"
                          ? "Bride"
                          : "Groom"}

                      </span>

                    </div>


                    <div className="search-profile-content">

                      <h3>
                        {person.name}
                      </h3>


                      <div className="search-profile-info">

                        <p>
                          🎂 <strong>Age:</strong>{" "}
                          {person.age} Years
                        </p>


                        <p>
                          🎓{" "}

                          <strong>
                            Education:
                          </strong>{" "}

                          {person.education ||
                            "Not specified"}

                        </p>


                        <p>
                          💼{" "}

                          <strong>
                            Occupation:
                          </strong>{" "}

                          {person.occupation ||
                            "Not specified"}

                        </p>


                        <p>
                          📍{" "}

                          <strong>
                            City:
                          </strong>{" "}

                          {person.city ||
                            "Not specified"}

                        </p>

                      </div>


                      {/* VIEW BIODATA */}

                      <button
                        type="button"
                        className="search-view-btn"
                        onClick={() =>
                          handleViewBiodata(
                            person._id
                          )
                        }
                      >
                        View Biodata
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


        {/* PAGINATION */}

        {!loading &&
          !error &&
          filteredBiodatas.length > 0 &&
          totalPages > 1 && (

            <div className="search-pagination-controls">

              <button
                type="button"
                className="search-pagination-btn"
                onClick={handlePrevious}
                disabled={
                  currentPage === 1
                }
              >
                ← Previous
              </button>


              <span className="search-page-indicator">

                Page {currentPage} of{" "}
                {totalPages}

              </span>


              <button
                type="button"
                className="search-pagination-btn"
                onClick={handleNext}
                disabled={
                  currentPage === totalPages
                }
              >
                Next →
              </button>

            </div>

          )}

      </div>

    </div>

  );

}


export default Search;

