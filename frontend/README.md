# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## MediConnect frontend configuration

Create a `frontend/.env.local` file for local development:

```env
VITE_BACKEND_URL=http://localhost:5000
```

If you have a separate doctor/admin portal, set `VITE_DOCTOR_PORTAL_URL` to its URL to show its login links. Those links stay hidden when no portal URL is configured. Never put private credentials or Supabase service-role keys in Vite environment variables; values prefixed with `VITE_` are included in the browser bundle.

Run `npm run dev` here and `npm run dev` in `backend/` so patient login and signup can reach the API.

## Doctor portal

Open `/doctor/login` to sign in with a doctor account, then review, accept, or reject appointments at `/doctor/dashboard`. Doctor sessions use a separate `dtoken` from patient sessions. Sample doctors created by `backend`'s `npm run seed:doctors` use the password `doctor123`.
