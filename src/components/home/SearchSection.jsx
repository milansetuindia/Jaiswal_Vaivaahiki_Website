// src/components/home/SearchSection.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchSection.css";

function SearchSection() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    gender: "",
    ageFrom: "",
    ageTo: "",
    incomeFrom: "",
    incomeTo: "",
    maritalStatus: "",
    manglikStatus: "",
    education: "",
    occupation: "",
    state: "",
    city: "",
    caste: "",
    subCaste: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim() !== "") {
        params.set(key, value);
      }
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="search-card">

      <h2>Search Biodata</h2>

      <p>
        Find your perfect life partner using advanced search filters.
      </p>

      <form
        className="search-form"
        onSubmit={handleSubmit}
      >

        {/* ==================================================
            GENDER
        ================================================== */}

        <div className="form-group">
          <label htmlFor="gender">
            Gender
          </label>

          <select
            id="gender"
            name="gender"
            value={filters.gender}
            onChange={handleChange}
          >
            <option value="">
              All
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Male">
              Male
            </option>
          </select>
        </div>


        {/* ==================================================
            AGE FROM
        ================================================== */}

        <div className="form-group">
          <label htmlFor="ageFrom">
            Age From
          </label>

          <input
            id="ageFrom"
            name="ageFrom"
            type="number"
            min="18"
            max="100"
            placeholder="18"
            value={filters.ageFrom}
            onChange={handleChange}
          />
        </div>


        {/* ==================================================
            AGE TO
        ================================================== */}

        <div className="form-group">
          <label htmlFor="ageTo">
            Age To
          </label>

          <input
            id="ageTo"
            name="ageTo"
            type="number"
            min="18"
            max="100"
            placeholder="35"
            value={filters.ageTo}
            onChange={handleChange}
          />
        </div>

        {/* ==================================================
            INCOME FROM
        ================================================== */}

        <div className="form-group">
          <label htmlFor="incomeFrom">
            Annual Income From (₹ Lakh)
          </label>

          <input
            id="incomeFrom"
            name="incomeFrom"
            type="number"
            min="0"
            max="1000"
            step="0.1"
            placeholder="e.g. 5"
            value={filters.incomeFrom}
            onChange={handleChange}
          />
        </div>

        {/* ==================================================
            INCOME TO
        ================================================== */}

        <div className="form-group">
          <label htmlFor="incomeTo">
            Annual Income To (₹ Lakh)
          </label>

          <input
            id="incomeTo"
            name="incomeTo"
            type="number"
            min="0"
            max="1000"
            step="0.1"
            placeholder="e.g. 20"
            value={filters.incomeTo}
            onChange={handleChange}
          />
        </div>


        {/* ==================================================
            MARITAL STATUS
        ================================================== */}

        <div className="form-group">
          <label htmlFor="maritalStatus">
            Marital Status
          </label>

          <select
            id="maritalStatus"
            name="maritalStatus"
            value={filters.maritalStatus}
            onChange={handleChange}
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

        <div className="form-group">
          <label htmlFor="manglikStatus">
            Manglik Status
          </label>

          <select
            id="manglikStatus"
            name="manglikStatus"
            value={filters.manglikStatus}
            onChange={handleChange}
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

        <div className="form-group">
          <label htmlFor="education">
            Education
          </label>

          <input
            id="education"
            name="education"
            type="text"
            placeholder="e.g. B.Tech"
            value={filters.education}
            onChange={handleChange}
          />
        </div>


        {/* ==================================================
            OCCUPATION
        ================================================== */}

        <div className="form-group">
          <label htmlFor="occupation">
            Occupation
          </label>

          <input
            id="occupation"
            name="occupation"
            type="text"
            placeholder="e.g. Software Engineer"
            value={filters.occupation}
            onChange={handleChange}
          />
        </div>


        {/* ==================================================
            STATE
        ================================================== */}

        <div className="form-group">
          <label htmlFor="state">
            State
          </label>

          <input
            id="state"
            name="state"
            type="text"
            placeholder="e.g. Bihar"
            value={filters.state}
            onChange={handleChange}
          />
        </div>


        {/* ==================================================
            CITY
        ================================================== */}

        <div className="form-group">
          <label htmlFor="city">
            City
          </label>

          <input
            id="city"
            name="city"
            type="text"
            placeholder="e.g. Patna"
            value={filters.city}
            onChange={handleChange}
          />
        </div>


        {/* ==================================================
            CASTE
        ================================================== */}

        <div className="form-group">
          <label htmlFor="caste">
            Caste
          </label>

          <select
            id="caste"
            name="caste"
            value={filters.caste}
            onChange={handleChange}
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

        <div className="form-group">
          <label htmlFor="subCaste">
            Sub-caste
          </label>

          <input
            id="subCaste"
            name="subCaste"
            type="text"
            placeholder="Enter sub-caste"
            value={filters.subCaste}
            onChange={handleChange}
          />
        </div>


        {/* ==================================================
            SEARCH BUTTON
        ================================================== */}

        <button
          type="submit"
          className="search-btn"
        >
          Search Biodata
        </button>

      </form>

    </div>
  );
}

export default SearchSection;
