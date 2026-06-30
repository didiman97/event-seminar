import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://seminarverse.com";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/events", "/blog", "/certificate/verify"],
      disallow: ["/dashboard/", "/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
