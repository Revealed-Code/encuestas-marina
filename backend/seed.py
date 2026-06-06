from app.database import SessionLocal, engine
from app import models
def seed_data():
    # Creamos una sesión
    db = SessionLocal()
    
    # Lista de departamentos de la Marina Mercante
    departamentos_nombres = [
        "Dirección / Sub-Dirección",
        "Departamento Académico",
        "Administración y Finanzas",
        "División de Control de Estudios",
        "Gente de Mar",
        "Servicios Generales",
        "Doctorado",
        "Formacion Avanzada"
        "Creacion Intelectual"
    ]
    
    print("Iniciando carga de departamentos...")
    
    for nombre in departamentos_nombres:
        # Verificamos si ya existe para no duplicar si corres el script dos veces
        db_dept = db.query(models.Departamento).filter(models.Departamento.nombre == nombre).first()
        if not db_dept:
            nuevo_dept = models.Departamento(nombre=nombre)
            db.add(nuevo_dept)
            print(f"Agregado: {nombre}")
    
    db.commit()
    db.close()
    print("¡Proceso finalizado!")

if __name__ == "__main__":
    seed_data()