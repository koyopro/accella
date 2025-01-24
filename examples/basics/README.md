# Starter Kit: Basics

```sh
npm create accella@latest
```

## Project Structure

Inside of your project, you'll see the following folders and files:

```text
/
├── db/
│   └── schema/
│       └── main.prisma
├── src/
│   ├── config/
│   |   ├── session.ts
│   |   └── initializers/
│   |       └── database.ts
│   ├── models/
│   |   └── index.ts
│   └── pages/
│       └── index.astro
├── public/
└── package.json
```

`db/schema/main.prisma` is the Prisma schema file. You can define your database models here.

`src/config/` contains configuration files. `session.ts` is used to configure session management, and `initializers/` contains files that are run when the server starts.
Files related to Accel Record, generated based on the schema file, are stored in `src/models/`.

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

Any static assets, like images, can be placed in the `public/` directory.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                  | Action                                       |
| :----------------------- | :------------------------------------------- |
| `npm install`            | Installs dependencies                        |
| `npm run dev`            | Starts local dev server at `localhost:4321`  |
| `npm run build`          | Build your production site to `./dist/`      |
| `npm run preview`        | Preview your build locally, before deploying |
| `npx prisma migrate dev` | Run Prisma migrations                        |

## Docs

[README for accella](https://github.com/koyopro/accella/blob/main/packages/accella/README.md)
