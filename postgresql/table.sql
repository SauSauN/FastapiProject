-- Table Client
CREATE TABLE Client (
    id_client SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    ville VARCHAR(50) NOT NULL
);

-- Table Produit
CREATE TABLE Produit (
    id_produit SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0)
);

-- Table Commande
CREATE TABLE Commande (
    id_commande SERIAL PRIMARY KEY,
    id_client INT NOT NULL REFERENCES Client(id_client),
    id_produit INT NOT NULL REFERENCES Produit(id_produit),
    quantite INT NOT NULL CHECK (quantite > 0)
);