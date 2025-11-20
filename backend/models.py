# models.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from database import Base

# ------------------------------
# TABLES SQLALCHEMY
# ------------------------------

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    email = Column(String)
    ville = Column(String)
    commandes = relationship("Commande", back_populates="client")

class Produit(Base):
    __tablename__ = "produits"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    prix = Column(Float)
    stock = Column(Integer)
    commandes = relationship("Commande", back_populates="produit")

class Commande(Base):
    __tablename__ = "commandes"
    id = Column(Integer, primary_key=True)
    id_client = Column(Integer, ForeignKey("clients.id"))
    id_produit = Column(Integer, ForeignKey("produits.id"))
    quantite = Column(Integer)
    client = relationship("Client", back_populates="commandes")
    produit = relationship("Produit", back_populates="commandes")

# ------------------------------
# MODEL Pydantic
# ------------------------------

class ClientModel(BaseModel):
    nom: str
    email: str
    ville: str

class ProduitModel(BaseModel):
    nom: str
    prix: float
    stock: int

class CommandeModel(BaseModel):
    id_client: int
    id_produit: int
    quantite: int
