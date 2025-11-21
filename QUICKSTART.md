# 🚀 Quick Start Guide

## Início Rápido em 5 Minutos

### 1. Backend
```bash
cd mobilemed-backend
npm install
.env => "DATABASE_URL"
npx prisma migrate dev
npm run start
# http://localhost:3000
```

### 2. Frontend (novo terminal)
```bash
cd mobilemed-frontend
npm install
npm start
# http://localhost:4200
```

## 📌 Endpoints Principais

```bash
# Pacientes
POST   /pacientes                    # Criar
GET    /pacientes?page=1&pageSize=10 # Listar
GET    /pacientes/:id                # Detalhe
PUT    /pacientes/:id                # Atualizar
DELETE /pacientes/:id                # Deletar

# Exames
POST   /exames                        # Criar (com idempotência)
GET    /exames?page=1&pageSize=10    # Listar
```

---


