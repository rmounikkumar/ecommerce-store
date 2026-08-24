import { site } from '../config/site';

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout({ payment, orderNumber, name, email, contact }) {
  return new Promise(resolve => {
    const options = {
      key: payment.keyId,
      amount: payment.amount,
      currency: 'INR',
      name: site.name,
      description: `Order #${orderNumber}`,
      order_id: payment.orderId,
      handler: response => resolve(response),
      prefill: {
        name,
        email,
        contact: contact || undefined
      },
      notes: { order: orderNumber },
      theme: {
        color: '#2874F0'
      },
      modal: {
        ondismiss: () => resolve(null)
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => resolve(null));
    rzp.open();
  });
}
