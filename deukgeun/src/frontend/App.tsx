import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@shared/contexts/AuthContext";
import HomePage from "@pages/HomePage";
import LoginPage from "@pages/login/LoginPage";
import ErrorPage from "@pages/Error/ErrorPage";
import SignUpPage from "@pages/Sign up/SignUpPage";
import MachineGuidePage from "@pages/MachineGuide/MachineGuidePage";
import CommunityPage from "@features/community/CommunityPage";
import GymFinderPage from "@pages/location/GymFinderPage";
import MyPage from "@pages/Mypage/myPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/machine-guide" element={<MachineGuidePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/location" element={<GymFinderPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
