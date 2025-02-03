import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';

const rootDirectory = path.join(process.cwd(), 'src/assets/blog');

export async function getBlogPosts() {
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
    const filePath = path.join(rootDirectory, `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data: frontmatter, content } = matter(fileContent);
    const { content: mdxContent } = await compileMDX({
        source: content,
        options: { parseFrontmatter: true }
    });

    return { frontmatter, content: mdxContent };
} 