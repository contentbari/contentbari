
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const notify = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);

    const { data: auth, error: authError } =
      await supabase.auth.getUser();

    if (authError || !auth.user) {
      window.location.replace("/admin/login");
      return;
    }

    setEmail(auth.user.email || "");

    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      notify("পোস্ট লোড করা যায়নি: " + error.message, true);
    } else {
      setPosts((data || []) as Post[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  function startEdit(post: Post) {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setMessage("");
  }

  async function savePost() {
    if (!title.trim() || !content.trim()) {
      notify("Title ও Content দুটোই লিখুন।", true);
      return;
    }

    setSaving(true);
    setMessage("");

    if (editingId !== null) {
      const { data, error } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          content: content.trim(),
        })
        .eq("id", editingId)
        .select("id");

      if (error) {
        notify("পোস্ট Update হয়নি: " + error.message, true);
      } else if (!data || data.length === 0) {
        notify(
          "পোস্ট Update হয়নি। Database UPDATE permission পরীক্ষা করুন।",
          true
        );
      } else {
        notify("✅ পোস্ট সফলভাবে Update হয়েছে।");
        setEditingId(null);
        setTitle("");
        setContent("");
        await loadPosts();
      }
    } else {
      const { error } = await supabase.from("posts").insert({
        title: title.trim(),
        content: content.trim(),
      });

      if (error) {
        notify("পোস্ট যোগ হয়নি: " + error.message, true);
      } else {
        notify("✅ নতুন পোস্ট প্রকাশিত হয়েছে।");
        setTitle("");
        setContent("");
        await loadPosts();
      }
    }

    setSaving(false);
  }

  async function deletePost(post: Post) {
    const confirmed = window.confirm(
      `“${post.title}” পোস্টটি স্থায়ীভাবে মুছবেন?`
    );

    if (!confirmed) return;

    setBusyId(post.id);
    setMessage("");

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id)
      .select("id");

    if (error) {
      notify("পোস্ট Delete হয়নি: " + error.message, true);
    } else if (!data || data.length === 0) {
      notify(
        "Delete permission নেই অথবা পোস্টটি পাওয়া যায়নি।",
        true
      );
    } else {
      setPosts((current) =>
        current.filter((item) => item.id !== post.id)
      );

      if (editingId === post.id) {
        cancelEdit();
      }

      notify("✅ পোস্ট Delete হয়েছে।");
    }

    setBusyId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/admin/login");
  }

  if (loading) {
    return (
      <main style={centerStyle}>
        <p>Dashboard লোড হচ্ছে...</p>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>ContentBari Admin</h1>
            <p style={{ marginBottom: 0 }}>{email}</p>
          </div>

          <button onClick={logout} style={logoutStyle}>
            Logout
          </button>
        </header>

        <section style={panelStyle}>
          <h2>{editingId !== null ? "✏️ পোস্ট Edit" : "➕ নতুন পোস্ট"}</h2>

          <label style={labelStyle}>Post Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="পোস্টের শিরোনাম"
            style={inputStyle}
            maxLength={200}
          />

          <label style={labelStyle}>Post Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="পোস্টের বিস্তারিত লিখুন"
            rows={7}
            style={inputStyle}
          />

          <div style={actionsStyle}>
            <button
              onClick={savePost}
              disabled={saving}
              style={saveStyle}
            >
              {saving
                ? "সংরক্ষণ হচ্ছে..."
                : editingId !== null
                ? "Update Post"
                : "প্রকাশ করুন"}
            </button>

            {editingId !== null && (
              <button
                onClick={cancelEdit}
                disabled={saving}
                style={cancelStyle}
              >
                Cancel
              </button>
            )}
          </div>

          {message && (
            <p
              role="status"
              style={{
                padding: 12,
                borderRadius: 8,
                background: isError ? "#fee2e2" : "#dcfce7",
                color: isError ? "#991b1b" : "#166534",
                overflowWrap: "anywhere",
              }}
            >
              {message}
            </p>
          )}
        </section>

        <section style={panelStyle}>
          <div style={titleRowStyle}>
            <div>
              <h2 style={{ margin: 0 }}>📝 সব পোস্ট</h2>
              <p style={{ color: "#667085" }}>
                মোট পোস্ট: {posts.length}
              </p>
            </div>

            <button
              onClick={() => void loadPosts()}
              style={refreshStyle}
            >
              Refresh
            </button>
          </div>

          {posts.length === 0 ? (
            <p>কোনো পোস্ট নেই।</p>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {posts.map((post) => (
                <article key={post.id} style={postStyle}>
                  <h3 style={{ marginTop: 0 }}>{post.title}</h3>

                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      lineHeight: 1.7,
                    }}
                  >
                    {post.content}
                  </p>

                  <p style={dateStyle}>
                    {new Date(post.created_at).toLocaleString("bn-BD")}
                  </p>

                  <div style={actionsStyle}>
                    <button
                      onClick={() => startEdit(post)}
                      disabled={busyId !== null || saving}
                      style={editStyle}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => void deletePost(post)}
                      disabled={busyId !== null || saving}
                      style={deleteStyle}
                    >
                      {busyId === post.id ? "মুছছে..." : "🗑️ Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const centerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial, sans-serif",
};

const mainStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  padding: "20px 12px",
  fontFamily: "Arial, sans-serif",
  color: "#172033",
};

const containerStyle = {
  maxWidth: 900,
  margin: "0 auto",
};

const headerStyle = {
  background: "#101c3a",
  color: "white",
  padding: 22,
  borderRadius: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap" as const,
  marginBottom: 22,
};

const panelStyle = {
  background: "white",
  padding: 22,
  borderRadius: 14,
  marginBottom: 22,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
};

const labelStyle = {
  display: "block",
  marginBottom: 7,
  fontWeight: "bold" as const,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: 13,
  marginBottom: 16,
  border: "1px solid #d1d5db",
  borderRadius: 9,
  fontSize: 16,
  fontFamily: "inherit",
};

const actionsStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  marginTop: 8,
};

const saveStyle = {
  background: "#315cf5",
  color: "white",
  border: 0,
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold" as const,
};

const cancelStyle = {
  background: "#e5e7eb",
  color: "#111827",
  border: 0,
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
};

const logoutStyle = {
  background: "#475569",
  color: "white",
  border: 0,
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

const refreshStyle = {
  background: "#e0e7ff",
  color: "#273caa",
  border: 0,
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

const editStyle = {
  background: "#2563eb",
  color: "white",
  border: 0,
  padding: "10px 15px",
  borderRadius: 8,
  cursor: "pointer",
};

const deleteStyle = {
  background: "#dc2626",
  color: "white",
  border: 0,
  padding: "10px 15px",
  borderRadius: 8,
  cursor: "pointer",
};

const dateStyle = {
  color: "#667085",
  fontSize: 13,
};
    
