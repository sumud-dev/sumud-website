export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  category: { name: string } | null;
  publishedAt: string | null;
  createdAt: string;
  viewCount: number;
};