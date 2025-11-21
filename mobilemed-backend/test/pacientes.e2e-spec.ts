import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Pacientes (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.exame.deleteMany();
    await prisma.paciente.deleteMany();
  });

  it('Deve criar um paciente válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/pacientes')
      .send({
        nome: 'Gabriel Silveira',
        documento: '12345678900',
        dataNascimento: '1990-01-01T00:00:00.000Z',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.nome).toBe('Gabriel Silveira');
  });

  it('Deve retornar 409 ao tentar criar paciente com documento duplicado', async () => {
    await prisma.paciente.create({
      data: {
        nome: 'João',
        documento: '11122233344',
        dataNascimento: '1990-01-01T00:00:00.000Z',
      },
    });

    const res = await request(app.getHttpServer())
      .post('/pacientes')
      .send({
        nome: 'João Dup',
        documento: '11122233344',
        dataNascimento: '1990-01-01T00:00:00.000Z',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Já existe um paciente');
  });
});
