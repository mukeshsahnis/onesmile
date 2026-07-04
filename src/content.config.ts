import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().default("One Smile Dental Care"),
    category: z.string().default("General Dentistry"),
    tags: z.array(z.string()).default([]),
    relatedServices: z.array(z.string()).default([]), // IDs of related services
  })
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    summary: z.string(),
    order: z.number().default(99),
    benefits: z.array(z.string()).default([]),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).default([]),
    treatmentTime: z.string().optional(),
    relatedServices: z.array(z.string()).default([]), // IDs of related services
  })
});

export const collections = { blog, services };
