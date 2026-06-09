from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base # O como importes tu Base

class Departamento(Base):
    __tablename__ = "departamentos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    
    # 🌟 CAMBIO: Usa back_populates apuntando al campo de la otra tabla
    encuestas = relationship("Encuesta", back_populates="departamento")


class Encuesta(Base):
    __tablename__ = "encuestas"
    
    id = Column(Integer, primary_key=True, index=True)
    departamento_id = Column(Integer, ForeignKey("departamentos.id"))
    
    # Campos de las preguntas
    p1_trato = Column(Integer)
    p2_efectividad = Column(Integer)
    p3_facilidad_reporte = Column(Integer)
    p4_calidad_conexion = Column(Integer)
    p5_estado_equipos = Column(Integer)
    p6_comunicacion = Column(Integer)
    p7_satisfaccion_tic = Column(Integer)
    p8_satisfaccion_global = Column(Integer)
    
    comentarios = Column(String, nullable=True)
    fecha_creacion = Column(String) # O DateTime si prefieres, pero String es más simple para SQLite si guardas ISO strings

    # 🌟 CAMBIO: Usa back_populates apuntando al campo de la tabla Departame nto
    departamento = relationship("Departamento", back_populates="encuestas")