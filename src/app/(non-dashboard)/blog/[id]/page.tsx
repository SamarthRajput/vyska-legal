import IndividualBlogPageClient from '@/components/blog/IndividualBlogPageComponent';
import React from 'react';

const IndividualBlogPage = async ({ params }: { params: { id: Promise<string> } }) => {
    const id = await (await params).id;
    return <IndividualBlogPageClient id={id} />;
};

export default IndividualBlogPage;
