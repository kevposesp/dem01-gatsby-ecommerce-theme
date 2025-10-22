import React, { useEffect, useState } from 'react';
import { Link, navigate } from 'gatsby';

import Config from '../config.json';
import Icon from '../../Icons/Icon';

import * as styles from './Sidebar.module.css';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = ({ sidebarOpen, onToggleSidebar }) => {
  const { user } = useAuth();

  const [subMenu, setSubMenu] = useState();
  const [category, setCategory] = useState();
  const [depth, setDepth] = useState(0);

  const handleLogout = () => {
    window.localStorage.removeItem('key');
    navigate('/');
    onToggleSidebar();
  };

  return (
    <div className={styles.root} style={{
      left: sidebarOpen ? '0' : `-${Config.sidebarConfig.width}px`,
      width: `${Config.sidebarConfig.width}px`
    }}>
      {sidebarOpen}
      <nav>
        <div className={styles.headerAuth}>
          {depth === 0 && !user && (
            <div className={styles.authLinkContainer}>
              <Link to={'/signup'}>Sign Up</Link>
              <Link to={'/login'}>Login</Link>
            </div>
          )}

          {depth === 0 && user && (
            <div
              className={styles.welcomeContainer}
              role={'presentation'}
              // onClick={() => setDepth(-1)}
            >
              <span className={styles.welcomeMessage}>Welcome, {user.firstName}</span>
              {/* <Icon symbol={'caret'}></Icon> */}
            </div>
          )}

          {depth === -1 && user && (
            <div
              className={styles.previousLinkContainer}
              onClick={() => setDepth(0)}
              role={'presentation'}
            >
              <div className={styles.previousIcon}>
                <Icon symbol={'caret'}></Icon>
              </div>
              <span>my account</span>
            </div>
          )}

          {depth === 1 && (
            <div
              className={styles.previousLinkContainer}
              onClick={() => setDepth(0)}
              role={'presentation'}
            >
              <div className={styles.previousIcon}>
                <Icon symbol={'caret'}></Icon>
              </div>
              <span>{category.menuLabel}</span>
            </div>
          )}

          {depth === 2 && (
            <div
              className={styles.previousLinkContainer}
              onClick={() => setDepth(1)}
              role={'presentation'}
            >
              <div className={styles.previousIcon}>
                <Icon symbol={'caret'}></Icon>
              </div>
              <span>{subMenu.categoryLabel}</span>
            </div>
          )}
        </div>

        <div className={styles.mobileNavContainer}>
          {/* dynamic portion */}
          {depth === 0 && (
            <div>
              {Config.sidebarLinks.map((navObject) => {
                const hasSubmenu = Array.isArray(navObject.category) && navObject.category.length > 0;

                if (hasSubmenu) {
                  return (
                    <div
                      key={navObject.menuLabel}
                      className={`${styles.mobileLink}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setDepth(1);
                        setCategory(navObject);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && setDepth(1)}
                    >
                      {navObject.menuLabel}
                      <Icon symbol={'caret'} />
                    </div>
                  );
                }

                return (
                  <Link
                    key={navObject.menuLink}
                    className={`${styles.mobileLink}`}
                    to={navObject.menuLink}
                    onClick={onToggleSidebar}
                  >
                    {navObject.menuLabel}
                  </Link>
                );
              })}

              <div className={styles.navFooter}>
                <Link to={'/favorites'}>
                  <Icon symbol={'heart'} />
                  Favorites (0)
                </Link>
              </div>
            </div>
          )}

          {depth === 1 &&
            category.category.map((menuItem) => {
              const hasSubmenu = Array.isArray(menuItem.submenu) && menuItem.submenu.length > 0;

              if (hasSubmenu) {
                return (
                  <div
                    key={menuItem.categoryLabel}
                    className={`${styles.mobileLink}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setDepth(2);
                      setSubMenu(menuItem);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && setDepth(2)}
                  >
                    {menuItem.categoryLabel}
                    <Icon symbol={'caret'} />
                  </div>
                );
              }

              return (
                <Link
                  key={menuItem.categoryLabel}
                  to={menuItem.menuLink || '#'}
                  className={`${styles.mobileLink}`}
                  onClick={onToggleSidebar}
                >
                  {menuItem.categoryLabel}
                </Link>
              );
            })}

          {depth === 2 &&
            subMenu.submenu.map((menuItem) => {
              return (
                <Link
                  key={menuItem.menuLabel}
                  to={menuItem.menuLink}
                  className={`${styles.edgeLink}`}
                >
                  {menuItem.menuLabel}
                </Link>
              );
            })}

          {/* {depth === -1 && (
            <>
              <div>
                <Link to={'/account/orders/'} className={styles.mobileLink}>
                  Orders
                </Link>
                <Link to={'/account/address/'} className={styles.mobileLink}>
                  Addresses
                </Link>
                <Link to={'/account/settings/'} className={styles.mobileLink}>
                  Settings
                </Link>
                <Link to={'/account/favorites/'} className={styles.mobileLink}>
                  Favorites
                </Link>
                <Link to={'/account/viewed/'} className={styles.mobileLink}>
                  Recently Viewed
                </Link>
              </div>
              <div className={styles.navFooter}>
                <div
                  className={styles.logoutContainer}
                  role={'presentation'}
                  onClick={handleLogout}
                >
                  <Icon symbol={'logout'} />
                  <span>Sign out </span>
                </div>
              </div>
            </>
          )} */}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
