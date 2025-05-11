"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { Move, Navigation, Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DefaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Mode = "navigation" | "add-markers" | "move-markers";
type PositionTuple = [number, number];
type MarkerData = {
  id: string;
  position: PositionTuple;
  postalCode?: string;
  radius?: number;
};

function MapControls({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-md shadow-lg flex gap-2">
      <button
        onClick={() => setMode("move-markers")}
        className={`p-2 rounded ${mode === "move-markers" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
        title="Mode Déplacement de points"
      >
        <Move className="w-5 h-5" />
      </button>
      <button
        onClick={() => setMode("add-markers")}
        className={`p-2 rounded ${mode === "add-markers" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
        title="Mode Ajout de points"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={() => setMode("navigation")}
        className={`p-2 rounded ${mode === "navigation" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
        title="Mode Navigation"
      >
        <Navigation className="w-5 h-5" />
      </button>
    </div>
  );
}

function SideMenu({
  marker,
  isOpen,
  onClose,
}: {
  marker: MarkerData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !marker) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white z-[1000] shadow-lg p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Détails du point</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="pt-4 border-t">
          <h3 className="font-semibold text-lg mb-2">Données du point</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium">Code Postal</p>
              <p>{marker.postalCode || "Non spécifié"}</p>
            </div>
            <div>
              <p className="font-medium">Rayon</p>
              <p>{marker.radius || 500}m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkerForm({
  marker,
  onSearch,
  isLoading,
  onUpdateMarker,
}: {
  marker: MarkerData | null;
  onSearch: () => void;
  isLoading: boolean;
  onUpdateMarker: (data: { postalCode: string; radius: number }) => void;
}) {
  const [formData, setFormData] = useState({
    postalCode: "",
    radius: "500",
  });

  useEffect(() => {
    if (marker) {
      setFormData({
        postalCode: marker.postalCode || "",
        radius: marker.radius?.toString() || "500",
      });
    }
  }, [marker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMarker({
      postalCode: formData.postalCode,
      radius: parseInt(formData.radius) || 500,
    });
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-lg z-[1000] absolute bottom-4 left-4 w-80"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="font-bold mb-2">Configuration du point</h3>

      <form
        className="space-y-3"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Code Postal</label>
          <Input
            type="text"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            required
            onClick={(e) => e.stopPropagation()}
            placeholder="Ex: 75, 13, 95..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Rayon autour du point (mètres)
          </label>
          <Input
            type="number"
            value={formData.radius}
            onChange={(e) =>
              setFormData({ ...formData, radius: e.target.value })
            }
            min="100"
            max="5000"
            step="100"
            required
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Enregistrer
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSearch();
            }}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Recherche...
              </>
            ) : (
              "Rechercher"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function InteractiveMarkers({
  mode,
  markers,
  setSelectedMarker,
  isLoading,
  setMarkers,
  createMarker,
}: {
  mode: Mode;
  markers: MarkerData[];
  setSelectedMarker: (marker: MarkerData) => void;
  isLoading: boolean;
  setMarkers: (markers: MarkerData[]) => void;
  createMarker: (position: PositionTuple) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      const interactiveElements = [
        "INPUT",
        "SELECT",
        "BUTTON",
        "TEXTAREA",
        "LABEL",
      ];
      const target = e.originalEvent.target as HTMLElement;

      if (
        mode === "add-markers" &&
        !interactiveElements.includes(target.tagName)
      ) {
        createMarker([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  
  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          draggable={mode === "move-markers"}
          eventHandlers={{
            click: () => !isLoading && setSelectedMarker(marker),
            dragstart: () => {},
            dragend: (e) => {
              if (mode === "move-markers") {
                const newPos = (e.target as L.Marker).getLatLng();
                const updatedMarker = {
                  ...marker,
                  position: [newPos.lat, newPos.lng] as PositionTuple,
                };
                setSelectedMarker(updatedMarker);
                setMarkers(
                  markers.map((m) => (m.id === marker.id ? updatedMarker : m)),
                );
              }
            },
          }}
        >
          <Popup>
            {marker.postalCode ? (
              <>
                <b>Code Postal: {marker.postalCode}</b>
                <br />
                Rayon: {marker.radius}m
              </>
            ) : (
              "Cliquez pour configurer ce point"
            )}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function Map() {
  const [mode, setMode] = useState<Mode>("navigation");
  const [map, setMap] = useState<L.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([
    { id: "1", position: [48.8566, 2.3522], radius: 500 },
  ]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Fonction pour créer un nouveau point
  const createMarker = (position: PositionTuple) => {
    const newMarker = {
      id: Date.now().toString(),
      position,
      radius: 500,
    };
    setMarkers([...markers, newMarker]);
    setSelectedMarker(newMarker);
  };

  const handleSearch = () => {
    setIsLoading(true);
    // Simuler une recherche
    setTimeout(() => {
      setIsLoading(false);
      if (selectedMarker) {
        setSideMenuOpen(true);
      }
    }, 1500);
  };

  const handleUpdateMarker = (data: { postalCode: string; radius: number }) => {
    if (!selectedMarker) return;

    const updatedMarker = {
      ...selectedMarker,
      postalCode: data.postalCode,
      radius: data.radius,
    };

    setSelectedMarker(updatedMarker);
    setMarkers(
      markers.map((m) => (m.id === selectedMarker.id ? updatedMarker : m)),
    );
  };

  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
    if (map) {
      map.invalidateSize();
    }
  }, [map]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenReady={(mapInstance) => setMap(mapInstance.target)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <InteractiveMarkers
          mode={mode}
          markers={markers}
          setSelectedMarker={setSelectedMarker}
          isLoading={isLoading}
          setMarkers={setMarkers}
          createMarker={createMarker}
        />
      </MapContainer>

      <MapControls mode={mode} setMode={setMode} />

      <MarkerForm
        marker={selectedMarker}
        onSearch={handleSearch}
        isLoading={isLoading}
        onUpdateMarker={handleUpdateMarker}
      />

      <SideMenu
        marker={selectedMarker}
        isOpen={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
      />
    </div>
  );
}
