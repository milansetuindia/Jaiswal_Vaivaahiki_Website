
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  userFetch,
} from "../../utils/userApi";

import "./UserPortal.css";

const initialForm = {
  name: "",
  age: "",
  gender: "",
  diet: "",
  income: "",

  heightFeet: "",
  heightInches: "",

  contactNumber: "",
  maritalStatus: "",
  manglikStatus: "",
  caste: "",
  subCaste: "",

  city: "",
  state: "",
  education: "",
  occupation: "",
};

function AddBiodata() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [photo, setPhoto] =
    useState(null);

  const [pdf, setPdf] =
    useState(null);

  const [consent, setConsent] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [error, setError] =
    useState("");

  const [alreadySubmitted, setAlreadySubmitted] =
    useState(false);

  // ====================================================
  // CHECK IF USER ALREADY HAS A BIODATA
  // ====================================================

  useEffect(() => {
    let active = true;

    async function checkExisting() {
      try {
        const response = await userFetch(
          "/api/user-biodata/me"
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        if (active) {
          setAlreadySubmitted(
            Boolean(result.biodata)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
            "Unable to check biodata status."
          );
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    checkExisting();

    return () => {
      active = false;
    };
  }, []);

  // ====================================================
  // INPUT CHANGE
  // ====================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ====================================================
  // FILE VALIDATION
  // ====================================================

  function handlePhoto(event) {
    const file = event.target.files?.[0];

    setError("");

    if (!file) {
      setPhoto(null);
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError(
        "Photo must be JPG, PNG or WebP."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Photo must be 10 MB or smaller."
      );
      event.target.value = "";
      return;
    }

    setPhoto(file);
  }

  function handlePdf(event) {
    const file = event.target.files?.[0];

    setError("");

    if (!file) {
      setPdf(null);
      return;
    }

    if (
      file.type !== "application/pdf" ||
      file.size > 10 * 1024 * 1024
    ) {
      setError(
        "Select a PDF of 10 MB or less."
      );
      event.target.value = "";
      return;
    }

    setPdf(file);
  }

  // ====================================================
  // SUBMIT BIODATA
  // ====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!photo || !pdf) {
      setError(
        "Please select one photo and one biodata PDF."
      );
      return;
    }

    if (!consent) {
      setError(
        "Please confirm you have permission to submit this biodata."
      );
      return;
    }

    const confirmed = window.confirm(
      "After submission, you cannot edit or delete this biodata yourself. Only the administrator can make changes. Continue?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const data = new FormData();

      const fields = [
        "name",
        "age",
        "gender",
        "diet",
        "income",
        "contactNumber",
        "maritalStatus",
        "manglikStatus",
        "caste",
        "subCaste",
        "city",
        "state",
        "education",
        "occupation",
      ];

      fields.forEach((field) => {
        data.append(
          field,
          form[field]
        );
      });

      const height =
        form.heightFeet !== "" &&
        form.heightInches !== ""
          ? `${form.heightFeet} ft ${form.heightInches} in`
          : "";

      data.append("height", height);

      data.append(
        "consentToSubmission",
        consent ? "true" : "false"
      );


      // ======================================================
      // UPLOADED FILES
      // ======================================================

      data.append("photo", photo);
      data.append("biodataPdf", pdf);


      // The backend ignores all admin-only
      // visibility settings from the user.
      const response = await userFetch(
        "/api/user-biodata",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Unable to submit biodata."
        );
      }

      alert(
        `Biodata ${result.profileNumber} submitted successfully. Admin approval is pending.`
      );

      navigate("/user/dashboard", {
        replace: true,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="user-portal-loading">
        Checking biodata status...
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <main className="user-portal">
        <div className="user-portal-card">
          <h1>Biodata Already Submitted</h1>

          <p>
            One biodata is allowed per
            account. Contact the admin
            if corrections are required.
          </p>

          <Link to="/user/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="user-portal">
      <div
        className="user-portal-card"
        style={{ maxWidth: "760px" }}
      >
        <Link
          className="user-portal-back"
          to="/user/dashboard"
        >
          ← Back to Dashboard
        </Link>

        <h1>Add Your Biodata</h1>

        <p className="user-portal-intro">
          Your biodata will be published
          only after admin approval.
          Contact number, WhatsApp and PDF
          options remain hidden by default.
        </p>

        <form onSubmit={handleSubmit}>

          <h2>Personal Information</h2>

          <label htmlFor="userName">
            Full Name *
          </label>

          <input
            id="userName"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            required
          />

          <label htmlFor="userAge">
            Age *
          </label>

          <input
            id="userAge"
            type="number"
            name="age"
            min={18}
            max={100}
            value={form.age}
            onChange={handleChange}
            required
          />

          <label htmlFor="userGender">
            Gender *
          </label>

          <select
            id="userGender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Gender
            </option>
            <option value="Male">
              Male
            </option>
            <option value="Female">
              Female
            </option>
          </select>

          <label htmlFor="userDiet">
            Diet
          </label>

          <select
            id="userDiet"
            name="diet"
            value={form.diet}
            onChange={handleChange}
          >
            <option value="">
              Select Diet
            </option>
            <option value="Vegetarian">
              Vegetarian
            </option>
            <option value="Non-Vegetarian">
              Non-Vegetarian
            </option>
            <option value="Not Specified">
              Not Specified
            </option>
          </select>

          <label htmlFor="userIncome">
            Annual Income (₹ Lakh)
          </label>

          <input
            id="userIncome"
            type="number"
            name="income"
            min={0}
            max={1000}
            step="0.1"
            value={form.income}
            onChange={handleChange}
          />

          <label htmlFor="userContact">
            Parent / Guardian Contact Number
          </label>

          <input
            id="userContact"
            name="contactNumber"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="10-digit contact number"
          />

          <label>
            Height (Optional)
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <select
              name="heightFeet"
              value={form.heightFeet}
              onChange={handleChange}
            >
              <option value="">
                Feet
              </option>

              {Array.from(
                { length: 6 },
                (_, index) => index + 3
              ).map((feet) => (
                <option
                  key={feet}
                  value={feet}
                >
                  {feet} ft
                </option>
              ))}
            </select>

            <select
              name="heightInches"
              value={form.heightInches}
              onChange={handleChange}
            >
              <option value="">
                Inches
              </option>

              {Array.from(
                { length: 12 },
                (_, index) => index
              ).map((inches) => (
                <option
                  key={inches}
                  value={inches}
                >
                  {inches} in
                </option>
              ))}
            </select>
          </div>

          <label htmlFor="userMarital">
            Marital Status (Optional)
          </label>

          <select
            id="userMarital"
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
          >
            <option value="">
              Select Marital Status
            </option>
            <option value="Unmarried">
              Unmarried
            </option>
            <option value="Divorced">
              Divorced
            </option>
            <option value="Widowed">
              Widowed
            </option>
            <option value="Not Specified">
              Not Specified
            </option>
          </select>

          <label htmlFor="userManglik">
            Manglik Status *
          </label>

          <select
            id="userManglik"
            name="manglikStatus"
            value={form.manglikStatus}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Manglik Status
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
            <option value="Not Specified">
              Not Specified
            </option>
          </select>

          <label htmlFor="userCaste">
            Caste *
          </label>

          <select
            id="userCaste"
            name="caste"
            value={form.caste}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Caste
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

          <label htmlFor="userSubCaste">
            Sub-caste
          </label>

          <input
            id="userSubCaste"
            name="subCaste"
            value={form.subCaste}
            onChange={handleChange}
            maxLength={100}
          />

          <h2>Location and Profession</h2>

          <label htmlFor="userCity">
            City *
          </label>

          <input
            id="userCity"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />

          <label htmlFor="userState">
            State *
          </label>

          <input
            id="userState"
            name="state"
            value={form.state}
            onChange={handleChange}
            required
          />

          <label htmlFor="userEducation">
            Education *
          </label>

          <input
            id="userEducation"
            name="education"
            value={form.education}
            onChange={handleChange}
            required
          />

          <label htmlFor="userOccupation">
            Occupation *
          </label>

          <input
            id="userOccupation"
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            required
          />

          <h2>Upload Documents</h2>

          <label htmlFor="userPhoto">
            Profile Photo *
          </label>

          <input
            id="userPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhoto}
            required
          />

          <label htmlFor="userPdf">
            Biodata PDF *
          </label>

          <input
            id="userPdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdf}
            required
          />

          <label className="user-portal-check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) =>
                setConsent(event.target.checked)
              }
              required
            />

            <span>
              I confirm that I am authorized
              to submit this biodata and
              understand that the admin
              controls publication and
              contact/PDF visibility.
            </span>
          </label>

          {error && (
            <p
              className="user-portal-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="user-portal-button"
            type="submit"
            disabled={loading || Boolean(error)}
          >
            {loading
              ? "Submitting Biodata..."
              : "Submit Biodata for Approval"}
          </button>

        </form>
      </div>
    </main>
  );
}

export default AddBiodata;
