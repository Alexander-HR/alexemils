import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function Login() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-4xl font-light">Log in</h1>
      <p className="mb-6 opacity-70">
        No account? You can still claim Wishes as a Guest.
      </p>
      <LoginForm />
    </div>
  );
}
