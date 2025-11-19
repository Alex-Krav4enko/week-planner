import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeekPage from './pages/WeekPage';
import DayPage from './pages/DayPage';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WeekPage />} />
        <Route path="/day/:day" element={<DayPage />} />
      </Routes>
    </Router>
  );
}
