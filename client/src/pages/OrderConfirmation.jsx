import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useGetEventByIdQuery } from '../redux/services/eventService';
import api from '../services/axios';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ clientSecret, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/order-confirmation/${orderId}?payment_success=true` },
      redirect: 'if_required',
    });
    if (error) {
      toast.error(error.message);
      setProcessing(false);
    } else {
      await api.post('/payments/confirm', { paymentIntentId: clientSecret });
      toast.success('Payment successful!');
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="font-display text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-400 text-sm mb-6">Your tickets have been confirmed. Check your email for details.</p>
        <Link to="/dashboard/tickets" className="gradient-btn px-6 py-3 rounded-xl text-sm font-medium inline-block">View My Tickets</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || processing} className="gradient-btn w-full py-3 rounded-xl text-sm font-medium mt-6 disabled:opacity-50">
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const ticketsParam = searchParams.get('tickets');
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentSuccess) {
      setLoading(false);
      return;
    }
    const initPayment = async () => {
      try {
        const tickets = ticketsParam ? JSON.parse(ticketsParam) : [];
        const res = await api.post('/tickets/purchase', { eventId: orderId, tickets });
        setClientSecret(res.data.data.clientSecret);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to initiate purchase');
      } finally {
        setLoading(false);
      }
    };
    initPayment();
  }, [orderId, ticketsParam, paymentSuccess]);

  if (loading) return <div className="text-center py-20 text-gray-500">Processing...</div>;

  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 text-sm mb-8">Check your dashboard for tickets.</p>
        <Link to="/dashboard/tickets" className="gradient-btn px-6 py-3 rounded-xl text-sm font-medium">View Tickets</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">Complete Purchase</h1>
      <p className="text-gray-400 text-sm mb-8">Enter your payment details below</p>
      <div className="glass rounded-2xl p-6">
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
          </Elements>
        ) : (
          <p className="text-gray-500 text-sm">Setting up payment...</p>
        )}
      </div>
    </div>
  );
}
