import "./MainLayout.css";

import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout({ children }) {
  return (
    <div className="layout">

      <Navbar />

      <main className="main-content">
        {children}
      </main>

      <Footer />

    </div>
  );
}

export default MainLayout;