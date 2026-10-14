
"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "24px 16px",
    background: "#f4f7fb",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e4e8ef",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "22px",
    boxShadow: "0 3px 12px rgba(20, 30, 50, 0.04)",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "16px",
    border: "1px solid #ccd3df",
    borderRadius: "8px",
    fontSize: "16px",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "150px",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "16px",
    border: "1px solid #ccd3df",
    borderRadius: "8px",
    fontSize: "16px",
    resize: "vertical",
  },
  button: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
  },
  primary: {
    background: "#2563eb",
    color: "#ffffff",
  },
  secondary: {
    background: "#e9eef7",
    color: "#243047",
  },
  danger: {
    background: "#fee2e2",
    color: "#b91c1c",
  },
  post: {
    border: "1px solid #e4e8ef",
    borderRadius: "10px",
    padding: "16px",
    marginTop: "14px",
    overflowWrap: "anywhere",
  },
  message: {
    padding: "12px",
    borderRadius: "8px",
    background: "#eff6ff",
    marginBottom: "16px",
    overflowWrap: "anywhere",
  },
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("পোস্ট লোড করা যায়নি: " + error.message);
      return;
    }

    setPosts((data ?? []) as Post[]);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        window.location.replace("/admin/login");
        return;
      }

      setUserEmail(data.user.email ?? "");
      setLoading(true);

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (postError) {
        setMessage("পোস্ট লোড করা যায়নি: " + postError.message);
      } else {
        setPosts((postData ?? []) as Post[]);
      }

      setLoading(false);
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      setMessage("শিরোনাম ও পোস্টের লেখা দুটোই পূরণ করো।");
      return;
    }

    setSaving(true);

    try {
      if (editingId !== null) {
        const { data, error } = await supabase
          .from("posts")
          .update({
            title: cleanTitle,
            content: cleanContent,
          })
          .eq("id", editingId)
          .select("id");

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error(
            "পোস্ট আপডেট হয়নি। Supabase RLS permission পরীক্ষা করো।"
          );
        }

        setMessage("পোস্ট সফলভাবে আপডেট হয়েছে।");
      } else {
        const { data, error } = await supabase
          .from("posts")
          .insert({
            title: cleanTitle,
            content: cleanContent,
          })
          .select("id");

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error(
            "পোস্ট তৈরি হয়নি। Supabase RLS permission পরীক্ষা করো।"
          );
        }

        setMessage("নতুন পোস্ট সফলভাবে তৈরি হয়েছে।");
      }

      resetForm();
      await loadPosts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করো।"
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(post: Post) {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePost(post: Post) {
    const confirmed = window.confirm(
      `“${post.title}” পোস্টটি স্থায়ীভাবে Delete করবে?`
    );

    if (!confirmed) return;

    setMessage("");

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id)
      .select("id");

    if (error) {
      setMessage("পোস্ট Delete হয়নি: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      setMessage(
        "পোস্ট Delete হয়নি। Supabase RLS permission পরীক্ষা করো।"
      );
      return;
    }

    setPosts((current) => current.filter((item) => item.id !== post.id));
    setMessage("পোস্ট Delete হয়েছে।");

    if (editingId === post.id) resetForm();
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Logout করা যায়নি: " + error.message);
      return;
    }

    window.location.replace("/admin/login");
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <h2>ContentBari Admin</h2>
          <p>ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={{ margin: "0 0 8px" }}>ContentBari Admin</h1>
            <p style={{ margin: 0, color: "#667085" }}>
              স্বাগতম {userEmail || "Admin"}
            </p>
          </div>

          <button
            type="button"
            style={{ ...styles.button, ...styles.danger }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        {message && (
          <div role="status" style={styles.message}>
            {message}
          </div>
        )}

        <section style={styles.panel}>
          <h2 style={{ marginTop: 0 }}>
            {editingId !== null ? "✏️ পোস্ট Edit করো" : "➕ নতুন পোস্ট"}
          </h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="post-title">পোস্টের শিরোনাম</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="পোস্টের শিরোনাম লিখো"
              required
              style={styles.input}
            />

            <label htmlFor="post-content">পোস্টের বিস্তারিত</label>
            <textarea
              id="post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="পোস্টের লেখা লিখো"
              required
              style={styles.textarea}
            />

            <div style={styles.titleRow}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.button,
                  ...styles.primary,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving
                  ? "অপেক্ষা করো..."
                  : editingId !== null
                    ? "Update Post"
                    : "Publish Post"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  style={{ ...styles.button, ...styles.secondary }}
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.panel}>
          <div style={styles.titleRow}>
            <div>
              <h2 style={{ margin: 0 }}>📝 সব পোস্ট</h2>
              <p style={{ color: "#667085" }}>
                মোট পোস্ট: {posts.length}
              </p>
            </div>

            <button
              type="button"
              style={{ ...styles.button, ...styles.secondary }}
              onClick={loadPosts}
            >
              Refresh
            </button>
          </div>

          {posts.length === 0 ? (
            <p>এখনো কোনো পোস্ট পাওয়া যায়নি।</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} style={styles.post}>
                <h3 style={{ marginTop: 0 }}>{post.title}</h3>

                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                  {post.content}
                </p>

                <p style={{ color: "#667085", fontSize: "13px" }}>
                  {post.created_at
                    ? new Date(post.created_at).toLocaleString("bn-BD")
                    : ""}
                </p>

                <div style={styles.titleRow}>
                  <button
                    type="button"
                    style={{ ...styles.button, ...styles.primary }}
                    onClick={() => startEdit(post)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={{ ...styles.button, ...styles.danger }}
                    onClick={() => deletePost(post)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <footer style={{ textAlign: "center", color: "#667085" }}>
          ContentBari Admin Dashboard
        </footer>
      </div>
    </main>
  );
              }
    
