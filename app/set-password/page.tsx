import type { Metadata } from "next";
import SetPasswordForm from "./SetPasswordForm";

export const metadata: Metadata = { title: "Choose a password" };

export default function SetPassword() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-4xl font-light">Welcome!</h1>
      <p className="mb-6 opacity-70">Choose a password to finish setting up your account.</p>
      <SetPasswordForm />
    </div>
  );
}
