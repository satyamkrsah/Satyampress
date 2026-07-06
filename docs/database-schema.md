# Database Schema

The database utilizes MongoDB via the Mongoose ODM. Below are the key entities and their conceptual schemas.

## 1. User (`users`)
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique)
- `password`: String (Bcrypt Hashed)
- `role`: Enum ['customer', 'admin']
- `phone`: String
- `status`: Enum ['active', 'blocked']
- `addresses`: Array of Subdocuments (Street, City, State, ZIP, Country, isDefault)
- `timestamps`: createdAt, updatedAt

## 2. Category (`categories`)
- `_id`: ObjectId
- `name`: String
- `slug`: String (Unique)
- `description`: String
- `image`: String (URL)
- `parentCategory`: ObjectId (Ref: Category, nullable)
- `status`: Enum ['active', 'inactive']
- `seo`: Subdocument (Title, Description, Keywords)

## 3. Product (`products`)
- `_id`: ObjectId
- `name`: String
- `sku`: String (Unique)
- `category`: ObjectId (Ref: Category)
- `basePrice`: Number
- `description`: String
- `images`: Array of Strings
- `stock`: Number
- `gstRate`: Number
- `customizationOptions`: Array of Subdocuments (Defining available paper sizes, GSM, finishes, etc. specific to this product)
- `isActive`: Boolean

## 4. Cart (`carts`)
- `_id`: ObjectId
- `user`: ObjectId (Ref: User)
- `items`: Array of Subdocuments
  - `product`: ObjectId (Ref: Product)
  - `quantity`: Number
  - `price`: Number
  - `customizations`: Object (Map of chosen custom options)
  - `designFile`: ObjectId (Ref: Media)
  - `specialInstructions`: String
- `coupon`: ObjectId (Ref: Coupon, nullable)
- `totals`: Subdocuments (SubTotal, TaxTotal, ShippingTotal, DiscountTotal, GrandTotal)

## 5. Order (`orders`)
- `_id`: ObjectId
- `user`: ObjectId (Ref: User)
- `invoiceNumber`: String (Unique)
- `items`: Array (Snapshot of Cart Items)
- `shippingAddress`: Object (Snapshot of chosen User Address)
- `billingAddress`: Object
- `financials`: Subdocument (SubTotal, Tax, Shipping, Discount, GrandTotal)
- `paymentStatus`: Enum ['pending', 'completed', 'failed', 'refunded']
- `orderStatus`: Enum ['pending', 'confirmed', 'printing', 'ready', 'shipped', 'delivered', 'cancelled']
- `paymentDetails`: Subdocument (razorpayOrderId, razorpayPaymentId, signature)
- `timeline`: Array of status updates

## 6. Payment (`payments`)
- `_id`: ObjectId
- `razorpayOrderId`: String
- `razorpayPaymentId`: String
- `order`: ObjectId (Ref: Order)
- `customer`: ObjectId (Ref: User)
- `amount`: Number
- `currency`: String
- `paymentStatus`: Enum ['pending', 'completed', 'failed', 'refunded']
- `refundStatus`: Enum ['none', 'partial', 'full']

## 7. Settings (`settings`)
*(Singleton collection managing global store config)*
- `storeName`, `logo`, `gstNumber`: Strings
- `address`, `phone`, `email`: Strings
- `socialLinks`: Subdocument
- `seo`: Subdocument (Default title/desc)
