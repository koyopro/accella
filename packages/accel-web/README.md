# Accel Web

This is a library for integrating Astro and Accel Record.

## Pagination

`paginate` is a function that generates pagination components. It takes a query and options as arguments.

```astro
---
import { paginate } from "accel-web";
import { Account } from "src/models";

const url = new URL(Astro.request.url);
const page = Number(url.searchParams.get("p")) || 1;

const { Nav, PageEntriesInfo } = paginate(Account.order("id", "desc"), { page, per: 10, window: 1 });
---

<!-- nav -->
<Nav />

<!-- info -->
<PageEntriesInfo />
```

The above code will render a result like:

```html
<!-- nav -->
<nav>
  <ul class="pagination">
    <li class="page-item first">
      <a href="/?p=1" class="page-link">« First</a>
    </li>
    <li class="page-item prev">
      <a rel="prev" href="/?p=2" class="page-link">‹ Prev</a>
    </li>
    <li class="page-item disabled gap">
      <span class="page-link">…</span>
    </li>
    <li class="page-item page">
      <a href="/?p=2" class="page-link"> 2 </a>
    </li>
    <li class="page-item page active">
      <span class="page-link">3</span>
    </li>
    <li class="page-item page">
      <a href="/?p=4" class="page-link"> 4 </a>
    </li>
    <li class="page-item disabled gap">
      <span class="page-link">…</span>
    </li>
    <li class="page-item next">
      <a rel="next" href="/?p=4" class="page-link">Next ›</a>
    </li>
    <li class="page-item last">
      <a href="/?p=6" class="page-link">Last »</a>
    </li>
  </ul>
</nav>

<!-- info -->
<div class="page-entries-info">Displaying <b>21 - 30</b> of <b>55</b> in total</div>
```

The following styles will be applied when Bootstrap 5 is used. You can override the styles by adding your own CSS.

