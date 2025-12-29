
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import googleLogo from "/src/assets/gg.jpeg";
// import Loggo from "/src/assets/Loggo.png";
// import "./login.css";

// const Login = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ✅ Handle login
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const response = await fetch("http://127.0.0.1:5000/api/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         console.log("✅ Login successful:", data);
//         alert("Login successful!");
//         localStorage.setItem("user", JSON.stringify(data.user));
//         navigate("/home");
//       } else {
//         setError(data.message || "Invalid credentials");
//       }
//     } catch (err) {
//       console.error("❌ Error:", err);
//       setError("Server error. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="background-shape"></div>
//       <div className="login-container">
//         <img src={Loggo} alt="Logo" className="login-logo" />
//         <h2>Welcome Back!</h2>

//         {/* ✅ Form for login */}
//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           {error && <p className="error-message">{error}</p>}

//           <button type="submit" className="login-btn" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         {/* ✅ Google login button */}
//         <button className="google-login">
//           <img src={googleLogo} alt="Google logo" />
//           Login with Google
//         </button>

//         <div className="redirect-signup">
//           Don't have an account? <a href="/signup">Sign up</a>
//         </div>

//         <div className="forgot-password">
//           <a href="#">Forgot Password?</a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;













// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import googleLogo from "/src/assets/gg.jpeg";
// import Loggo from "/src/assets/Loggo.png";
// import "./login.css";

// const Login = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ✅ Handle login
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const response = await fetch("http://127.0.0.1:5000/api/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         console.log("✅ Login successful:", data);
//         alert("Login successful!");

//         // ✅ Store complete user info
//         localStorage.setItem("user", JSON.stringify(data.user));

//         // ✅ Store user_id separately for future API requests
//         localStorage.setItem("user_id", data.user.id);

//         navigate("/home");
//       } else {
//         setError(data.message || "Invalid credentials");
//       }
//     } catch (err) {
//       console.error("❌ Error:", err);
//       setError("Server error. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="background-shape"></div>
//       <div className="login-container">
//         <img src={Loggo} alt="Logo" className="login-logo" />
//         <h2>Welcome Back!</h2>

//         {/* ✅ Form for login */}
//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           {error && <p className="error-message">{error}</p>}

//           <button type="submit" className="login-btn" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         {/* ✅ Google login button */}
//         <button className="google-login">
//           <img src={googleLogo} alt="Google logo" />
//           Login with Google
//         </button>

//         <div className="redirect-signup">
//           Don't have an account? <a href="/signup">Sign up</a>
//         </div>

//         <div className="forgot-password">
//           <a href="#">Forgot Password?</a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;





import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import googleLogo from "/src/assets/gg.jpeg";
import Loggo from "/src/assets/Loggo.png";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Login successful:", data);
        alert("Login successful!");

        // ✅ Save token and user info in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...data.user,
            token: data.token, // save JWT token
          })
        );

        // localStorage.setItem("token", response.data.access_token);

        // ✅ Store user_id separately if needed
        localStorage.setItem("user_id", data.user.id);

        // ✅ Navigate to home
        navigate("/home");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background-shape"></div>
      <div className="login-container">
        <img src={Loggo} alt="Logo" className="login-logo" />
        <h2>Welcome Back!</h2>

        {/* ✅ Form for login */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ✅ Google login button */}
        <button className="google-login">
          <img src={googleLogo} alt="Google logo" />
          Login with Google
        </button>

        <div className="redirect-signup">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>

        <div className="forgot-password">
          <a href="#">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
