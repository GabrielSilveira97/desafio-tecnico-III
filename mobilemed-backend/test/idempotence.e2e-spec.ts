import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Exames - Idempotência concorrente (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve persistir apenas 1 exame mesmo com requisições simultâneas', async () => {
    const paciente = await prisma.paciente.create({
      data: { nome: 'Teste Concorrência', documento: '99999999999', dataNascimento: new Date('1990-01-01') },
    });

    const examePayload = {
      pacienteId: paciente.id,
      idempotencyKey: 'CONCORRENTE-123',
      modalidade: 'CT',
      dataExame: new Date().toISOString(),
      descricao: 'Teste concorrente',
    };

    await Promise.all(
      Array(5)
        .fill(0)
        .map(() =>
          request(app.getHttpServer())
            .post('/exames')
            .send(examePayload)
            .expect(201),
        ),
    );

    const exames = await prisma.exame.findMany({
      where: { idempotencyKey: 'CONCORRENTE-123' },
    });

    expect(exames.length).toBe(1);
  });
});
