import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { userApi } from "../services/api.js";

const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    userApi
      .get(`/auth/verify-email/${token}`)
      .then(({ data }) => setMessage(data.message))
      .catch((err) => setMessage(err.response?.data?.message || "Verification failed"));
  }, [token]);

  return (
    <div className="auth-card">
      <h2>Email Verification</h2>
      <p>{message}</p>
      <Link to="/login">Go to login</Link>
    </div>
  );
};

export default VerifyEmail;
