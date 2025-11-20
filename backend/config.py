# config.py

# Configuration de l'application
APP_HOST = "127.0.0.22"  # Adresse d'écoute
APP_PORT = 8000         # Port d'écoute
APP_DEBUG = True        # Mode debug

# Configuration de la Base de Données (Récupéré de connexion.py)
DATABASE_URL = "postgresql+psycopg2://neondb_owner:**************@ep-steep-base-afg14wez-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"