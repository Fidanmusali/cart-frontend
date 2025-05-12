import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  PaymentElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const cartItems = useSelector(state => state.cart.items);
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!stripe || !elements) {
      return;
    }
  
    setIsProcessing(true);
  
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
        receipt_email: email,
      },
      // Burada redirect: 'if_required' silindi
    });
  
    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    }
  
    // Redirect olduğu üçün əgər ödəniş uğurludursa, istifadəçi avtomatik `return_url`-a yönləndiriləcək.
  };
  

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          required
        />
      </div>
      
      <PaymentElement />
      
      <div className="order-summary">
        <h3>Order Summary</h3>
        <ul>
          {cartItems.map(item => (
            <li key={item.id}>
              {item.name} - ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <div className="total">
          <strong>Total: ${calculateTotal().toFixed(2)}</strong>
        </div>
      </div>
      
      <button disabled={isProcessing || !stripe || !elements}>
        {isProcessing ? "Processing..." : `Pay $${calculateTotal().toFixed(2)}`}
      </button>
      
      {message && <div className="payment-message">{message}</div>}
    </form>
  );
};

export default CheckoutForm;