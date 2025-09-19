

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from contextlib import contextmanager

# Database URL - can be overridden with environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://ist_user:ist_password@localhost:5432/interactive_storytelling_db"
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

@contextmanager
def get_db_context():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables"""
    from database_models import Base
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def drop_tables():
    """Drop all database tables"""
    from database_models import Base
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped successfully!")
