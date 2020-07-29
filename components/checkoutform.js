import React, { useState, useEffect } from "react";
import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import axios from 'axios';
import styles from "./checkoutform.module.scss"

const APIendpoint = process.env.APIendpoint

export default function CheckoutForm(props) {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    axios.post(`${APIendpoint}/payment`, {items: "testpayment"})
      .then(res => {
        console.log(res.data)
        setClientSecret(res.data.clientSecret);
      });
  }, []);
  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };
  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };
  const handleSubmit = async ev => {
    ev.preventDefault();
    setProcessing(true);
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: ev.target.name.value
        }
      }
    });
    if (payload.error) {
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
      props.paymentSucceed()
    }
  };
  return (
    <form id="payment-form" className={styles.checkout} onSubmit={handleSubmit}>
      <p>ODR <b>EXPRESS</b></p>
      <div className="formgroup">
        <input type="email" placeholder="Email"/>
      </div>

      <CardElement id="card-element" className={styles.cardelement} options={cardStyle} onChange={handleChange} />
      <button
        disabled={processing || disabled || succeeded}
        id="submit"
        className={styles.submit}
      >
        <span id="button-text">
          {processing ? (
            <div 
            className={styles.spinner}
            id="spinner"></div>
          ) : (
            "Pay"
          )}
        </span>
      </button>
      {/* Show any error that happens when processing the payment */}
      {error && (
        <div 
        className={styles.carderror} 
        role="alert">
          {error}
        </div>
      )}
      {/* Show a success message upon completion */}
      <p className={succeeded ? styles.resultmessage: `${styles.resultmessage} ${styles.hidden}`}>
        Payment succeeded
      </p>
    </form>
  );
}