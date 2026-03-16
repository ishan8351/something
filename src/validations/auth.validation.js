import { z } from "zod";

export const authValidation = {
    register: z.object({
        body: z.object({
            name: z.string().min(2, "Name must be at least 2 characters").max(50),
            email: z.string().email("Invalid email address format"),
            password: z.string().min(6, "Password must be at least 6 characters long")
        })
    }),
    login: z.object({
        body: z.object({
            email: z.string().email("Invalid email address format"),
            password: z.string().min(1, "Password is required")
        })
    })
};