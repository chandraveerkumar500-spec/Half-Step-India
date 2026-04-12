# Hack2Skill

Hack2Skill is a hackathon MVP for monitoring public infrastructure through a half-step condition scoring system. The platform is designed to help teams detect asset degradation early, trigger maintenance workflows before complete failure, and present district-level health insights through dashboards and reporting tools.

## Problem Statement

Public assets such as roads, streetlights, toilets, benches, hospital lines, and water pumps are often repaired only after full failure. Hack2Skill introduces a fractional scoring model so teams can identify deterioration earlier and act before assets become non-functional.

## Core Idea

Every asset is scored using five fixed values:

- `2.0` = perfect
- `1.5` = minor degradation
- `1.0` = moderate degradation
- `0.5` = severe degradation
- `0.0` = non-functional

Instead of waiting for a binary working/not-working state, the system tracks score drops over time, flags risky decline patterns, and generates alerts or work orders when thresholds are crossed.

## MVP Goals

- Register and manage public assets with location and department data
- Support role-based access for `admin`, `department_officer`, `field_inspector`, and `citizen`
- Record condition reports with score, notes, timestamp, photo, and geolocation
- Trigger alerts and work orders from score-drop rules
- Show district-level degradation summaries and trend insights
- Prepare a strong hackathon demo with seeded sample data and one complete end-to-end scenario

## Current Repository Structure

```text
hack2skill/
  app/        -> main implementation workspace
  frontend/   -> separate Next.js scaffold, currently default starter
```

The `app` folder is the primary project area right now. It already includes the main technical foundation for the MVP:

- Next.js app setup
- Prisma schema for users, departments, assets, reports, alerts, work orders, and district metrics
- NextAuth credential-based authentication wiring
- half-step scoring utilities and alert/work-order evaluation logic

The `frontend` folder exists but is still close to the default Next.js starter and does not appear to be the main active implementation yet.

## Tech Stack

- Frontend: `Next.js 16` + `React 19` + `TypeScript`
- Styling: `Tailwind CSS 4`
- Auth: `NextAuth` with credentials provider
- Database ORM: `Prisma`
- Database target: `PostgreSQL`
- Password hashing: `bcryptjs`
- Charts: `Recharts`

## Current Implementation Status

Implemented in `app/`:

- project bootstrapping with Next.js App Router
- Prisma data model for core entities
- auth configuration for credential login
- score validation for allowed half-step values
- alert/work-order evaluation rules for major score drops
- Half-Step Index calculation helpers

Still pending or not yet visible in the current codebase:

- login page UI
- dashboard routes and analytics screens
- asset CRUD pages and APIs
- report submission flow
- file upload flow
- seeded demo data
- full end-to-end inspector/admin experience

## Core Alert Logic

The current scoring utility follows these key rules:

- `1.5 -> 1.0` creates a medium alert
- `1.0 -> 0.5` creates a high alert and a work order
- any drop to `0.0` creates a critical alert and critical work order
- larger rapid drops can also trigger high-priority handling

## Data Model

The Prisma schema currently defines:

- `Department`
- `User`
- `Asset`
- `AssetReport`
- `Alert`
- `WorkOrder`
- `DistrictMetricsDaily`

This matches the hackathon plan closely and provides the base needed for reporting, scoring, alerting, and district-level summaries.

## Suggested Demo Story

The strongest demo path for this project is:

1. Admin or inspector logs in
2. Opens an existing public asset
3. Submits a lower score than the previous report
4. System calculates score delta
5. Alert or work order is generated automatically
6. Dashboard highlights the degrading asset and district trend

## Local Setup

### Main App

```bash
cd app
npm install
npm run dev
```

### Secondary Frontend Scaffold

```bash
cd frontend
npm install
npm run dev
```

## Environment Notes

The Prisma setup expects a PostgreSQL connection string through:

```env
DATABASE_URL=postgresql://...
```

For the auth flow, you will also likely need standard NextAuth environment variables when the login flow is completed, such as:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

## Recommended Next Steps

- add a real root architecture decision: use only `app/` or merge/remove the duplicate `frontend/`
- build the missing login and dashboard routes
- add asset CRUD and report submission APIs
- seed demo users, assets, and report history
- wire alert/work-order creation into report submission
- prepare one polished judge-facing demo flow before adding optional features

## Submission Priorities

For hackathon delivery, the priority should remain:

- complete one stable end-to-end workflow first
- keep the score-drop logic correct
- seed convincing demo data
- document setup, features, and demo credentials clearly
- polish only after the workflow is reliable

## Project Vision

Hack2Skill is aimed at helping teams move from reactive repair to early intervention. The value of the product is not only in collecting reports, but in turning small drops in asset condition into actionable maintenance signals before public infrastructure reaches failure.
