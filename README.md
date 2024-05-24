## Description

This is a small service built with the NestJS framework as a proof of concept to be used as technical assessment.

For the sake of simplification, it contains just two modules, User and Resource, that will be enough to fullfill the required functionalities.

#### USER MODULE

The auth controller has a very simple authentication logic, allowing to get the jwt that will be used in the other requests.
The user controller has two endpoints that allow to create users and to get the details of one of them passing their email (only if the authenticated user is an admin).

It is possible to create a user without being authenticated. In order for the user to be able to interact with the Resource endpoints, two things must be taken into account:

- The role must be either "admin" or "auditor".
- The _auditedCompanies_ field is an array with the names of the companies which resources might be retrieved by a given user. The available companies are "Company X", "Company Y" and "Company Z", and _their names must be spelled correctly both in this field (upon creation) and in the query parameter *company* that some requests allow_.

#### RESOURCE MODULE

It exposes the resources belonging to a certain company. The access to said resources are regulated by the RolesGuard, that will check the role of the authenticated user in order to grant/reject access.

- Users can access the endpoints /resources/check and /resources/check/:resourceId to learn if they can retrieve information from a certain company or a certain resource, respectively. In the former, if no company is specified the response will include the allowed companies.
- Admin users can access the endpoint /resources to get the whole list of resources.
- Admin and auditors can access the endpoint /resources/audit to get the resources of one or more companies, given the query param _?company=_, with the companies names separated by commas (i.e.: ?company=Company X,Company Y, carefull with the spelling!)
- Admin and auditors can access the endpoint /resources/audit/:resourceId to get a single resource

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

All these will need a mongodb instance up and running. Therefore, the preferred way to run this app is via the docker-compose file. Just run:

```bash
$ npm run start:doker
```

**When the mongodb instance is running**, run:

```bash
$ npm run mongo:load
```

This will load into the mongo instance the necessary data with an admin user, an auditor, and the resources.

#### ENV VARIABLES
Please note that if you choose to run the app locally **you will need a .env file at the root**. You can copy the ones at iac/docker/.env.docker

#### DATA

- ADMIN USER:

```JSON
{

  "firstName": "Adam",
  "lastName": "Smith",
  "email": "adam.smith@mail.com",
  "auditedCompanies":["Company X", "Company Z"],
  "role": "audit",
  "password": "audit"

}
```

- ADMIN USER:

```JSON
{

  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@mail.com",
  "auditedCompanies":["Company Y"],
  "role": "admin",
  "password": "admin"

}
```

### NEXT STEPS

For speed sake, thise little app does not include some improvements that should be taken into consideration:

- **TESTING**: for lack of time, just the initial app.e2e-spec.ts is working. Unit, integration and e2e testing should be included as a fundamental way to ensure the robustness of the application. The latter, e2e tests, would be a great way to automatically check that the requirements are being met.

- **ARCHITECTURE**: this application is following in a sort of loose way the architecture suggested by NestJS, having modules and services, with the latter accessing directly to the models and thus the database. More sophisticated architectures could be applied, like DDD and Clean Architecture, that will tackle possible problems when the complexity increases.

- **DESIGN PATTERNS**: related to the previous points, some patterns would allow to more strictly observe good practices like the SOLID principles. NestJS's dependency injection model is great to use interfaces and apply the Inversion of Control principle; it has a buil-in module for CQRS that enables scalability; has an out-of-the-box microservices module that would lead to a whole new level of complexity...

- **VALIDATION**: with class-validator, Zod or validating at the domain level, some form of validation should always be considered to strengthen the API in general.
