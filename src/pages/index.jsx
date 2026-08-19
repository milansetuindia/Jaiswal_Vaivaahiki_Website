import MainLayout from "../../components/layout/MainLayout";

import Hero from "../../components/home/Hero";
import SearchSection from "../../components/home/SearchSection";
import LatestProfiles from "../../components/home/LatestProfiles";
import Features from "../../components/home/Features";

function Home() {
  return (
    <MainLayout>
      <Hero />
      <SearchSection />
      <LatestProfiles />
      <Features />
    </MainLayout>
  );
}

export default Home;