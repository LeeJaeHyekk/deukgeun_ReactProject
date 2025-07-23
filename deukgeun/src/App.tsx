import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import LoginPage from '@pages/login/LoginPage';
import ErrorPage from '@pages/Error/ErrorPage';
import SignUpPage from '@pages/Sign up/SignUpPage';
import MachineGuidePage from '@pages/MachineGuide/MachineGuidePage';
import CommunityPage from '@pages/Community/CommunityPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/machine-guide" element={<MachineGuidePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
