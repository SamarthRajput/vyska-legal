import IndividualBlogPageComponent from '@/components/blog/IndividualBlogPageComponent';
import React from 'react';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import getExcerpt from '@/lib/getExcerpt';

interface Props {
    params: { id: Promise<string> };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = await (await params).id;

    const blog = await prisma.blog.findUnique({
        where: { id },
        include: { author: true },
    });

    if (!blog) {
        return {
            title: 'Blog Not Found',
            description: 'The requested blog post could not be found.',
        };
    }

    const excerpt = getExcerpt(blog.content, 160);
    const title = blog.title;
    const imageUrl = blog.thumbnailUrl || '/default-blog-thumbnail.jpg';

    return {
        title: title,
        description: excerpt,
        openGraph: {
            title: title,
            description: excerpt,
            url: `/blog/${blog.id}`,
            type: 'article',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            publishedTime: blog.createdAt.toISOString(),
            modifiedTime: blog.updatedAt.toISOString(),
            authors: [blog.author.name],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: excerpt,
            images: [imageUrl],
        },
    };
}

const IndividualBlogPage = async ({ params }: Props) => {
    const id = await (await params).id;
    return <IndividualBlogPageComponent id={id} />;
};

export default IndividualBlogPage;
