import { useState, useCallback, useContext, createContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    //remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
    }, []);


    return (
      <ToastContext.Provider value={{ showToast, toasts }}>
        {children}
      </ToastContext.Provider>
    );
};

export const useToast = () => {
    if(!ToastContext) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return useContext(ToastContext);
};