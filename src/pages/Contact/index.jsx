import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">

      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="contact-hero">

        <div className="contact-hero-content">

          <h1>
            Contact Us
          </h1>

          <p>
            We are here to help you with
            Jaiswal Vaivaahiki.
          </p>

        </div>

      </section>


      {/* ==================================================
          MAIN CONTACT CONTENT
      ================================================== */}

      <section className="contact-container">

        {/* Introduction */}

        <div className="contact-intro">

          <h2>
            We'd Love to Hear From You
          </h2>

          <p>
            If you have any questions, suggestions,
            feedback, or face any problem while using
            Jaiswal Vaivaahiki, feel free to contact us.
          </p>

        </div>


        {/* ==================================================
            CONTACT CARDS
        ================================================== */}

        <div className="contact-cards">

          {/* EMAIL */}

          <div className="contact-card">

            <div className="contact-icon">
              ✉
            </div>

            <h3>
              Email
            </h3>

            <p>
              For general questions, suggestions,
              feedback, or technical assistance.
            </p>

            <a
              href="mailto:milansetuindia@gmail.com"
              className="contact-link"
            >
              milansetuindia@gmail.com
            </a>

          </div>


          {/* PHONE */}

          <div className="contact-card">

            <div className="contact-icon">
              ☎
            </div>

            <h3>
              Phone
            </h3>

            <p>
              Contact us during our business hours
              for assistance.
            </p>

            <a
              href="tel:+917050510511"
              className="contact-link"
            >
              +91 7050510511
            </a>

          </div>


          {/* BUSINESS HOURS */}

          <div className="contact-card">

            <div className="contact-icon">
              🕐
            </div>

            <h3>
              Business Hours
            </h3>

            <p>
              Monday – Saturday
            </p>

            <strong>
              10:00 AM – 7:00 PM (IST)
            </strong>

          </div>

        </div>


        {/* ==================================================
            SUPPORT SECTION
        ================================================== */}

        <div className="contact-support">

          <div className="support-icon">
            ?
          </div>

          <div className="support-content">

            <h2>
              Need Help?
            </h2>

            <p>
              If you are facing any technical problem
              while using the website, have a question
              about a biodata profile, or would like to
              provide feedback, please contact us.
            </p>

            <p>
              Our team will review your request and
              respond as soon as possible.
            </p>

            <a
              href="mailto:milansetuindia@gmail.com"
              className="support-button"
            >
              Email Us
            </a>

          </div>

        </div>


        {/* ==================================================
            FEEDBACK SECTION
        ================================================== */}

        <div className="contact-note">

          <h3>
            Suggestions &amp; Feedback
          </h3>

          <p>
            Your feedback helps us improve Jaiswal
            Vaivaahiki. If you have suggestions about
            the website, search experience, biodata
            profiles, or any other feature, we would
            be happy to hear from you.
          </p>

        </div>

      </section>


      {/* ==================================================
          FOOTER MESSAGE
      ================================================== */}

      <section className="contact-footer">

        <h2>
          Jaiswal Vaivaahiki
        </h2>

        <p>
          A matrimonial portal for the Jaiswal community.
        </p>

      </section>

    </div>
  );
}

export default Contact;