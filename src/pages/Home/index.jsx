// src/pages/Home/index.jsx

import MainLayout from "../../components/layout/MainLayout";

import Hero from "../../components/home/Hero";
import TrustStats from "../../components/home/TrustStats";
import Donation from "../../components/home/Donation";
import UploadBiodata from "../../components/home/UploadBiodata";
import SearchSection from "../../components/home/SearchSection";
import LatestProfiles from "../../components/home/LatestProfiles";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItWorks";
import HomeCTA from "../../components/home/HomeCTA";

function Home() {
  return (
    <MainLayout>

      <Hero />

      <TrustStats />

      <Donation />

      <UploadBiodata />

      <SearchSection />

      <LatestProfiles />

      <Features />

      <HowItWorks />

      <HomeCTA />

    </MainLayout>
  );
}

export default Home;
