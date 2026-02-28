"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Projects", href: "/projects", icon: FolderIcon },
  { name: "Tasks", href: "/tasks", icon: ClipboardDocumentListIcon }, // adjust dynamically later
  { name: "Profile", href: "/profile", icon: UserCircleIcon },
];

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-white shadow-lg">
      <Link
        className="mb-2 flex h-20 items-center justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="flex items-center gap-3 text-white">
          <Image
            src="/synergy_sphere_logo_no_text-removebg.png"
            alt="Synergy Sphere Logo"
            height={40}
            width={40}
            className="w-10 h-10 md:w-16 md:h-16 object-contain"
          />
          <h2 className="block text-xl font-bold">Synergy Sphere</h2>
        </div>
      </Link>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <nav className="flex flex-row md:flex-col gap-2 grow">
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium transition-colors",
                  "hover:bg-sky-100 hover:text-blue-600",
                  pathname === link.href
                    ? "bg-sky-100 text-blue-600"
                    : "text-gray-700",
                  "md:flex-none md:justify-start md:px-3"
                )}
              >
                <LinkIcon className="w-6 h-6" />
                <span className="hidden md:block">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

        <form
          action={async () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium bg-red-100 hover:border hover:border-red-500 text-red-600 md:flex-none md:justify-start md:px-3 hover:cursor-pointer hover:text-red-800 hover:bg-red-300">
            <PowerIcon className="w-6" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
