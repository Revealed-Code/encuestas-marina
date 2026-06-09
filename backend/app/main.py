import io
import pandas as pd
from fastapi.responses import StreamingResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Importamos AMBOS routers desde la carpeta routers
from app.routers.estadisticas import router as estadisticas_router
from app.routers.surveys import router as surveys_router

app = FastAPI(title="Sistema de Encuestas - Marina Mercante")

# Configuración de CORS para conectar con el React de Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Conectamos los dos módulos al servidor principal
app.include_router(estadisticas_router)
app.include_router(surveys_router) 

@app.get("/download-excel")
def download_excel(db: Session = Depends(get_db)):
    # 1. Traemos todas las encuestas de la base de datos
    encuestas = db.query(models.Encuesta).all()
    
    # 2. Estructuramos la información en una lista de diccionarios
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
            "Satisfacción TIC": e.p7_satisfaccion_tic,       # Incluimos la nueva p7
            "Satisfacción Global": e.p8_satisfaccion_global, # Incluimos la nueva p8
            "Comentarios": e.comentarios,
            "Fecha de Creación": e.fecha_creacion
        })
    
    # 3. Convertimos los datos a un DataFrame de Pandas
    df = pd.DataFrame(data)
    
    # 4. Creamos el archivo Excel directamente en memoria virtual (Buffer)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Encuestas Marina")
    output.seek(0)
    
    # 5. Lo enviamos como descarga automática al navegador
    headers = {"Content-Disposition": "attachment; filename=reporte_encuestas_marina.xlsx"}
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)