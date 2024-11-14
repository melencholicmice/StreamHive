import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from "./pages/NotFound";
import UploadFilePage from './pages/uploadFile';
import LoginPage from './pages/loginPage';
import AllVideos from './pages/allVideos';
import VideoPage from './pages/video';
import { Protected } from './components/protected';
import Profile from './pages/profile'
import Nav from './components/nav';


function App() {
  return (
    <>
      <Nav />
      <Router>
        <Routes>
          <Route path="/" element={<AllVideos />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path="/file-upload" element={<Protected><UploadFilePage /></Protected>} />
          <Route path="/video" element={<VideoPage />} />
          <Route path='/profile' element={<Protected>{(user) => <Profile {...user} />}</Protected>} />
          <Route path="*" element={<NotFound />} /> {/* For handling 404 */}
        </Routes>
      </Router>
    </>
  )
}

export default App