import { Toaster } from 'react-hot-toast';

export default function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '13px',
          fontWeight: '500',
          borderRadius: '14px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '360px',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1.5px solid #bbf7d0',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        },
        error: {
          style: {
            background: '#fff7f7',
            color: '#991b1b',
            border: '1.5px solid #fecaca',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff7f7',
          },
        },
        loading: {
          style: {
            background: '#f8f7ff',
            color: '#3730a3',
            border: '1.5px solid #e0e7ff',
          },
          iconTheme: {
            primary: '#6366f1',
            secondary: '#f8f7ff',
          },
        },
      }}
    />
  );
}