import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import navItems from './navItems';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = navItems[user?.role] || [];

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>

      {menuOpen && (
        <div className={styles.overlay} onClick={closeMenu} />
      )}

      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.userInfo}>
          <span className={styles.username}>{user?.username}</span>
          <span className={styles.role}>{user?.role}</span>
        </div>

        <nav className={styles.nav}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>
    </>
  );
}
