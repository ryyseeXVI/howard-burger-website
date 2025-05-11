"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect, useMemo } from "react";
import { X, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Entreprise } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { getScoreColor, truncateText } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Fonction pour créer une icône SVG personnalisée
const createSvgIcon = (color: string) => {
  return L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `,
    className: "custom-marker-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Définition des icônes pour les marqueurs
const DefaultIcon = createSvgIcon("#2196F3"); // Bleu
const GoodScoreIcon = createSvgIcon("#4CAF50"); // Vert
const MediumScoreIcon = createSvgIcon("#FF9800"); // Orange
const LowScoreIcon = createSvgIcon("#F44336"); // Rouge

// Styles CSS pour les marqueurs
const markerStyles = `
  .custom-marker-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .leaflet-popup-content {
    margin: 8px 12px;
    line-height: 1.3;
    font-size: 13px;
    min-height: unset;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

// Interface pour les marqueurs d'entreprises
interface EntrepriseMarker {
  id: string;
  position: [number, number];
  entreprise: Entreprise;
}

interface FilterState {
  departement: string; // 'all' ou l'identifiant du département
  scoreMin: number;
  favori: boolean;
}

// Vérifie si un filtre est actif (différent de la valeur par défaut)
const isFilterActive = (
  filter: string | number | boolean,
  key: string,
): boolean => {
  if (key === "departement") return filter !== "all";
  if (key === "scoreMin") return Number(filter) > 0;
  if (key === "favori") return filter === true;
  return false;
};

// Filtre par région/département
function FilterPanel({
  isOpen,
  onClose,
  onFilterChange,
  departements,
  activeFilters,
  isMobileView,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: FilterState) => void;
  departements: string[];
  activeFilters: FilterState;
  isMobileView: boolean;
}) {
  const [filters, setFilters] = useState(activeFilters);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`absolute ${isMobileView ? "top-16 left-4 right-4" : "top-24 right-4 w-80"} z-[1001] bg-white p-4 rounded-md shadow-lg`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Filtres</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Département</Label>
          <Select
            value={filters.departement}
            onValueChange={(value) => handleChange("departement", value)}
          >
            <SelectTrigger className="z-[1002]">
              <SelectValue placeholder="Tous les départements" />
            </SelectTrigger>
            <SelectContent className="z-[1002]">
              <SelectItem value="all">Tous les départements</SelectItem>
              {departements.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Score minimum</Label>
          <Select
            value={filters.scoreMin.toString()}
            onValueChange={(value) => handleChange("scoreMin", parseInt(value))}
          >
            <SelectTrigger className="z-[1002]">
              <SelectValue placeholder="Aucun minimum" />
            </SelectTrigger>
            <SelectContent className="z-[1002]">
              <SelectItem value="0">Aucun minimum</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
              <SelectItem value="6">6+</SelectItem>
              <SelectItem value="7">7+</SelectItem>
              <SelectItem value="8">8+</SelectItem>
              <SelectItem value="9">9+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="favori-filter"
            checked={filters.favori}
            onCheckedChange={(checked) => handleChange("favori", !!checked)}
          />
          <label htmlFor="favori-filter" className="text-sm font-medium">
            Favoris seulement
          </label>
        </div>

        <div className="pt-2">
          <Button onClick={handleApply} className="w-full">
            Appliquer les filtres
          </Button>
        </div>
      </div>
    </div>
  );
}

// Barre de recherche
function SearchBar({
  onSearch,
  isMobileView,
}: {
  onSearch: (query: string) => void;
  isMobileView: boolean;
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full relative">
      <Input
        placeholder={
          isMobileView ? "Rechercher..." : "Rechercher une entreprise..."
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-8 border-gray-200 text-sm"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <Button type="submit" size="sm" className="ml-1 px-2">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}

// Composant principal de la carte
export default function MapWithEntreprises({
  markers = [],
  onMarkerClickAction: onMarkerClickFn,
  loading = false,
  onInitialized,
  attributionControl = false,
}: {
  markers: EntrepriseMarker[];
  // eslint-disable-next-line react/no-unused-prop-types
  onMarkerClickAction?: (entreprise: Entreprise | { id: string }) => void;
  loading?: boolean;
  onInitialized?: () => void;
  attributionControl?: boolean;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filteredMarkers, setFilteredMarkers] =
    useState<EntrepriseMarker[]>(markers);
  const [isMobileView, setIsMobileView] = useState(false);
  // Valeurs par défaut des filtres (considérées comme non-actives)
  const defaultFilters: FilterState = {
    departement: "all",
    scoreMin: 0,
    favori: false,
  };

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    ...defaultFilters,
  });

  // Detect mobile view
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

  // Extract all departments from markers
  const departements = useMemo(() => {
    const depts = markers.map((m) => m.entreprise.departement).filter(Boolean);
    return [...new Set(depts)].sort();
  }, [markers]);

  // Update markers when props change
  useEffect(() => {
    const applyCurrentFilters = () => {
      let result = [...markers];

      // Filtrer par département seulement si une valeur spécifique est sélectionnée
      if (activeFilters.departement && activeFilters.departement !== "all") {
        result = result.filter(
          (m) => m.entreprise.departement === activeFilters.departement,
        );
      }

      if (activeFilters.scoreMin > 0) {
        result = result.filter(
          (m) =>
            m.entreprise.score &&
            parseInt(m.entreprise.score) >= activeFilters.scoreMin,
        );
      }

      if (activeFilters.favori) {
        result = result.filter((m) => m.entreprise.favori);
      }

      setFilteredMarkers(result);
    };

    applyCurrentFilters();
  }, [markers, activeFilters]);

  // Add marker styles to document head
  useEffect(() => {
    // Ajouter un style pour l'ombre des marqueurs
    const style = document.createElement("style");
    style.textContent = markerStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Set default icon for all markers and handle map resize
  useEffect(() => {
    if (map) {
      map.invalidateSize();

      // Notify parent component that map is initialized
      if (onInitialized) {
        onInitialized();
      }
    }
  }, [map, onInitialized]);

  // Function to get icon based on score
  const getIconForScore = (score: string) => {
    if (!score || isNaN(parseInt(score))) return DefaultIcon;

    const scoreNum = parseInt(score);
    if (scoreNum >= 7) return GoodScoreIcon;
    if (scoreNum >= 4) return MediumScoreIcon;
    return LowScoreIcon;
  };

  // Apply filters to markers
  const applyFilters = (
    allMarkers: EntrepriseMarker[],
    filters: FilterState,
  ) => {
    let result = [...allMarkers];

    // Ne filtrer que si un département spécifique est sélectionné
    if (filters.departement && filters.departement !== "all") {
      result = result.filter(
        (m) => m.entreprise.departement === filters.departement,
      );
    }

    if (filters.scoreMin > 0) {
      result = result.filter(
        (m) =>
          m.entreprise.score &&
          parseInt(m.entreprise.score) >= filters.scoreMin,
      );
    }

    if (filters.favori) {
      result = result.filter((m) => m.entreprise.favori);
    }

    setFilteredMarkers(result);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setActiveFilters(newFilters);
    applyFilters(markers, newFilters);
  };

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      applyFilters(markers, activeFilters);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const result = markers.filter(
      (m) =>
        m.entreprise.nom_complet?.toLowerCase().includes(lowerQuery) ||
        m.entreprise.activite_principale?.toLowerCase().includes(lowerQuery) ||
        m.entreprise.social_ville?.toLowerCase().includes(lowerQuery),
    );

    setFilteredMarkers(result);

    // Zoom to fit all search results if there are any
    if (result.length > 0 && map) {
      const bounds = L.latLngBounds(result.map((m) => m.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        whenReady={(mapInstance: { target: L.Map }) =>
          setMap(mapInstance.target)
        }
        attributionControl={attributionControl}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {!loading &&
          filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={getIconForScore(marker.entreprise.score)}
              eventHandlers={{
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                click: () => onMarkerClickFn && onMarkerClickFn(marker.entreprise),
              }}
            >
              <Popup>
                <div className="compact-popup">
                  <p className="font-medium text-xs">
                    {truncateText(marker.entreprise.nom_complet, 30)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {truncateText(marker.entreprise.social_ville, 20)}
                    {marker.entreprise.social_code_postal
                      ? ` (${marker.entreprise.social_code_postal})`
                      : ""}
                  </p>
                  <Badge
                    variant="outline"
                    className={`${getScoreColor(marker.entreprise.score)} text-xs mt-1 px-1 py-0`}
                  >
                    Score: {marker.entreprise.score || "N/A"}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Contrôles supérieurs */}
      <div className="absolute top-4 left-0 right-0 z-[1000] flex justify-center items-center px-4">
        <div className="bg-white rounded-md shadow-lg p-2 flex items-center gap-2 w-full max-w-[800px]">
          <div className="flex-grow">
            <SearchBar onSearch={handleSearch} isMobileView={isMobileView} />
          </div>

          {/* Bouton de filtres */}
          <Button
            onClick={() => setFilterOpen(!filterOpen)}
            className="bg-white text-black hover:bg-gray-100 border border-gray-200"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            {!isMobileView ? (
              <>
                <span className="ml-2">Filtres</span>
                {Object.entries(activeFilters).some(([key, value]) =>
                  isFilterActive(value, key),
                ) && (
                  <Badge variant="secondary" className="ml-2">
                    {
                      Object.entries(activeFilters).filter(([key, value]) =>
                        isFilterActive(value, key),
                      ).length
                    }
                  </Badge>
                )}
              </>
            ) : (
              Object.entries(activeFilters).some(([key, value]) =>
                isFilterActive(value, key),
              ) && (
                <Badge variant="secondary" className="ml-1">
                  {
                    Object.entries(activeFilters).filter(([key, value]) =>
                      isFilterActive(value, key),
                    ).length
                  }
                </Badge>
              )
            )}
          </Button>
        </div>
      </div>

      {/* Panneau de filtres */}
      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onFilterChange={handleFilterChange}
        departements={departements}
        activeFilters={activeFilters}
        isMobileView={isMobileView}
      />

      {/* Attribution OpenStreetMap */}
      {!attributionControl && (
        <div className="absolute bottom-4 right-4 z-[999] bg-white/90 py-1 px-2 rounded-md shadow-sm text-xs">
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
      )}

      {/* Indicateur du nombre d'entreprises - Ne s'affiche que si non vide */}
      {!loading && markers.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[999] bg-white px-4 py-2 rounded-full shadow-lg text-xs flex items-center">
          <div>
            {filteredMarkers.length === markers.length ? (
              <span>{markers.length} entreprises</span>
            ) : (
              <span>
                {filteredMarkers.length} sur {markers.length} entreprises
              </span>
            )}
          </div>
          <div className="mx-2 text-gray-300">|</div>
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {markers.length > 0
              ? Math.round((filteredMarkers.length / markers.length) * 100)
              : 0}
            % géolocalisées
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs ml-1"
            onClick={() => {
              // Émettre un événement pour afficher tous les points
              if (onMarkerClickFn && markers.length > 0) {
                // On utilise un événement spécial pour indiquer qu'on veut voir tous les points
                onMarkerClickFn({ id: "all" });
              }
            }}
          >
            Détails
          </Button>
        </div>
      )}
    </div>
  );
}
