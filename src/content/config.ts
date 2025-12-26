import { defineCollection, z } from 'astro:content';

const unitsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    size: z.string(),
    dimensions: z.string(),
    priceGross: z.number(),
    capacity: z.object({
      cartons: z.number(),
      bicycles: z.number().optional(),
      suitcases: z.number().optional(),
      furniture: z.string().optional(),
    }),
    features: z.array(z.string()),
    image: z.string(),
    status: z.enum(['available', 'occupied']),
  }),
});

export const collections = {
  units: unitsCollection,
};