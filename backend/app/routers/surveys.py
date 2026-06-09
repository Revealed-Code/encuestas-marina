import io
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
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
    
    # Crear la encuesta con las 8 preguntas integradas
    nueva_encuesta = Encuesta(
        departamento_id=encuesta.departamento_id,
        p1_trato=encuesta.p1_trato,
        p2_efectividad=encuesta.p2_efectividad,
        p3_facilidad_reporte=encuesta.p3_facilidad_reporte,
        p4_calidad_conexion=encuesta.p4_calidad_conexion,
        p5_estado_equipos=encuesta.p5_estado_equipos,
        p6_comunicacion=encuesta.p6_comunicacion,
        p7_satisfaccion_tic=encuesta.p7_satisfaccion_tic,       # Guardamos p7
        p8_satisfaccion_global=encuesta.p8_satisfaccion_global, # Guardamos p8
        comentarios=encuesta.comentarios,
        fecha_creacion=datetime.now().isoformat()
    )
    
    db.add(nueva_encuesta)
    db.commit()
    db.refresh(nueva_encuesta)
    return {"status": "success", "id": nueva_encuesta.id}


@router.get("/download-excel")
def download_excel(db: Session = Depends(get_db)):
    # 1. Traemos todas las encuestas de la base de datos
    encuestas = db.query(Encuesta).all()
    
    # 2. Estructuramos la información para el DataFrame
    data = []
    for e in encuestas:
        data.append({
            "ID": e.id,
            "ID Departamento": e.departamento_id,
            "Departamento": e.departamento.nombre if e.departamento else "No asignado",
            "Correo Institucional": e.p1_trato,
            "Internet Sede": e.p2_efectividad,
            "WiFi Sede": e.p3_facilidad_reporte,
            "Telefonía": e.p4_calidad_conexion,
            "Soporte Técnico": e.p5_estado_equipos,
            "Sistemas Informáticos": e.p6_comunicacion,
            "Satisfacción TIC": e.p7_satisfaccion_tic,       
            "Satisfacción Global": e.p8_satisfaccion_global, 
            "Comentarios": e.comentarios,
            "Fecha de Creación": e.fecha_creacion
        })
    
    if not data:
        # Si la base de datos está vacía, evitamos que pandas falle creando columnas por defecto
        df = pd.DataFrame(columns=["ID", "Departamento", "Mensaje"])
        df.loc[0] = [1, "N/A", "No hay encuestas registradas aún"]
    else:
        df = pd.DataFrame(data)
    
    # 3. Creamos el archivo Excel en memoria
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Encuestas Marina")
    output.seek(0)
    
    headers = {"Content-Disposition": "attachment; filename=reporte_encuestas_marina.xlsx"}
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)