import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FaBatteryFull,
  FaShieldAlt,
  FaTools,
  FaSignInAlt,
  FaBars,
  FaTimes,
  FaFileAlt
} from 'react-icons/fa';
import LOGIN_ROUTE from '@/constants/loginrouter';
import styles from './Home.module.css';


export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();


  const handleLogin = (): void => {
    navigate(LOGIN_ROUTE);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerWrapper}>
          <div className={styles.headerContent}>
            {/* Logo */}
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <FaBatteryFull size={24} />
              </div>
              <div className={styles.logoText}>
                <h1>EV Warranty</h1>
                <p>Hệ thống quản lý bảo hành</p>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.headerActions}>
              <button
                onClick={handleLogin}
                className={styles.loginBtn}
              >
                <FaSignInAlt size={18} />
                Đăng nhập
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={styles.mobileMenuBtn}
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>
              Quản Lý Bảo Hành Xe Điện
            </h2>
            <p className={styles.heroSubtitle}>
              Hệ thống quản lý toàn diện cho dịch vụ bảo hành và bảo dưỡng xe điện của bạn
            </p>
          </div>
        </div>
      </section>

      {/* Vehicle Showcase Section */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseContainer}>
          <div className={styles.showcaseContent}>
            <h3 className={styles.showcaseTitle}>Dòng xe điện VinFast</h3>
            <p className={styles.showcaseSubtitle}>
              Trải nghiệm công nghệ xe điện hiện đại với dịch vụ bảo hành toàn diện
            </p>
          </div>
          <div className={styles.showcaseImageWrapper}>
            <img
              src="/src/pic/Vinfast-line-up.webp"
              alt="Dòng xe điện VinFast - VF e34, VF 8, VF 9"
              className={styles.showcaseImage}
            />
            <div className={styles.showcaseOverlay}>
              <div className={styles.showcaseStats}>
                <div className={styles.showcaseStat}>
                  <span className={styles.showcaseStatNumber}>100%</span>
                  <span className={styles.showcaseStatLabel}>Xe điện</span>
                </div>
                <div className={styles.showcaseStat}>
                  <span className={styles.showcaseStatNumber}>10 năm</span>
                  <span className={styles.showcaseStatLabel}>Bảo hành pin</span>
                </div>
                <div className={styles.showcaseStat}>
                  <span className={styles.showcaseStatNumber}>24/7</span>
                  <span className={styles.showcaseStatLabel}>Hỗ trợ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionIntro}>
            <h3>Tính năng nổi bật</h3>
            <p>Hệ thống quản lý bảo hành toàn diện với nhiều tính năng tiện lợi</p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                <FaShieldAlt size={32} />
              </div>
              <h4>Bảo hành chính hãng</h4>
              <p>Đảm bảo chất lượng với chính sách bảo hành từ nhà sản xuất</p>
            </div>

            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.featureIconGreen}`}>
                <FaTools size={32} />
              </div>
              <h4>Sửa chữa chuyên nghiệp</h4>
              <p>Đội ngũ kỹ thuật viên giàu kinh nghiệm với xe điện</p>
            </div>

            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>
                <FaFileAlt size={32} />
              </div>
              <h4>Theo dõi lịch sử</h4>
              <p>Quản lý và tra cứu lịch sử bảo hành dễ dàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <div className={styles.footerLogo}>
                <FaBatteryFull size={24} />
                <span>EV Warranty</span>
              </div>
              <p className={styles.footerDescription}>
                Hệ thống quản lý bảo hành xe điện hàng đầu Việt Nam
              </p>
            </div>

            <div className={styles.footerColumn}>
              <h5>Dịch vụ</h5>
              <ul>
                <li>Bảo hành</li>
                <li>Bảo dưỡng</li>
                <li>Sửa chữa</li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h5>Hỗ trợ</h5>
              <ul>
                <li>Trung tâm trợ giúp</li>
                <li>Liên hệ</li>
                <li>FAQs</li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h5>Liên hệ</h5>
              <ul className={styles.contactList}>
                <li>Email: support@evwarranty.vn</li>
                <li>Hotline: 1900-xxxx</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; 2024 EV Warranty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}