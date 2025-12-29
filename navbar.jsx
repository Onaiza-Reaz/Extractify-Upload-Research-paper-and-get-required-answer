// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Logo from "/src/assets/Loggo.png";
// import Login from "./login.jsx";
// import "./navbar.css";

// export default function Navbar() {
//   const navigate = useNavigate();
//     return (
//         <nav className="navbar">
//         <div className="navbar-logo">
//             <img src={Logo} alt="App Logo" />
//             <span className="brand-name">EXTRACTIFY</span>
//         </div>

//         <ul className="navbar-links">
//             <li><Link to="/home">Home</Link></li>
//             <li><Link to="/about">About</Link></li>
//             <li><Link to="/feature">Features</Link></li>
//             <li><Link to="/contact">Contact</Link></li>
//         </ul>

//         <button
//             className="nav-btn"
//             onClick={() => navigate("/")} 
//         >
//             Get Started
//         </button>
//         </nav>
//     );
//     }














// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Logo from "/src/assets/Loggo.png";
// import "./navbar.css";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // ✅ Check login state when Navbar mounts
//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     setIsLoggedIn(!!token);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     setIsLoggedIn(false);
//     navigate("/"); // redirect to home or login page
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-logo">
//         <img src={Logo} alt="App Logo" />
//         <span className="brand-name">EXTRACTIFY</span>
//       </div>

//       <ul className="navbar-links">
//         <li><Link to="/home">Home</Link></li>
//         <li><Link to="/about">About</Link></li>
//         <li><Link to="/feature">Features</Link></li>
//         <li><Link to="/contact">Contact</Link></li>
//       </ul>

//       {isLoggedIn ? (
//         <button className="nav-btn logout" onClick={handleLogout}>
//           Logout
//         </button>
//       ) : (
//         <button className="nav-btn" onClick={() => navigate("/")}>
//           Get In
//         </button>
//       )}
//     </nav>
//   );
// }







import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "/src/assets/Loggo.png";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check login state dynamically
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setIsLoggedIn(!!userData.token); // ✅ check for token inside user object
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user"); // ✅ clear user data
    setIsLoggedIn(false);
    navigate("/"); // redirect to login page
    window.dispatchEvent(new Event("storage")); // ✅ update Navbar immediately
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={Logo} alt="App Logo" />
        <span className="brand-name">EXTRACTIFY</span>
      </div>

      <ul className="navbar-links">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/feature">Features</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      {isLoggedIn ? (
        <button className="nav-btn logout" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="nav-btn" onClick={() => navigate("/")}>
          Get In
        </button>
      )}
    </nav>
  );
}
