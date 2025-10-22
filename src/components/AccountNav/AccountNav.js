import { Link, navigate } from 'gatsby';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import * as styles from './AccountNav.module.css';

const AccountNav = (props) => {
  const { logout } = useAuth();
  const { user } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.root}>
      <div className={styles.webRoot}>
        <Link
          activeClassName={styles.activeLink}
          to={'/account/orders/'}
          className={styles.webLink}
        >
          Orders
        </Link>
        <Link
          activeClassName={styles.activeLink}
          to={'/account/address/'}
          className={styles.webLink}
        >
          Addresses
        </Link>
        <Link
          activeClassName={styles.activeLink}
          to={'/account/settings/'}
          className={styles.webLink}
        >
          Settings
        </Link>
        <Link
          activeClassName={styles.activeLink}
          to={'/account/favorites/'}
          className={styles.webLink}
        >
          Mis Favoritos
        </Link>
        {user && Array.isArray(user.roles) && user.roles.includes('admin') && (
          <Link
            activeClassName={styles.activeLink}
            to={'/admin/'}
            className={styles.webLink}
          >
            Admin Dashboard
          </Link>
        )}
        <Link
          activeClassName={styles.activeLink}
          to={'/account/viewed/'}
          className={styles.webLink}
        >
          Recently Viewed
        </Link>
        <span
          role={'presentation'}
          onClick={handleLogout}
          className={styles.webLink}
        >
          Logout
        </span>
      </div>
    </div>
  );
};

export default AccountNav;
