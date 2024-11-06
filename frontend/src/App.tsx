import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from "./pages/NotFound";
import UploadFilePage from './pages/uploadFile';
import LoginPage from './pages/loginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/file-upload" element={<UploadFilePage />} />
        <Route path="*" element={<NotFound />} /> {/* For handling 404 */}
      </Routes>
    </Router>
  )
}

export default App
