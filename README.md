
## Project Structure

shipping  is structure by the following packages.

- `backend`: The back-end application used to provide shipping Web Services.
- `shared`: The shared package is used to represent common code between packages.

## Requirements

- node 22
- docker

## Quick start

Before start the project, copy the file `.env-dev` to `.env` and configure the environment
variables. There are two modes for the configuration

- `dev`: Development mode.

To start the project, you should use docker compose using local or production database.

### Docker Compose local database

To start the project using Docker Compose with a local database, execute the following code:

`docker compose -f compose-dev.yml up`

Note: Remember put the database configuration into '.env' file.

## Migrations and Seeder

After starting the server in development or production mode, you need to run the migrations to
create the entities in the database and populate the necessary entities. Follow these steps:

1. Run the migrations and seed:

```bash
docker compose -f compose.dev.yml exec shippingd yarn workspace @shipping/backend setup:db
```
