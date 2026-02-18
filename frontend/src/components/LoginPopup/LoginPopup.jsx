import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!data.email || !data.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }

    if (!data.password || data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (currentState === "Sign Up") {
      if (!data.name || data.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
      if (data.password !== data.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onLogin = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    try {
      setLoading(true);
      const endpoint =
        currentState === "Login" ? "/api/user/login" : "/api/user/register";

      const response = await axios.post(`${url}${endpoint}`, {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        setToken(response.data.data.accessToken);
        localStorage.setItem("token", response.data.data.accessToken);
        toast.success(
          currentState === "Login"
            ? "Login successful!"
            : "Account created successfully!"
        );
        setShowLogin(false);
      } else {
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup" onClick={() => setShowLogin(false)}>
      <form
        onSubmit={onLogin}
        className="login-popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-popup-title">
          <h2>{currentState === "Login" ? "Login" : "Create Account"}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={() => setShowLogin(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="login-popup-inputs">
          {currentState === "Sign Up" && (
            <div className="input-group">
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Full name"
                required
                disabled={loading}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          )}

          <div className="input-group">
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Email address"
              required
              disabled={loading}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="input-group password-group">
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {currentState === "Sign Up" && (
            <div className="input-group password-group">
              <input
                name="confirmPassword"
                onChange={onChangeHandler}
                value={data.confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
              </button>
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="login-popup-button"
        >
          {loading
            ? "Processing..."
            : currentState === "Sign Up"
            ? "Create Account"
            : "Login"}
        </button>

        <div className="login-popup-condition">
          <input
            type="checkbox"
            required
            disabled={loading}
            id="terms-checkbox"
          />
          <label htmlFor="terms-checkbox">
            By continuing, I agree to the terms of use & privacy policy
          </label>
        </div>

        <div className="login-popup-toggle">
          {currentState === "Login" ? (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setCurrentState("Sign Up");
                  setData({ name: "", email: "", password: "", confirmPassword: "" });
                  setErrors({});
                }}
              >
                Create one
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrentState("Login");
                  setData({ name: "", email: "", password: "", confirmPassword: "" });
                  setErrors({});
                }}
              >
                Login here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPopup;
