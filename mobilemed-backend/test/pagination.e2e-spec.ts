import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Pacientes - Paginação (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await prisma.exame.deleteMany({});
    await prisma.paciente.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar pacientes paginados corretamente', async () => {
    const pacientesPromises = Array.from({ length: 15 }).map((_, i) =>
      prisma.paciente.create({
        data: {
          nome: `Paciente`,
          documento: `111111111${i}`,
          dataNascimento: new Date('1990-01-01'),
        },
      }),
    );
    await Promise.all(pacientesPromises);

    const res = await request(app.getHttpServer())
      .get('/pacientes?page=1&limit=10')
      .expect(200);

    expect(res.body.data).toHaveLength(10);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.total).toBe(15);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data[0]).toHaveProperty('nome');

    const res2 = await request(app.getHttpServer())
      .get('/pacientes?page=2&limit=10')
      .expect(200);
    expect(res2.body.data).toHaveLength(5);
    expect(res2.body.page).toBe(2);
    expect(res2.body.data[0]).toHaveProperty('nome');
  });
});
