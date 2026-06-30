import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getEvents } from "@/lib/strapi";
import { EventDetailClient } from "./EventDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate Dynamic SEO Metadata for Google index ranking
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.slug);
  
  if (!event) {
    return {
      title: "Event Not Found | SeminarVerse",
    };
  }

  return {
    title: `${event.title} | SeminarVerse`,
    description: event.description.substring(0, 160),
    keywords: event.seo.keywords,
    openGraph: {
      title: event.title,
      description: event.description.substring(0, 160),
      images: [{ url: event.thumbnail }],
      type: "website",
    }
  };
}

export default async function EventDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.slug);
  
  if (!event) {
    notFound();
  }

  // Fetch related events (same category)
  const allEvents = await getEvents();
  const relatedEvents = allEvents
    .filter((e) => e.category === event.category && e.id !== event.id)
    .slice(0, 3);

  // Generate JSON-LD Google Search Event Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "image": event.thumbnail,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "eventAttendanceMode": event.isOnline 
      ? "https://schema.org/OnlineEventAttendanceMode" 
      : "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": event.isOnline 
      ? {
          "@type": "VirtualLocation",
          "url": "https://seminarverse.com/dashboard/events"
        }
      : {
          "@type": "Place",
          "name": event.location,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": event.location,
            "addressLocality": "Jakarta",
            "addressCountry": "ID"
          }
        },
    "offers": {
      "@type": "Offer",
      "price": event.ticketPrice,
      "priceCurrency": "IDR",
      "availability": "https://schema.org/InStock",
      "url": `https://seminarverse.com/events/${event.slug}`
    },
    "performer": {
      "@type": "Person",
      "name": event.speaker.name
    }
  };

  return (
    <>
      {/* Inject Structured SEO JSON-LD to header */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <EventDetailClient event={event} relatedEvents={relatedEvents} />
    </>
  );
}
