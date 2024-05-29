import { AppModule } from '@/app.module';
import { ResourceModel } from '@/resource/types';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { RESOURCES, USERS } from './seed';
import { MongoClient } from 'mongodb';

describe('resource controller', () => {
  let app: INestApplication;

  let token: string;

  let testResource: { _id: string } & ResourceModel;

  const client = new MongoClient(process.env.MONGO_URI);

  beforeAll(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testModule.createNestApplication();
    await app.init();

    await client.connect();

    await client.db('test').collection('users').insertMany(USERS);
    await client.db('test').collection('resources').insertMany(RESOURCES);
  });

  afterAll(async () => {
    await client.db('test').collection('users').deleteMany({});
    await client.db('test').collection('resources').deleteMany({});
    await client.db('test').dropDatabase();
    await client.close();
  });

  it('login user', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: USERS[0].email,
        password: USERS[0].password,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((result) => {
        expect(result.body).toHaveProperty('username', USERS[0].email);
        token = result.body.token;
      });
  });

  it('try to get all resources without token and gets 401', async () => {
    return request(app.getHttpServer())
      .get('/resources')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((result) => {
        expect(result.body).toHaveProperty('error', 'Unauthorized');
        expect(result.body).toHaveProperty('statusCode', 401);
      });
  });

  it('get all resources because user is admin', async () => {
    return request(app.getHttpServer())
      .get('/resources')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).not.toHaveLength(0);
        testResource = result.body[0];
      });
  });

  it('check permissions', async () => {
    return request(app.getHttpServer())
      .get('/resources/check')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveProperty('permission', 'granted');
        expect(result.body).toHaveProperty(
          'message',
          'issue a request to /audit to get the information from this company',
        );
      });
  });

  it('check permissions for single resource', async () => {
    return request(app.getHttpServer())
      .get(`/resources/check/${testResource._id.toString()}`)
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveProperty('permission', 'granted');
        expect(result.body).toHaveProperty(
          'message',
          'issue a request to /audit to get the information from this company',
        );
      });
  });

  it('audit companies', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).not.toHaveLength(0);
      });
  });

  it('audit companies', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit?company=Company Y')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).not.toHaveLength(0);
        expect(result.body[0]).toHaveProperty('company', 'Company Y');
      });
  });

  it('audit companies with limit', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit?company=Company Y&limit=3&page=1')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveLength(3);
        expect(result.body[0]).toHaveProperty('company', 'Company Y');
      });
  });

  it('audit resource', async () => {
    return request(app.getHttpServer())
      .get(`/resources/audit/${testResource._id.toString()}`)
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveProperty('company', testResource.company);
        expect(result.body).toHaveProperty('_id', testResource._id);
      });
  });

  it('login user', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: USERS[1].email,
        password: USERS[1].password,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((result) => {
        expect(result.body).toHaveProperty('username', USERS[1].email);
        token = result.body.token;
      });
  });

  it('try to get all resources without token and gets 401', async () => {
    return request(app.getHttpServer())
      .get('/resources')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((result) => {
        expect(result.body).toHaveProperty('error', 'Unauthorized');
        expect(result.body).toHaveProperty('statusCode', 401);
      });
  });

  it('try to get all resources and fails because user is not admin', async () => {
    return request(app.getHttpServer())
      .get('/resources')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('check permissions', async () => {
    return request(app.getHttpServer())
      .get('/resources/check')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((result) => {
        expect(result.body).toHaveProperty(
          'message',
          'You must specify at least one company to check for this endpoint',
        );
      });
  });

  it('check permissions for single resource', async () => {
    return request(app.getHttpServer())
      .get(`/resources/check/${RESOURCES[6]._id.toString()}`)
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveProperty('permission', 'granted');
        expect(result.body).toHaveProperty(
          'message',
          'issue a request to /audit/:resourceId to get the information',
        );
      });
  });

  it('audit companies', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((result) => {
        expect(result.body).toHaveProperty(
          'message',
          'You must specify at least one company to check for this endpoint',
        );
      });
  });

  it('audit company', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit?company=Company Y')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).not.toHaveLength(0);
        expect(result.body[0]).toHaveProperty('company', 'Company Y');
      });
  });

  it('try to audit companies and fails because user is not auditor', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit?company=Company X')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(403)
      .then((result) => {
        expect(result.body).toHaveProperty(
          'message',
          "You're not allowed to get information from company Company X",
        );
      });
  });

  it('audit companies with limit', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit?company=Company Y&limit=3&page=1')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveLength(3);
        expect(result.body[0]).toHaveProperty(
          'company',
          USERS[1].auditedCompanies[0],
        );
      });
  });

  it('audit resource', async () => {
    return request(app.getHttpServer())
      .get(`/resources/audit/${RESOURCES[6]._id.toString()}`)
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveProperty('company', RESOURCES[6].company);
        expect(result.body).toHaveProperty('_id', RESOURCES[6]._id.toString());
      });
  });

  it('tries to audit resource and fails because user cannot audit that company', async () => {
    return request(app.getHttpServer())
      .get(`/resources/audit/${RESOURCES[0]._id.toString()}`)
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(403)
      .then((result) => {
        expect(result.body).toHaveProperty(
          'message',
          'You are not allowed to get this resource, since you are not an auditor for company Company X',
        );
      });
  });
});
