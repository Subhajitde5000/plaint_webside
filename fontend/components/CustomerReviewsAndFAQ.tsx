"use client";

import { useState } from "react";

const T = {
  text: "#1c1c1c",
  textSecondary: "rgba(28,28,28,0.65)",
  green: "#00b566",
  bg: "#fefcf9",
  bgSecondary: "#f3ede2",
  r2xl: "24px",
  s2: "rgb(202, 223, 212) 0px 0px 0px 1px inset",
};

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  verified: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const REVIEWS: Review[] = [
  {
    id: "1",
    author: "Sarah M.",
    rating: 5,
    date: "2 weeks ago",
    title: "Beautiful plant, thriving in my apartment",
    text: "This Red Anthurium arrived in perfect condition. It's now blooming beautifully in my living room. The care instructions were helpful, and the plant is hardy and forgiving even for beginners.",
    verified: true,
  },
  {
    id: "2",
    author: "James T.",
    rating: 4,
    date: "1 month ago",
    title: "Great quality, excellent packaging",
    text: "Very happy with my purchase. The plant was well-packaged and arrived healthy. It took about a week to settle in, but now it's showing new growth. Highly recommend!",
    verified: true,
  },
  {
    id: "3",
    author: "Emma L.",
    rating: 5,
    date: "1 month ago",
    title: "Stunning focal point for my bedroom",
    text: "The vibrant red blooms are absolutely gorgeous. This plant has become the centerpiece of my bedroom décor. Worth every penny!",
    verified: true,
  },
  {
    id: "4",
    author: "Michael K.",
    rating: 4,
    date: "2 months ago",
    title: "Needs humidity but worth the effort",
    text: "This plant prefers humid conditions, so I had to adjust my care routine slightly. Once I started misting regularly, it's been blooming non-stop. Patience pays off!",
    verified: true,
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "How often should I water my Red Anthurium?",
    answer: "Water twice a week, keeping the soil consistently moist but not waterlogged. Check that the top inch of soil feels dry before watering again. During winter, reduce watering to once per week.",
  },
  {
    id: "2",
    question: "What humidity level does it prefer?",
    answer: "Red Anthuriums thrive in high humidity (60–80%). Mist the leaves regularly, use a pebble tray with water underneath the pot, or place it in a bathroom. A small humidifier nearby also helps significantly.",
  },
  {
    id: "3",
    question: "Can it grow in low-light conditions?",
    answer: "No. While it tolerates bright indirect light, it requires at least 6–8 hours of filtered sunlight daily for healthy blooms. East or north-facing windows work best. Direct sun can scorch the leaves.",
  },
  {
    id: "4",
    question: "Is it toxic to pets?",
    answer: "Yes, Red Anthuriums contain calcium oxalate crystals, making them mildly toxic to cats and dogs. Ingestion causes mouth irritation and drooling. Keep it out of reach of curious pets and small children.",
  },
  {
    id: "5",
    question: "How long do the blooms last?",
    answer: "Individual blooms (spathes) can last 2–3 months, and the plant blooms year-round indoors with proper care. Provide warm temperatures, consistent humidity, and monthly fertilizer during spring and summer to encourage blooming.",
  },
  {
    id: "6",
    question: "When should I repot my plant?",
    answer: "Repot every 12–18 months when you see roots emerging from drainage holes or growth slowing. Spring is the best time. Use a pot just slightly larger (1–2 inches) than the current one and well-draining potting mix.",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: "flex", gap: "4px" }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < rating ? "#c8a84b" : "rgba(28,28,28,0.25)"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <div style={{ background: "white", borderRadius: T.r2xl, padding: "24px", boxShadow: T.s2, marginBottom: "16px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: "15px", color: T.text }}>{review.author}</span>
          {review.verified && <span style={{ fontSize: "11px", background: `${T.green}20`, color: T.green, padding: "2px 8px", borderRadius: "9999px" }}>✓ Verified</span>}
        </div>
        <span style={{ fontSize: "13px", color: T.textSecondary }}>{review.date}</span>
      </div>
      <StarRating rating={review.rating} />
    </div>

    <h4 style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: "15px", color: T.text, marginBottom: "8px" }}>{review.title}</h4>
    <p style={{ fontFamily: "Outfit", fontSize: "14px", color: T.text, lineHeight: "22px", opacity: 0.85 }}>
      {review.text}
    </p>
  </div>
);

const FAQItem = ({ item }: { item: FAQItem }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: "white", borderRadius: T.r2xl, padding: "20px", boxShadow: T.s2, marginBottom: "12px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: "15px", color: T.text, margin: 0 }}>
          {item.question}
        </h4>
        <span style={{ fontSize: "20px", color: T.green, transition: "transform 0.25s ease", transform: expanded ? "rotate(45deg)" : "rotate(0deg)" }}>
          +
        </span>
      </button>

      {expanded && (
        <p style={{
          fontFamily: "Outfit",
          fontSize: "14px",
          color: T.text,
          lineHeight: "22px",
          opacity: 0.8,
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: "1px solid rgba(28,28,28,0.08)",
        }}>
          {item.answer}
        </p>
      )}
    </div>
  );
};

export default function CustomerReviewsAndFAQ() {
  const [activeTab, setActiveTab] = useState<"reviews" | "faq">("reviews");
  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <section style={{ background: T.bgSecondary, padding: "72px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ display: "inline-block", background: `${T.green}14`, color: T.green, borderRadius: "9999px", padding: "6px 18px", fontSize: "13px", fontWeight: 600, marginBottom: "14px" }}>
            ⭐ Customer Reviews & FAQ
          </span>
          <h2 style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 38px)", color: T.text, lineHeight: 1.15, marginBottom: "12px" }}>
            What Our Customers Say
          </h2>
          <p style={{ fontSize: "14px", color: T.textSecondary, maxWidth: "520px", margin: "0 auto", lineHeight: "22.4px" }}>
            Read real reviews from plant lovers and get answers to common questions.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "40px" }}>
          {["reviews", "faq"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "reviews" | "faq")}
              style={{
                padding: "10px 28px",
                borderRadius: "9999px",
                border: "none",
                background: activeTab === tab ? T.green : "transparent",
                color: activeTab === tab ? "white" : T.text,
                fontFamily: "Outfit",
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: activeTab === tab ? T.s2 : "none",
              }}
            >
              {tab === "reviews" ? `Reviews (${REVIEWS.length})` : `FAQ (${FAQ_ITEMS.length})`}
            </button>
          ))}
        </div>

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Rating Summary */}
            <div style={{ background: "white", borderRadius: T.r2xl, padding: "28px", textAlign: "center", marginBottom: "32px", boxShadow: T.s2 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <StarRating rating={Math.round(parseFloat(avgRating))} />
              </div>
              <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "32px", color: T.text }}>{avgRating} out of 5</div>
              <div style={{ fontSize: "13px", color: T.textSecondary, marginTop: "6px" }}>
                Based on {REVIEWS.length} verified reviews
              </div>
            </div>

            {/* Review List */}
            {REVIEWS.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            <button style={{
              width: "100%",
              padding: "14px",
              marginTop: "24px",
              background: "white",
              border: `2px solid ${T.green}`,
              borderRadius: T.r2xl,
              fontFamily: "Outfit",
              fontWeight: 600,
              fontSize: "15px",
              color: T.green,
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${T.green}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
            >
              Write a Review
            </button>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
