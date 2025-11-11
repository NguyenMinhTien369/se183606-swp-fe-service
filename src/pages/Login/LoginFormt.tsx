import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "./feature/AuthContext";
import { getHomeRoute } from "@/utils/constants";
import { FaUser, FaLock, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /*
Mình nghĩ: Cần sửa lại hàm handleSubmit như sau:
- @param e: là một sự kiện của biểu mẫu (form event) được truyền vào khi người dùng gửi biểu mẫu đăng nhập.
- chuyển trang dựa vào role của user sau khi đăng nhập thành công. Chuyển về trang home chứ không phải trang login nữa.
*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(formData);
    if (result.success) {
      // Giải nén user từ kết quả login
      const user = result.user;

      // Kiểm tra có tồn tại user và role không
      let roleName = "";
      if (user && user.role) {
        // Nếu role là object có key roleName
        if (typeof user.role === "object" && "roleName" in user.role) {
          roleName = user.role.roleName;
        } else if (typeof user.role === "string") {
          // Nếu role là chuỗi, ví dụ "ROLE_ADMIN"
          roleName = user.role;
        }
      }

      console.log("🔵 Navigating with role:", roleName);

      // ✅ Sử dụng helper function để lấy home route với full role name
      const destination = getHomeRoute(roleName);
      console.log("🔵 Destination:", destination);
      navigate(destination);
    } else {
      // Đăng nhập thất bại
      const errorMessage = result.error ?? "Đăng nhập thất bại";
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      {/* Main Container */}
      <div className={styles.mainCard}>

        {/* Left Side - Background Image */}
        <div className={styles.leftSide}>
          <div className={styles.backgroundImage} />
          <div className={styles.overlay} />

          {/* Geometric Shapes */}
          <div className={styles.geometricShapes}>
            <div className={`${styles.shape} ${styles.shape1}`} />
            <div className={`${styles.shape} ${styles.shape2}`} />
            <div className={`${styles.shape} ${styles.shape3}`} />
          </div>

          {/* Content */}
          <div className={styles.leftContent}>
            <div className={styles.brandCard}>
              <h2 className={styles.brandTitle}>OEM EV Warranty Management System</h2>
              <p className={styles.brandSubtitle}>Phần mềm quản lý bảo hành xe điện từ hãng</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.rightSide}>
          <div className={styles.formContainer}>
            {/* Back to Home Button */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className={styles.backToHomeBtn}
            >
              <FaArrowLeft />
              <span>Quay lại trang chủ</span>
            </button>

            {/* Welcome Text */}
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle}>Welcome</h1>
              <p className={styles.welcomeSubtitle}>Log in to your account to continue</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>{error}</div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Username Input */}
              <div className={styles.inputGroup}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••••"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePasswordBtn}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className={styles.forgotPassword}>
                <Link to="/reset-password" className={styles.forgotLink}>
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <span className={styles.loadingSpinner}>
                    <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
