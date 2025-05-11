"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  MapIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  ListIcon,
  BookText,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Bouton menu flottant indépassable */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed z-[1000] top-4 left-4 p-2 rounded-md bg-white shadow-xl border border-gray-200 hover:bg-gray-50 transition-all"
          aria-label="Menu principal"
        >
          {isOpen ? (
            <XIcon className="w-5 h-5 text-gray-800" />
          ) : (
            <MenuIcon className="w-5 h-5 text-gray-800" />
          )}
        </button>
      )}

      {/* Overlay semi-transparent */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[900] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar principale */}
      <div
        className={cn(
          "flex flex-col h-screen w-64 border-r bg-white transition-transform duration-300 ease-in-out",
          isMobile ? "fixed top-0 left-0 shadow-xl" : "relative",
          isMobile && !isOpen && "-translate-x-full",
        )}
        style={{ zIndex: 950 }}
      >
        {/* Logo/Titre */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-700">Howard Burger</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          <Link
            href="/app/dashboard"
            className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <LayoutDashboardIcon className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          <Link
            href="/app/map"
            className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <MapIcon className="w-5 h-5 mr-3" />
            Map
          </Link>

          <Link
            href="/app/listing"
            className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <ListIcon className="w-5 h-5 mr-3" />
            Listing
          </Link>

          <Link
            href="/app/settings"
            className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <SettingsIcon className="w-5 h-5 mr-3" />
            Settings
          </Link>

          <Link
            href="/app/ressources"
            className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <BookText className="w-5 h-5 mr-3" />
            Ressources
          </Link>
        </nav>

        {/* Section utilisateur */}
        <div className="p-4 border-t">
          <div className="flex items-center">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              {user?.firstName || user?.username || "Profil"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
