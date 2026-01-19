# Gemini Project Context: nest-ex

This document provides context for the `nest-ex` project, a backend application built with the NestJS framework.

## Project Overview

This project is a modular, scalable backend application built with [NestJS](https://nestjs.com/), a progressive Node.js framework using TypeScript.

### Key Technologies

*   **Framework**: NestJS
*   **Language**: TypeScript
*   **Database**:
    *   PostgreSQL with TypeORM for relational data.
    *   MongoDB for other data persistence needs.
*   **API**: RESTful API with Swagger documentation.
*   **Authentication**: Passport.js with JWT and local strategies.
*   **Testing**: Jest for unit and end-to-end (e2e) tests.
*   **Containerization**: Docker (for MongoDB).

### Architecture

The application follows a modular architecture, with features organized into separate modules (e.g., `Users`, `Posts`, `Blogs`, `Comments`). It uses a core module for shared functionalities like configuration, exception handling, and pipes. The application is configured to use both PostgreSQL (via TypeORM) and MongoDB, indicating a multi-database strategy.

## Building and Running

### Prerequisites

*   Node.js
*   Yarn
*   Docker

### Installation

```bash
yarn install
```

### Running the Application

1.  **Start the database:**
    This project uses Docker to run a MongoDB instance.

    ```bash
    docker-compose up -d
    ```

2.  **Run in development mode:**
    This command starts the application with hot-reloading.

    ```bash
    yarn run start:dev
    ```

3.  **Run in production mode:**
    This command starts the application from the compiled JavaScript files in the `dist` directory.

    ```bash
    yarn run build
    yarn run start:prod
    ```

### Running Tests

*   **Run all tests:**

    ```bash
    yarn run test
    ```

*   **Run unit tests:**

    ```bash
    yarn run test:unit
    ```

*   **Run end-to-end (e2e) tests:**

    ```bash
    yarn run test:e2e
    ```

## Development Conventions

### Code Style and Formatting

*   **Linter**: ESLint is used for identifying and fixing code quality issues. The configuration is in `eslint.config.mjs`.
*   **Formatter**: Prettier is used for consistent code formatting. The configuration is in `.prettierrc`. Key styles include:
    *   `singleQuote: true`
    *   `trailingComma: 'all'`

    You can format the entire project by running:
    ```bash
    yarn run format
    ```

### Testing

*   **Unit Tests**: Unit tests are located alongside the source files (e.g., `*.spec.ts`). They are configured in `test/jest-unit.json`.
*   **E2E Tests**: End-to-end tests are in the `test/` directory (e.g., `*.e2e-spec.ts`). They are configured in `test/jest-e2e.json`.

### Configuration

Application configuration is managed through environment variables and loaded using the `@nestjs/config` module. The main configuration file is `src/core/config/configuration.ts`. Environment variables are defined in `.env.*` files.
