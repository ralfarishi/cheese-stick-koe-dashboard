"use server";

import { createClient } from "@/lib/actions/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  checkRateLimit,
  recordFailedAttempt,
  clearAttempts,
  formatLockoutTime,
} from "@/lib/rateLimit";

export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Rate limiting check
  const rateLimitResult = checkRateLimit(email);
  
  if (!rateLimitResult.allowed) {
    const lockoutTime = formatLockoutTime(rateLimitResult.resetTime);
    return {
      error: `Too many login attempts. Please try again in ${lockoutTime}.`,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Record failed attempt
    recordFailedAttempt(email);
    
    // Get updated rate limit info
    const updatedLimit = checkRateLimit(email);
    
    if (updatedLimit.remainingAttempts > 0) {
      return {
        error: `${error.message}`,
      };
    } else {
      return {
        error: "Too many failed attempts. Your account has been temporarily locked.",
      };
    }
  }

  // Clear attempts on successful login
  clearAttempts(email);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function getSession() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}
