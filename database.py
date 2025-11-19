# database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import config

# Configuration PostgreSQL
engine = create_engine(config.DATABASE_URL)   # Connexion à la base
SessionLocal = sessionmaker(bind=engine)      # Créateur de sessions DB
Base = declarative_base()                     # Base des modèles SQLAlchemy

