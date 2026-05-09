# Al-Manara API Reference

Base URL: `/api`

Most successful responses use:

```json
{
  "status": 200,
  "message": "Optional message",
  "data": {}
}
```

Most validation errors use:

```json
{
  "message": "Invalid request body",
  "issues": {}
}
```

Admin routes require the `admin_token` HTTP-only cookie created by the login API.

## Public APIs

### `GET /api/brands`

Returns all brands ordered by name.

### `POST /api/brands`

Creates a brand.

Supports JSON or multipart form data.

JSON body:

```json
{
  "name": "Toyota",
  "slug": "toyota",
  "country": "Japan",
  "logoUrl": "https://example.com/logo.png"
}
```

Multipart form data:

```txt
payload fields: name, slug, country, logoUrl
files: one brand logo file
```

### `GET /api/cars`

Returns active cars ordered newest first.

Query parameters:

```txt
name: optional car name search
brand: optional brand slug
minPrice: optional number/string
maxPrice: optional number/string
year: optional number
```

Example:

```txt
/api/cars?brand=toyota&minPrice=10000&maxPrice=30000&year=2022
```

### `GET /api/cars/{id}`

Returns one car with brand, images, specifications, and reviews.

### `POST /api/interests`

Registers interest in an out-of-stock active car.

Body:

```jsons
{
  "carId": "uuid",
  "email": "customer@example.com",
  "phoneNumber": "+963900000000"
}
```

Notes:

- Returns `404` if the car does not exist or is inactive.
- Returns `400` if the car is currently available.
- Upserts by `carId` and `email`.

### `GET /api/reviews`

Returns verified reviews ordered newest first.

### `POST /api/reviews`

Creates an unverified review and returns an `editToken`.

Body:

```json
{
  "email": "customer@example.com",
  "username": "Customer Name",
  "rating": 5,
  "comment": "Great service"
}
```

### `PATCH /api/reviews/{id}`

Updates a review using its edit token. The review becomes unverified again after editing.

Body:

```json
{
  "editToken": "token returned when creating the review",
  "rating": 4,
  "comment": "Updated comment"
}
```

At least one of `rating` or `comment` is required.

### `DELETE /api/reviews/{id}`

Deletes a review using its edit token.

Body:

```json
{
  "editToken": "token returned when creating the review"
}
```

### `POST /api/upload-cloudinary`

Uploads images to Cloudinary.

Multipart form data:

```txt
folder: "brand-logo" | "car-image"
carSlug: required when folder is "car-image"
files: one or more image files
```

Rules:

- `brand-logo` requires exactly one file.
- `car-image` requires `carSlug`.
- Allowed file types: JPG, JPEG, PNG, WEBP.
- Max image size: 10MB.

## Admin Auth APIs

### `POST /api/admin/auth/login`

Logs in an admin and sets the `admin_token` cookie.

Body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Success response includes:

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "fullName": "Admin Name",
    "role": "admin"
  }
}
```

### `POST /api/admin/auth/logout`

Logs out the admin by clearing the `admin_token` cookie.

### `POST /api/admin/auth/forgot-password`

Creates a 6-digit OTP and sends it by email.

Body:

```json
{
  "email": "admin@example.com"
}
```

Response is intentionally generic:

```json
{
  "status": 200,
  "message": "If this email exists, an OTP has been sent."
}
```

### `POST /api/admin/auth/reset-password`

Resets an admin password using the OTP.

Body:

```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

## Admin Car APIs

### `POST /api/admin/car`

Creates a car. Requires admin authentication.

Supports JSON or multipart form data.

JSON body:

```json
{
  "brandId": "uuid",
  "name": "Camry",
  "model": "Hybrid",
  "year": 2024,
  "registrationYear": 2024,
  "engine": "Hybrid",
  "engineCapacityCc": 2500,
  "transmission": "Automatic",
  "mileageKm": 0,
  "originCountry": "Japan",
  "color": "White",
  "description": "Car description",
  "price": "30000",
  "salePrice": null,
  "isOnSale": false,
  "isNewArrival": true,
  "newArrivalExpiresAt": "2026-06-01T00:00:00.000Z",
  "stockQuantity": 1,
  "isFeatured": false,
  "featuredOrder": null,
  "isActive": true,
  "images": ["https://example.com/car.jpg"],
  "specifications": {
    "doors": 4,
    "fuel": "Hybrid"
  }
}
```

Multipart form data can include the same fields plus uploaded car image files.

### `PATCH /api/admin/car/{id}`

Updates a car. Requires admin authentication.

Accepts a partial version of the create car body. Supports JSON or multipart form data.

If `images` or uploaded files are provided, existing images are replaced.
If `specifications` is provided, existing specifications are replaced.

### `DELETE /api/admin/car/{id}`

Deletes a car. Requires admin authentication.

## Admin Interest APIs

### `GET /api/admin/interests`

Returns registered car interests. Requires admin authentication.

Query parameters:

```txt
carId: optional UUID
notified: optional "true" | "false"
```

Each item includes a `whatsappUrl` when a phone number exists.

### `PATCH /api/admin/interests/{id}`

Updates the `notified` status. Requires admin authentication.

Body:

```json
{
  "notified": true
}
```

### `DELETE /api/admin/interests/{id}`

Deletes an interest. Requires admin authentication.

## Admin Review APIs

### `GET /api/admin/reviews`

Returns all reviews, verified and unverified. Requires admin authentication.

### `PATCH /api/admin/reviews/{id}`

Approves or unapproves a review. Requires admin authentication.

Body:

```json
{
  "isVerified": true
}
```

### `DELETE /api/admin/reviews/{id}`

Deletes a review. Requires admin authentication.
