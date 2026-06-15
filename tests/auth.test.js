const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('POST /auth/register', () => {
  beforeEach(async () => {
    await prisma.link.deleteMany();
    await prisma.user.deleteMany();
  });
  it('deve retornar 400 quando os dados não forem enviados', async () => {
    const response = await request(app).post('/auth/register');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ message: 'Erro de validação' });
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
  it('deve retornar 400 quando o e-mail for inválido', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Usuário Teste',
      email: 'email-invalido',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    });
    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toMatchObject({
      field: 'email',
      message: 'E-mail inválido',
    });
  });
  it('deve retornar 400 quando as senhas não combinam', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Usuário Teste',
      email: 'email@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@1233',
    });
    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toMatchObject({
      field: 'confirmPassword',
      message: 'As senhas não conferem',
    });
  });
  it('deve retornar 201 quando o cadastro for realizado', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    });
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('emailteste@teste.com');
  });
  it('deve retornar 409 quando o e-mail já estiver cadastrado', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'duplicado@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };

    const firstResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const secondResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(409);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await prisma.link.deleteMany();
    await prisma.user.deleteMany();
  });
  it('deve retornar 400 quando os dados não forem enviados', async () => {
    const response = await request(app).post('/auth/login');

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
  it('deve retornar 400 quando o e-mail for inválido', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'email-invalido',
      password: 'Senha@123',
    });
    expect(response.status).toBe(400);

    expect(response.body.errors[0]).toMatchObject({
      field: 'email',
      message: 'E-mail inválido',
    });
  });
  it('deve retornar 200 quando o login for realizado', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);
    const response = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    expect(registerResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
  it('deve retornar 401 quando a senha for incorreta', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);
    const response = await request(app).post('/auth/login').send({
      email: userData.email,
      password: 'SenhaErrada@123',
    });
    expect(registerResponse.status).toBe(201);
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: 'Email ou senha inválidos',
    });
  });
  it('deve retornar 401 quando o email não estiver registrado', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'emailnaocadastrado@email.com',
      password: 'Senha@123',
    });
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: 'Email ou senha inválidos',
    });
  });
});
describe('GET /auth/me', () => {
  it('deve retornar 401 se não possuir o token', async () => {
    const response = await request(app).get('/auth/me');
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: 'Token não fornecido',
    });
  });
  it('deve retornar 401 se o token for inválido', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer token-invalido');
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: 'Token inválido ou expirado',
    });
  });
  it('deve retornar 200 se o token for válido', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);
    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginToken}`);
    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(userData.email);
  });
});
afterAll(async () => {
  await prisma.$disconnect();
});
