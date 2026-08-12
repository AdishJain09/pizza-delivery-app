import { useState } from "react";
import { userApi } from "../services/api.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await userApi.post("/auth/forgot-password", { email });
    setMessage(data.message);
  };

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send reset link</button>
      </form>
      {message && <p className="success">{message}</p>}
    </div>
  );
};

export default ForgotPassword;
