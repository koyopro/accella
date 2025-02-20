Language: [English](https://github.com/koyopro/accella/blob/main/packages/accella/README.md) | [日本語](https://github.com/koyopro/accella/blob/main/packages/accella/README-ja.md)

# Accella

A web framework built with Astro and Accel Record.

For instructions on how to use the framework, please refer to the [Accella documentation](https://accella.dev/).

## Structure

### Astro

Accella is built on top of the web framework Astro. Astro is a server-first framework that can flexibly integrate with frontend components like React and Vue.js.

Page routing is handled by Astro files located in the `src/pages` directory. Astro files have the `.astro` extension and can contain both HTML and JavaScript in a single file.

https://docs.astro.build/en/getting-started/

### Accel Record

Accel Record is a type-safe and synchronous ORM for TypeScript. It adopts the Active Record pattern and is heavily influenced by Ruby on Rails' Active Record.

Accel Record is integrated into Accella from the start, allowing you to begin database-driven development immediately. By default, SQLite is used, but you can configure it to use MySQL or PostgreSQL.

Accel Record uses Prisma for migration management, and you can define your database settings and models in `db/schema/main.prisma`.

https://github.com/koyopro/accella/blob/main/packages/accel-record/README.md

### Accel Web

Accel Web is a library that supports web application development with Astro, and it is also integrated into Accella. It provides features such as session management, request parameter parsing, and form creation.

https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md

#### Request Parameters

Accella provides a Request Parameters object via `Astro.locals.params` to handle request parameters.

For usage details, refer to the [Accel Web README](https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md#form-and-request-parameters).

#### Session

Accella provides a session management object via `Astro.locals.session`.

```astro
---
import { User } from '../models';

if (Astro.request.method === 'POST') {
  Astro.locals.session.user = User.findBy({ email: 'test@example.com' });
}
const currentUser: User | undefined = Astro.locals.session.user;
---
{currentUser ? <p>Hello, {currentUser.name}!</p> : <p>Hello, Guest!</p>}
```

By default, values retrieved from the session are of type `any`, but you can use type definitions in `src/config/session.ts` to ensure type safety.

```typescript
import { type Session as BaseSession } from "accella/session";
import { User } from "../models";

// You can define the type of the session object here
export type SessionData = {
  user: User; // Add here
};

export type Session = BaseSession & Partial<SessionData>;
```

#### CSRF Protection

Accella has built-in CSRF protection. When sending POST or other non-GET requests, you must include the appropriate token in the request, or an InvalidAuthenticityToken error will occur. If you use the [related features to create forms](https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md#form-and-request-parameters), the CSRF token is automatically generated and included in the request. For other methods of sending non-GET requests, refer to the [CSRF Protection](https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md#csrf-protection) section for the necessary steps.
