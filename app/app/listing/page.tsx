"use client";

import { useEntreprises } from "../layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EntrepriseModal } from "@/components/EntrepriseModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { supabase } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Entreprise } from "@/lib/types";
import { getScoreColor } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart,
  HeartOff,
  Trash2,
  Filter,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 14;

export default function ListePage() {
  const { entreprises, loading: contextLoading } = useEntreprises();
  const [filteredEntreprises, setFilteredEntreprises] = useState<Entreprise[]>(
    [],
  );
  const [selectedEntreprise, setSelectedEntreprise] =
    useState<Entreprise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    nom: "",
    ville: "",
    activite: "",
    scoreMin: "",
    scoreMax: "",
    favori: false,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "dateparution",
    direction: "desc",
  });

  // Initialiser les données filtrées depuis le contexte
  useEffect(() => {
    if (!contextLoading) {
      setFilteredEntreprises(entreprises);
      setTotalItems(entreprises.length);
      setIsLoading(false);
    }
  }, [entreprises, contextLoading]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let result = [...entreprises];

    if (filters.nom) {
      result = result.filter((e) =>
        e.nom_complet?.toLowerCase().includes(filters.nom.toLowerCase()),
      );
    }

    if (filters.ville) {
      result = result.filter((e) =>
        e.social_ville?.toLowerCase().includes(filters.ville.toLowerCase()),
      );
    }

    if (filters.activite) {
      result = result.filter((e) =>
        e.activite_principale
          ?.toLowerCase()
          .includes(filters.activite.toLowerCase()),
      );
    }

    if (filters.scoreMin) {
      result = result.filter(
        (e) => e.score && parseInt(e.score) >= parseInt(filters.scoreMin),
      );
    }

    if (filters.scoreMax) {
      result = result.filter(
        (e) => e.score && parseInt(e.score) <= parseInt(filters.scoreMax),
      );
    }

    if (filters.favori) {
      result = result.filter((e) => e.favori);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue: unknown = a[sortConfig.key as keyof Entreprise];
      const bValue: unknown = b[sortConfig.key as keyof Entreprise];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredEntreprises(result);
    setTotalItems(result.length);
    setCurrentPage(1);
  }, [filters, entreprises, sortConfig]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEntreprises.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntreprises.map((e) => e.id));
    }
  };

  const { updateEntreprise } = useEntreprises();

  const handleToggleFavorite = async (id: string) => {
    try {
      const entreprise = entreprises.find((e) => e.id === id);
      if (!entreprise) return;

      const updatedEntreprise = { ...entreprise, favori: !entreprise.favori };

      const { error } = await supabase
        .from("entreprise")
        .update({ favori: !entreprise.favori })
        .eq("id", id);

      if (error) throw error;

      updateEntreprise(updatedEntreprise);
      toast.success(
        entreprise.favori ? "Retiré des favoris" : "Ajouté aux favoris",
      );
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const { removeEntreprise } = useEntreprises();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("entreprise").delete().eq("id", id);

      if (error) throw error;

      removeEntreprise(id);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      toast.success("Entreprise supprimée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from("entreprise")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      // Supprimer chaque entreprise du contexte
      selectedIds.forEach((id) => removeEntreprise(id));
      setSelectedIds([]);
      toast.success("Entreprises supprimées avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBulkToggleFavorite = async (value: boolean) => {
    try {
      const { error } = await supabase
        .from("entreprise")
        .update({ favori: value })
        .in("id", selectedIds);

      if (error) throw error;

      // Mettre à jour chaque entreprise dans le contexte
      selectedIds.forEach((id) => {
        const entreprise = entreprises.find((e) => e.id === id);
        if (entreprise) {
          updateEntreprise({ ...entreprise, favori: value });
        }
      });
      setSelectedIds([]);
      toast.success(value ? "Ajoutés aux favoris" : "Retirés des favoris");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const resetFilters = () => {
    setFilters({
      nom: "",
      ville: "",
      activite: "",
      scoreMin: "",
      scoreMax: "",
      favori: false,
    });
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedData = filteredEntreprises.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>
                {isLoading || contextLoading ? (
                  <Skeleton className="h-6 w-[250px]" />
                ) : (
                  "Liste des entreprises en liquidation"
                )}
              </CardTitle>
              <CardDescription>
                {isLoading || contextLoading ? (
                  <Skeleton className="h-4 w-[200px] mt-2" />
                ) : (
                  `${totalItems} entreprises trouvées - Page ${currentPage} sur ${totalPages}`
                )}
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>

              {selectedIds.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkToggleFavorite(true)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkToggleFavorite(false)}
                  >
                    <HeartOff className="h-4 w-4 mr-2" />
                    Non favoris
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    placeholder="Filtrer par nom"
                    value={filters.nom}
                    onChange={(e) =>
                      setFilters({ ...filters, nom: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ville</label>
                  <Input
                    placeholder="Filtrer par ville"
                    value={filters.ville}
                    onChange={(e) =>
                      setFilters({ ...filters, ville: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Activité</label>
                  <Input
                    placeholder="Filtrer par activité"
                    value={filters.activite}
                    onChange={(e) =>
                      setFilters({ ...filters, activite: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Score (min)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    value={filters.scoreMin}
                    onChange={(e) =>
                      setFilters({ ...filters, scoreMin: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Score (max)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="10"
                    value={filters.scoreMax}
                    onChange={(e) =>
                      setFilters({ ...filters, scoreMax: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="favori-filter"
                    checked={filters.favori}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, favori: !!checked })
                    }
                  />
                  <label
                    htmlFor="favori-filter"
                    className="text-sm font-medium"
                  >
                    Favoris seulement
                  </label>
                </div>

                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredEntreprises.length
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < filteredEntreprises.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Établissement</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Activité</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("dateparution")}
                >
                  <div className="flex items-center">
                    Date annonce
                    {sortConfig.key === "dateparution" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Favori</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || contextLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-[20px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-[80px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEntreprises.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucune entreprise trouvée
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((entreprise) => (
                  <TableRow key={entreprise.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(entreprise.id)}
                        onCheckedChange={() => toggleSelect(entreprise.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedEntreprise(entreprise);
                        setIsModalOpen(true);
                      }}
                    >
                      {entreprise.nom_complet}
                    </TableCell>
                    <TableCell>
                      {entreprise.social_ville} ({entreprise.social_code_postal}
                      )
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entreprise.activite_principale}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(entreprise.dateparution)}</TableCell>
                    <TableCell>
                      {entreprise.score ? (
                        <Badge
                          variant="outline"
                          className={getScoreColor(entreprise.score)}
                        >
                          {entreprise.score}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(entreprise.id);
                        }}
                      >
                        {entreprise.favori ? (
                          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        ) : (
                          <Heart className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleToggleFavorite(entreprise.id)}
                          >
                            {entreprise.favori ? (
                              <>
                                <HeartOff className="h-4 w-4 mr-2" />
                                Retirer des favoris
                              </>
                            ) : (
                              <>
                                <Heart className="h-4 w-4 mr-2" />
                                Ajouter aux favoris
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(entreprise.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoading && totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    },
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <EntrepriseModal
        entreprise={selectedEntreprise}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
