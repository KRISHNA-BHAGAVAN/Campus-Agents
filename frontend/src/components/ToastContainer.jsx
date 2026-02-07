import {CreatePortal} from 'react-dom';
import { useToast } from '../context/ToastContext';


const typeStyles = {
  success: "bg-green-100 border-green-500 text-green-800",
  error: "bg-red-100 border-red-500 text-red-800",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
  info: "bg-blue-100 border-blue-500 text-blue-800",
};


const ToastContainer = () => {
    const { toasts } = useToast();

    return CreatePortal(
         <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <div 
                key={toast.id} 
                className={`animate-toastIn flex items-center justify-between min-w-[300px] p-4 rounded shadow-lg border-l-4 ${typeStyles[toast.type]}`}
                >
                <p className="text-sm font-medium">{toast.message}</p>
                <button 
                    onClick={() => removeToast(toast.id)}
                    className="ml-4 hover:opacity-70"
                >
                    ✕
                </button>
                </div>
            ))}
            </div>,
            document.body
        );
};

export default ToastContainer;