import Link from "next/link";
import { buttonVariants } from "@/components/buttonVariants";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-display">Lost in space</h1>
      <p className="text-sm text-white/60">
        We couldn't find that page in the vault.
      </p>
      <Link href="/" className={buttonVariants({})}>
        Return home
      </Link>
    </div>
  );
}
