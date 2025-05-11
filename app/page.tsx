"use client";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <SignIn />;

  router.push("/app/dashboard");
}
