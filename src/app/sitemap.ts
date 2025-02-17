import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://yourdomain.com/",
      lastModified: new Date(),
    },
    {
      url: "https://yourdomain.com/about",
      lastModified: new Date(),
    },
    {
      url: "https://yourdomain.com/blog",
      lastModified: new Date(),
    },
  ]
}
