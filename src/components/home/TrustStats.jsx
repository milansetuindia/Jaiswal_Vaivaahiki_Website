// src/components/home/TrustStats.jsx

import { useEffect, useState } from "react";
import "./TrustStats.css";

const API_URL = import.meta.env.VITE_API_URL;

function TrustStats() {
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/biodatas`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to fetch statistics"
          );
        }

        const biodatas =
          result.biodatas || [];

        const maleCount =
          biodatas.filter(
            (person) =>
              person.gender === "Male"
          ).length;

        const femaleCount =
          biodatas.filter(
            (person) =>
              person.gender === "Female"
          ).length;

        setStats({
          total: biodatas.length,
          male: maleCount,
          female: femaleCount,
        });

      } catch (error) {
        console.error(
          "Statistics fetch error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="trust-stats">

      {/* ==================================================
          HEADING
      ================================================== */}

      <div className="trust-heading">

        <span className="trust-eyebrow">
          ✦ JAISWAL VAIVAAHIKI ✦
        </span>

        <h2>
          A Trusted Place to Begin
          Your Search
        </h2>

        <p>
          Explore matrimonial profiles from
          the Jaiswal community and take
          the first step toward finding a
          suitable life partner.
        </p>

      </div>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="stats-container">


        {/* ==================================================
            TOTAL PROFILES
        ================================================== */}

        <div className="stat-card">

          <div className="stat-icon-flip">

            <div className="stat-icon-inner">

              {/* FRONT */}

              <div className="stat-icon-face stat-icon-front">
                👥
              </div>

              {/* BACK */}

              <div className="stat-icon-face stat-icon-back">
                ✦
              </div>

            </div>

          </div>


          <div className="stat-number">

            {loading
              ? "—"
              : stats.total}

          </div>

          <div className="stat-label">
            Total Profiles
          </div>

        </div>


        {/* ==================================================
            MALE PROFILES
        ================================================== */}

        <div className="stat-card">

          <div className="stat-icon-flip">

            <div className="stat-icon-inner">

              {/* FRONT */}

              <div className="stat-icon-face stat-icon-front">
                👨
              </div>

              {/* BACK */}

              <div className="stat-icon-face stat-icon-back">
                ✦
              </div>

            </div>

          </div>


          <div className="stat-number">

            {loading
              ? "—"
              : stats.male}

          </div>

          <div className="stat-label">
            Male Profiles
          </div>

        </div>


        {/* ==================================================
            FEMALE PROFILES
        ================================================== */}

        <div className="stat-card">

          <div className="stat-icon-flip">

            <div className="stat-icon-inner">

              {/* FRONT */}

              <div className="stat-icon-face stat-icon-front">
                👩
              </div>

              {/* BACK */}

              <div className="stat-icon-face stat-icon-back">
                ✦
              </div>

            </div>

          </div>


          <div className="stat-number">

            {loading
              ? "—"
              : stats.female}

          </div>

          <div className="stat-label">
            Female Profiles
          </div>

        </div>


        {/* ==================================================
            COMMUNITY
        ================================================== */}

        <div className="stat-card">

          <div className="stat-icon-flip">

            <div className="stat-icon-inner">

              {/* FRONT */}

              <div className="stat-icon-face stat-icon-front">
                ❤️
              </div>

              {/* BACK */}

              <div className="stat-icon-face stat-icon-back">
                ✦
              </div>

            </div>

          </div>


          <div className="stat-number">
            100%
          </div>

          <div className="stat-label">
            Community Focused
          </div>

        </div>


      </div>

    </section>
  );
}

export default TrustStats;