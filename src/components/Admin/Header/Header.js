import React from 'react';

import Brand from '../../Brand';
import Icon from '../../Icons/Icon';
import * as styles from './Header.module.css';

const Header = ({ sidebarOpen, onToggleSidebar }) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div
          role={'presentation'}
          onClick={onToggleSidebar}
          className={styles.burgerIcon}
        >
          <Icon symbol={`${sidebarOpen === true ? 'cross' : 'burger'}`}></Icon>
        </div>
        <Brand />
      </div>
    </div>
  );
};

export default Header;
