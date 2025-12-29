










import React, { useState } from "react";
import "./signup.css";
import googleLogo from "/src/assets/gg.jpeg";
import Select from "react-select";
import Loggo from "/src/assets/Loggo.png";
import axios from "axios";

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Validation logic (unchanged)
  const validate = () => {
    const newErrors = {};

    if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }
    if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|icloud)\.com$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email must be from gmail, outlook, or icloud.";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must include uppercase, lowercase, number, special character, and be at least 8 characters.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ✅ Submit with JWT handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        designation: formData.role, // backend expects this key
      };

      const res = await axios.post("http://127.0.0.1:5000/api/signup", payload);

      if (res.status === 200 || res.status === 201) {
 
        const { user, token, message } = res.data;

        // ✅ Save JWT + user info in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("user_id", user.id);

        alert(message || "Signup successful!");
        window.location.href = "/home";
      }
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message || "Signup failed!");
      } else {
        alert("Network error! Please check your backend connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="background-shape"></div>
      <div className="signup-container">
        <img src={Loggo} alt="Logo" className="signup-logo" />
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="name-fields-row">
            <div className="field half">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <span className="error">{errors.firstName}</span>
              )}
            </div>

            <div className="field half">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <span className="error">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="field">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="field">
            <Select
              options={[
                { value: "", label: "Select Role / Designation", isDisabled: true },
                { value: "student", label: "Student" },
                { value: "teacher", label: "Teacher" },
                { value: "developer", label: "Project Developer" },
                { value: "other", label: "Other" },
              ]}
              placeholder="Select Role / Designation"
              value={
                formData.role
                  ? { value: formData.role, label: capitalize(formData.role) }
                  : null
              }
              onChange={(selectedOption) =>
                setFormData({ ...formData, role: selectedOption.value })
              }
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "transparent",
                  border: "1px solid #00defc",
                  borderRadius: "6px",
                  padding: "2px",
                  boxShadow: "none",
                  color: "white",
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "white",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "rgba(180, 179, 179, 0.7)",
                  fontSize: "13px",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#020b31",
                  border: "1px solid #00defc",
                  borderRadius: "6px",
                  marginTop: "5px",
                  zIndex: 100,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#00defc"
                    : state.isFocused
                    ? "#062a4e"
                    : "#020b31",
                  color: state.isSelected ? "#020b31" : "#ffffff",
                  cursor: "pointer",
                }),
              }}
            />
            {errors.role && <span className="error">{errors.role}</span>}
          </div>

          <div className="field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <button type="button" className="google-signup">
            <img src={googleLogo} alt="Google logo" />
            Sign Up with Google
          </button>
        </form>

        <div className="login-redirect">
          Already have an account? <a href="/">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
