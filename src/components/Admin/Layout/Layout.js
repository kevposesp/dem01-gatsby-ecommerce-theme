import React, { useState } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';

import Header from '../Header';
import Sidebar from '../Sidebar';
import * as styles from './Layout.module.css';
import Config from '../config.json';

import './Globals.css';

const Layout = ({ props, children, disablePaddingBottom = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      <main
        className={`${styles.main} ${disablePaddingBottom === true ? styles.disablePaddingBottom : ''
          }`}
      >
        <Sidebar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className={styles.content} style={{ marginLeft: sidebarOpen ? `${Config.sidebarConfig.width}px` : '0' }}>
          {children}
        </div>
      </main>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
