export const homeSchema = {
  name: 'home',
  title: 'Home Page',
  type: 'document',
  fields: [
    {
      name: 'heroRoles',
      title: 'Hero: Rotating Roles',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'heroProof',
      title: 'Hero: Proof Points',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'interviewSplit',
      title: 'Inside Interviews Section',
      type: 'object',
      fields: [
        { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'body', title: 'Body', type: 'text' },
        { name: 'points', title: 'Points', type: 'array', of: [{ type: 'string' }] },
        { name: 'cta', title: 'CTA Label', type: 'string' },
      ],
    },
    {
      name: 'industries',
      title: 'Industries Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'icon', title: 'Icon', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'text' },
            { name: 'statValue', title: 'Stat Value', type: 'string' },
            { name: 'statLabel', title: 'Stat Label', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'faqs',
      title: 'Frequently Asked Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', title: 'Question', type: 'string' },
            { name: 'answer', title: 'Answer', type: 'text' },
          ],
        },
      ],
    },
  ],
};
