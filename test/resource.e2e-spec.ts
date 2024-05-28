import { AppModule } from '@/app.module';
import { ResourceModule } from '@/resource/resource.module';
import { ResourceModel } from '@/resource/types';
import { UserModule } from '@/user/user.module';
import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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

  it('login user', async () => {
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
});
