from pydantic import BaseModel, Field
from typing import Optional

# fíjate bien en este nombre, debe coincidir letra por letra
class EncuestaCreate(BaseModel):
    departamento_id: int
    p1_trato: int = Field(..., ge=1, le=5)
    p2_efectividad: int = Field(..., ge=1, le=5)
    p3_facilidad_reporte: int = Field(..., ge=1, le=5)
    p4_calidad_conexion: int = Field(..., ge=1, le=5)
    p5_estado_equipos: int = Field(..., ge=1, le=5)
    p6_comunicacion: int = Field(..., ge=1, le=5) # Lo cambié a p6_comunicacion (número)
    comentarios: Optional[str] = None # Este es el que guarda el texto largo

    class Config:
        from_attributes = True