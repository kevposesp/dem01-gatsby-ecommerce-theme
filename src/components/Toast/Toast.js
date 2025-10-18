import React, { useEffect } from 'react';
import * as styles from './Toast.module.css';
import Icon from '../Icons/Icon';

const Toast = ({ message, show, onClose, type = 'success' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`${styles.toast} ${show ? styles.toastShow : styles.toastHide}`}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <Icon symbol={'check'} />
        </div>
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
