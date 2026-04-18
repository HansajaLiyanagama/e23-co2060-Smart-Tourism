import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The default route (http://localhost:5173/) will show the Login page */}
        <Route path="/" element={<Login />} />
        
        {/* The /home route (http://localhost:5173/home) will show the Map page */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;