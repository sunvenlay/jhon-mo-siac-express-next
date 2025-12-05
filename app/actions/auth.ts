"use server";

import { auth } from "@/lib/auth";

export async function getSessionUser() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  return {
    id: (session.user as any).id as string,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role as string,
  };
}
