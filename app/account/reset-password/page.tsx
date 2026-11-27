import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Choose a new password for your 1775 Gaming account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] bg-marine-black text-white px-4 pt-16 pb-20">
      <div className="mx-auto w-full max-w-md">
        <ResetPasswordClient />
      </div>
    </div>
  );
}
