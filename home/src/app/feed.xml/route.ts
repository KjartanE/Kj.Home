import { getBlogPosts } from "@/lib/mdx";

export async function GET() {
  const posts = await getBlogPosts();

  const items = posts
    .map((post) => {
      const link = `https://kjhome.dev/blog/${post.slug}`;
      const pubDate = new Date(post.frontmatter.publishedAt).toUTCString();
      const title = escapeXml(post.frontmatter.title);
      const description = escapeXml(post.frontmatter.summary);
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>kj.home blog</title>
    <link>https://kjhome.dev</link>
    <description>Personal blog by Kjartan Einarsson</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
