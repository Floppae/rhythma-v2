import "./App.css";

import { auth } from "./firebase";
import Home from "./components/Home";
import CreatorPage from "./components/CreatorPage";
import Login from "./components/Login";
import CreatorEditPage from "./components/CreatorEditPage";
import Maps from "./components/Maps";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/maps" element={<Maps />} />
          <Route exact path="/creator" element={<CreatorPage />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/creator-edit" element={<CreatorEditPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
