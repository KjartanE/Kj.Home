export const baseUrl = "https://kj.home.vercel.app";
// export const baseUrl = 'https://portfolio-blog-starter.vercel.app'

export default async function sitemap() {
  const routes = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0]
  }));

  return [...routes];
}
