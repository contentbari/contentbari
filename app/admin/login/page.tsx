"use client";

import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Supabase connection will be added in the next step.
    // This page is only the login interface for now.

    if (!email || !password) {
      setMessage("Email এবং Password দুটিই দিন।");
      setLoading(false);
      return;
    }

    setMessage("Login system প্রস্তুত হচ্ছে...");
    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fb",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "white",
          padding: 30,
          borderRadius: 18,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>🔐 Admin Login</h1>

        <p style={{ color: "#667085" }}>
          ContentBari Admin Panel
        </p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          style={inputStyle}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Loading..." : "Login"}
        </button>

        {message && (
          <p style={{ marginTop: 18 }}>{message}</p>
        )}
      </form>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px",
  marginTop: 7,
  marginBottom: 18,
  border: "1px solid #d0d5dd",
  borderRadius: 10,
  fontSize: 16,
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  border: "none",
  borderRadius: 10,
  background: "#315cf5",
  color: "white",
  fontSize: 16,
  fontWeight: "bold" as const,
  cursor: "pointer",
};
