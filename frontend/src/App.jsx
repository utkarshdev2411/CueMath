import { BrowserRouter, Route, Routes } from "react-router-dom";
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
      </Routes>
    </BrowserRouter>
  );
}
