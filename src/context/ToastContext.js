import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from '../components/Toast/Toast';

const defaultState = {
  message: '',
  show: false,
  type: 'success',
};

export const ToastContext = createContext({
  ...defaultState,
  showToast: () => {},
  closeToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(defaultState);

  const showToast = useCallback(({ message, type = 'success', duration = 3000 }) => {
    setToast({ message, type, show: true });
    if (duration && duration > 0) {
      setTimeout(() => {
        setToast((t) => ({ ...t, show: false }));
      }, duration);
    }
  }, []);

  const closeToast = useCallback(() => {
    setToast((t) => ({ ...t, show: false }));
  }, []);

  return (
    <ToastContext.Provider
      value={{ ...toast, showToast, closeToast }}
    >
      {children}
      <Toast message={toast.message} show={toast.show} onClose={closeToast} type={toast.type} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export default ToastContext;
