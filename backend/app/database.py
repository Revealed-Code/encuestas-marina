from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# El archivo se creará automáticamente como 'marina_encuestas.db'
SQLALCHEMY_DATABASE_URL = "sqlite:///./marina_encuestas.db"

# 'check_same_thread': False es REQUISITO para que SQLite funcione con FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()