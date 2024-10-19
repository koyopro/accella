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
  const params = await RequestParameters.from(Astro.request);
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
