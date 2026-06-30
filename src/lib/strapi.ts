export interface Speaker {
  id: string;
  name: string;
  photo: string;
  bio: string;
  company: string;
  position: string;
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  description: string;
  category: string;
  speaker: Speaker;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  ticketPrice: number;
  quota: number;
  startDate: string;
  endDate: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

// Mock Data
export const MOCK_SPEAKERS: Speaker[] = [
  {
    id: "spk-1",
    name: "Dr. Sarah Jenkins",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    bio: "AI Architect at Google DeepMind with 10+ years of research in deep generative modeling.",
    company: "Google DeepMind",
    position: "Senior AI Researcher",
    socialMedia: { twitter: "https://twitter.com", linkedin: "https://linkedin.com", github: "https://github.com" }
  },
  {
    id: "spk-2",
    name: "Alex Rivera",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    bio: "Fintech innovator, former VP of Product at Stripe, focused on global payment APIs.",
    company: "Stripe",
    position: "Former VP of Product",
    socialMedia: { twitter: "https://twitter.com", linkedin: "https://linkedin.com" }
  },
  {
    id: "spk-3",
    name: "Elena Rostova",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    bio: "Web standards advocate, core Next.js contributor, and designer of responsive frameworks.",
    company: "Vercel",
    position: "Developer Advocate",
    socialMedia: { github: "https://github.com", linkedin: "https://linkedin.com" }
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "AI & Deep Learning Breakthroughs in 2026",
    slug: "ai-deep-learning-breakthroughs-2026",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1200",
    description: "Explore the bleeding-edge developments in multi-modal transformers, agentic coding models, and hardware-accelerated deep learning setups. Perfect for engineers, researchers, and tech founders looking to utilize state-of-the-art architectures in production environments.",
    category: "Technology",
    speaker: MOCK_SPEAKERS[0],
    location: "Zoom Web Events",
    isOnline: true,
    meetingLink: "https://zoom.us/j/webinar-mock-ai-2026",
    ticketPrice: 199000,
    quota: 500,
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in future
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    seo: {
      metaTitle: "AI & Deep Learning Breakthroughs in 2026 Webinar",
      metaDescription: "Join Dr. Sarah Jenkins from DeepMind to discuss transformers and agentic code.",
      keywords: "AI, Deep Learning, Transformers, Gemini, Coding Agents"
    }
  },
  {
    id: "evt-2",
    title: "Global Fintech Scaling & Payments Architecture",
    slug: "global-fintech-scaling-payments",
    thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200",
    description: "Learn how to build cross-border multi-currency payment checkout systems, handle regulatory webhooks, fraud checks, and automate billing accounts. We will dive deep into tokenization, ledger engineering, and scale mechanics.",
    category: "Finance",
    speaker: MOCK_SPEAKERS[1],
    location: "Grand Hyatt Ballroom, Jakarta",
    isOnline: false,
    ticketPrice: 450000,
    quota: 150,
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days in future
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    seo: {
      metaTitle: "Fintech Scaling & Payment Architecture Seminar",
      metaDescription: "Learn to build cross-border payment platforms with former Stripe VP.",
      keywords: "Fintech, Payments, Stripe, Midtrans, SaaS Architecture"
    }
  },
  {
    id: "evt-3",
    title: "Next.js App Router: Intermediate to Production Core",
    slug: "nextjs-app-router-intermediate-production",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
    description: "An intensive session focused on server components, streaming rendering, caching headers, ISR layout pipelines, and Next.js optimization standards. We will code a functional app live and audit it using Lighthouse CI.",
    category: "Technology",
    speaker: MOCK_SPEAKERS[2],
    location: "Vercel Spaces Live",
    isOnline: true,
    meetingLink: "https://zoom.us/j/webinar-mock-nextjs",
    ticketPrice: 0, // Free ticket
    quota: 1000,
    startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days in future
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    seo: {
      metaTitle: "Free Next.js App Router Masterclass - Elena Rostova",
      metaDescription: "Master React Server Components, Streaming, and ISR in this Vercel masterclass.",
      keywords: "Next.js, React, Vercel, Tailwind CSS, Frontend Performance"
    }
  }
];

export const MOCK_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Why Headless CMS is the Future of Event Marketing",
    slug: "why-headless-cms-future-event-marketing",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    category: "Marketing",
    author: { name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100" },
    publishedAt: "2026-06-25",
    readTime: "5 min read",
    content: `
# The Rise of the Headless Event Stack

In the past, organizers relied solely on monolithic platforms like Eventbrite to sell tickets. While functional, these platforms restricted layout branding, SEO performance, and deep client integrations. 

Today, modern SaaS structures leverage a decoupled architecture: **Next.js App Router Frontend + Strapi Headless CMS + Midtrans Payment Hook**.

## Core Benefits

1. **Unrivaled Load Speeds**: Pre-rendering event landing pages with ISR (Incremental Static Regeneration) achieves a Lighthouse score of 95+ and cuts bounce rates in half.
2. **SEO Dominance**: Dynamic rendering allows us to inject structured schema models (\`JSON-LD\`), driving organic search discoverability for tickets.
3. **Integration Autonomy**: Hooking custom certificates and Midtrans checkouts into private APIs is far simpler than extending third-party platforms.

\`\`\`javascript
// Example: Dynamic routing in Next.js
export async function generateMetadata({ params }) {
  const event = await getEventBySlug(params.slug);
  return {
    title: event.title,
    description: event.description,
  };
}
\`\`\`

By owning your tech stack, you own your data, user profiles, and ticketing fees.
    `,
    seo: {
      metaTitle: "Why Headless CMS is the Future of Event Marketing",
      metaDescription: "An in-depth article analyzing how Next.js and Strapi optimize ticketing platforms.",
      keywords: "Headless CMS, Next.js, Strapi, Web Development"
    }
  },
  {
    id: "blog-2",
    title: "Designing Seamless Checkout Experiences for Ticket Sales",
    slug: "designing-seamless-checkout-experiences",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
    category: "Design",
    author: { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" },
    publishedAt: "2026-06-28",
    readTime: "7 min read",
    content: `
# UX Patterns for High-Conversion Checkouts

When a user decides to register for a seminar, every extra input field or slow page load reduces purchase intent by 10%. Optimizing the payment funnel is crucial to minimizing cart abandonment.

## Key Checkout Strategies

* **Keep Checkouts In-Context**: Use inline portals or overlay modals (such as Midtrans Snap) instead of redirecting the user to external payment pages.
* **Instant Verification**: Confirm promo codes instantly without full page reloads.
* **Streamlined Authentication**: Allow participants to checkout as guests or using one-click Google Sign-In.

\`\`\`typescript
// Initiating a transaction with Midtrans Snap Client
const parameter = {
  transaction_details: {
    order_id: "order-12345",
    gross_amount: 199000
  },
  credit_card: { secure: true }
};
\`\`\`

By focusing on friction reduction, you can significantly boost registration numbers and ticketing revenue.
    `,
    seo: {
      metaTitle: "UX Patterns for High-Conversion Checkouts",
      metaDescription: "Tips and scripts to design ticket checkout paths that scale.",
      keywords: "UX, Payments, Web Design, Checkout Conversion"
    }
  }
];

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

// Client Wrapper Functions
export async function getEvents(): Promise<Event[]> {
  if (!STRAPI_API_URL) {
    return MOCK_EVENTS;
  }

  try {
    const res = await fetch(`${STRAPI_API_URL}/api/events?populate=speaker,seo`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    const data = await res.json();
    return data.data; // Note: actual mapping might be needed based on Strapi structure
  } catch (error) {
    console.error("Strapi fetch events error, using mock data:", error);
    return MOCK_EVENTS;
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!STRAPI_API_URL) {
    const mock = MOCK_EVENTS.find((e) => e.slug === slug);
    return mock || null;
  }

  try {
    const res = await fetch(`${STRAPI_API_URL}/api/events?filters[slug][$eq]=${slug}&populate=speaker,seo`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return data.data[0] || null;
  } catch (error) {
    console.error("Strapi fetch event by slug error, using mock data:", error);
    const mock = MOCK_EVENTS.find((e) => e.slug === slug);
    return mock || null;
  }
}

export async function getBlogs(): Promise<Blog[]> {
  if (!STRAPI_API_URL) {
    return MOCK_BLOGS;
  }

  try {
    const res = await fetch(`${STRAPI_API_URL}/api/blogs?populate=author,seo`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Strapi fetch blogs error, using mock data:", error);
    return MOCK_BLOGS;
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  if (!STRAPI_API_URL) {
    const mock = MOCK_BLOGS.find((b) => b.slug === slug);
    return mock || null;
  }

  try {
    const res = await fetch(`${STRAPI_API_URL}/api/blogs?filters[slug][$eq]=${slug}&populate=author,seo`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return data.data[0] || null;
  } catch (error) {
    console.error("Strapi fetch blog by slug error, using mock data:", error);
    const mock = MOCK_BLOGS.find((b) => b.slug === slug);
    return mock || null;
  }
}
