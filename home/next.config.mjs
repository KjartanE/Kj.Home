import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"]
};

export default withMDX(nextConfig);
