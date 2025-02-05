import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';

const rootDirectory = path.join(process.cwd(), 'src/assets/blog');

// Add check for server-side execution
const isServer = typeof window === 'undefined';

export async function getBlogPosts() {
    if (!isServer) {
        throw new Error('getBlogPosts should only be called on the server side');
    }

    const files = fs.readdirSync(rootDirectory);

    const posts = await Promise.all(
        files.map(async (filename) => {
            const filePath = path.join(rootDirectory, filename);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data: frontmatter, content } = matter(fileContent);

            return {
                slug: filename.replace('.mdx', ''),
                frontmatter,
                content
            };
        })
    );

    return posts;
}

export async function getBlogPost(slug: string) {
    if (!isServer) {
        throw new Error('getBlogPost should only be called on the server side');
    }

    const filePath = path.join(rootDirectory, `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data: frontmatter, content } = matter(fileContent);
    const { content: mdxContent } = await compileMDX({
        source: content,
        options: { parseFrontmatter: true }
    });

    return { frontmatter, content: mdxContent };
} 