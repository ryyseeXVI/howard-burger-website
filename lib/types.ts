export interface Entreprise {
  id: number;
  entreprise_id: string;
  score: string;
  positif: string;
  negatif: string;
  dateparution: string;
  numeroannonce: string;
  tribunal: string;
  commercant: string;
  registre: string;
  social_adresse: string;
  social_code_postal: string;
  social_ville: string;
  activite: string;
  url_complete: string;
  nom_complet: string;
  activite_principale: string;
  date_creation: string;
  created_at: string;
  latitude: string;
  longitude: string;
  departement: string;
  location: unknown;
  url_registre: string;
  effectif: string;
  dirigeant: string;
  finances: string;
  courrier: string;
  coordonnees_mandataire: string;
  favori: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}
