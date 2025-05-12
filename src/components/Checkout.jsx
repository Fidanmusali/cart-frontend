import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Replace with your publishable key
const stripePromise = loadStripe('pk_test_your_publishable_key');

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const cartItems = useSelector(state => state.cart.items);
  
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: calculateTotal(),
            currency: 'usd'
          }),
        });
        
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error('Failed to get client secret:', data);
        }
      } catch (error) {
        console.error('Error fetching payment intent:', error);
      }
    };

    if (cartItems.length > 0) {
      fetchPaymentIntent();
    }
  }, [cartItems]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4f46e5',
    },
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      ) : (
        <p>Loading payment form...</p>
      )}
    </div>
  );
};

export default Checkout;