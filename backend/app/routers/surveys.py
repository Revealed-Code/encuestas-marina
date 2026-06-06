from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db       
from ..models import Encuesta, Departamento 
from ..schemas import EncuestaCreate

router = APIRouter()

@router.get("/departamentos/")
def get_departamentos(db: Session = Depends(get_db)):
    return db.query(Departamento).all()

@router.post("/encuestas/")
def create_encuesta(encuesta: EncuestaCreate, db: Session = Depends(get_db)):
    # Validar que el departamento exista
    db_dept = db.query(Departamento).filter(Departamento.id == encuesta.departamento_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    
    # Crear la encuesta
    nueva_encuesta = Encuesta(
        departamento_id=encuesta.departamento_id,
        p1_trato=encuesta.p1_trato,
        p2_efectividad=encuesta.p2_efectividad,
        p3_facilidad_reporte=encuesta.p3_facilidad_reporte,
        p4_calidad_conexion=encuesta.p4_calidad_conexion,
        p5_estado_equipos=encuesta.p5_estado_equipos,
        p6_comunicacion=encuesta.p6_comunicacion,
        comentarios=encuesta.comentarios,
        fecha_creacion=datetime.now().isoformat()
    )
    
    db.add(nueva_encuesta)
    db.commit()
    db.refresh(nueva_encuesta)
    return {"status": "success", "id": nueva_encuesta.id}
