"use client";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useState, useEffect, useContext, createContext } from "react";
import { Entreprise } from "@/lib/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from("entreprise")
        .select("*")
        .order("dateparution", { ascending: false });

      if (!error && data) {
        setEntreprises(data);
      }
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("realtime-entreprises")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "entreprise",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEntreprises((prev) => [payload.new as Entreprise, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setEntreprises((prev) =>
              prev.map((e) =>
                e.id === payload.new.id ? (payload.new as Entreprise) : e,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setEntreprises((prev) =>
              prev.filter((e) => e.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Context value
  const contextValue = {
    entreprises,
    loading,
    updateEntreprise: (updated: Entreprise) => {
      setEntreprises((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
    },
    removeEntreprise: (id: number) => {
      setEntreprises((prev) => prev.filter((e) => e.id !== id));
    },
  };

  return (
    <EntreprisesContext.Provider value={contextValue}>
      <div className="flex h-screen relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{
                duration: 0.3,
                scale: { type: "spring", damping: 10 },
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </EntreprisesContext.Provider>
  );
}

const EntreprisesContext = createContext<{
  entreprises: Entreprise[];
  loading: boolean;
  updateEntreprise: (updated: Entreprise) => void;
  removeEntreprise: (id: string) => void;
} | null>(null);

export function useEntreprises() {
  const context = useContext(EntreprisesContext);
  if (!context) {
    throw new Error("useEntreprises must be used within AppLayout");
  }
  return context;
}
