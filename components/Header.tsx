import Link from "next/link";
import Avatar from "./Avatar";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <div>
      <header className="bg-white shadow-sm text-gray-800 flex justify-between p-5">
        <Link href="/" className="flex items-center text-4xl font-thin">
          <Avatar seed="Orbin's Support Agent" />
          <div className="space-y-1 p-5 ">
            <h1>Assistly</h1>
            <h2 className="text-sm">Your customizable AI agent</h2>
          </div>
        </Link>

        <div className="flex items-center">
            <SignedIn>
                <UserButton showName/>
            </SignedIn>
            <SignedOut>
                <SignInButton />
            </SignedOut>
        </div>
      </header>
    </div>
  );
}
