"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

import { useState, useMemo, useEffect } from "react";
import { useEntreprises } from "../layout";
import { Entreprise } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getScoreColor } from "@/lib/utils";
import {
  Heart,
  X,
  MapPin,
  Calendar,
  Building,
  Activity,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { truncateText } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Map = dynamic(() => import("@/components/MapWithEntreprises"), {
  ssr: false,
  loading: () => (
    <Skeleton className="w-full h-[calc(100vh-64px)] rounded-lg" />
  ),
});

export default function MapPage() {
  const { entreprises, loading } = useEntreprises();
  const [selectedEntreprise, setSelectedEntreprise] =
    useState<Entreprise | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [showGlobalView, setShowGlobalView] = useState(false);
  const [enafFilter, setEnafFilter] = useState<string>("");
  const [showEnafFilter, setShowEnafFilter] = useState(false);

  // Extract unique ENAF codes from activite_principale
  const enafCodes = useMemo(() => {
    if (!entreprises) return [];
    const codes = new Set<string>();
    entreprises.forEach((e) => {
      if (e.activite_principale) {
        codes.add(e.activite_principale);
      }
    });
    return Array.from(codes).sort();
  }, [entreprises]);

  // Convert entreprises with coordinates to map markers
  const entrepriseMarkers = useMemo(() => {
    if (!entreprises) return [];

    return entreprises
      .filter(
        (e) =>
          e.latitude &&
          e.longitude &&
          !isNaN(parseFloat(e.latitude)) &&
          !isNaN(parseFloat(e.longitude)) &&
          (enafFilter === "" || e.activite_principale === enafFilter),
      )
      .map((e) => ({
        id: e.id.toString(),
        position: [parseFloat(e.latitude), parseFloat(e.longitude)] as [
          number,
          number,
        ],
        entreprise: e,
      }));
  }, [entreprises, enafFilter]);

  // Check if screen is mobile
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Handle marker click to show sidebar
  const handleMarkerClick = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setShowGlobalView(false);
    setSidebarOpen(true);
  };

  // Handle details button click to show global view
  const handleShowGlobalView = () => {
    setShowGlobalView(true);
    setSidebarOpen(true);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <>
      <div className="h-[calc(100vh-64px)] w-full relative overflow-hidden">
        <Map
          markers={entrepriseMarkers}
          onMarkerClick={handleMarkerClick}
          loading={loading}
          key={`map-${entrepriseMarkers.length}`}
          onInitialized={() => setMapInitialized(true)}
          attributionControl={false}
        />
        {mapInitialized && entrepriseMarkers.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[500]">
            <div className="text-center p-4 md:p-6 bg-white rounded-lg shadow-lg max-w-[90%] md:max-w-md mx-4">
              <MapPin className="h-8 w-8 md:h-10 md:w-10 text-blue-500 mx-auto mb-2 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">
                Aucune entreprise géolocalisée
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-4">
                Les entreprises affichées sur cette carte nécessitent des
                coordonnées géographiques valides.
              </p>
            </div>
          </div>
        )}

        {/* Sidebar for entreprise details */}
        <div
          className={`fixed md:absolute top-0 right-0 h-full ${isMobileView ? "w-full" : "w-[350px]"} bg-white z-[1000] shadow-xl transition-all duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/0 opacity-20 pointer-events-none" />
          {showGlobalView ? (
            <div className="h-full overflow-y-auto p-0">
              <Card className="h-full border-0 rounded-none">
                <CardHeader className="relative pb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="pr-8 text-lg">
                    Toutes les entreprises
                  </CardTitle>
                  <CardDescription>
                    {entrepriseMarkers.length} entreprises géolocalisées sur{" "}
                    {entreprises.length} au total
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Nom</TableHead>
                          <TableHead className="w-[40%]">Ville</TableHead>
                          <TableHead className="w-[20%] text-right">
                            Score
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entrepriseMarkers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center py-6 text-gray-500"
                            >
                              Aucune entreprise géolocalisée
                            </TableCell>
                          </TableRow>
                        ) : (
                          entrepriseMarkers.map(({ entreprise }) => (
                            <TableRow
                              key={entreprise.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleMarkerClick(entreprise)}
                            >
                              <TableCell
                                className="font-medium py-2 truncate"
                                title={entreprise.nom_complet}
                              >
                                {truncateText(entreprise.nom_complet)}
                              </TableCell>
                              <TableCell
                                className="py-2 truncate"
                                title={entreprise.social_ville}
                              >
                                {entreprise.social_ville || "Non spécifié"}
                              </TableCell>
                              <TableCell className="text-right py-2">
                                <Badge
                                  variant="outline"
                                  className={`${getScoreColor(entreprise.score)} px-1.5 py-0`}
                                >
                                  {entreprise.score || "N/A"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            selectedEntreprise && (
              <div className="h-full overflow-y-auto p-0">
                <Card className="h-full border-0 rounded-none">
                  <CardHeader className="relative pb-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardTitle
                      className="pr-8 text-lg truncate"
                      title={selectedEntreprise.nom_complet}
                    >
                      {truncateText(selectedEntreprise.nom_complet)}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        <span className="truncate">
                          {selectedEntreprise.social_ville ||
                            "Ville non spécifiée"}
                          {selectedEntreprise.social_code_postal
                            ? ` (${selectedEntreprise.social_code_postal})`
                            : ""}
                        </span>
                      </div>
                    </CardDescription>
                    <div className="flex justify-between items-center mt-2">
                      <Badge
                        variant="outline"
                        className={`${getScoreColor(selectedEntreprise.score)} px-2 py-0.5`}
                      >
                        Score: {selectedEntreprise.score || "N/A"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="max-w-[150px] truncate"
                        title={selectedEntreprise.activite_principale}
                      >
                        {selectedEntreprise.activite_principale ||
                          "Activité non spécifiée"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-2 gap-3 border p-3 rounded-md bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Date de parution
                        </span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedEntreprise.dateparution)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Date de création
                        </span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedEntreprise.date_creation)}
                        </span>
                      </div>
                    </div>

                    {selectedEntreprise.dirigeant && (
                      <div className="border-t pt-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <Building className="h-4 w-4" /> Dirigeant
                        </h3>
                        <p className="text-sm">
                          {selectedEntreprise.dirigeant}
                        </p>
                      </div>
                    )}

                    {selectedEntreprise.activite && (
                      <div className="border-t pt-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <Activity className="h-4 w-4" /> Activité
                        </h3>
                        <p className="text-sm">{selectedEntreprise.activite}</p>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </h3>
                      <p className="text-sm">
                        {selectedEntreprise.social_adresse ||
                          "Adresse non spécifiée"}
                      </p>
                      {(selectedEntreprise.social_code_postal ||
                        selectedEntreprise.social_ville) && (
                        <p className="text-sm">
                          {selectedEntreprise.social_code_postal}{" "}
                          {selectedEntreprise.social_ville}
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Informations légales
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedEntreprise.tribunal && (
                          <div>
                            <p className="text-xs text-gray-500">Tribunal</p>
                            <p>{selectedEntreprise.tribunal}</p>
                          </div>
                        )}
                        {selectedEntreprise.numeroannonce && (
                          <div>
                            <p className="text-xs text-gray-500">
                              N° d&apos;annonce
                            </p>
                            <p>{selectedEntreprise.numeroannonce}</p>
                          </div>
                        )}
                        {selectedEntreprise.registre && (
                          <div>
                            <p className="text-xs text-gray-500">Registre</p>
                            <p>{selectedEntreprise.registre}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 mt-4 pt-2 border-t">
                      <Button
                        variant={
                          selectedEntreprise.favori ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          selectedEntreprise.favori
                            ? "bg-red-500 hover:bg-red-600"
                            : ""
                        }
                        onClick={() => {}}
                      >
                        <Heart
                          className={`h-4 w-4 mr-1 ${selectedEntreprise.favori ? "fill-white" : ""}`}
                        />
                        {selectedEntreprise.favori
                          ? "Favori"
                          : "Ajouter aux favoris"}
                      </Button>

                      {selectedEntreprise.url_complete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              selectedEntreprise.url_complete,
                              "_blank",
                            )
                          }
                        >
                          Voir l&apos;annonce
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </div>

        {/* Status bar - absolute bottom center (on the map) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 px-4 py-2 rounded-full shadow-md text-sm backdrop-blur-sm">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{entrepriseMarkers.length} entreprises</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {entreprises.length > 0
                  ? Math.round(
                      (entrepriseMarkers.length / entreprises.length) * 100,
                    )
                  : 0}
                % géolocalisées
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs ml-1"
                onClick={handleShowGlobalView}
              >
                Détails
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowEnafFilter(!showEnafFilter)}
              >
                <Filter className="h-3 w-3 mr-1" />
                Filtre ENAF
              </Button>
            </div>
          )}
        </div>

        {/* ENAF Filter select */}
        {showEnafFilter && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 px-4 py-2 rounded-lg shadow-md text-sm backdrop-blur-sm w-64">
            <Select
              value={enafFilter}
              onValueChange={(value) => setEnafFilter(value)}
            >
              <SelectTrigger className="w-full border-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Filtrer par code ENAF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les codes ENAF</SelectItem>
                {enafCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* OpenStreetMap attribution */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 py-1 px-2 rounded-md shadow-sm text-xs">
          <small className="text-gray-500">
            &copy;{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              className="hover:underline"
            >
              OpenStreetMap
            </a>
          </small>
        </div>

        {/* Close sidebar button on mobile */}
        {sidebarOpen && isMobileView && (
          <Button
            className="absolute bottom-16 left-4 z-[1001] rounded-full shadow-lg"
            size="sm"
            variant="secondary"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
}
