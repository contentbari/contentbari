
"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setError("Supabase URL বা Publishable Key পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${url}/rest/v1/posts?select=id,title,content,created_at&order=created_at.desc`,
          {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Database error: ${response.status}`);
        }

        const data: Post[] = await response.json();
        setPosts(data);
      } catch {
        setError("পোস্ট লোড হয়নি। Supabase সেটিংস পরীক্ষা করো।");
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  return (
    <main
      style={{
        maxWidth: 750,
        margin: "35px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>ContentBari Posts</h1>
      <p>তোমার কনটেন্ট এখানে দেখা যাবে।</p>

      {loading && <p>পোস্ট লোড হচ্ছে...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p>এখনো কোনো পোস্ট নেই।</p>
      )}

      {posts.map((post) => (
        <article
          key={post.id}
          style={{
            padding: 18,
            marginTop: 16,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          <h2>{post.title}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {post.content}
          </p>
        </article>
      ))}
    </main>
  );
          }
              
