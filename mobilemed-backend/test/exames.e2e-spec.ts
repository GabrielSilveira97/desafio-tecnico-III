import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModalidadeDICOM } from '@prisma/client';

describe('Exames (e2e) - Criação', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pacienteId: string;

  beforeAll(async () => {


    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.exame.deleteMany({});
    await prisma.paciente.deleteMany({});

    const paciente = await prisma.paciente.create({
      data: {
        nome: 'Gabriel Silveira',
        documento: '123.456.789-01',
        dataNascimento: new Date('1990-01-01'),
      },
    });

    pacienteId = paciente.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve criar exame com paciente existente e idempotencyKey nova', async () => {
    const exameData = {
      pacienteId,
      idempotencyKey: 'unique-key-123',
      modalidade: ModalidadeDICOM.CT,
      dataExame: new Date().toISOString(),
      descricao: 'Exame de teste',
    };

    const response = await request(app.getHttpServer())
      .post('/exames')
      .send(exameData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.pacienteId).toBe(pacienteId);
    expect(response.body.idempotencyKey).toBe(exameData.idempotencyKey);
    expect(response.body.modalidade).toBe(exameData.modalidade);
    expect(response.body.descricao).toBe(exameData.descricao);

    const exameInDb = await prisma.exame.findUnique({
      where: { id: response.body.id },
    });
    expect(exameInDb).not.toBeNull();
    expect(exameInDb?.idempotencyKey).toBe(exameData.idempotencyKey);
  });
});
