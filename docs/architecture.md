# System Architecture

Satyam Printing Press operates on a decoupled client-server architecture.

## 1. Frontend (Client Tier)
- **Framework:** React.js powered by Vite for rapid HMR and optimized production builds.
- **State Management:** Local component state for UI interactions, and centralized Zustand (or React Context) for global states like the Shopping Cart and User Authentication.
- **Routing:** Handled via `react-router-dom`. Routes are split into three zones: Public (Shop), Protected (Customer Dashboard), and Admin (Dashboard).
- **Styling:** Tailwind CSS is used extensively for utility-first styling, providing a highly responsive and dynamic modern UI without bulky CSS files.

## 2. Backend (Application Tier)
- **Server:** Express.js running on a Node.js runtime.
- **Design Pattern:** The API is structured using the MVC (Model-View-Controller) pattern.
  - **Routes** map HTTP endpoints to controller functions.
  - **Controllers** extract parameters, enforce business logic, interact with models, and format JSON responses.
  - **Middlewares** intercept requests to validate JWTs (`protect`), verify RBAC (`authorize('admin')`), limit rates, and parse file uploads (`multer`).
- **Security Integrations:**
  - `helmet` secures HTTP headers against common attacks (XSS, Clickjacking).
  - `express-mongo-sanitize` prevents NoSQL injection via `req.body` or `req.query`.
  - `xss-clean` sanitizes user input payloads.

## 3. Data Tier
- **Primary Database:** MongoDB acts as the primary data store, using `Mongoose` as the Object Data Modeling (ODM) library. It handles referential integrity through ObjectId references (e.g., Orders referencing Users and Products).
- **Asset Storage:** Cloudinary is utilized as an external CDN/Blob storage mechanism. When a customer uploads a design file, it streams to Cloudinary and only the secure URL is saved in MongoDB.

## 4. Payment Subsystem
- The application relies on Razorpay for payment orchestration. 
- The backend generates a secure Order ID via the Razorpay SDK.
- The frontend loads the Razorpay Checkout widget.
- The backend strictly verifies the cryptographic HMAC SHA256 signature sent back by Razorpay before confirming the payment and updating the inventory.

## 5. Deployment Architecture
- Containerized using Docker.
- **Frontend Container:** A multi-stage Docker build that compiles the React app into static HTML/JS/CSS files, which are then served using an ultra-fast NGINX server.
- **Backend Container:** A standard Node.js image that runs the Express server.
- Orchestrated locally using `docker-compose.yml` and prepared for production scaling via `.github/workflows/deploy.yml`.
