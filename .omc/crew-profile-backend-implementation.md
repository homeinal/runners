# Crew Profile Backend Implementation

## Summary

Successfully implemented the complete backend for crew profile management.

## Database Schema

### CrewProfile Model
```prisma
model CrewProfile {
  id            String   @id @default(cuid())
  userId        String   @unique @map("user_id")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  nickname      String
  region        String
  pace          String
  message       String?
  tags          String[] @default([])
  availableDays String[] @default([]) @map("available_days")
  preferredTime String?  @map("preferred_time")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([region], map: "idx_crew_profiles_region")
  @@index([createdAt], map: "idx_crew_profiles_created_at")
  @@map("crew_profiles")
}
```

### User Model Relation
Added `crewProfile CrewProfile?` to User model for one-to-one relationship.

## API Routes

### 1. `/api/crew/profiles` (GET, POST)

#### GET - List Profiles with Filters
**Query Parameters:**
- `region` - Filter by region (e.g., "서울", "경기")
- `search` - Search in nickname, message, or tags
- `day` - Filter by available day (e.g., "월", "화")

**Response:** Array of profiles with user avatar

**Features:**
- Case-insensitive search
- Multiple filter combination
- Ordered by creation date (newest first)
- Includes user image for avatar display

#### POST - Create Profile
**Authentication:** Required
**Body:**
```json
{
  "nickname": "string",
  "region": "string",
  "pace": "string (e.g., '5:30')",
  "message": "string (optional)",
  "tags": ["string[]"],
  "availableDays": ["string[]"],
  "preferredTime": "string (optional)"
}
```

**Validation:**
- Checks for existing profile (one per user)
- Validates required fields: nickname, region, pace
- Returns 400 if duplicate or missing fields

### 2. `/api/crew/profiles/[id]` (GET, PATCH, DELETE)

#### GET - Get Single Profile
**Response:** Profile with user avatar or 404

#### PATCH - Update Profile
**Authentication:** Required (owner only)
**Authorization:** Returns 403 if not profile owner
**Body:** Same fields as POST

#### DELETE - Delete Profile
**Authentication:** Required (owner only)
**Authorization:** Returns 403 if not profile owner

### 3. `/api/crew/my-profile` (GET)

#### GET - Get Current User's Profile
**Authentication:** Required
**Response:** User's own profile or `null` if doesn't exist

## Database Migration

Executed successfully:
```bash
npx prisma db push
```

Status: ✓ Database schema synced
Status: ✓ Prisma Client generated

## Build Verification

```bash
npm run build
```

Status: ✓ All routes compiled successfully
- `/api/crew/my-profile` - 176 B
- `/api/crew/profiles` - 176 B
- `/api/crew/profiles/[id]` - 176 B

## Security Features

1. **Authentication:** All mutations require valid session
2. **Authorization:** Users can only edit/delete their own profiles
3. **Validation:** Required field checks before database operations
4. **Cascade Delete:** Profile automatically deleted when user is deleted

## Performance Optimizations

1. **Database Indexes:**
   - `idx_crew_profiles_region` - Fast region filtering
   - `idx_crew_profiles_created_at` - Optimized sorting

2. **Case-Insensitive Search:**
   - Uses `mode: "insensitive"` for PostgreSQL
   - Searches across nickname, message, and tags

3. **Selective Includes:**
   - Only fetches `user.image` (not entire user object)

## Next Steps

Frontend implementation needed:
- Profile creation form
- Profile list view with filters
- Profile detail modal
- My profile edit page

## Files Created

1. `prisma/schema.prisma` - Updated with CrewProfile model
2. `src/app/api/crew/profiles/route.ts` - List/Create endpoints
3. `src/app/api/crew/profiles/[id]/route.ts` - CRUD for single profile
4. `src/app/api/crew/my-profile/route.ts` - Current user profile

## Implementation Date

2026-02-04
