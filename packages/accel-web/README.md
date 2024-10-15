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
