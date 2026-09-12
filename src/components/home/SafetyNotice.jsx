// src/components/home/SafetyNotice.jsx

import { useState } from "react";
import "./SafetyNotice.css";

function SafetyNotice() {
  const [showEnglish, setShowEnglish] = useState(false);

  return (
    <section className="safety-notice-section">
      <div className="safety-notice">
        <div className="safety-notice-icon">
          ⚠️
        </div>

        <div className="safety-notice-content">
          <h2>महत्वपूर्ण सूचना</h2>

          {!showEnglish ? (
            <>
              <p>
                जायसवाल वैवाहिकी मेट्रोमोनियल वेबसाइट पर उपलब्ध किसी
                बायोडाटा के संपर्क नंबर पर वर-वधू के अभिभावक के अलावा
                कोई अन्य व्यक्ति मिले, तो कृपया{" "}
                <strong className="safety-phone">
                  7050 510 511
                </strong>{" "}
                पर तुरंत सूचित करें। पुष्टि होने पर संबंधित बायोडाटा
                को वेबसाइट से तत्काल हटा दिया जाएगा।
              </p>

              <p className="safety-thanks">
                🙏 आपके सहयोग के लिए धन्यवाद।
              </p>

              <button
                type="button"
                className="safety-translation-btn"
                onClick={() => setShowEnglish(true)}
              >
                See translation in English
              </button>
            </>
          ) : (
            <>
              <h2>Important Notice</h2>

              <p>
                If you find that the contact number provided in any
                biodata on the{" "}
                <strong>Jaiswal Vaivaahiki</strong>{" "}
                matrimonial website belongs to someone other than the
                bride's or groom's parent or guardian, please inform us
                immediately at{" "}
                <strong className="safety-phone">
                  7050 510 511
                </strong>.
                Upon verification, the concerned biodata will be
                removed from the website immediately.
              </p>

              <p className="safety-thanks">
                🙏 Thank you for your cooperation.
              </p>

              <button
                type="button"
                className="safety-translation-btn"
                onClick={() => setShowEnglish(false)}
              >
                हिंदी में देखें
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default SafetyNotice;