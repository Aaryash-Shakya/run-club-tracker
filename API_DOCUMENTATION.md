# Run Club Tracker — API Documentation

Base URL: `https://run-club-tracker.onrender.com/api`

All responses use JSON. Responses are cached for **5 minutes** (`Cache-Control: public, max-age=300`) unless noted otherwise.

---

## Table of Contents

- [Types](#types)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Activities](#activities)
  - [Users](#users)
- [Data Conventions & Conversions](#data-conventions--conversions)
- [Error Handling](#error-handling)
- [Weekly Date Logic](#weekly-date-logic)

---

## Types

These are the TypeScript types for all API response payloads. Use them as-is in your frontend.

```typescript
/** A single activity record */
type TActivity = {
  _id: string
  name: string
  /** Distance in meters */
  distance: number
  /** Moving time in seconds */
  movingTime: number
  /** Elapsed time in seconds (includes pauses) */
  elapsedTime: number
  /** Elevation gain in meters */
  totalElevationGain: number
  /** Pace in decimal minutes per kilometer (e.g. 6.5 = 6:30/km) */
  movingPace: number
  /** Activity type label, e.g. "Run", "Walk" */
  type: string
  /** Sport type label, e.g. "Running", "Walking" */
  sportType: string
  /** Strava workout type number */
  workoutType: number
  /** ISO 8601 date string */
  activityDate: string
  /** Whether the activity passed validation thresholds */
  isValid: boolean
  /** Reason for invalidation, or null if valid */
  note: string | null
  __v: number
  createdAt: string
  updatedAt: string
}

/** A user profile */
type TUser = {
  _id: string
  firstName: string
  lastName: string
  bio: string | null
  createdAt: string
  updatedAt: string
  __v: number
}

/** Aggregated statistics for a user over a time period */
type TStats = {
  /** Total valid distance in meters */
  totalDistance: number
  /** Total valid moving time in seconds */
  totalMovingTime: number
  /** Weighted average pace in decimal min/km (weighted by distance) */
  averagePace: number
  /** Number of valid activities */
  totalActivities: number
  /** Number of invalid (rejected) activities */
  invalidActivities: number
  /** Sum of valid distances where pace < 10 min/km (meters) */
  runningDistance: number
  /** totalDistance - runningDistance (meters) */
  walkingDistance: number
}

/** User with stats (no activities array) */
type TUserWithStats = {
  user: TUser
  stats: TStats
}

/** User with stats and their activity list */
type TUserActivitiesWithStats = TUserWithStats & {
  activities: TActivity[]
}

/** Activity with user object populated (used in /july and /recent) */
type TActivityWithUser = Omit<TActivity, 'activityDate' | 'createdAt' | 'updatedAt'> & {
  activityDate: string  // ISO date
  createdAt: string
  updatedAt: string
  user: TUser
}
```

---

## Endpoints

### Health

#### `GET /api/`

API info and status.

**Response:**

```typescript
{
  message: "Strava Club Activity Tracker API"
  status: "running"
  timestamp: string  // ISO 8601
}
```

#### `GET /api/health`

Database connection check.

**Response:**

```typescript
{
  status: "OK"
  timestamp: string  // ISO 8601
  database: "connected" | "disconnected"
}
```

---

### Activities

#### `GET /api/activities`

Fetch all users' activities for a given time period, grouped by user with computed stats. **This is the main leaderboard endpoint.**

**Query Parameters:**

| Param    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `period` | string | Yes      | `"daily"`, `"weekly"`, or `"monthly"` |
| `date`   | string | No       | Date in `yyyy-mm-dd` format. Defaults to today. The period is calculated around this date. |

**Response:**

```typescript
{
  status: "OK"
  message: string
  userActivitiesWithStats: TUserWithStats[]  // sorted by totalDistance descending
}
```

> **Note:** This endpoint returns `TUserWithStats[]` (stats only, no activities array) despite the field name `userActivitiesWithStats`.

**Example:** `GET /api/activities?period=weekly&date=2025-08-10`

---

#### `GET /api/activities/recent`

Fetch all activities from the last 24 hours.

**Response:**

```typescript
{
  status: "OK"
  message: "Recent activities fetched successfully"
  activities: TActivityWithUser[]             // raw activity list with populated user
  userActivitiesWithStats: TUserWithStats[]   // grouped & sorted by distance
}
```

---

#### `GET /api/activities/july`

Fetch all activities for July 2025 (hardcoded month).

**Response:**

```typescript
{
  status: "OK"
  message: "Monthly activities for July fetched successfully"
  activities: TActivityWithUser[]
}
```

> No caching on this endpoint.

---

### Users

#### `GET /api/users`

List all registered users.

**Response:**

```typescript
{
  status: "OK"
  message: "Users fetched successfully"
  data: {
    users: TUser[]
    count: number
  }
}
```

---

#### `GET /api/users/:userId/activities`

Fetch a single user's activities for a given period, with stats.

**Path Parameters:**

| Param    | Type   | Description |
|----------|--------|-------------|
| `userId` | string | MongoDB ObjectId (24-character hex string) |

**Query Parameters:**

| Param    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `period` | string | Yes      | `"daily"`, `"weekly"`, or `"monthly"` |
| `date`   | string | No       | Date in `yyyy-mm-dd` format. Defaults to today. |

**Response:**

```typescript
{
  status: "OK"
  message: string
  activities: TUserActivitiesWithStats  // single object (not array), includes activities list
}
```

> **Note:** `activities` here is a single `TUserActivitiesWithStats` object — it includes the user, their stats, and the full activities array. Returns `undefined` if the user has no activities in the period.

**Example:** `GET /api/users/64a1b2c3d4e5f6a7b8c9d0e1/activities?period=monthly`

---

## Data Conventions & Conversions

These are critical to understand when displaying data in your frontend.

### Units stored in the database

| Field                | Unit                  | How to convert for display |
|----------------------|-----------------------|---------------------------|
| `distance`           | **meters**            | Divide by 1000 for kilometers |
| `movingTime`         | **seconds**           | Divide by 60 for minutes, or format as `H:MM:SS` |
| `elapsedTime`        | **seconds**           | Same as movingTime |
| `totalElevationGain` | **meters**            | Display as-is |
| `movingPace`         | **decimal min/km**    | See pace formatting below |
| `totalDistance`       | **meters**            | Divide by 1000 for kilometers |
| `totalMovingTime`    | **seconds**           | Format as `H:MM:SS` |
| `averagePace`        | **decimal min/km**    | See pace formatting below |
| `runningDistance`     | **meters**            | Divide by 1000 for kilometers |
| `walkingDistance`     | **meters**            | Divide by 1000 for kilometers |

### Pace formatting

Pace is stored as a **decimal number in minutes per kilometer** (e.g., `6.5` means 6 minutes 30 seconds per km).

To display it in `M:SS` format:

```typescript
function formatPace(pace: number): string {
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Examples:
// 6.5    → "6:30"
// 5.25   → "5:15"
// 10.083 → "10:05"
```

### Average pace calculation

Average pace is **weighted by distance**, not a simple mean. The formula:

```
averagePace = Σ(activity.movingPace × activity.distance) / Σ(activity.distance)
```

This means longer activities contribute more to the average. Only **valid** activities are included.

### Running vs Walking classification

- **Running:** `movingPace < 10` min/km
- **Walking:** `movingPace >= 10` min/km

`runningDistance` and `walkingDistance` in stats are split using this threshold.

### Activity validation

Activities are validated against challenge thresholds. An activity is marked `isValid: false` when:

- **Walk** (pace > maxRunPace): distance < minimum walking distance threshold
- **Run** (pace <= maxRunPace): distance < minimum running distance threshold

Invalid activities are **excluded** from stats calculations (`totalDistance`, `totalMovingTime`, `averagePace`, `totalActivities`). They are only counted in `invalidActivities`.

The `note` field on an activity contains the human-readable reason for rejection when `isValid` is `false`.

### Timezone

All date operations use **Asia/Kathmandu (UTC+5:45)**. When you pass a `date` query parameter, the server interprets it in this timezone. The `period` boundaries (start/end of day, week, month) are calculated in NPT, then converted to UTC for database queries.

---

## Error Handling

### Validation errors (400)

Returned when query parameters fail Zod validation.

```typescript
{
  status: "ERROR"
  message: "Validation failed"
  errors: Array<{
    field: string    // dot-path of the invalid field
    message: string  // human-readable error
  }>
}
```

**Example:**

```json
{
  "status": "ERROR",
  "message": "Validation failed",
  "errors": [
    { "field": "period", "message": "Period must be 'daily', 'weekly', or 'monthly'" }
  ]
}
```

### Invalid userId (400)

```typescript
{
  error: "Invalid userId format"
  details: ZodIssue[] | "Invalid parameters"
}
```

### Not found (404)

```typescript
{
  success: false
  error: {
    message: "Route /api/nonexistent not found"
  }
}
```

### Server errors (500)

```typescript
{
  success: false
  error: {
    message: string
    stack?: string  // only in development
  }
}
```

---

## Weekly Date Logic

The week calculation is **not standard ISO weeks**. Weeks are **month-relative**:

- Week starts on **Sunday** (or the 1st of the month if Sunday falls in the previous month).
- Week ends 6 days after the start.
- If the calculated Sunday start is in the previous month, the week start is overridden to the **1st of the current month**.

This means the first "week" of a month may be shorter than 7 days. Keep this in mind when displaying week labels.

**Example:** If March 1 is a Wednesday:
- Week 1: Mar 1 (Wed) – Mar 4 (Sat) → only 4 days
- Week 2: Mar 5 (Sun) – Mar 11 (Sat) → full 7 days
- etc.

---

## Data Sync

Activities are synced from Strava every **30 minutes** via a cron job. There may be up to a 30-minute delay between a user completing an activity on Strava and it appearing in the API.

Daily stats reset at **midnight NPT (UTC+5:45)**, weekly stats reset based on the month-relative week logic described above, and monthly stats reset on the 1st of each month.
