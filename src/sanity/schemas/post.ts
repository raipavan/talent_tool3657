export const postSchema = {
  name: 'post',
  title: 'Blog Posts',
  type: 'document',
  fields: [
    { name: 'id', title: 'Post Slug / ID', type: 'string' },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'tagline', title: 'Tagline', type: 'string' },
    { name: 'category', title: 'Category', type: 'string' },
    { name: 'readTime', title: 'Read Time (e.g. 5 min read)', type: 'string' },
    { name: 'date', title: 'Publication Date', type: 'string' },
    { name: 'author', title: 'Author', type: 'string' },
    { name: 'summary', title: 'Summary', type: 'text' },
    {
      name: 'paragraphs',
      title: 'Article Paragraphs',
      type: 'array',
      of: [{ type: 'text' }],
    },
  ],
};
