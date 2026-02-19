import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Worlds from "./components/Worlds.jsx";
import WorldScene from "./components/worlds/WorldScene.jsx";

function LandingPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Shared gradient background — spans hero + worlds seamlessly */}
      <div className="relative bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,#dbeafe_0%,#c7d7fe_30%,#bfcffe_55%,#e0e7ff_75%,#f0f4ff_100%)]">
        <Navbar />
        <Hero />
        <Worlds />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/world/:id" element={<WorldScene />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
