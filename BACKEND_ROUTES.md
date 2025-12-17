# FundsUs Backend API Routes

Base URL: `/api`

---

## App-level Routes (not under `/api`)

| Method | Endpoint | Description                                        |
| ------ | -------- | -------------------------------------------------- |
| GET    | `/`      | Health check (`Server is working`)                 |
| ALL    | `*`      | Not found handler (returns 404 for unknown routes) |

## Authentication Routes (`/auth`)

| Method | Endpoint                | Description                         | Access      |
| ------ | ----------------------- | ----------------------------------- | ----------- |
| POST   | `/auth/register`        | Register a new user                 | Public      |
| POST   | `/auth/login`           | Login user                          | Public      |
| POST   | `/auth/social-login`    | Social login (Google/Facebook)      | Public      |
| POST   | `/auth/logout`          | Logout user                         | Public      |
| POST   | `/auth/refresh-token`   | Refresh access token                | Public      |
| POST   | `/auth/auto-refresh`    | Auto-refresh token when near expiry | Public      |
| GET    | `/auth/verify-token`    | Verify token validity               | Admin       |
| GET    | `/auth/profile`         | Get current user profile            | User, Admin |
| PATCH  | `/auth/profile`         | Update current user profile         | User, Admin |
| PATCH  | `/auth/change-password` | Change password                     | User, Admin |

---

## User Routes (`/users`)

| Method | Endpoint                       | Description                        | Access      |
| ------ | ------------------------------ | ---------------------------------- | ----------- |
| GET    | `/users`                       | Get all users (paginated)          | Admin       |
| POST   | `/users`                       | Create a new user                  | Admin       |
| GET    | `/users/admin/:userId/details` | Get detailed user info for admin   | Admin       |
| PATCH  | `/users/me`                    | Update current user's basic fields | User, Admin |
| PATCH  | `/users/me/highlights`         | Update current user's highlights   | User, Admin |
| GET    | `/users/discover`              | Discover users                     | User, Admin |
| GET    | `/users/browse`                | Browse users                       | User, Admin |
| GET    | `/users/:userId/public`        | Get public profile of a user       | Public      |
| GET    | `/users/:userId`               | Get single user by ID              | User, Admin |
| PATCH  | `/users/:userId`               | Update user by ID                  | Admin       |
| DELETE | `/users/:userId`               | Delete user by ID                  | Admin       |
| POST   | `/users/:userId/follow`        | Follow a user                      | User, Admin |
| POST   | `/users/:userId/unfollow`      | Unfollow a user                    | User, Admin |
| GET    | `/users/:userId/followers`     | Get user's followers               | Public      |
| GET    | `/users/:userId/following`     | Get user's following list          | Public      |

---

## Fundraiser Routes (`/fundraisers`)

| Method | Endpoint                      | Description                           | Access      |
| ------ | ----------------------------- | ------------------------------------- | ----------- |
| GET    | `/fundraisers`                | Get all fundraisers (admin dashboard) | Admin       |
| POST   | `/fundraisers/owner/:ownerId` | Admin create fundraiser for a user    | Admin       |
| GET    | `/fundraisers/public`         | Get public fundraisers                | Public      |
| POST   | `/fundraisers/drafts`         | Create a draft fundraiser             | User, Admin |
| PATCH  | `/fundraisers/:id`            | Update fundraiser                     | User, Admin |
| POST   | `/fundraisers/:id/publish`    | Publish a draft fundraiser            | User, Admin |
| GET    | `/fundraisers/mine`           | Get current user's fundraisers        | User, Admin |
| GET    | `/fundraisers/slug/:slug`     | Get fundraiser by slug                | Public      |
| GET    | `/fundraisers/:id`            | Get fundraiser by ID (admin)          | Admin       |
| PATCH  | `/fundraisers/admin/:id`      | Admin update fundraiser               | Admin       |
| DELETE | `/fundraisers/admin/:id`      | Admin delete fundraiser               | Admin       |

### Fundraiser Reactions

| Method | Endpoint                      | Description                     | Access      |
| ------ | ----------------------------- | ------------------------------- | ----------- |
| POST   | `/fundraisers/:id/reactions`  | React to a fundraiser           | User, Admin |
| DELETE | `/fundraisers/:id/reactions`  | Remove reaction from fundraiser | User, Admin |
| GET    | `/fundraisers/:id/reactions`  | Get fundraiser reactions        | Public      |
| GET    | `/fundraisers/reactions/mine` | Get current user's reactions    | User, Admin |

