import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
        autoSignIn: false
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "student",
                input: true, // Allow setting role during sign up for initialization/testing
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    }
});




