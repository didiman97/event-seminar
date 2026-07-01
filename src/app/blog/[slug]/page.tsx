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

  const cleanDescription = blog.seo?.metaDescription || 
    (blog.content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().substring(0, 160));

  return {
    title: `${blog.title} | SeminarVerse Blog`,
    description: cleanDescription,
    keywords: blog.seo?.keywords || blog.category,
    openGraph: {
      title: blog.title,
      description: cleanDescription,
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
