# Folder Structure

The project follows a standard Monorepo layout containing both the React Frontend and Node.js Backend.

```text
d:\Satyampress\
├── backend/                  # Node.js / Express Backend Server
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Request handlers containing business logic
│   ├── middleware/           # Express middlewares (Auth, Error handling, Uploads)
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # Express router definitions mapping to controllers
│   ├── tests/                # Jest automated test suites and setup files
│   ├── utils/                # Helper functions (Notifier, Logger, etc.)
│   ├── server.js             # Express application entry point
│   ├── Dockerfile            # Backend Docker image blueprint
│   └── package.json          # Node dependencies and scripts
│
├── Frontend/                 # React / Vite Frontend Application
│   ├── src/
│   │   ├── api/              # Axios instances and API service calls
│   │   ├── assets/           # Static images, SVGs, and fonts
│   │   ├── components/       # Reusable UI components (Buttons, Inputs, Cards)
│   │   ├── layouts/          # Page wrappers (AdminLayout, MainLayout)
│   │   ├── pages/            # Routable page views
│   │   │   ├── admin/        # Admin Dashboard specific pages (e.g., AdminProducts)
│   │   │   ├── auth/         # Login and Registration views
│   │   │   ├── shop/         # Public-facing product browsing and detail views
│   │   │   └── user/         # Customer profile and order history views
│   │   ├── store/            # Global state management (Zustand context)
│   │   ├── App.jsx           # Main React Router setup (Lazy loaded components)
│   │   └── index.css         # Global Tailwind CSS and custom tokens
│   ├── public/               # Public assets (Favicon, robots.txt, sitemap.xml)
│   ├── Dockerfile            # Frontend Docker image blueprint (Multi-stage NGINX)
│   ├── tailwind.config.js    # Tailwind CSS configuration and theme extensions
│   └── package.json          # Frontend dependencies
│
├── docs/                     # Comprehensive project documentation
├── docker-compose.yml        # Development Docker orchestration
├── docker-compose.prod.yml   # Production Docker orchestration
└── README.md                 # Project introduction
```
