import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import BuildJourney from "./pages/BuildJourney";
import BuildStory from "./pages/BuildStory";
import DebugReport from "./pages/DebugReport";
import Interview from "./pages/Interview";
import Landing from "./pages/Landing";
import Report from "./pages/Report";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/build-story" element={<BuildStory />} />
        <Route path="/build-journey" element={<BuildJourney />} />
        <Route path="/debug" element={<DebugReport />} />
      </Routes>
    </BrowserRouter>
  );
}
