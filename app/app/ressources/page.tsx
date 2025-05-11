"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function RessourcesPage() {
  const outils = [
    {
      title: "Site du gouvernement",
      description: "Annonces légales des liquidations judiciaires",
      url: "https://www.bodacc.fr",
    },
    {
      title: "Les Repreneurs",
      description: "Plateforme de mise en relation avec des repreneurs",
      url: "https://www.repreneurs.com",
    },
    {
      title: "Les mandataires.com",
      description: "Annuaire de mandataires liquidateurs",
      url: "https://lesmandataires.com/",
    },
    {
      title: "Infogreffe",
      description: "Données financières et juridiques des entreprises",
      url: "https://www.infogreffe.fr",
    },
  ];

  const references = [
    {
      title: "INSEE - Codes NAF",
      description: "Nomenclature d'activités française complète",
      url: "https://www.insee.fr/fr/information/2406147",
    },
    {
      title: "Legifrance",
      description: "Textes de lois sur les procédures collectives",
      url: "https://www.legifrance.gouv.fr",
    },
    {
      title: "APCE",
      description: "Agence pour la création d'entreprise - ressources",
      url: "https://www.apce.com",
    },
    {
      title: "URSSAF",
      description: "Informations sur les obligations sociales",
      url: "https://www.urssaf.fr",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Ressources utiles</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Carte Outils */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Sites & Outils pratiques</CardTitle>
            <p className="text-sm text-muted-foreground">
              Plateformes pour suivre les liquidations et trouver des repreneurs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {outils.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Carte Références */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Références & Données</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sources officielles pour les codes NAF et réglementations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {references.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
