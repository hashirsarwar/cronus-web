# cronus-web

Browser frontend for Cronus, a cloud-native food-ordering application. Users browse restaurants,
build a cart, place an order and view its delivery outcome. React powers the interface; a static
container image serves the deployed application.

## Key Features

- Restaurant and menu browsing, cart editing, checkout and order confirmation.
- Loading, pending-action and error states throughout the ordering journey.
- Typed API integration with validation messages and empty-cart handling.
- Component and journey tests, plus optional runtime-configured browser telemetry.

## Technology stack

React, TypeScript, Vite and Docker.

## Application flow

The browser calls ordering through same-origin `/api` requests. Ordering manages carts and orders and
integrates with delivery. Vite supplies the local API proxy; the Kubernetes Gateway routes requests in
deployed environments.

## Quick start

Use Node.js 24. Start [ordering](https://github.com/hashirsarwar/cronus-ordering-service) on port 5081 and
[delivery](https://github.com/hashirsarwar/cronus-delivery-service) on port 5082 for delivery confirmation.
Ordering's Development startup provides a sample catalogue.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. For a different API address, set it in the process environment:

```bash
ORDERING_SERVICE_URL=http://localhost:5090 npm run dev
```

Run checks with `npm run lint`, `npm test` and `npm run build`. Deployed environments need Gateway API
routing; the standalone static image does not proxy the backend. Keep credentials out of browser
configuration, and verify HTTPS before sending sensitive customer data over the public edge.

## Related repositories

| Repository | Responsibility |
| --- | --- |
| [cronus-infrastructure](https://github.com/hashirsarwar/cronus-infrastructure) | Azure resources, managed identities and PostgreSQL privilege bootstrap. |
| [cronus-gitops](https://github.com/hashirsarwar/cronus-gitops) | Argo CD bootstrap, Helm charts, Gateway routes and environment-specific deployments. |
| [cronus-ordering-service](https://github.com/hashirsarwar/cronus-ordering-service) | Restaurant catalogue, cart rules, order persistence and delivery integration. |
| [cronus-delivery-service](https://github.com/hashirsarwar/cronus-delivery-service) | Idempotent delivery creation and lookup in its own database. |
