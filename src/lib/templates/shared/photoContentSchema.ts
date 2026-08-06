import { z } from "zod";

export const photoEntrySchema = z.object({
  url: z.string().min(1),
  caption: z.string().max(280),
});

export const photoContentSchema = z.object({
  title: z.string().min(1).max(120),
  photos: z.array(photoEntrySchema).min(1).max(20),
});

export type PhotoContent = z.infer<typeof photoContentSchema>;

export const emptyPhotoContent: PhotoContent = { title: "", photos: [] };
