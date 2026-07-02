/* ─── Types ──────────────────────────────────────────────────────────────────── */
export type QueryStatus = "normal" | "flagged" | "reviewed";
export type QueryRating = "helpful" | "not_helpful" | null;
export type QuerySource = "chat" | "photo" | "room_visualiser" | "quick_prompt";
export type FlagReason =
  | "harmful_advice"
  | "inappropriate_content"
  | "privacy_concern"
  | "spam_bot"
  | "other";

export interface PlantIdResult {
  plantName: string;
  confidence: number; // 0–100
  identified: boolean;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  price: number;
  addedToCart: boolean;
  deleted?: boolean;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  rating?: QueryRating; // only after AI messages
  productSuggestions?: ProductSuggestion[];
  aiUnavailable?: boolean;
}

export interface QueryLog {
  id: string;
  userId: string | null; // null = guest
  userName: string;
  userEmail: string;
  userAvatar: string;
  query: string; // first message text
  hasPhoto: boolean;
  photoUrl?: string;
  plantIdResult?: PlantIdResult;
  rating: QueryRating;
  converted: boolean;
  conversionAmount?: number;
  source: QuerySource;
  status: QueryStatus;
  flagReason?: FlagReason;
  flagNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  date: string;
  dateAbsolute: string;
  device: string;
  os: string;
  browser: string;
  sessionTurns: number;
  sessionDuration: string;
  conversation: ConversationMessage[];
}

export interface KpiData {
  totalQueries: number;
  totalQueriesTrend: number;
  uniqueUsers: number;
  uniqueUsersTrend: number;
  photoUploads: number;
  photoUploadsPercent: number;
  helpfulRating: number;
  helpfulRatingTrend: number;
  cartConversionRate: number;
  cartConversionRevenue: number;
  flaggedRate: number;
  flaggedCount: number;
}

export interface TopQuestion {
  rank: number;
  topic: string;
  count: number;
  avgRating: number;
}

export interface PlantUpload {
  plantName: string;
  count: number;
}

export interface FunnelStep {
  label: string;
  count: number;
}

export interface AISettings {
  enabledOnStorefront: boolean;
  showOnPDP: boolean;
  showOnDedicatedPage: boolean;
  showFloatingWidget: boolean;
  allowPhotoUploads: boolean;
  roomVisualiserMode: boolean;
  quickPromptsOnOpen: boolean;
  productRecommendations: boolean;
  allowConversationHistory: boolean;
  language: string;
  tone: string;
  maxResponseWords: number;
  fallbackMessage: string;
  blockHarmfulAdvice: boolean;
  autoFlagProfanity: boolean;
  autoFlagPII: boolean;
  logConversations: boolean;
  retentionDays: string;
  showConversationNotice: boolean;
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */
export const FLAG_REASONS: { value: FlagReason; label: string; description: string }[] = [
  { value: "harmful_advice", label: "Harmful/dangerous advice", description: "AI gave incorrect plant care that could harm the plant" },
  { value: "inappropriate_content", label: "Inappropriate content", description: "Customer or AI response contains inappropriate language" },
  { value: "privacy_concern", label: "Privacy concern (PII)", description: "PII shared in conversation" },
  { value: "spam_bot", label: "Spam/bot behaviour", description: "Looks like automated query" },
  { value: "other", label: "Other", description: "Admin must specify in note" },
];

/* ─── Mock KPI Data ──────────────────────────────────────────────────────────── */
export const KPI_DATA: KpiData = {
  totalQueries: 14821,
  totalQueriesTrend: 18.4,
  uniqueUsers: 3204,
  uniqueUsersTrend: 4.2,
  photoUploads: 6234,
  photoUploadsPercent: 42,
  helpfulRating: 78,
  helpfulRatingTrend: 2.1,
  cartConversionRate: 12.4,
  cartConversionRevenue: 48320,
  flaggedRate: 3.2,
  flaggedCount: 474,
};

/* ─── Volume Chart Data ──────────────────────────────────────────────────────── */
export const VOLUME_DATA_DAILY = Array.from({ length: 30 }, (_, i) => {
  const base = 420 + Math.sin(i * 0.4) * 80 + Math.random() * 60;
  const photos = base * (0.38 + Math.random() * 0.08);
  const converted = base * (0.10 + Math.random() * 0.05);
  const date = new Date(2026, 5, 1 + i);
  return {
    label: `Jun ${i + 1}`,
    total: Math.round(base),
    photos: Math.round(photos),
    converted: Math.round(converted),
  };
});

export const VOLUME_DATA_WEEKLY = Array.from({ length: 8 }, (_, i) => ({
  label: `Week ${i + 1}`,
  total: 2800 + Math.round(Math.sin(i * 0.8) * 400 + Math.random() * 200),
  photos: 1100 + Math.round(Math.random() * 300),
  converted: 340 + Math.round(Math.random() * 100),
}));

export const VOLUME_DATA_MONTHLY = Array.from({ length: 6 }, (_, i) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return {
    label: months[i],
    total: 10000 + Math.round(Math.sin(i * 0.5) * 2000 + Math.random() * 1000),
    photos: 4000 + Math.round(Math.random() * 800),
    converted: 1200 + Math.round(Math.random() * 300),
  };
});

