import { z } from "zod";

/**
 * Shared validation rules for discount actions (PROJ-5).
 * Used by the server actions and the client form so validation stays in sync.
 */
export const actionTitleSchema = z
  .string()
  .trim()
  .min(1, { message: "Bitte einen Titel eingeben." })
  .max(80, { message: "Der Titel darf höchstens 80 Zeichen haben." });

export const discountValueSchema = z
  .string()
  .trim()
  .min(1, { message: "Bitte einen Rabattwert eingeben." })
  .max(50, { message: "Der Rabattwert darf höchstens 50 Zeichen haben." });

export const commentSchema = z
  .string()
  .trim()
  .max(500, { message: "Der Kommentar darf höchstens 500 Zeichen haben." });

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Bitte ein gültiges Datum wählen." });

/**
 * Full action payload. The cross-field rule (end >= start) is enforced via
 * `.refine` so both the form and the server reject an end-before-start range.
 */
export const actionSchema = z
  .object({
    title: actionTitleSchema,
    marketplaceId: z.string().uuid({ message: "Bitte einen Kanal auswählen." }),
    brandId: z.string().uuid({ message: "Bitte eine Marke auswählen." }),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    discountValue: discountValueSchema,
    comment: commentSchema.optional().or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Das Enddatum darf nicht vor dem Startdatum liegen.",
    path: ["endDate"],
  });

export type ActionFormValues = z.infer<typeof actionSchema>;
