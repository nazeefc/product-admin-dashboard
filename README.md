# Product Admin Dashboard

A small admin dashboard built with Next.js, React, Tailwind CSS, and Axios that lets a logged-in user manage products using the [DummyJSON](https://dummyjson.com) API.

## Live Link

[Add your Vercel/Netlify link here after deployment]

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Axios

## Setup Instructions

1. Clone the repository:
```bash
   git clone https://github.com/nazeefc/product-admin-dashboard.git
   cd product-admin-dashboard
```

2. Install dependencies:
```bash
   npm install
```

3. Run the development server:
```bash
   npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Log in with:
   - Username: `emilys`
   - Password: `emilyspass`

## Features Completed

- **Login/Logout**: Login using DummyJSON's `/auth/login`, with error handling for wrong credentials. Auth token is stored and attached to every API request automatically via an Axios interceptor. Route protection redirects unauthenticated users to `/login`.
- **Product List**: Displays image, title, category, price, rating, and stock. Renders as a table on desktop and cards on mobile using responsive Tailwind classes.
- **Pagination**: Page-by-page loading using `limit`/`skip`, with page number buttons, Previous/Next, a page size selector (10/20/50), and a "Showing X–Y of Z" indicator. Invalid URL values like `?page=abc` or `?page=999` fall back safely to a valid page instead of breaking.
- **Search**: Debounced search (500ms) against `/products/search`, synced to the URL. Uses `AbortController` to cancel in-flight requests when a newer search is triggered, so slower/older responses never overwrite newer ones (verified using `&delay=2000`).
- **Filter & Sort**: Category filter (`/products/categories`) and sort by price/rating/title. Selecting a category clears any active search and vice versa (see Design Decisions below). Sort is disabled while a search is active, since DummyJSON's search endpoint doesn't support sorting.
- **Product Details**: Dynamic route at `/products/[id]` showing images, description, price, and reviews, with a dedicated "not found" state for invalid IDs.
- **Add/Edit/Delete**: A shared, validated form component used for both adding and editing products, and a confirmation dialog before deleting. See Design Decisions for how this works given the fake API.
- **Loading/Empty/Error States**: Every data-fetching view has a loading indicator, an empty-state message, and an error state with a Retry button.
- **URL as source of truth**: Page, search, category, sort, and page size are all stored in the URL query string, so refreshing or sharing a link reproduces the same view.
- **Double-submit protection**: Login and Save buttons disable themselves while a request is in flight, preventing duplicate requests from rapid clicking.

## Design Decisions

### Search and category filter can't be used together

DummyJSON doesn't support combining a text search with a category filter in one request. To avoid a confusing or silently-wrong UI, selecting a category clears any active search, and typing in the search box clears any active category filter. Only one of the two is ever active at a time.

### Sort is disabled during search

DummyJSON's `/products/search` endpoint doesn't accept `sortBy`/`order` parameters. Rather than let the user pick a sort option that silently does nothing, the sort dropdown is disabled while a search term is active.

### Add/Edit/Delete and the fake API

DummyJSON's `/products/add`, `PUT /products/:id`, and `DELETE /products/:id` endpoints return a success response but don't actually persist changes to their database. To still reflect changes in the app:

- **Add**: after a successful `POST`, the new product is given a unique local ID (`local-<timestamp>`, since DummyJSON always returns the same fake ID for every added product) and stored in `sessionStorage`. On the product list page, these session-stored products are merged with the first page of API results.
- **Edit**: after a successful `PUT`, the updated product is saved to the same `sessionStorage` bucket (keyed by its real or local ID), so its own details page reflects the change. When merging into the list, any API result with a matching ID is replaced by its session version so duplicates and stale data don't both appear.
- **Delete**: after a successful `DELETE` (skipped for session-only products, since they were never real DummyJSON products to begin with), the product is removed from local state and from `sessionStorage`.

**Known limitation**: since this all lives in `sessionStorage`, added/edited products persist across a page refresh but not across a new tab or after the browser session ends — this is expected, given the API doesn't actually save anything server-side.

### Race-condition-safe search

Each fetch (search, filter, or plain listing) uses an `AbortController`. When the search term, filter, sort, or page changes before a previous request resolves, the previous request is aborted rather than just ignored — so a slow, stale response can never overwrite a newer one.

## Problem Faced & Fix

One issue I ran into: newly-added products would occasionally break the product list with a "duplicate key" React warning. This happened because DummyJSON's `/products/add` endpoint always returns the same fake ID for every new product, so adding more than one product in a session created duplicate IDs. I fixed this by generating a unique local ID (`local-<timestamp>`) for every added product instead of relying on the ID DummyJSON returns.

## Where AI Helped

I used Claude to help design the overall architecture (folder structure, Axios interceptor setup, URL-driven state pattern), to work through the debounce/race-condition logic for search, and to debug a few runtime issues (duplicate React keys, a missing variable reference, PowerShell path-escaping for the `[id]` dynamic route). I reviewed, tested, and understood each part of the code before committing it.