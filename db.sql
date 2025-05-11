DROP TABLE IF EXISTS Entreprise CASCADE;

CREATE EXTENSION IF NOT EXISTS postgis;

create table Entreprise (
    id bigint primary key generated always as identity,
    entreprise_id text,
    score text,
    positif text,
    negatif text,
    dateparution text,
    numeroannonce text,
    tribunal text,
    commercant text,
    registre text,
    social_adresse text,
    social_code_postal text,
    social_ville text,
    activite text,
    url_complete text,
    nom_complet text,
    activite_principale text,
    date_creation text,
    created_at timestamp
    with
        time zone default now (),
        latitude text,
        longitude text,
        departement text,
        location geography (POINT)
);

create index restaurants_geo_index on Entreprise using GIST (location);
