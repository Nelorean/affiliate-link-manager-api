const prisma = require('../src/config/prisma');
const request = require('supertest');
const app = require('../src/app');

beforeEach(async () => {
  await prisma.link.deleteMany();
  await prisma.user.deleteMany();
});
describe('POST /links', () => {
  it('deve retornar 401 se não possuir o token', async () => {
    const response = await request(app).post('/links');
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: 'Token não fornecido',
    });
  });
  it('deve retornar 400 se possuir token e link vazio', async () => {
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
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`);
    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(response.status).toBe(400);
  });
  it('deve retornar 201 se criar um link válido', async () => {
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
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send({
        title: 'Curso Node',
        originalUrl: 'https://example.com/produto',
        slug: 'curso-node',
      });

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(response.status).toBe(201);
    expect(response.body.link.slug).toBe('curso-node');
  });
  it('deve retornar 409 quando o slug já estiver cadastrado', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'duplicado@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };

    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);
    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const firstResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);
    const secondResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(409);
  });
});
describe('GET /links', () => {
  it('deve retornar 401 se o token não for fornecido', async () => {
    const response = await request(app).get('/links');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: 'Token não fornecido',
    });
  });
  it('deve retornar uma lista vazia quando o usuário não possuir link', async () => {
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
      .get('/links')
      .set('Authorization', `Bearer ${loginToken}`);
    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.links)).toBe(true);
    expect(response.body.total).toBe(0);
  });
  it('deve listar os links do usuário', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);
    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);
    const response = await request(app)
      .get('/links')
      .set('Authorization', `Bearer ${loginToken}`);
    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.links[0].slug).toBe(linkData.slug);
    expect(response.body.total).toBe(1);
  });
  it('deve retornar apenas os links do usuário autenticado', async () => {
    const userAData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const userBData = {
      name: 'Usuário Teste Dois',
      email: 'emailteste2@teste.com',
      password: 'Senha@1232',
      confirmPassword: 'Senha@1232',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerAResponse = await request(app)
      .post('/auth/register')
      .send(userAData);
    const loginAResponse = await request(app).post('/auth/login').send({
      email: userAData.email,
      password: userAData.password,
    });
    const loginAToken = loginAResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginAToken}`)
      .send(linkData);

    const registerBResponse = await request(app)
      .post('/auth/register')
      .send(userBData);
    const loginBResponse = await request(app).post('/auth/login').send({
      email: userBData.email,
      password: userBData.password,
    });
    const loginBToken = loginBResponse.body.token;
    const response = await request(app)
      .get('/links')
      .set('Authorization', `Bearer ${loginBToken}`);

    expect(registerAResponse.status).toBe(201);
    expect(loginAResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(registerBResponse.status).toBe(201);
    expect(loginBResponse.status).toBe(200);
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
  });
});
describe('GET /links/:id', () => {
  it('deve retornar 404 quando o link não existir', async () => {
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
      .get('/links/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${loginToken}`);
    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(response.status).toBe(404);
  });
  it('deve retornar 200 quando o link existir', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);

    const linkId = createResponse.body.link.id;

    const response = await request(app)
      .get(`/links/${linkId}`)
      .set('Authorization', `Bearer ${loginToken}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.link.slug).toBe(linkData.slug);
  });
  it('deve retornar 404 ao buscar o link de outro usuário', async () => {
    const userAData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const userBData = {
      name: 'Usuário Teste Dois',
      email: 'emailteste2@teste.com',
      password: 'Senha@1232',
      confirmPassword: 'Senha@1232',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerAResponse = await request(app)
      .post('/auth/register')
      .send(userAData);
    const loginAResponse = await request(app).post('/auth/login').send({
      email: userAData.email,
      password: userAData.password,
    });
    const loginAToken = loginAResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginAToken}`)
      .send(linkData);

    const linkAId = createResponse.body.link.id;

    const registerBResponse = await request(app)
      .post('/auth/register')
      .send(userBData);
    const loginBResponse = await request(app).post('/auth/login').send({
      email: userBData.email,
      password: userBData.password,
    });
    const loginBToken = loginBResponse.body.token;
    const response = await request(app)
      .get(`/links/${linkAId}`)
      .set('Authorization', `Bearer ${loginBToken}`);

    expect(registerAResponse.status).toBe(201);
    expect(loginAResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(registerBResponse.status).toBe(201);
    expect(loginBResponse.status).toBe(200);
    expect(response.status).toBe(404);
  });
});
describe('PATCH /links/:id', () => {
  it('deve atualizar um link do usuário', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);

    const linkId = createResponse.body.link.id;

    const response = await request(app)
      .patch(`/links/${linkId}`)
      .set('Authorization', `Bearer ${loginToken}`)
      .send({ title: 'Novo Curso Node' });

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.link.title).toBe('Novo Curso Node');
  });
  it('deve retornar 404 ao atualizar o link de outro usuário', async () => {
    const userAData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const userBData = {
      name: 'Usuário Teste Dois',
      email: 'emailteste2@teste.com',
      password: 'Senha@1232',
      confirmPassword: 'Senha@1232',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerAResponse = await request(app)
      .post('/auth/register')
      .send(userAData);
    const loginAResponse = await request(app).post('/auth/login').send({
      email: userAData.email,
      password: userAData.password,
    });
    const loginAToken = loginAResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginAToken}`)
      .send(linkData);

    const linkAId = createResponse.body.link.id;

    const registerBResponse = await request(app)
      .post('/auth/register')
      .send(userBData);
    const loginBResponse = await request(app).post('/auth/login').send({
      email: userBData.email,
      password: userBData.password,
    });
    const loginBToken = loginBResponse.body.token;
    const response = await request(app)
      .patch(`/links/${linkAId}`)
      .set('Authorization', `Bearer ${loginBToken}`)
      .send({ title: 'Novo Curso Node' });

    expect(registerAResponse.status).toBe(201);
    expect(loginAResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(registerBResponse.status).toBe(201);
    expect(loginBResponse.status).toBe(200);
    expect(response.status).toBe(404);
  });
});
describe('DELETE /links/:id', () => {
  it('deve deletar o link', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);

    const linkId = createResponse.body.link.id;

    const response = await request(app)
      .delete(`/links/${linkId}`)
      .set('Authorization', `Bearer ${loginToken}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.link.isActive).toBe(false);
  });
  it('deve retornar 404 ao deletar o link de outro usuário', async () => {
    const userAData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const userBData = {
      name: 'Usuário Teste Dois',
      email: 'emailteste2@teste.com',
      password: 'Senha@1232',
      confirmPassword: 'Senha@1232',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerAResponse = await request(app)
      .post('/auth/register')
      .send(userAData);
    const loginAResponse = await request(app).post('/auth/login').send({
      email: userAData.email,
      password: userAData.password,
    });
    const loginAToken = loginAResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginAToken}`)
      .send(linkData);

    const linkAId = createResponse.body.link.id;

    const registerBResponse = await request(app)
      .post('/auth/register')
      .send(userBData);
    const loginBResponse = await request(app).post('/auth/login').send({
      email: userBData.email,
      password: userBData.password,
    });
    const loginBToken = loginBResponse.body.token;
    const response = await request(app)
      .delete(`/links/${linkAId}`)
      .set('Authorization', `Bearer ${loginBToken}`);

    expect(registerAResponse.status).toBe(201);
    expect(loginAResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(registerBResponse.status).toBe(201);
    expect(loginBResponse.status).toBe(200);
    expect(response.status).toBe(404);
  });
});
describe('GET /r/:slug', () => {
  it('deve retornar 404 ao apresentar link inexistente', async () => {
    const response = await request(app).get('/r/slug-inexistente');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: 'Link não existe',
    });
  });
  it('deve redirecionar para a URL original', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);

    const linkId = createResponse.body.link.id;

    const response = await request(app).get('/r/curso-node');

    const incrementResponse = await request(app)
      .get(`/links/${linkId}`)
      .set('Authorization', `Bearer ${loginToken}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(linkData.originalUrl);
    expect(incrementResponse.body.link.clicks).toBe(1);
  });
  it('deve retornar 410 quando o link estiver inativo', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);

    const linkId = createResponse.body.link.id;

    const deleteResponse = await request(app)
      .delete(`/links/${linkId}`)
      .set('Authorization', `Bearer ${loginToken}`);

    const response = await request(app).get(`/r/${linkData.slug}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.link.isActive).toBe(false);
    expect(response.status).toBe(410);
    expect(response.body).toMatchObject({
      message: 'Link inativo',
    });
  });
  it('deve retornar 410 quando o link estiver expirado', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkData = {
      title: 'Curso Node',
      originalUrl: 'https://example.com/produto',
      slug: 'curso-node',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkData);

    const linkId = createResponse.body.link.id;
    await prisma.link.update({
      where: { id: linkId },
      data: {
        expiresAt: new Date('2020-01-01'),
      },
    });
    const response = await request(app).get(`/r/${linkData.slug}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(response.status).toBe(410);
    expect(response.body).toMatchObject({
      message: 'Link expirado',
    });
  });
});
describe('GET /links filtros', () => {
  it('deve filtrar links por campanha', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkAData = {
      title: 'Curso Node A',
      originalUrl: 'https://examplea.com/produtoa',
      slug: 'curso-node-a',
      campaign: 'campanha-a',
    };
    const linkBData = {
      title: 'Curso Node B',
      originalUrl: 'https://exampleb.com/produtob',
      slug: 'curso-node-b',
      campaign: 'campanha-b',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createAResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkAData);
    const createBResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkBData);

    const response = await request(app)
      .get('/links?campaign=campanha-a')
      .set('Authorization', `Bearer ${loginToken}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createAResponse.status).toBe(201);
    expect(createBResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.links[0].campaign).toBe(linkAData.campaign);
  });
  it('deve buscar links pelo título', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkAData = {
      title: 'Curso Node A',
      originalUrl: 'https://examplea.com/produtoa',
      slug: 'curso-node-a',
      campaign: 'campanha-a',
    };
    const linkBData = {
      title: 'Curso Node B',
      originalUrl: 'https://exampleb.com/produtob',
      slug: 'curso-node-b',
      campaign: 'campanha-b',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createAResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkAData);
    const createBResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkBData);

    const response = await request(app)
      .get('/links?search=Curso Node B')
      .set('Authorization', `Bearer ${loginToken}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createAResponse.status).toBe(201);
    expect(createBResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.links[0].title).toBe(linkBData.title);
  });
  it('deve buscar links pelo slug', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkAData = {
      title: 'Curso Node A',
      originalUrl: 'https://examplea.com/produtoa',
      slug: 'curso-node-a',
      campaign: 'campanha-a',
    };
    const linkBData = {
      title: 'Curso Node B',
      originalUrl: 'https://exampleb.com/produtob',
      slug: 'curso-node-b',
      campaign: 'campanha-b',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createAResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkAData);
    const createBResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkBData);

    const response = await request(app)
      .get('/links?search=curso-node-a')
      .set('Authorization', `Bearer ${loginToken}`);

    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createAResponse.status).toBe(201);
    expect(createBResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.links[0].slug).toBe(linkAData.slug);
  });
  it('deve paginar os links', async () => {
    const userData = {
      name: 'Usuário Teste',
      email: 'emailteste@teste.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const linkAData = {
      title: 'Curso Node A',
      originalUrl: 'https://examplea.com/produtoa',
      slug: 'curso-node-a',
      campaign: 'campanha-a',
    };
    const linkBData = {
      title: 'Curso Node B',
      originalUrl: 'https://exampleb.com/produtob',
      slug: 'curso-node-b',
      campaign: 'campanha-b',
    };
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    const loginToken = loginResponse.body.token;

    const createAResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkAData);
    const createBResponse = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${loginToken}`)
      .send(linkBData);

    const response = await request(app)
      .get('/links?page=2&limit=1')
      .set('Authorization', `Bearer ${loginToken}`);
    expect(registerResponse.status).toBe(201);
    expect(loginResponse.status).toBe(200);
    expect(createAResponse.status).toBe(201);
    expect(createBResponse.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(1);
    expect(response.body.totalPages).toBe(2);
    expect(response.body.total).toBe(2);

    expect(response.body.links.length).toBe(1);
  });
});
afterAll(async () => {
  await prisma.$disconnect();
});
