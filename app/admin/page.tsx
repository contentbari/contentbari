"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/admin/login";
      return;
    }

    setUserEmail(data.user.email || "");
  }

  async function addPost() {
    setMessage("");

    if (!title.trim() || !content.trim()) {
      setMessage("Title এবং Content লিখুন।");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      title: title.trim(),
      content: content.trim(),
    });

    if (error) {
      setMessage("❌ পোস্ট যোগ করা যায়নি: " + error.message);
      return;
    }

    setTitle("");
    setContent("");
    setMessage("✅ পোস্ট সফলভাবে প্রকাশ হয়েছে!");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 800, margin: "auto" }}>
        <header
          style={{
            background: "#101c3a",
            color: "white",
            padding: 22,
            borderRadius: 15,
            marginBottom: 20,
          }}
        >
          <h1 style={{ margin: 0 }}>ContentBari Admin</h1>
          <p>{userEmail}</p>

          <button
            onClick={logout}
            style={{
              padding: "10px 16px",
              border: 0,
              borderRadius: 8,
              background: "#ef4444",
              color: "white",
            }}
          >
            Logout
          </button>
        </header>

        <section
          style={{
            background: "white",
            padding: 25,
            borderRadius: 15,
          }}
        >
          <h2>📝 নতুন পোস্ট</h2>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="পোস্টের Title"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 13,
              marginBottom: 15,
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 16,
            }}
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="পোস্টের Content"
            rows={8}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 13,
              marginBottom: 15,
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 16,
            }}
          />

          <button
            onClick={addPost}
            style={{
              padding: "13px 22px",
              border: 0,
              borderRadius: 8,
              background: "#315cf5",
              color: "white",
              fontWeight: "bold",
            }}
          >
            প্রকাশ করুন
          </button>

          {message && <p>{message}</p>}
        </section>
      </div>
    </main>
  );
      }
