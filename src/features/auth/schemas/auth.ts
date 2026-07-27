import { z } from "zod";
import { IRANIAN_MOBILE_PATTERN } from "@/features/auth/constants";

export const phoneFormSchema = z.object({
  phone: z
    .string()
    .regex(
      IRANIAN_MOBILE_PATTERN,
      "لطفاً یک شماره موبایل معتبر ۱۱ رقمی وارد کنید",
    ),
});

export type PhoneFormValues = z.infer<typeof phoneFormSchema>;

