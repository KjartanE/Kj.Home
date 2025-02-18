import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  output: "standalone",
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"]
};

export default withMDX(nextConfig);
