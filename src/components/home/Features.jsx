// src/components/home/Features.jsx

import "./Features.css";

function Features() {
  const features = [
    {
      icon: "🔎",
      title: "Easy Search",
      description:
        "Find suitable profiles using age, gender, location, education, income, caste and other preferences.",
    },
    {
      icon: "❤️",
      title: "Community Focused",
      description:
        "A matrimonial platform created especially for families looking for suitable Jaiswal community matches.",
    },
    {
      icon: "🛡️",
      title: "Trusted Profiles",
      description:
        "Biodata profiles are carefully managed through our administration system.",
    },
    {
      icon: "📄",
      title: "Complete Biodata",
      description:
        "View detailed biodata including education, occupation, annual income and Manglik status.",
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description:
        "Browse profiles comfortably on mobile phones, tablets and desktop devices.",
    },
    {
      icon: "✨",
      title: "Simple & Professional",
      description:
        "A clean and elegant experience designed to make matrimonial searching easier.",
    },
  ];

  return (
    <section className="features">

      {/* ==================================================
          SECTION HEADING
      ================================================== */}

      <div className="section-heading">

        <span className="section-eyebrow">
          WHY JAISWAL VAIVAAHIKI
        </span>

        <h2>
          Everything You Need to Find
          <span> the Right Match</span>
        </h2>

        <p>
          A simple, trusted and community-focused
          matrimonial platform for finding suitable
          life partners.
        </p>

      </div>


      {/* ==================================================
          FEATURE GRID
      ================================================== */}

      <div className="features-grid">

        {features.map((feature) => (

          <div
            className="feature-card"
            key={feature.title}
          >

            {/* ==================================================
                FEATURE ICON
                ONLY THE ICON FLIPS
            ================================================== */}

            <div className="feature-icon-flip">

              <div className="feature-icon-inner">

                {/* FRONT */}

                <div className="feature-icon-face feature-icon-front">
                  {feature.icon}
                </div>

                {/* BACK */}

                <div className="feature-icon-face feature-icon-back">
                  ✦
                </div>

              </div>

            </div>


            {/* ==================================================
                TITLE
            ================================================== */}

            <h3>
              {feature.title}
            </h3>


            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <p>
              {feature.description}
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Features;
