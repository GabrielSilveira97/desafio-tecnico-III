-- CreateEnum
CREATE TYPE "ModalidadeDICOM" AS ENUM ('CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA');

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exame" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "modalidade" "ModalidadeDICOM" NOT NULL,
    "dataExame" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Exame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_documento_key" ON "Paciente"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Exame_idempotencyKey_key" ON "Exame"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "Exame" ADD CONSTRAINT "Exame_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