/* ─── Satisfaction Data ──────────────────────────────────────────────────────── */
export const SATISFACTION_DATA = [
  { label: "Helpful", icon: "👍", count: 3842, percent: 78, color: "#57ab5a" },
  { label: "Not helpful", icon: "👎", count: 591, percent: 12, color: "#e5534b" },
  { label: "No rating", icon: "—", count: 493, percent: 10, color: "#444c56" },
];

/* ─── Top Questions ──────────────────────────────────────────────────────────── */
export const TOP_QUESTIONS: TopQuestion[] = [
  { rank: 1, topic: "Why are my leaves turning yellow?", count: 824, avgRating: 84 },
  { rank: 2, topic: "How often should I water Monstera?", count: 612, avgRating: 91 },
  { rank: 3, topic: "Best plants for low light?", count: 488, avgRating: 76 },
  { rank: 4, topic: "Is my plant overwatered?", count: 421, avgRating: 69 },
  { rank: 5, topic: "How to propagate pothos?", count: 398, avgRating: 88 },
  { rank: 6, topic: "Why are leaf tips brown?", count: 367, avgRating: 72 },
  { rank: 7, topic: "Best fertiliser for indoor plants?", count: 312, avgRating: 82 },
  { rank: 8, topic: "Is this plant toxic to cats?", count: 289, avgRating: 94 },
  { rank: 9, topic: "How to repot a plant?", count: 251, avgRating: 87 },
  { rank: 10, topic: "What causes root rot?", count: 234, avgRating: 56 },
  { rank: 11, topic: "How much sunlight does a succulent need?", count: 218, avgRating: 79 },
  { rank: 12, topic: "Best plants for bathroom?", count: 204, avgRating: 83 },
  { rank: 13, topic: "Pest identification on leaves", count: 197, avgRating: 61 },
  { rank: 14, topic: "How to treat white spots on leaves?", count: 183, avgRating: 58 },
  { rank: 15, topic: "When to water succulents?", count: 176, avgRating: 90 },
];

/* ─── Plant ID Data ──────────────────────────────────────────────────────────── */
export const PLANT_ID_STATS = {
  identified: 82,
  lowConfidence: 11,
  failed: 7,
  totalRequests: 6234,
};

export const MOST_UPLOADED_PLANTS: PlantUpload[] = [
  { plantName: "Monstera Deliciosa", count: 1204 },
  { plantName: "Pothos", count: 842 },
  { plantName: "Snake Plant", count: 612 },
  { plantName: "ZZ Plant", count: 488 },
  { plantName: "Peace Lily", count: 401 },
  { plantName: "Rubber Plant", count: 334 },
  { plantName: "Spider Plant", count: 289 },
];

