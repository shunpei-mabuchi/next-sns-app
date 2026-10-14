import Link from "next/link";
import { CircleUserRound } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background shadow-md">
      <div className="mx-auto max-w-md px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-bold">PiBit</h1>
        <Link href="/mypage" aria-label="マイページ">
          <CircleUserRound className="size-6" />
        </Link>
      </div>
    </header>
  )

}