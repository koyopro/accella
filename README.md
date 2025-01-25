Language: [English](README.md) | [日本語](README-ja.md)

# Accella Project

Accella is a full-stack web framework designed to achieve high development efficiency with rich features and strong type safety. It is particularly suitable for startups and small teams.

## Installation

```bash
npm create accella@latest
```

For more details, please refer to [this document](./packages/accella/README.md).

## Features

- **Server-First**
  - Follows the tradition of full-stack MVC frameworks.
  - Based on Astro, it returns pre-rendered HTML to the client from the server.
  - Keeps the architecture simple, enhancing both development efficiency and user experience.
- **ORM Integration**
  - Utilizes Accel Record, an ORM implemented with the Active Record pattern.
  - The integration between the framework and ORM enhances development efficiency, especially for database CRUD operations.
- **Type Safety**
  - Provides a type-safe development environment with TypeScript, from table operations to template rendering.

## How to Achieve High Development Efficiency

- Full-Stack
  - Common tasks can be accomplished with minimal code by leveraging the framework's features, allowing you to focus on custom implementations.
  - Includes CRUD operations, validation, session management, password authentication, advanced search, form building, request parameter parsing, pagination, i18n, and security.
  - No need to spend time selecting libraries at the start of the project.
- Rapid feedback through type checking
  - TypeScript's type safety ensures high efficiency in debugging and refactoring.
  - In addition to database interactions, it offers type-safe template rendering using Astro components, which is unique compared to other server-side frameworks.
- Simple Architecture
  - Focuses on backend development, avoiding the need to develop server-side APIs and frontend applications separately like in SPAs.
  - No need to set up a separate server for SSR; keeps the infrastructure architecture simple.
- Integration with Frontend Frameworks
  - Returns pre-rendered HTML to the browser by default, but can flexibly integrate with frontend frameworks (React, Vue, Svelte, etc.) using Astro's features.

## Technologies

- [Astro](https://astro.build/)
  - Forms the base of the framework, handling routing and rendering.
- [Accel Record](./packages/accel-record/README.md)
  - Advanced ORM adopting the Active Record pattern.
- [Prisma](https://www.prisma.io/)
  - Handles table definitions and migrations.

## Libraries Included in This Repository

- [Accella](./packages/accella/)
  - Web framework built with Astro and Accel Record.
- [Accel Record](./packages/accel-record/)
  - Type-safe and synchronous ORM for TypeScript, influenced by Ruby on Rails' Active Record.
- [Accel Record Factory](./packages/accel-record-factory/)
  - Factory for creating Accel Record models.
- [Accel Web](./packages/accel-web/)
  - Library for integrating Astro and Accel Record.
