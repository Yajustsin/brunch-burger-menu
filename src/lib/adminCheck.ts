import { cookies } from "next/headers";
import { verifyPassword } from "./auth";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  return verifyPassword(token);
}
