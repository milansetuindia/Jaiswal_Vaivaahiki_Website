// src/pages/Privacy/index.jsx

import { Link } from "react-router-dom";
import "./Privacy.css";

function Privacy() {
  return (
    <div className="legal-page">

      <div className="legal-container">

        <div className="legal-header">
          <span className="legal-eyebrow">
            ✦ JAISWAL VAIVAAHIKI ✦
          </span>

          <h1>
            Privacy Policy
          </h1>

          <p>
            Your privacy and trust are important to us.
          </p>

          <span className="legal-date">
            Last Updated: August 2026
          </span>
        </div>


        <div className="legal-content">

          <section>
            <h2>1. Introduction</h2>

            <p>
              Jaiswal Vaivaahiki is a community-focused
              matrimonial platform designed to help families
              discover suitable matrimonial profiles.
            </p>

            <p>
              This Privacy Policy explains how we collect,
              use, store, protect and manage information
              associated with the use of our website and
              matrimonial services.
            </p>
          </section>


          <section>
            <h2>2. Information We Collect</h2>

            <p>
              Depending on the services used, the platform
              may contain or process information including:
            </p>

            <ul>
              <li>Name</li>
              <li>Age</li>
              <li>Gender</li>
              <li>City and State</li>
              <li>Education</li>
              <li>Occupation</li>
              <li>Annual Income</li>
              <li>Marital Status</li>
              <li>Manglik Status</li>
              <li>Caste and Sub-caste</li>
              <li>Profile Photograph</li>
              <li>Biodata documents uploaded by the administrator</li>
            </ul>
          </section>


          <section>
            <h2>3. How We Use Information</h2>

            <p>
              Information available on the platform may be
              used to:
            </p>

            <ul>
              <li>Display matrimonial profiles.</li>
              <li>Provide profile search functionality.</li>
              <li>Allow users to view available biodata information.</li>
              <li>Generate and display matrimonial biodata.</li>
              <li>Maintain and manage the website.</li>
              <li>Improve the functionality and user experience.</li>
              <li>Protect the platform against misuse or unauthorized activity.</li>
            </ul>
          </section>


          <section>
            <h2>4. Publicly Displayed Information</h2>

            <p>
              Information included in a matrimonial profile
              may be visible to visitors of the website.
              This can include profile photographs, name,
              age, education, occupation, location, annual
              income, marital status, Manglik status and
              other profile information made available through
              the platform.
            </p>

            <p>
              Users and administrators should therefore only
              submit information that they are comfortable
              making available through the matrimonial service.
            </p>
          </section>


          <section>
            <h2>5. Profile Photographs and Biodata Documents</h2>

            <p>
              Profile photographs and biodata documents may
              be uploaded and stored for the purpose of
              providing matrimonial services.
            </p>

            <p>
              We take reasonable measures to protect stored
              information, but no internet-based system can
              be guaranteed to be completely secure.
            </p>
          </section>


          <section>
            <h2>6. Data Accuracy</h2>

            <p>
              Users or administrators responsible for submitting
              profile information should ensure that the
              information provided is accurate, current and
              not misleading.
            </p>

            <p>
              Jaiswal Vaivaahiki does not guarantee the accuracy
              or completeness of information submitted by
              profile owners or third parties.
            </p>
          </section>


          <section>
            <h2>7. Data Security</h2>

            <p>
              We use reasonable technical and organizational
              measures to protect information from unauthorized
              access, alteration, disclosure or destruction.
            </p>

            <p>
              However, transmission and storage of information
              over the internet involves inherent risks, and
              absolute security cannot be guaranteed.
            </p>
          </section>


          <section>
            <h2>8. Data Retention</h2>

            <p>
              Matrimonial profiles may be retained for the
              period necessary to provide the service.
              Profiles may also be removed in accordance with
              the platform's administrative policies.
            </p>

            <p>
              Our platform may automatically remove profiles
              after the applicable retention period configured
              by the administrator.
            </p>
          </section>


          <section>
            <h2>9. Third-Party Services</h2>

            <p>
              The website may use third-party infrastructure
              and service providers for hosting, database
              storage, file storage, website deployment and
              other technical services.
            </p>

            <p>
              Such services may process information only as
              necessary to provide their respective technical
              services and subject to their applicable policies.
            </p>
          </section>


          <section>
            <h2>10. Cookies and Technical Data</h2>

            <p>
              The website may use cookies, local storage or
              similar technologies where necessary for
              functionality, authentication, security and
              improving the user experience.
            </p>

            <p>
              Technical information such as browser type,
              device information, IP address and access logs
              may also be processed by hosting or security
              infrastructure.
            </p>
          </section>


          <section>
            <h2>11. Children's Privacy</h2>

            <p>
              The matrimonial service is intended for adults.
              We do not knowingly intend to collect or publish
              matrimonial profiles belonging to minors.
            </p>
          </section>


          <section>
            <h2>12. Misuse and Unauthorized Information</h2>

            <p>
              Users must not submit another person's personal
              information, photograph or biodata without having
              the necessary permission or authority to do so.
            </p>

            <p>
              We may remove information that appears to violate
              applicable law, privacy rights, intellectual
              property rights or these policies.
            </p>
          </section>


          <section>
            <h2>13. Your Requests</h2>

            <p>
              If you believe that your personal information has
              been displayed incorrectly, submitted without
              authorization, or should be removed, you may
              contact the website administrator.
            </p>

            <p>
              Requests may be reviewed and handled subject to
              applicable law and operational requirements.
            </p>
          </section>


          <section>
            <h2>14. Changes to This Privacy Policy</h2>

            <p>
              We may update this Privacy Policy from time to
              time to reflect changes in the website,
              technology, services or applicable legal
              requirements.
            </p>

            <p>
              The updated version will be published on this
              page with a revised "Last Updated" date.
            </p>
          </section>


          <section>
            <h2>15. Contact</h2>

            <p>
              For privacy-related questions, requests or
              concerns, please contact the Jaiswal Vaivaahiki
              administrator through the contact details
              provided on the website.
            </p>
          </section>

        </div>


        <div className="legal-back">
          <Link to="/">
            ← Back to Home
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Privacy;