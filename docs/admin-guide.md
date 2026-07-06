# Admin Guide

The Admin Dashboard provides full control over the e-commerce operations. To access the dashboard, a user must have the `role` field set to `admin` in the database.

## 1. Dashboard Overview
Upon logging in, the admin lands on the main overview panel `/admin/dashboard`. This displays top-level KPIs:
- Total Revenue
- Pending Orders
- Completed Orders
- Total Customers
Real-time graphs reflect order volume and revenue timelines.

## 2. Managing Orders
Navigate to the **Orders** tab (`/admin/orders`).
- **View Details**: Click on an order to view the customer details, uploaded design assets (links to Cloudinary), and financial breakdown.
- **Update Status**: Use the action dropdowns to move an order through the fulfillment pipeline: `Pending` -> `Confirmed` -> `Printing` -> `Ready for Dispatch` -> `Shipped` -> `Delivered`. Every status update generates a timestamped log in the order timeline.
- **Refunds**: For cancelled or problematic orders, admins can initiate Razorpay refunds (full or partial) directly from the dashboard.

## 3. Product & Category Management
- **Categories**: Create hierarchical categories in the `/admin/categories` panel. Define SEO tags to improve store search rankings.
- **Products**: Manage the catalog in `/admin/products`. Define the base price, available stock, GST rates, and complex customization configurations (e.g., Paper GSM, Lamination options).

## 4. Customer Management
- Navigate to `/admin/customers`.
- Search customers by email or name.
- View their cumulative order history and lifetime value.
- Use the **Block / Unblock** action to revoke or restore login capabilities for specific accounts.

## 5. Global Settings
- The `/admin/settings` panel controls the storefront branding.
- Change the store name, physical address, support email, phone numbers, and default SEO attributes. These settings are stored in the database and applied globally across the frontend application.
