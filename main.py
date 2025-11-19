# ------------------------------
# IMPORTATIONS
# ------------------------------
from fastapi import FastAPI, HTTPException  # FastAPI pour créer l'API, HTTPException pour gérer les erreurs
from pydantic import BaseModel  # BaseModel pour valider les données JSON envoyées dans le body
from sqlalchemy import Column, Integer, String, Float, ForeignKey, create_engine  # SQLAlchemy pour la base
from sqlalchemy.orm import sessionmaker, declarative_base, relationship  # ORM pour créer les tables et relations

import config

# ------------------------------
# CONFIGURATION POSTGRESQL
# ------------------------------
engine = create_engine(config.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ------------------------------
# DEFINITION DES TABLES AVEC SQLALCHEMY
# ------------------------------

class Client(Base):
    """Table clients avec id, nom, email, ville et relation avec commandes"""
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    email = Column(String)
    ville = Column(String)
    commandes = relationship("Commande", back_populates="client")  # Relation avec la table commandes

class Produit(Base):
    """Table produits avec id, nom, prix, stock et relation avec commandes"""
    __tablename__ = "produits"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    prix = Column(Float)
    stock = Column(Integer)
    commandes = relationship("Commande", back_populates="produit")  # Relation avec la table commandes

class Commande(Base):
    """Table commandes avec id, id_client, id_produit, quantite et relations"""
    __tablename__ = "commandes"
    id = Column(Integer, primary_key=True)
    id_client = Column(Integer, ForeignKey("clients.id"))
    id_produit = Column(Integer, ForeignKey("produits.id"))
    quantite = Column(Integer)
    client = relationship("Client", back_populates="commandes")  # Relation vers client
    produit = relationship("Produit", back_populates="commandes")  # Relation vers produit

# Création des tables dans la base
Base.metadata.create_all(engine)

# ------------------------------
# MODELES PYDANTIC (VALIDATION DES DONNEES)
# ------------------------------

class ClientModel(BaseModel):
    """Modèle pour valider les données JSON d'un client"""
    nom: str
    email: str
    ville: str

class ProduitModel(BaseModel):
    """Modèle pour valider les données JSON d'un produit"""
    nom: str
    prix: float
    stock: int

class CommandeModel(BaseModel):
    """Modèle pour valider les données JSON d'une commande"""
    id_client: int
    id_produit: int
    quantite: int

# ------------------------------
# CREATION DE L'APPLICATION FASTAPI
# ------------------------------
app = FastAPI(title="API Gestion DB")  # Nom de l'API

@app.get("/")
def read_root():
    """Point d'entrée de l'API"""
    return {"message": "Backend RUN"}

# ------------------------------
# ROUTES CLIENTS
# ------------------------------

@app.post("/clients")
def create_client(data: ClientModel):
    """
    Crée un client à partir des données reçues en JSON.
    """
    db = SessionLocal()  # Crée une session
    try:
        nouveau = Client(**data.dict())  # Crée l'objet SQLAlchemy
        db.add(nouveau)
        db.commit()
        db.refresh(nouveau)  # Récupère l'ID généré automatiquement
        return {
                    "message": "Client créé", 
                    "client": {
                        "nom": nouveau.nom,
                        "email": nouveau.email
                    }
                }
    finally:
        db.close()  # Fermer la session

@app.get("/clients")
def liste_clients():
    """Retourne tous les clients"""
    db = SessionLocal()
    try:
        return db.query(Client).all()
    finally:
        db.close()

@app.get("/clients/{client_id}")
def get_client(client_id: int):
    """Retourne un client spécifique par son ID"""
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(404, "Client introuvable")
        return client
    finally:
        db.close()

@app.put("/clients/{client_id}")
def update_client(client_id: int, data: ClientModel):
    """Met à jour un client existant"""
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(404, "Client introuvable")
        for key, value in data.dict().items():
            setattr(client, key, value) # Met à jour les attributs
        db.commit()
        return {"message": "Client modifié"}
    finally:
        db.close()

@app.delete("/clients/{client_id}")
def delete_client(client_id: int):
    """Supprime un client existant"""
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(404, "Client introuvable")
        db.delete(client)
        db.commit()
        return {"message": "Client supprimé"}
    finally:
        db.close()

# ------------------------------
# ROUTES PRODUITS
# ------------------------------

@app.post("/produits")
def create_produit(produit: ProduitModel):
    """Crée un produit"""
    db = SessionLocal()
    try:
        nouveau = Produit(**produit.dict())
        db.add(nouveau)
        db.commit()
        db.refresh(nouveau)
        return {
                    "message": "Produit créé", 
                    "produit": {
                        "nom": nouveau.nom,
                        "prix": nouveau.prix
                    }
                }
    finally:
        db.close()

@app.get("/produits")
def liste_produits():
    """Retourne tous les produits"""
    db = SessionLocal()
    try:
        return db.query(Produit).all()
    finally:
        db.close()

@app.get("/produits/{produit_id}")
def get_produit(produit_id: int):
    """Retourne un produit spécifique"""
    db = SessionLocal()
    try:
        produit = db.query(Produit).filter(Produit.id == produit_id).first()
        if not produit:
            raise HTTPException(404, "Produit introuvable")
        return produit
    finally:
        db.close()

@app.put("/produits/{produit_id}")
def update_produit(produit_id: int, data: ProduitModel):
    """Met à jour un produit existant"""
    db = SessionLocal()
    try:
        produit = db.query(Produit).filter(Produit.id == produit_id).first()
        if not produit:
            raise HTTPException(404, "Produit introuvable")
        for key, value in data.dict().items():
            setattr(produit, key, value)
        db.commit()
        return {"message": "Produit modifié"}
    finally:
        db.close()

@app.delete("/produits/{produit_id}")
def delete_produit(produit_id: int):
    """Supprime un produit existant"""
    db = SessionLocal()
    try:
        produit = db.query(Produit).filter(Produit.id == produit_id).first()
        if not produit:
            raise HTTPException(404, "Produit introuvable")
        db.delete(produit)
        db.commit()
        return {"message": "Produit supprimé"}
    finally:
        db.close()

# ------------------------------
# ROUTES COMMANDES
# ------------------------------

@app.post("/commandes")
def create_commande(cmd: CommandeModel):
    """
    Crée une commande.
    Vérifie que le client et le produit existent avant de créer.
    """
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.id == cmd.id_client).first()
        produit = db.query(Produit).filter(Produit.id == cmd.id_produit).first()
        if not client:
            raise HTTPException(404, "Client introuvable")
        if not produit:
            raise HTTPException(404, "Produit introuvable")
        nouvelle = Commande(**cmd.dict())
        db.add(nouvelle)
        db.commit()
        db.refresh(nouvelle)
        return {
                    "message": "Commande créée", 
                    "commande": {
                        "quantite": nouvelle.quantite
                    }
                }
    finally:
        db.close()

@app.get("/commandes")
def liste_commandes():
    """Retourne toutes les commandes"""
    db = SessionLocal()
    try:
        return db.query(Commande).all()
    finally:
        db.close()
