import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug, getBlogs } from "@/lib/strapi";
import { BlogDetailClient } from "./BlogDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    return {
      title: "Blog Not Found | SeminarVerse",
    };
  }

  return {
    title: `${blog.title} | SeminarVerse Blog`,
    description: blog.content.substring(0, 160).replace(/[#*`]/g, ""),
    keywords: blog.seo.keywords,
    openGraph: {
      title: blog.title,
      description: blog.content.substring(0, 160).replace(/[#*`]/g, ""),
      images: [{ url: blog.thumbnail }],
      type: "article",
      publishedTime: blog.publishedAt,
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  const allBlogs = await getBlogs();
  const relatedBlogs = allBlogs
    .filter((b) => b.category === blog.category && b.id !== blog.id)
    .slice(0, 2);

  return <BlogDetailClient blog={blog} relatedBlogs={relatedBlogs} />;
}
