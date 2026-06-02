import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaprompt.in";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/pricing",
        "/technology",
        "/about",
        "/features",
      ],
      disallow: [
        "/login",
        "/register",
        "/dashboard",
        "/setup",
        "/simulate",
        "/results",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
