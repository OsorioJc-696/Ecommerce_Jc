'use server'; // Mark this file's functions as Server Actions

import prisma from '@/lib/prisma'; // Import Prisma client
import bcrypt from 'bcryptjs'; // Import bcrypt
import { z } from 'zod'; // Import Zod for validation

// Zod schema for server-side validation (more robust)
const signupSchema = z.object({
  username: z.string().min(1, { message: 'Please enter a username.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'], // Associate error with confirmPassword field
});

// Server Action for handling signup
export async function handleSignupAction(formData: FormData): Promise<{ success: boolean; message: string; fieldErrors?: Record<string, string[]> }> {

  const rawFormData = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  // Validate using Zod
  const validationResult = signupSchema.safeParse(rawFormData);

  if (!validationResult.success) {
     // Extract field-specific errors
     const fieldErrors = validationResult.error.flatten().fieldErrors;
     return {
       success: false,
       message: 'Please correct the errors below.',
       fieldErrors: fieldErrors,
     };
  }

  const { username, email, password } = validationResult.data;

  try {
    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { username: username }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return { success: false, message: 'Email already exists. Please try logging in.', fieldErrors: { email: ['Email already in use.'] } };
      } else {
        return { success: false, message: 'Username already taken. Please choose another.', fieldErrors: { username: ['Username already taken.'] } };
      }
    }

    // Hash the password securely
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt rounds
    //const hashedPassword = password; // KEEPING PLAIN TEXT FOR DEMO - REPLACE WITH BCRYPT IN PRODUCTION

    // Create the new user in the database
    await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        // favoriteProductIds: [], // Initialize favorites (removed as it is not in the schema)
        // Other fields will be null/default initially
      },
    });

    return { success: true, message: 'Account created successfully. Please log in.' };

  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: 'An unexpected error occurred during signup.' };
  }
}
