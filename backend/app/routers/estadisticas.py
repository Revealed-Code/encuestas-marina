from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

# Usamos ".." para subir un nivel en las carpetas de forma segura
from ..database import get_db       
from ..models import Encuesta       

router = APIRouter()

@router.get("/estadisticas/")
def obtener_estadisticas(db: Session = Depends(get_db)):
    total = db.query(Encuesta).count()
    
    if total == 0:
        return {
            "total": 0,
            "promedios": [
                {"name": "Trato", "Promedio": 0},
                {"name": "Efectividad", "Promedio": 0},
                {"name": "Reporte", "Promedio": 0},
                {"name": "Internet", "Promedio": 0},
                {"name": "Equipos", "Promedio": 0},
                {"name": "Comunicación", "Promedio": 0},
            ]
        }
        
    promedios = db.query(
        func.avg(Encuesta.p1_trato).label("p1"),
        func.avg(Encuesta.p2_efectividad).label("p2"),
        func.avg(Encuesta.p3_facilidad_reporte).label("p3"),
        func.avg(Encuesta.p4_calidad_conexion).label("p4"),
        func.avg(Encuesta.p5_estado_equipos).label("p5"),
        func.avg(Encuesta.p6_comunicacion).label("p6")
    ).first()

    data_grafico = [
        {"name": "Trato", "Promedio": round(promedios.p1 or 0, 2)},
        {"name": "Efectividad", "Promedio": round(promedios.p2 or 0, 2)},
        {"name": "Reporte", "Promedio": round(promedios.p3 or 0, 2)},
        {"name": "Internet", "Promedio": round(promedios.p4 or 0, 2)},
        {"name": "Equipos", "Promedio": round(promedios.p5 or 0, 2)},
        {"name": "Comunicación", "Promedio": round(promedios.p6 or 0, 2)},
    ]

    return {
        "total": total,
        "promedios": data_grafico
    }