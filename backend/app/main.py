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