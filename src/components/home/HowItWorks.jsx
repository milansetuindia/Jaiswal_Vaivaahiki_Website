// src/components/home/HowItWorks.jsx

import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: "👤",
      title: "Search Profiles",
      frontText:
        "Find suitable matrimonial profiles using our advanced search filters.",
      backText:
        "Search by age, gender, income, education, location, Manglik status and more.",
    },

    {
      number: "2",
      icon: "📷",
      title: "Explore Profiles",
      frontText:
        "Browse profiles and learn more about potential life partners.",
      backText:
        "View profile photos, education, occupation, location and other important details.",
    },

    {
      number: "3",
      icon: "👁️",
      title: "View Biodata",
      frontText:
        "Review the complete biodata before taking the next step.",
      backText:
        "Check personal details, annual income, Manglik status and download the complete biodata PDF.",
    },

    {
      number: "4",
      icon: "📄",
      title: "Take the Next Step",
      frontText:
        "Find a suitable profile and move forward with confidence.",
      backText:
        "Connect with the family and take the relationship forward toward a meaningful future.",
    },
  ];

  return (
    <section className="how-it-works">

      {/* ==================================================
          HEADING
      ================================================== */}

      <div className="how-heading">

        <span className="how-eyebrow">
          ✦ SIMPLE &amp; EASY ✦
        </span>

        <h2>
          How Jaiswal Vaivaahiki Works
        </h2>

        <p>
          Finding a suitable life partner can be
          simple. Follow these four easy steps.
        </p>

      </div>


      {/* ==================================================
          FOUR CARDS
      ================================================== */}

      <div className="steps-container">

        {steps.map((step) => (

          <div
            className="flip-card"
            key={step.number}
          >

            {/* ==================================================
                FRONT CARD
                The card itself NEVER flips.
            ================================================== */}

            <div className="flip-card-face flip-card-front">

              {/* STEP NUMBER */}

              <div className="step-number">
                {step.number}
              </div>


              {/* ==================================================
                  ICON
                  ONLY THIS PART FLIPS
              ================================================== */}

              <div className="step-icon">

                <div className="step-icon-inner">

                  {/* MAROON FRONT */}

                  <div className="step-icon-front">
                    {step.icon}
                  </div>


                  {/* GOLDEN BACK */}

                  <div className="step-icon-back">
                    {step.icon}
                  </div>

                </div>

              </div>


              {/* TITLE */}

              <h3>
                {step.title}
              </h3>


              {/* DESCRIPTION */}

              <p>
                {step.frontText}
              </p>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default HowItWorks;