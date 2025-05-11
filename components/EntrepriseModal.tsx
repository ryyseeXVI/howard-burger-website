import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Entreprise } from "@/lib/types";
import { RichTextItem } from "./RichTextItem";
import InfoItem from "./InfoItem";

interface EntrepriseModalProps {
  entreprise: Entreprise | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntrepriseModal({
  entreprise,
  isOpen,
  onOpenChange,
}: EntrepriseModalProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getScoreColor = (score: string) => {
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum)) return "";
    if (scoreNum <= 4) return "bg-red-100 text-red-800 border-red-200";
    if (scoreNum <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-greeen-100 text-green-800 border-green-200";
  };

  if (!entreprise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {entreprise.nom_complet}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              {entreprise.activite_principale}
            </span>
            {entreprise.score && (
              <Badge
                variant="outline"
                className={getScoreColor(entreprise.score)}
              >
                Score: {entreprise.score}
              </Badge>
            )}
            {entreprise.effectif && (
              <Badge variant="outline">Effectif: {entreprise.effectif}</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Section Identité */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 text-lg">Identité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Date création"
                value={formatDate(entreprise.date_creation)}
              />
              <InfoItem label="Registre" value={entreprise.registre} />
              <InfoItem
                label="URL Registre"
                value={entreprise.url_registre}
                isLink={true}
              />
              <InfoItem label="Commerçant" value={entreprise.commercant} />
              <InfoItem label="Dirigeant" value={entreprise.dirigeant} />
              <InfoItem label="Département" value={entreprise.departement} />
            </div>
          </div>

          {/* Section Adresse */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 text-lg">Adresse</h3>
            <div className="grid grid-cols-1 gap-2">
              <InfoItem label="Adresse" value={entreprise.social_adresse} />
              <div className="flex gap-4">
                <InfoItem
                  label="Code postal"
                  value={entreprise.social_code_postal}
                />
                <InfoItem label="Ville" value={entreprise.social_ville} />
              </div>
              {entreprise.latitude && entreprise.longitude && (
                <InfoItem
                  label="Coordonnées"
                  value={`${entreprise.latitude}, ${entreprise.longitude}`}
                />
              )}
            </div>
          </div>

          {/* Section Annonce */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 text-lg">Détails de l&apos;annonce</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Date parution"
                value={formatDate(entreprise.dateparution)}
              />
              <InfoItem
                label="Numéro annonce"
                value={entreprise.numeroannonce}
              />
              <InfoItem label="Tribunal" value={entreprise.tribunal} />
              <InfoItem
                label="URL complète"
                value={entreprise.url_complete}
                isLink={true}
              />
            </div>
          </div>

          {/* Section Mandataire */}
          {(entreprise.coordonnees_mandataire || entreprise.courrier) && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 text-lg">Mandataire</h3>
              <div className="grid grid-cols-1 gap-4">
                {entreprise.coordonnees_mandataire && (
                  <InfoItem
                    label="Coordonnées"
                    value={entreprise.coordonnees_mandataire}
                  />
                )}
                {entreprise.courrier && (
                  <RichTextItem
                    label="Courrier"
                    withCopyButton
                    value={entreprise.courrier}
                  />
                )}
              </div>
            </div>
          )}

          {/* Section Finances */}
          {entreprise.finances && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 text-lg">
                Informations financières
              </h3>
              <InfoItem label="" value={entreprise.finances} />
            </div>
          )}

          {/* Section Analyse */}
          {(entreprise.positif || entreprise.negatif) && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 text-lg">Analyse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entreprise.positif && (
                  <div>
                    <h4 className="font-medium text-sm text-green-600">
                      Points positifs
                    </h4>
                    <InfoItem label="" value={entreprise.positif} />
                  </div>
                )}
                {entreprise.negatif && (
                  <div>
                    <h4 className="font-medium text-sm text-red-600">
                      Points négatifs
                    </h4>
                    <InfoItem label="" value={entreprise.negatif} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
