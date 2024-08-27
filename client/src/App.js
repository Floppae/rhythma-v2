import "./App.css";
import userSeif from "./assets/user-seif.jpeg";
import grizzly from "./assets/grizzlypng.jpeg";
import davolaf from "./assets/davolaf.jpeg";
import { auth } from "./firebase";
import Home from "./components/Home";
import CreatorPage from "./components/CreatorPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <div>
      {/* This is the alias of BrowserRouter i.e. Router */}
      <Router>
        <Routes>
          {/* This route is for home component 
      with exact path "/", in component props 
      we passes the imported component*/}
          <Route exact path="/" element={<Home />} />
          <Route exact path="/creator" element={<CreatorPage />} />

          {/* This route is for about component 
      with exact path "/about", in component 
      props we passes the imported component*/}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
