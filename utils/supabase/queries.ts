import { supabase } from "./client";
import { Entreprise } from "@/lib/types";

const SupabaseCalls = {
  subscribeToNewEnterprises: (callback: (newData: Entreprise) => void) => {
    const channel = supabase
      .channel("entreprise_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "entreprise",
        },
        (payload) => {
          callback(payload.new);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  getAllEntreprisesAndSubscribe: async (callback: (newData: Entreprise) => void) => {
    const { data: existingEnterprises, error } = await supabase
      .from("entreprise")
      .select("*")
      .order("dateparution", { ascending: false });

    if (!error && existingEnterprises) {
      existingEnterprises.forEach((entreprise) => callback(entreprise));
    }

    const channel = supabase
      .channel("entreprise_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "entreprise",
        },
        (payload) => {
          callback(payload.new);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  toggleFavorite: async (id: string, isFavorite: boolean) => {
    const { error } = await supabase
      .from("entreprise")
      .update({ favori: !isFavorite })
      .eq("id", id);

    if (error) throw error;
    return !isFavorite;
  },

  deleteEntreprise: async (id: string) => {
    const { error } = await supabase.from("entreprise").delete().eq("id", id);

    if (error) throw error;
  },

  bulkDelete: async (ids: string[]) => {
    const { error } = await supabase.from("entreprise").delete().in("id", ids);

    if (error) throw error;
  },

  bulkToggleFavorite: async (ids: string[], isFavorite: boolean) => {
    const { error } = await supabase
      .from("entreprise")
      .update({ favori: !isFavorite })
      .in("id", ids);

    if (error) throw error;
  },
};

export default SupabaseCalls;
