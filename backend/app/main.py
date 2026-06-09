from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.estadisticas import router as estadisticas_router
from app.routers.surveys import router as surveys_router

app = FastAPI(title="Sistema de Encuestas - Marina Mercante")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectamos los módulos routers
app.include_router(estadisticas_router)
app.include_router(surveys_router)