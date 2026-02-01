import { useEffect, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { api } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface PayPalButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PayPalButton({ onSuccess, onError }: PayPalButtonProps) {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const [clientId] = useState(import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb'); // Sandbox client ID

  const handleCreateOrder = async () => {
    try {
      const response = await api.createPayPalOrder();
      if (response.success) {
        return response.data.orderId;
      }
      throw new Error('Failed to create PayPal order');
    } catch (error: any) {
      onError?.(error.message || 'Failed to create order');
      throw error;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    try {
      const response = await api.capturePayPalPayment(data.orderID);
      if (response.success) {
        // Update user subscription
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.data) {
          currentUser.data.subscription = response.data.subscription;
          localStorage.setItem('user', JSON.stringify(currentUser));
          setUser(currentUser.data);
        }
        onSuccess?.();
        navigate('/payment/success');
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to capture payment');
    }
  };

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'USD' }}>
      <PayPalButtons
        createOrder={handleCreateOrder}
        onApprove={(data) => handleApprove(data)}
        onError={(err) => {
          onError?.(err.message || 'PayPal error occurred');
        }}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'subscribe',
        }}
      />
    </PayPalScriptProvider>
  );
}
