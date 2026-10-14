
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      <header
        style={{
          background: "#101c3a",
          color: "white",
          padding: "22px 16px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 30 }}>
          ContentBari
        </h1>
        <p style={{ marginBottom: 0 }}>
          Your Ideas, Our Intelligence
        </p>
      </header>

      <section
        style={{
          maxWidth: 850,
          margin: "35px auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 18,
            padding: 25,
            boxShadow: "0 5px 25px #15264a12",
          }}
        >
          <p style={{ color: "#315cf5", fontWeight: "bold" }}>
            WELCOME TO CONTENTBARI
          </p>

          <h2 style={{ fontSize: 30, marginBottom: 12 }}>
            তোমার আইডিয়া, তোমার ডিজিটাল দুনিয়া
          </h2>

          <p style={{ color: "#5b6475", lineHeight: 1.8 }}>
            ContentBari-তে স্বাগতম। এখানে ভবিষ্যতে
            AI Tools, বাংলা কনটেন্ট, দরকারি তথ্য
            এবং নতুন নতুন ফিচার যুক্ত করা হবে।
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 15,
              marginTop: 25,
            }}
          >
            <div style={cardStyle}>
              <h3>🤖 AI Tools</h3>
              <p>স্মার্ট AI ফিচার ব্যবহারের সুবিধা।</p>
            </div>

            <div style={cardStyle}>
              <h3>📝 Content</h3>
              <p>লেখালেখি ও কনটেন্টের নতুন অভিজ্ঞতা।</p>
            </div>

            <div style={cardStyle}>
              <h3>⚙️ Dashboard</h3>
              <p>ভবিষ্যতের অ্যাডমিন প্যানেলের ভিত্তি।</p>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: 24,
          color: "#687386",
        }}
      >
        © 2026 ContentBari. All rights reserved.
      </footer>
    </main>
  );
}

const cardStyle = {
  background: "#f4f7ff",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e0e7ff",
};
          
