import { defineCollection, z } from 'astro:content';

const artists = defineCollection({
	type: 'content',
	schema: z.object({
		name: z.string(),
		type: z.enum(['resident', 'guest']),
		photo: z.string().optional(),
		instagram: z.string().optional(),
		soundcloud: z.string().optional(),
		website: z.string().optional(),
		order: z.number().default(999), // For sorting residents vs guests
	}),
});

const events = defineCollection({
	type: 'content',
	schema: z.object({
		number: z.number(),
		title: z.object({
			en: z.string(),
			fr: z.string(),
		}),
		dateFrom: z.coerce.date(),
		dateTo: z.coerce.date(),
		location: z.string(),
		coverImage: z.string().optional(),
		artists: z.array(z.string()),
	}),
});

const recordings = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		artist: z.string(),
		event: z.string(),
		duration: z.number(),
		audioFile: z.string(),
		date: z.coerce.date(),
	}),
});

const media = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.enum(['photo', 'video']),
		file: z.string(),
		author: z.string().optional(),
		date: z.coerce.date(),
		event: z.string().optional(),
		artists: z.array(z.string()).optional(),
	}),
});

export const collections = { artists, events, recordings, media };