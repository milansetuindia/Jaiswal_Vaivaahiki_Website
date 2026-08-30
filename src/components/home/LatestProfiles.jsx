// src/components/home/LatestProfiles.jsx

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./LatestProfiles.css";


const API_URL =
  import.meta.env.VITE_API_URL;


// ======================================================
// PROFILES PER PAGE
// ======================================================

const PROFILES_PER_PAGE = 9;


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

function LatestProfiles() {


  // ======================================================
  // NAVIGATION
  // ======================================================

  const navigate =
    useNavigate();

  const location =
    useLocation();


  // ======================================================
  // REFS
  // ======================================================

  const latestProfilesRef =
    useRef(null);

  const isRestoringRef =
    useRef(false);

  const hasRestoredRef =
    useRef(false);


  // ======================================================
  // DISABLE BROWSER AUTOMATIC SCROLL RESTORATION
  // ======================================================

  useEffect(() => {

    if (
      "scrollRestoration" in history
    ) {

      history.scrollRestoration =
        "manual";

    }


    return () => {

      if (
        "scrollRestoration" in history
      ) {

        history.scrollRestoration =
          "auto";

      }

    };

  }, []);


  // ======================================================
  // STATE
  // ======================================================

  const [biodatas, setBiodatas] =
    useState([]);


  const [currentPage, setCurrentPage] =
    useState(
      () =>
        Number(
          location.state?.page
        ) || 1
    );


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [shouldScroll, setShouldScroll] =
    useState(false);


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


  // ======================================================
  // RESTORE PAGE AFTER RETURNING FROM BIODATA
  // ======================================================

  useEffect(() => {

    if (
      !location.state?.restoreHome
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
    location.state,
  ]);


  // ======================================================
  // RESET PAGE WHEN NORMAL HOME LOADS
  // ======================================================

  useEffect(() => {

    if (
      !isRestoringRef.current
    ) {
      return;
    }

    /*
     * Keep the restored page.
     *
     * This effect exists only to clearly separate
     * restoration flow from normal pagination flow.
     */

  }, [
    currentPage,
  ]);


  // ======================================================
  // PAGINATION CALCULATIONS
  // ======================================================

  const totalPages =
    Math.ceil(
      biodatas.length /
      PROFILES_PER_PAGE
    );


  const startIndex =
    (currentPage - 1) *
    PROFILES_PER_PAGE;


  const visibleBiodatas =
    biodatas.slice(
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
      biodatas.length === 0
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
    biodatas.length,
    currentPage,
    totalPages,
  ]);


  // ======================================================
  // RESTORE EXACT SCROLL POSITION
  // AFTER CORRECT PAGE HAS RENDERED
  // ======================================================

  useLayoutEffect(() => {

    if (
      !location.state?.restoreHome
    ) {
      return;
    }


    if (
      loading ||
      biodatas.length === 0
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


    // Mark restored before scrolling

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
    location.state,
    loading,
    biodatas.length,
    currentPage,
    totalPages,

  ]);


  // ======================================================
  // SCROLL TO LATEST PROFILES
  // ONLY WHEN NEXT / PREVIOUS IS CLICKED
  // ======================================================

  useEffect(() => {

    if (!shouldScroll) {
      return;
    }


    if (
      biodatas.length === 0 ||
      !latestProfilesRef.current
    ) {
      return;
    }


    requestAnimationFrame(() => {

      const headerOffset = 80;


      const elementPosition =
        latestProfilesRef.current
          .getBoundingClientRect()
          .top;


      const offsetPosition =
        elementPosition +
        window.scrollY -
        headerOffset;


      window.scrollTo({

        top:
          offsetPosition,

        behavior:
          "smooth",

      });


      setShouldScroll(false);

    });

  }, [
    currentPage,
    biodatas.length,
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
  // SAVE HOME PAGE STATE
  // ======================================================

  const handleViewBiodata = (
    personId
  ) => {

    navigate(
      `/biodata/${personId}`,
      {
        state: {

          // Identify Home as source
          fromHome: true,


          // Save current pagination page
          page:
            currentPage,


          // Save exact browser scroll position
          scrollPosition:
            window.scrollY,


          // Save selected profile ID
          selectedProfileId:
            personId,

        },
      }
    );

  };


  // ======================================================
  // PAGE
  // ======================================================

  return (

    <section
      className="latest-profiles"
      ref={latestProfilesRef}
    >

      <h2>
        Recently Added Biodata
      </h2>


      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (

        <p className="loading-message">
          Loading biodata...
        </p>

      )}


      {/* ==================================================
          ERROR
      ================================================== */}

      {!loading && error && (

        <p className="error-message">
          {error}
        </p>

      )}


      {/* ==================================================
          EMPTY
      ================================================== */}

      {!loading &&
        !error &&
        biodatas.length === 0 && (

          <p className="empty-message">
            No biodata profiles have been added yet.
          </p>

        )}


      {/* ==================================================
          BIODATA PROFILES
      ================================================== */}

      {!loading &&
        !error &&
        biodatas.length > 0 && (

          <>

            <div className="profile-grid">

              {visibleBiodatas.map(
                (person) => (

                  <div
                    className="profile-card"
                    key={person._id}
                    data-profile-id={person._id}
                  >

                    <div className="profile-image">

                      <img
                        src={getFileUrl(
                          person.photo
                        )}
                        alt={person.name}
                      />


                      <span className="badge">

                        {person.gender ===
                        "Female"
                          ? "Bride"
                          : "Groom"}

                      </span>

                    </div>


                    <div className="profile-content">

                      <h3>
                        {person.name}
                      </h3>


                      <div className="profile-info">

                        <p>

                          🎂{" "}

                          <strong>
                            Age:
                          </strong>{" "}

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
                        className="view-btn"
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


            {/* ==============================================
                PAGINATION
            ============================================== */}

            {totalPages > 1 && (

              <div className="pagination-controls">


                <button
                  type="button"
                  className="pagination-btn"
                  onClick={handlePrevious}
                  disabled={
                    currentPage === 1
                  }
                >

                  ← Previous

                </button>


                <span className="page-indicator">

                  Page {currentPage} of{" "}
                  {totalPages}

                </span>


                <button
                  type="button"
                  className="pagination-btn"
                  onClick={handleNext}
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >

                  Next →

                </button>


              </div>

            )}

          </>

        )}

    </section>

  );

}


export default LatestProfiles;