---

## Donation Routes (`/donations`)

| Method | Endpoint                                  | Description                        | Access                 |
| ------ | ----------------------------------------- | ---------------------------------- | ---------------------- |
| POST   | `/donations`                              | Create a donation                  | Public (Optional Auth) |
| GET    | `/donations/fundraiser/:fundraiserId`     | Get donations for a fundraiser     | Public                 |
| GET    | `/donations/fundraiser/:fundraiserId/top` | Get top donations for a fundraiser | Public                 |
| GET    | `/donations/mine`                         | Get current user's donations       | User, Admin            |
| GET    | `/donations/impact`                       | Get current user's impact stats    | User, Admin            |
| GET    | `/donations/admin/all`                    | Get all donations (admin)          | Admin                  |
| GET    | `/donations/admin/stats`                  | Get donation statistics            | Admin                  |
| GET    | `/donations/admin/:donationId`            | Get donation by ID                 | Admin                  |
| DELETE | `/donations/admin/:donationId`            | Delete donation                    | Admin                  |

### Admin Donations Query Parameters

- `page` - Page number
- `pageSize` - Items per page
- `search` - Search term
- `status` - Filter by status
- `minAmount` - Minimum donation amount
- `maxAmount` - Maximum donation amount
- `fromDate` - Start date filter
- `toDate` - End date filter

---

## Activity Routes (`/activities`)

| Method | Endpoint                               | Description                      | Access      |
| ------ | -------------------------------------- | -------------------------------- | ----------- |
| GET    | `/activities/user/:userId`             | Get public activities for a user | Public      |
| GET    | `/activities/fundraiser/:fundraiserId` | Get activities for a fundraiser  | Public      |
| POST   | `/activities`                          | Create a new activity            | User, Admin |
| GET    | `/activities/me`                       | Get current user's activities    | User, Admin |
| GET    | `/activities/admin/all`                | Get all activities (admin)       | Admin       |
| DELETE | `/activities/admin/:activityId`        | Delete an activity               | Admin       |

---

## Coupon Routes (`/coupons`)

| Method | Endpoint                       | Description                              | Access      |
| ------ | ------------------------------ | ---------------------------------------- | ----------- |
| GET    | `/coupons/mine`                | Get current user's coupons               | User, Admin |
| GET    | `/coupons/code/:code`          | Get coupon by code                       | Public      |
| GET    | `/coupons/admin/stats`         | Get coupon statistics                    | Admin       |
| GET    | `/coupons/admin/all`           | Get all coupons                          | Admin       |
| GET    | `/coupons/admin/:couponId`     | Get coupon by ID                         | Admin       |
| POST   | `/coupons/admin/select-winner` | Select random winner from active coupons | Admin       |
| POST   | `/coupons/admin/cleanup`       | Mark expired coupons                     | Admin       |

---

## Stripe/Payment Routes (`/stripe`)

| Method | Endpoint                        | Description                         | Access                 |
| ------ | ------------------------------- | ----------------------------------- | ---------------------- |
| POST   | `/stripe/create-payment-intent` | Create Stripe payment intent        | Public (Optional Auth) |
| POST   | `/stripe/webhook`               | Stripe webhook handler              | Stripe                 |
| POST   | `/stripe/confirm-payment`       | Confirm payment and create donation | Public (Optional Auth) |

---

## Upload Routes (`/upload`)

| Method | Endpoint                  | Description                                  | Access      |
| ------ | ------------------------- | -------------------------------------------- | ----------- |
| POST   | `/upload/profile-picture` | Upload profile picture (multipart/form-data) | User, Admin |
| POST   | `/upload/base64-image`    | Upload base64 encoded image                  | User, Admin |

---

## Access Levels

- **Public**: No authentication required
- **Optional Auth**: Authentication optional (guest donations allowed)
- **User**: Requires authenticated user
- **Admin**: Requires admin role
- **User, Admin**: Requires either user or admin role
- **Stripe**: Stripe webhook signature verification

---

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errorMessages": [
    {
      "path": "field",
      "message": "Validation error"
    }
  ]
}
```
