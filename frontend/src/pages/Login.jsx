import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the previous error when user edits the field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit login form
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   setServerError("");
  //   setSuccessMessage("");

  //   if (!validateForm()) {
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await api.post(
  //       "/auth/login",
  //       {
  //         email: formData.email.trim().toLowerCase(),
  //         password: formData.password,
  //       },
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     await login(formData);

  //     // Login API response
  //     console.log("Login successful:", response.data);

  //     setSuccessMessage(response.data.message || "Login successful");

  //     // Access Token and user will be connected
  //     // to Auth Context in the next integration step.

  //     setFormData({
  //       email: "",
  //       password: "",
  //     });

  //   } catch (error) {
  //     if (error.response) {
  //       setServerError(
  //         error.response.data?.message ||
  //         "Login failed. Please check your credentials."
  //       );
  //     } else if (error.request) {
  //       setServerError(
  //         "Unable to connect to the server. Please try again."
  //       );
  //     } else {
  //       setServerError("Something went wrong. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Login through AuthContext
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Navigate after successful login
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Login to your CRM account
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              aria-invalid={Boolean(errors.email)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                aria-invalid={Boolean(errors.password)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Backend error */}
          {serverError && (
            <div
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4"
              role="alert"
            >
              {serverError}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div
              className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