![Pagination UI with Bootstrap](https://github.com/user-attachments/assets/7c0dab8d-c22d-47ef-8e31-10eac12c8e06)

## Form and Request Parameters

`formFor` is a function that generates form components. It takes a record as an argument.
`RequestParameters` is a class that parses the request parameters.

These tools make it easy to create forms and retrieve request parameters.
Below is an example of a sign-up form.

```astro
---
// src/pages/signup.astro
import { formFor, RequestParameters } from "accel-web";
import Layout from "../layouts/Layout.astro";
import { Account } from "../models";
import { z } from "astro/zod";

const account = Account.build({});

if (Astro.request.method === "POST") {
  const params = await RequestParameters.from(Astro.request, Astro.params);
  // Using zod, you can validate request parameters and extract them with type information
  const accountParams = params.require("account").parseWith(
    z.object({
      email: z.string(),
      password: z.string(),
      passwordConfirmation: z.string(),
    })
  );
  // If strict type information is not required, you can write it as follows
  // const accountParams = params.require("account").permit("email", "password", "passwordConfirmation");
  if (account.update(accountParams)) {
    return Astro.redirect("/");
  }
}

// `formFor` is a helper function that creates a form object for the model
const { Form, Submit, Label, TextField, PasswordField } = formFor(account);
---

<Layout title="Sign Up">
  <main class="container" style="max-width: 700px; min-width: 400px;">
    <h1>Sign Up</h1>
    <Form method="post" class="form">
      {
        account.errors.fullMessages.length > 0 && (
          <div class="alert alert-danger">
            {account.errors.fullMessages.map((message) => (
              <div>{message}</div>
            ))}
          </div>
        )
      }
      <div class="mb-3">
        <!--
          The value of Label will be set according to the i18n settings configured in i18next.
          `accelrecord.attributes.Account.email` is the key to be translated.
        -->
        <Label for="email" />
        <!-- The value of TextField will be pre-filled with the value of account.email -->
        <TextField attr="email" class="form-control" />
      </div>
      <div class="mb-3">
        <Label for="password" />
        <PasswordField attr="password" class="form-control" />
      </div>
      <div class="mb-3">
        <Label for="passwordConfirmation" />
        <PasswordField attr="passwordConfirmation" class="form-control" />
      </div>
      <div class="d-flex justify-content-between">
        <Submit class="btn btn-secondary">Sign Up</Submit>
        <a href="/" class="btn btn-link">Back</a>
      </div>
    </Form>
  </main>
</Layout>
```

### SearchFormFor

`searchFormFor` is a function that generates a search form component.

The following is an example of a search form using `searchFormFor`. You can implement a search form and pagination by combining it with the previously introduced `paginate`.

```astro
---
// src/pages/todos/index.astro
import { paginate, RequestParameters, searchFormFor } from "accel-web";
import { Todo } from "src/models";
import Layout from "../../layouts/Layout.astro";

const params = await RequestParameters.from(Astro.request);
const page = Number(params.p) || 1;

// Model.search() returns a search object.
// params.q is a search query object from query parameters.
// Example:
//  Path like "/todos?q.id_eq=1&q.title_cont=foo" is parsed as follows:
//  { q: { id_eq: 1, title_cont: "foo" } }
const search = Todo.search(params.q);
// searchFormFor() returns form fields for search.
const { NumberField, TextField } = searchFormFor(search);

const { Nav, PageEntriesInfo, records } = paginate(search.result().order("id", "desc"), { page });
---

<Layout title="TODOs">
  <main class="container" style="max-width: 700px; min-width: 550px;">
    <h1 class="text-center">All TODOs</h1>
    <div class="d-flex justify-content-end">
      <a href="/todos/new" class="btn btn-link">Add a new todo</a>
    </div>
    <form method="get" class="row">
      <div class="col mb-3">
        <NumberField attr="id_eq" placeholder="Search by ID" class="form-control" />
      </div>
      <div class="col mb-3">
        <TextField attr="title_cont" placeholder="Search by Title" class="form-control" />
      </div>
      <div class="col-md-auto mb-3">
        <button type="submit" class="btn btn-dark">Search</button>
        <a href="/todos" class="btn btn-secondary">Clear</a>
      </div>
    </form>
    <ul>
      {
        records.map((todo) => (
          <li>
            <span>{todo.id}</span>
            <span>{todo.title}</span>
            {todo.estimate ? <span>｜{todo.estimate}</span> : null}
            {todo.dueDate ? <span>{todo.dueDate.toISOString().slice(0, 10)}迄</span> : null}
            <span>({todo.status})</span>
          </li>
        ))
      }
    </ul>
    <div class="d-flex justify-content-center">
      <Nav />
    </div>
    <div class="d-flex justify-content-center">
      <PageEntriesInfo />
    </div>
  </main>
</Layout>
```

### SortLink

`SortLink` is a component that generates a link for sorting. It takes a query and options as arguments.

```astro
---
import { RequestParameters, SortLink } from "accel-web";
import { Account } from "src/models";

const params = await RequestParameters.from(Astro.request);
const search = Account.search(params.q);
---
<table>
  <thead>
    <tr>
      <th>
        <!-- Basic Usage -->
        <SortLink q={search} key="id" />
      </th>
      <th>
        <!--
          Customization Examples
          - Specifying multiple sort attributes
          - Changing the appearance of ascending/descending arrows (default is "▲" and "▼")
          - Custom text
        -->
        <SortLink q={search} key={["email", "id desc"]} asc="↓" desc="↑">
          Email Address
        </SortLink>
      </th>
    </tr>
  </thead>
  <tbody>
    {
      search.result().map((account) => (
        <tr>
          <td>{account.id}</td>
          <td>{account.email}</td>
        </tr>
      ))
    }
  </tbody>
</table>
```

## Session

`createCookieSessionStorage` is a function that generates a session storage object. This is a thin wrapper around the function of the same name provided by [astro-cookie-session](https://www.npmjs.com/package/astro-cookie-session), so please refer to its documentation for basic usage. The difference from the original is that it adds the ability to save Accel Record models as sessions.

```ts
// src/session.ts
import { createCookieSessionStorage } from "accel-web";
import type { Account } from "./models";

export type SessionData = {
  // You can store the Accel Record model in the session
  account: Account;
};

export const { getSession } = createCookieSessionStorage<SessionData>();

export type Session = ReturnType<typeof getSession>;
```

```astro
---
// src/pages/login.astro
import { getSession } from "../session";
import { Account } from "../models";

const session = getSession(Astro.cookies);
// Read an Account model from the session
if (session.account) {
  return Astro.redirect("/");
}
let message = '';

if (Astro.request.method === "POST") {
  const params = await RequestParameters.from(Astro.request, Astro.params);
  // Account model is assumed to have password authentication implemented.
  // https://github.com/koyopro/accella/tree/main/packages/accel-record#password-authentication
  const account = Account.findBy({ email: params['email'] });
  if (account?.authenticate(params['password'])) {
    // Save an Account model in the session
    session.account = account;
    return Astro.redirect("/");
  } else {
    message = "Invalid email or password";
  }
}
---
<form method="post">
  {message && <div>{message}</div>}
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required />
  </div>
  <div>
    <label for="password">Password</label>
    <input type="password" id="password" name="password" required />
  </div>
  <div>
    <button type="submit">Login</button>
  </div>
</form>
```
