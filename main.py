# main.py

from fastapi import FastAPI, HTTPException
from database import SessionLocal, engine, Base
from models import Client, Produit, Commande, ClientModel, ProduitModel, CommandeModel

# Création des tables
Base.metadata.create_all(engine)

app = FastAPI(title="API Gestion DB")

# ------------------------------
# ROUTES GÉNÉRALES
# ------------------------------

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

# ------------------------------
# ROUTES SELECT
# ------------------------------

@app.get("/select/produits/{id_client}")
def get_produit_achete(id_client: int):
    """
    Retourne les produits achetés par un client donné.
    Utilise une jointure entre les tables Commande et Produit.
    """
    db = SessionLocal()
    try:
        commandes = db.query(Commande).filter(Commande.id_client == id_client).all()
        if not commandes:
            raise HTTPException(404, "Aucune commande trouvée pour ce client")
        produits_achetes = []
        for cmd in commandes:
            produit = db.query(Produit).filter(Produit.id == cmd.id_produit).first()
            if produit:
                produits_achetes.append(produit)
        return produits_achetes
    finally:
        db.close()

@app.get("/select/clients/{id_produit}")
def get_clients_ayant_achete(id_produit: int):
    """
    Retourne les clients ayant acheté un produit donné.
    Utilise une jointure entre les tables Commande et Client.
    """
    db = SessionLocal()
    try:
        commandes = db.query(Commande).filter(Commande.id_produit == id_produit).all()
        if not commandes:
            raise HTTPException(404, "Aucune commande trouvée pour ce produit")
        clients_acheteurs = []
        for cmd in commandes:
            client = db.query(Client).filter(Client.id == cmd.id_client).first()
            if client:
                clients_acheteurs.append(client)
        return clients_acheteurs
    finally:
        db.close()