/* ─── Funnel Data ────────────────────────────────────────────────────────────── */
export const FUNNEL_DATA: FunnelStep[] = [
  { label: "Total AI queries", count: 14821 },
  { label: "Received suggestion", count: 11240 },
  { label: "Clicked suggestion", count: 2812 },
  { label: "Added to cart", count: 1840 },
  { label: "Completed checkout", count: 824 },
];

/* ─── Query Source Data ──────────────────────────────────────────────────────── */
export const SOURCE_DATA = [
  { label: "Chat (text only)", percent: 58, color: "#00b566", source: "chat" as QuerySource },
  { label: "Photo upload", percent: 42, color: "#539bf5", source: "photo" as QuerySource },
  { label: "Room Visualiser", percent: 8, color: "#986ee2", source: "room_visualiser" as QuerySource },
  { label: "Quick prompts", percent: 24, color: "#c69026", source: "quick_prompt" as QuerySource },
];

/* ─── DAU Data ───────────────────────────────────────────────────────────────── */
export const DAU_DATA = Array.from({ length: 30 }, (_, i) => ({
  label: `Jun ${i + 1}`,
  count: Math.round(80 + Math.sin(i * 0.5) * 30 + Math.random() * 40),
}));

/* ─── Mock Query Log ─────────────────────────────────────────────────────────── */
export const MOCK_QUERIES: QueryLog[] = [
  {
    id: "q001",
    userId: "u001",
    userName: "Priya Kumar",
    userEmail: "priya@email.com",
    userAvatar: "PK",
    query: "Why are my Monstera leaves turning yellow?",
    hasPhoto: true,
    photoUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80",
    plantIdResult: { plantName: "Monstera Deliciosa", confidence: 94, identified: true },
    rating: "helpful",
    converted: true,
    conversionAmount: 499,
    source: "photo",
    status: "normal",
    date: "2 hours ago",
    dateAbsolute: "15 Jun 2026 · 2:30 PM",
    device: "Mobile",
    os: "iOS",
    browser: "Chrome",
    sessionTurns: 4,
    sessionDuration: "3 min 22 sec",
    conversation: [
      { id: "m1", role: "user", content: "Why are my Monstera leaves turning yellow?", timestamp: "2:30:04 PM" },
      {
        id: "m2", role: "ai",
        content: "Yellow leaves on a Monstera can indicate overwatering, low light, or nutrient deficiency. Here are some steps to try:\n\n1. Check soil moisture before watering — the top 2–3 cm should be dry\n2. Move to a brighter location with indirect light\n3. Consider a balanced liquid fertiliser every 4 weeks during growing season",
        timestamp: "2:30:06 PM",
        rating: "helpful",
        productSuggestions: [{ id: "p001", name: "Monstera Care Kit", price: 499, addedToCart: true }],
      },
      { id: "m3", role: "user", content: "It's also getting some brown spots.", timestamp: "2:32:18 PM" },
      {
        id: "m4", role: "ai",
        content: "Brown spots alongside yellow leaves typically suggest leaf burn from direct sun or mineral build-up from tap water. Try moving your Monstera away from harsh afternoon sun and use filtered or rainwater for a month to see if it improves.",
        timestamp: "2:32:20 PM",
        rating: null,
      },
    ],
  },
  {
    id: "q002",
    userId: null,
    userName: "Guest",
    userEmail: "",
    userAvatar: "G",
    query: "Best plants for bedroom?",
    hasPhoto: false,
    rating: "not_helpful",
    converted: false,
    source: "chat",
    status: "normal",
    date: "3 hours ago",
    dateAbsolute: "15 Jun 2026 · 1:15 PM",
    device: "Desktop",
    os: "Windows",
    browser: "Firefox",
    sessionTurns: 2,
    sessionDuration: "1 min 05 sec",
    conversation: [
      { id: "m1", role: "user", content: "Best plants for bedroom?", timestamp: "1:15:00 PM" },
      {
        id: "m2", role: "ai",
        content: "Great plants for bedrooms include: Snake Plant (very low maintenance), Pothos (trailing vines, thrives in low light), Peace Lily (purifies air), and ZZ Plant (drought-tolerant). Would you like care tips for any of these?",
        timestamp: "1:15:02 PM",
        rating: "not_helpful",
      },
    ],
  },
  {
    id: "q003",
    userId: "u003",
    userName: "Ravi Shah",
    userEmail: "ravi@email.com",
    userAvatar: "RS",
    query: "Identify this plant please",
    hasPhoto: true,
    photoUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80",
    plantIdResult: { plantName: "Pothos (Epipremnum aureum)", confidence: 87, identified: true },
    rating: null,
    converted: true,
    conversionAmount: 299,
    source: "photo",
    status: "reviewed",
    reviewedBy: "Suresh K.",
    reviewedAt: "14 Jun 2026",
    reviewNote: "Not actually inappropriate — false positive.",
    date: "1 day ago",
    dateAbsolute: "14 Jun 2026 · 4:20 PM",
    device: "Mobile",
    os: "Android",
    browser: "Chrome",
    sessionTurns: 3,
    sessionDuration: "2 min 10 sec",
    conversation: [
      { id: "m1", role: "user", content: "Identify this plant please", timestamp: "4:20:00 PM" },
      {
        id: "m2", role: "ai",
        content: "Based on your photo, this appears to be a Pothos (Epipremnum aureum) — also known as Devil's Ivy. It's one of the most popular indoor plants! It's very easy to care for and can tolerate low light and irregular watering.",
        timestamp: "4:20:03 PM",
        rating: null,
        productSuggestions: [{ id: "p002", name: "Pothos Starter Pack", price: 299, addedToCart: true }],
      },
      { id: "m3", role: "user", content: "Great! How do I propagate it?", timestamp: "4:21:30 PM" },
      {
        id: "m4", role: "ai",
        content: "Propagating Pothos is easy! Cut a stem just below a node (the little bump where leaves grow). Remove lower leaves, place in water until roots are 2–3 cm long, then pot in moist soil.",
        timestamp: "4:21:32 PM",
        rating: null,
      },
    ],
  },
  {
    id: "q004",
    userId: "u004",
    userName: "Anjali Mehta",
    userEmail: "anjali@email.com",
    userAvatar: "AM",
    query: "How do I kill fungus gnats in my soil?",
    hasPhoto: false,
    rating: "helpful",
    converted: false,
    source: "quick_prompt",
    status: "flagged",
    flagReason: "spam_bot",
    flagNote: "Unusual query volume from same IP",
    date: "2 days ago",
    dateAbsolute: "13 Jun 2026 · 10:00 AM",
    device: "Mobile",
    os: "iOS",
    browser: "Safari",
    sessionTurns: 1,
    sessionDuration: "0 min 45 sec",
    conversation: [
      { id: "m1", role: "user", content: "How do I kill fungus gnats in my soil?", timestamp: "10:00:00 AM" },
      {
        id: "m2", role: "ai",
        content: "To eliminate fungus gnats: let soil dry out completely between waterings (gnats need moist soil to breed), apply sticky yellow traps near the pot, and use a diluted hydrogen peroxide solution (1 part 3% H2O2 + 4 parts water) to drench the soil — this kills larvae without harming your plant.",
        timestamp: "10:00:03 AM",
        rating: "helpful",
      },
    ],
  },
  {
    id: "q005",
    userId: "u005",
    userName: "Deepak Nair",
    userEmail: "deepak@email.com",
    userAvatar: "DN",
    query: "Is Dieffenbachia toxic to dogs?",
    hasPhoto: false,
    rating: "helpful",
    converted: false,
    source: "chat",
    status: "normal",
    date: "2 days ago",
    dateAbsolute: "13 Jun 2026 · 9:15 AM",
    device: "Desktop",
    os: "macOS",
    browser: "Chrome",
    sessionTurns: 2,
    sessionDuration: "1 min 30 sec",
    conversation: [
      { id: "m1", role: "user", content: "Is Dieffenbachia toxic to dogs?", timestamp: "9:15:00 AM" },
      {
        id: "m2", role: "ai",
        content: "Yes, Dieffenbachia (Dumb Cane) is toxic to dogs and cats. It contains calcium oxalate crystals which can cause intense oral irritation, drooling, difficulty swallowing, and vomiting if ingested. Keep it out of reach of pets. If your dog has chewed on it, contact your vet immediately.",
        timestamp: "9:15:02 AM",
        rating: "helpful",
      },
    ],
  },
  {
    id: "q006",
    userId: "u006",
    userName: "Sunita Joshi",
    userEmail: "sunita@email.com",
    userAvatar: "SJ",
    query: "My ZZ plant has black stems, is it dying?",
    hasPhoto: true,
    photoUrl: "https://images.unsplash.com/photo-1620127807580-990c3eceChronicles?w=400&q=80",
    plantIdResult: { plantName: "ZZ Plant (Zamioculcas zamiifolia)", confidence: 72, identified: true },
    rating: "not_helpful",
    converted: false,
    source: "photo",
    status: "normal",
    date: "3 days ago",
    dateAbsolute: "12 Jun 2026 · 3:45 PM",
    device: "Tablet",
    os: "Android",
    browser: "Chrome",
    sessionTurns: 3,
    sessionDuration: "2 min 45 sec",
    conversation: [
      { id: "m1", role: "user", content: "My ZZ plant has black stems, is it dying?", timestamp: "3:45:00 PM" },
      {
        id: "m2", role: "ai",
        content: "Black stems on a ZZ Plant usually indicate overwatering and root rot. ZZ Plants are extremely drought-tolerant. Try: 1. Remove from pot and inspect roots — cut off any black/mushy ones. 2. Let roots air dry for a day. 3. Repot in fresh, well-draining soil. 4. Water only when soil is bone dry.",
        timestamp: "3:45:04 PM",
        rating: "not_helpful",
      },
    ],
  },
  {
    id: "q007",
    userId: "u007",
    userName: "Vikram Patel",
    userEmail: "vikram@email.com",
    userAvatar: "VP",
    query: "Best soil for cacti and succulents?",
    hasPhoto: false,
    rating: "helpful",
    converted: true,
    conversionAmount: 349,
    source: "quick_prompt",
    status: "normal",
    date: "3 days ago",
    dateAbsolute: "12 Jun 2026 · 11:20 AM",
    device: "Mobile",
    os: "iOS",
    browser: "Safari",
    sessionTurns: 2,
    sessionDuration: "1 min 15 sec",
    conversation: [
      { id: "m1", role: "user", content: "Best soil for cacti and succulents?", timestamp: "11:20:00 AM" },
      {
        id: "m2", role: "ai",
        content: "Cacti and succulents need fast-draining soil. Use a mix of 50% coarse sand or perlite with 50% standard potting mix. Avoid moisture-retaining soils. Commercial cactus soil mixes work well and are convenient.",
        timestamp: "11:20:02 AM",
        rating: "helpful",
        productSuggestions: [{ id: "p003", name: "Succulent & Cactus Soil Mix 5L", price: 349, addedToCart: true }],
      },
    ],
  },
  {
    id: "q008",
    userId: null,
    userName: "Guest",
    userEmail: "",
    userAvatar: "G",
    query: "How to care for a Fiddle Leaf Fig?",
    hasPhoto: false,
    rating: null,
    converted: false,
    source: "chat",
    status: "normal",
    date: "4 days ago",
    dateAbsolute: "11 Jun 2026 · 5:00 PM",
    device: "Desktop",
    os: "Windows",
    browser: "Edge",
    sessionTurns: 5,
    sessionDuration: "4 min 10 sec",
    conversation: [
      { id: "m1", role: "user", content: "How to care for a Fiddle Leaf Fig?", timestamp: "5:00:00 PM" },
      {
        id: "m2", role: "ai",
        content: "Fiddle Leaf Figs (Ficus lyrata) are beautiful but a little particular. Key care tips:\n\n• **Light**: Bright, indirect light — near a window but no harsh afternoon sun\n• **Water**: Water when the top 2.5 cm of soil is dry; avoid overwatering\n• **Humidity**: Mist leaves occasionally or use a pebble tray\n• **Stability**: They hate being moved — find a good spot and leave them there!",
        timestamp: "5:00:04 PM",
        rating: null,
      },
    ],
  },
  {
    id: "q009",
    userId: "u009",
    userName: "Meera Reddy",
    userEmail: "meera@email.com",
    userAvatar: "MR",
    query: "Why is my peace lily drooping?",
    hasPhoto: false,
    rating: "helpful",
    converted: true,
    conversionAmount: 199,
    source: "chat",
    status: "flagged",
    flagReason: "inappropriate_content",
    flagNote: "User sent follow-up with offensive language in subsequent message",
    date: "5 days ago",
    dateAbsolute: "10 Jun 2026 · 8:30 AM",
    device: "Mobile",
    os: "Android",
    browser: "Chrome",
    sessionTurns: 3,
    sessionDuration: "2 min 00 sec",
    conversation: [
      { id: "m1", role: "user", content: "Why is my peace lily drooping?", timestamp: "8:30:00 AM" },
      {
        id: "m2", role: "ai",
        content: "A drooping Peace Lily is almost always thirsty! Peace Lilies are dramatic when they need water — give it a thorough watering and it should perk up within 30–60 minutes. Going forward, water when the top layer of soil feels dry.",
        timestamp: "8:30:02 AM",
        rating: "helpful",
        productSuggestions: [{ id: "p004", name: "Peace Lily (Medium)", price: 199, addedToCart: true }],
      },
    ],
  },
  {
    id: "q010",
    userId: "u010",
    userName: "Arjun Singh",
    userEmail: "arjun@email.com",
    userAvatar: "AS",
    query: "What are air-purifying plants for office?",
    hasPhoto: false,
    rating: "helpful",
    converted: true,
    conversionAmount: 1299,
    source: "quick_prompt",
    status: "normal",
    date: "5 days ago",
    dateAbsolute: "10 Jun 2026 · 2:15 PM",
    device: "Desktop",
    os: "macOS",
    browser: "Chrome",
    sessionTurns: 4,
    sessionDuration: "3 min 45 sec",
    conversation: [
      { id: "m1", role: "user", content: "What are air-purifying plants for office?", timestamp: "2:15:00 PM" },
      {
        id: "m2", role: "ai",
        content: "The best office air-purifying plants are: Spider Plant, Snake Plant, Peace Lily, Boston Fern, and Rubber Plant. All are low-maintenance and effective at filtering common indoor pollutants. Which size space are you looking to fill?",
        timestamp: "2:15:03 PM",
        rating: "helpful",
        productSuggestions: [{ id: "p005", name: "Office Plant Collection (Set of 3)", price: 1299, addedToCart: true }],
      },
    ],
  },
];

/* ─── Default Settings ───────────────────────────────────────────────────────── */
export const DEFAULT_SETTINGS: AISettings = {
  enabledOnStorefront: true,
  showOnPDP: true,
  showOnDedicatedPage: true,
  showFloatingWidget: true,
  allowPhotoUploads: true,
  roomVisualiserMode: true,
  quickPromptsOnOpen: true,
  productRecommendations: true,
  allowConversationHistory: false,
  language: "english",
  tone: "friendly",
  maxResponseWords: 300,
  fallbackMessage: "Sorry, I couldn't find specific information about that. Please try rephrasing your question or contact our plant experts.",
  blockHarmfulAdvice: true,
  autoFlagProfanity: true,
  autoFlagPII: true,
  logConversations: true,
  retentionDays: "90",
  showConversationNotice: true,
};
