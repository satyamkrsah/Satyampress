# Environment Variables Configuration

The system requires several critical environment variables to function correctly. **Never commit `.env` files to source control.**

## Backend (`/backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `development` or `production` |
| `PORT` | The port the Node server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/satyampress` |
| `JWT_SECRET` | Cryptographic secret for signing tokens | `supersecretkey_change_in_production` |
| `JWT_EXPIRE` | Expiry duration for auth tokens | `30d` |
| `RAZORPAY_KEY_ID` | Your public Razorpay Key | `rzp_test_xxxxxx` |
| `RAZORPAY_KEY_SECRET`| Your private Razorpay Secret | `secretxxxxxx` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret | `abcxyz123` |
| `SMTP_HOST` | Email SMTP Server | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP Port | `587` |
| `SMTP_USER` | Email Authentication Username | `noreply@satyampress.com` |
| `SMTP_PASS` | Email Authentication Password | `app_password` |

## Frontend (`/Frontend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL pointing to the backend API | `http://localhost:5000/api` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key for frontend widget | `rzp_test_xxxxxx` |
