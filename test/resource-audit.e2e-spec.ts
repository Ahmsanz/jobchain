import { AppModule } from '@/app.module';
import { ResourceModel } from '@/resource/types';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('resource controller', () => {
  let app: INestApplication;

  let token: string;

  let testResource: { _id: string } & ResourceModel;

  beforeAll(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testModule.createNestApplication();
    await app.init();
  });

  it('login admin user to get single resource id', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'john.doe@mail.com',
        password: 'admin',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((result) => {
        expect(result.body).toHaveProperty('username', 'john.doe@mail.com');
        token = result.body.token;
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

  it('login user', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'adam.smith@mail.com',
        password: 'audit',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((result) => {
        expect(result.body).toHaveProperty('username', 'adam.smith@mail.com');
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
      .get(`/resources/check/${testResource._id.toString()}`)
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
      .get('/resources/audit?company=Company X')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).not.toHaveLength(0);
        expect(result.body[0]).toHaveProperty('company', 'Company X');
      });
  });

  it('try to audit companies and fails because user is not auditor', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit?company=Company Y')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(403)
      .then((result) => {
        expect(result.body).toHaveProperty(
          'message',
          "You're not allowed to get information from company Company Y",
        );
      });
  });

  it('audit companies with limit', async () => {
    return request(app.getHttpServer())
      .get('/resources/audit?company=Company X&limit=3&page=1')
      .auth(token, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((result) => {
        expect(result.body).toHaveLength(3);
        expect(result.body[0]).toHaveProperty('company', 'Company X');
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
});
