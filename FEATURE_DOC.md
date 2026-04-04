<aside> 🧭

**Summary**

- Product: Operating system for influencers & agencies
- Source: Mapped from Figma file (3 pages, ~792 screens)
- Portals: Super Admin dashboard, Agency employee app, Influencer app
- MVP focus: Auth, Dashboard, Leads, Campaigns, Creators </aside>

> The Operating System for Influencers & Agencies Mapped from Figma design file — 3 pages, 792 screens total

---

## Architecture: Three User Portals


| Page                | Figma URL     | Screens | User                                           |
| ------------------- | ------------- | ------- | ---------------------------------------------- |
| **Admin Dashboard** | `node-id=0-3` | ~447    | Super Admin (agency owner)                     |
| **Agency UI**       | `node-id=0-4` | ~198    | Agency employees (Sales, Operations, Managers) |
| **Influencer UI**   | `node-id=0-1` | ~147    | Creators/Influencers                           |


---

## Table of Contents

---

# Part A — Admin Dashboard (Super Admin)

> Page: `node-id=0-3` | ~447 screens The full control panel for the agency owner/super admin

<aside> ⭐

**Highlights (Admin)**

- Lead → Campaign → Creator workflow (pipeline + assignment + tracking)
- Financial ops: invoices, payments, revenue analytics
- Governance: people/leave, roles & permissions, blacklist
- System utilities: reminders, search, integrations </aside>

---

## A1. Dashboard

**Figma Screens:**

- `Super Admin-dashboard` (multiple variants)
- `Super Admin-set target dashboard`
- `yunto dashboard` (web + mobile)
- `dashboard homescreen`

### Features

### A1.1 Agency Overview

- **Team Glance** — total members, active vs absent count, split by Sales and Operations
- **Campaign Progress** — progress bar showing total campaigns, % completed, in-progress, and pending
- **Conversion Ratio** — percentage of leads converted to deals
- **Response Time** — average time to respond to a new lead (rated as Excellent/Good/Poor)
- **Average Ticket Size** — average deal value (e.g., ₹2.5L)

### A1.2 Top Creators Widget

- Ranked list of best-performing creators (daily/weekly/monthly toggle)
- Shows: name, handle, follower count, views, leads generated

### A1.3 Leads Overview

- Quick counts: Contacted, New Lead, Unattended, Converted
- Event/meetup lead sources
- Inline follow-up reminders with countdown timers (e.g., “Follow up in 30 mins”)

### A1.4 Revenue Summary

- **This Month** — total revenue split by Sales vs Operations, with % change from last month
- **Last Month** — same breakdown
- **Total Earnings** — all-time revenue

### A1.5 Set Targets

- Per-team targets (Sales, Operations)
- Per-employee targets with name, target amount, and progress %

---

## A2. Leads Management

**Figma Screens:**

- `Super Admin- leads`
- `Super Admin- new leads`
- `Super Admin- detail New leads`
- `Super Admin- contacted leads`
- `Super Admin- detail contacted lead`
- `Super Admin- Create lead paid`
- `Super Admin- Create lead barter`
- `Super Admin- leads(download leads)`
- `Super Admin- new lead search`
- `Super Admin- lead connected`
- `Super Admin- new lead- creator list`
- `Super Admin- creators (new leads) add creator`
- `Super Admin- creators (contacted) add creator`
- `Super Admin- contacted`
- `yunto leads` (mobile)

### Features

### A2.1 Lead Pipeline

- **Stages:** New → Contacted → Connected → Converted
- Each lead shows: brand name, deal type (Paid/Barter), budget, timeline, status

### A2.2 Create New Lead

- Two flows: **Paid** and **Barter**
- Fields: brand name, contact info, campaign details, budget, timeline
- Assign lead to a sales team member

### A2.3 Lead Detail View

- Full brand/contact information
- Communication history
- Assigned team member
- Status progression timeline

### A2.4 Attach Creators to Leads

- Search and add creators from agency’s database to a lead
- Share creator list with the brand (via shareable link)

### A2.5 Lead Search & Filter

- Search across all leads
- Filter by status (new/contacted/connected/converted)
- Filter by deal type (paid/barter)

### A2.6 Download Leads

- Export leads data (CSV/Excel)

### A2.7 Creator Shared Links

- Generate a shareable link of selected creator profiles to send to brands
- Multiple screens for different shared link states

---

## A3. Campaigns

**Figma Screens:**

- `Super Admin-Campaigns`
- `Super Admin- Campaigns detail`
- `Super Admin- Campaigns detail - creator list`
- `Super Admin- Campaigns assign`
- `Super Admin- Campaigns creator detail(my creator)`
- `Super Admin- Campaigns creator detail(all creator)`
- `Super Admin- Rating Creator(mark done campaign)` (3 variants)
- `yunto campaigns` (mobile)

### Features

### A3.1 Campaign List

- All active campaigns with: brand name, deal type (Paid/Barter), budget, date range, completion %
- Daily/Weekly/Monthly toggle
- Campaign count by status

### A3.2 Campaign Detail

- Full campaign info: brand, budget, timeline, deliverables
- List of assigned creators with individual status
- Progress tracking per creator

### A3.3 Assign Creators to Campaign

- Browse and assign creators (from “my creators” or “all creators” pools)
- Add creators modal with search

### A3.4 Creator Detail within Campaign

- **My Creators** — creators managed by the agency
- **All Creators** — broader creator pool
- Individual creator performance within the campaign

### A3.5 Campaign Completion & Creator Rating

- Mark campaign as done
- Rate creators on performance (3-step flow)
- Rating feeds into creator score/blacklist system

---

## A4. Creators

**Figma Screens:**

- `Super Admin-main creators`
- `Super Admin- all creators`
- `Super Admin-creators recommended one`
- `Super Admin- Creators find` (AI discovery)
- `Super Admin- creator detail(my creator)`
- `Super Admin- creator detail(contacted)`
- `Super Admin-main creators- barter filter`
- `Super Admin- share link- creator list`
- `yunto creators` / `yunto creator` (mobile)

### Features

### A4.1 Creator Database

- **My Creators** — creators the agency has worked with / manages
- **All Creators** — full marketplace/database
- Each creator card shows: name, handle, platform, followers, engagement, past campaigns

### A4.2 Creator Detail View

- Full profile: bio, platforms, follower counts, engagement rate
- Campaign history with the agency
- Content calendar
- Payment history
- Rating/score

### A4.3 AI Creator Discovery

- Search for new creators by niche, platform, follower range, engagement
- AI-recommended creators based on campaign requirements

### A4.4 Creator Filters

- Filter by deal type: Paid vs Barter
- Filter by platform, niche, follower count, engagement rate
- Barter-specific filter view

### A4.5 Recommended Creators

- AI-suggested creators that match current campaign needs

### A4.6 Shareable Creator Lists

- Generate a link with selected creator profiles
- Share with brands for approval/selection

---

## A5. Blacklist

**Figma Screens:**

- `Super Admin-blacklist` (multiple variants)
- `yunto blacklist` (mobile)

### Features

### A5.1 Blacklisted Creators List

- List of creators who have been blacklisted with reason and date

### A5.2 Add/Remove from Blacklist

- Blacklist a creator from their profile or campaign rating flow
- Remove from blacklist with notes

### A5.3 Blacklist Visibility

- Blacklisted creators flagged across all views (leads, campaigns, search)
- Prevents accidentally assigning blacklisted creators

---

## A6. Calendar & Content Management

**Figma Screens:**

- `Super Admin- Manage Calendar (my creator)`
- `Super Admin- Manage Calendar (all creator)`
- `Super Admin- Manage Calendar (my creator)- brand`
- `Super Admin- Manage Calendar (shift date content)`

### Features

### A6.1 Creator Content Calendar

- Visual calendar showing scheduled content per creator
- View by: My Creators or All Creators

### A6.2 Brand-wise Calendar

- Filter calendar by brand/campaign
- See all content scheduled for a specific brand across creators

### A6.3 Shift/Reschedule Content

- Drag or edit to shift content dates
- Reschedule deliverables with reason tracking

### A6.4 Content Status Tracking

- Track content through: Scheduled → In Production → Submitted → Approved → Published

---

## A7. Team & People Management

**Figma Screens:**

- `Super Admin-people`
- `Super Admin-people(employee detail)`
- `Super Admin-people - employee clicked- attendance`
- `Super Admin- leaves` / `Super Admin - people (Leaves)`
- `Super Admin - people (Leaves request)`
- `Super Admin - people (apply forvLeaves)`
- `Super Admin- leaves (add holidays)`
- `Super Admin-people(add permission)`
- `Super Admin-people- assign creators`

### Features

### A7.1 People Directory

- All team members listed with role, status (active/absent), department (Sales/Operations)

### A7.2 Employee Detail

- Profile, contact info, role
- Performance metrics
- Assigned creators/leads

### A7.3 Attendance Tracking

- Daily attendance: present/absent/late
- Attendance history per employee

### A7.4 Leave Management

- **Leave Requests** — employees submit leave requests
- **Leave Approval** — admin approves/rejects
- **Apply for Leave** — leave application form
- **Add Holidays** — configure company holidays
- Leave balance tracking

### A7.5 Permissions & Roles

- Add/edit permissions per employee
- Role-based access control (Super Admin, Sales, Operations)

### A7.6 Assign Creators to Employees

- Map specific creators to team members
- Load balancing across the team

### A7.7 Target Setting (Sales & Operations)

- Set monthly/quarterly revenue targets per employee
- Track progress against targets

---

## A8. Messaging & Chat

**Figma Screens:**

- `message - super admin` (3 variants)
- `Super Admin-Team/ Influencer Chat Room`
- `Campaign Level_Chat Room Brand chat room`
- `Influencer Chat Room`
- `message - brand`
- `Super Admin-Team/create a channel`
- `Super Admin-channel created`

### Features

### A8.1 Internal Team Chat

- Super Admin can message team members
- Multiple chat views/states

### A8.2 Influencer Chat Room

- Direct messaging between agency and creators/influencers

### A8.3 Campaign-Level Chat

- Brand chat room tied to a specific campaign
- All stakeholders (agency team, brand contacts) in one thread

### A8.4 Channels

- Create custom channels (like Slack channels)
- Topic-based or campaign-based grouping

---

## A9. Polls

**Figma Screens:**

- `Super Admin-poll in chat`
- `Super Admin-poll type`
- `create poll` / `create general poll` / `create campaign poll`
- `Super Admin-interested poll creator`
- `Super Admin-poll result` / `Super Admin-poll info`
- `Super Admin-connect lead(poll)`

### Features

### A9.1 Poll Types

- **General Poll** — agency-wide polls for team decisions
- **Campaign Poll** — poll creators for interest/availability on a campaign

### A9.2 Create Poll

- Poll creation form with question, options, target audience
- Select poll type (general vs campaign)

### A9.3 Campaign Interest Poll

- Send poll to creators asking if they’re interested in a campaign
- View interested creators
- Connect interested creators to leads

### A9.4 Poll Results & Info

- View poll responses, who voted and their selections

---

## A10. Invoices

**Figma Screens:**

- `Super Admin-invoices` (multiple variants)

### Features

### A10.1 Invoice List

- All invoices with: invoice number, brand, amount, status, date

### A10.2 Invoice Generation

- Auto-generate invoices from campaign/deal data
- Support for Paid and Barter deal invoicing

### A10.3 Invoice Status Tracking

- Track: Draft → Sent → Viewed → Paid/Overdue

---

## A11. Payments

**Figma Screens:**

- `Super Admin- paid payment summary`
- `Super Admin- barter payment summary`
- `Super Admin-payments (recieved)`

### Features

### A11.1 Paid Campaign Summary

- Payment details for paid deals: amount, date, method, brand

### A11.2 Barter Campaign Summary

- Barter deal details: products/services exchanged, estimated value

### A11.3 Payments Received

- Ledger of all received payments, filterable by date, brand, campaign

---

## A12. Revenue

**Figma Screens:**

- `yunto revenue` (mobile)
- Revenue section within Dashboard

### Features

### A12.1 Revenue Dashboard

- **This Month** — current month revenue, split by Sales vs Operations
- **Last Month** — comparison with % change
- **Total Earnings** — all-time with department split

### A12.2 Revenue Trends

- Growth indicators (+4.91% type metrics)
- Visual charts (bar/line graphs)

---

## A13. Contacts & Contracts

**Figma Screens:**

- `Super Admin - contacts` (multiple variants)
- `Super Admin-contracts` (5+ variants)
- `yunto contacts` (mobile)

### Features

### A13.1 Contacts Directory

- Brand contacts database with search and filter
- Contact info: name, email, phone, company, designation

### A13.2 Contract Management

- Create and manage contracts with brands
- Multiple contract states (draft, sent, signed, expired)
- Terms, payment schedule, deliverables, duration

---

## A14. Reminders

**Figma Screens:**

- `Super Admin-REMINDERS` (multiple variants)

### Features

### A14.1 Reminder System

- Set reminders for follow-ups, deadlines, content submissions
- Reminder list view with due times
- Types: Lead follow-up, campaign deadline, payment due, content delivery

---

## A15. Search

**Figma Screens:**

- `Super Admin-search` (multiple variants)

### Features

### A15.1 Global Search

- Search across all modules: leads, campaigns, creators, contacts, invoices
- Real-time search results, filtered/categorized

---

## A16. Add-ons (Videographers & Editors)

**Figma Screens:**

- `Super Admin- add - ons - videographers`
- `Super Admin- add - ons - editors`
- `Super Admin- add - ons (my creators)`

### Features

### A16.1 Videographer Directory

- Database of videographers: profile, portfolio, availability, rates

### A16.2 Editor Directory

- Database of content editors: profile, skills, availability, rates

### A16.3 Assign Add-ons to Creators

- Attach a videographer or editor to a creator for a specific campaign

---

## A17. Settings

**Figma Screens:**

- `Super Admin-SETTINGS`
- `Super Admin-SETTINGS- (lead distribution)`
- `Super Admin-SETTINGS- integration`
- `Super Admin-SETTINGS- collab`
- `Super Admin-Settings - add members`
- `Super Admin-add members - expanded`
- `Super Admin-Settings (lead assign)`
- `Super Admin-settings - lead assign popup`
- `Super Admin-settings(add information)`
- `Super Admin-settings(create team)`

### Features

### A17.1 Lead Distribution

- Configure how new leads are auto-assigned to sales team members
- Rules: round-robin, manual, load-based
- Lead assignment popup for manual override

### A17.2 Integrations

- Connect external tools/platforms (Instagram API, YouTube API, WhatsApp Business, payment gateways)

### A17.3 Collaboration Settings

- Configure how teams collaborate, permissions for cross-team visibility

### A17.4 Team Management

- **Add Members** — invite new team members with role selection
- **Create Team** — set up new departments/teams

### A17.5 Agency Information

- Add/edit agency details (name, logo, contact info, agency code)

---

## A18. Profile & Auth

**Figma Screens:**

- `profile`
- `Log Out`

### Features

### A18.1 User Profile

- Name, role (Super Admin), avatar
- Agency Code (e.g., “55678”) with copy-to-clipboard
- Navigation to: People, Settings, Logout

### A18.2 Authentication

- Login/Logout flow
- Role-based access (Super Admin, Sales, Operations)

---

## A19. Mobile App (Admin)

**Figma Screens:**

- `yunto dashboard`, `yunto leads`, `yunto campaigns`, `yunto creators`, `yunto blacklist`, `yunto revenue`, `yunto contacts` (all mobile variants)

### Features

### A19.1 Mobile Dashboard

- Simplified agency overview optimized for phone screens

### A19.2 Mobile Modules

All core modules in simplified mobile view: Leads, Campaigns, Creators, Blacklist, Revenue, Contacts

### A19.3 Mobile Navigation

- Bottom tab bar for module switching
- Responsive layouts for 390px width

---

---

# Part B — Agency UI (Employees)

> Page: `node-id=0-4` | ~198 screens The mobile/tablet app for agency employees — Sales reps, Operations staff, and Managers

<aside> ⭐

**Highlights (Agency Employees)**

- Role-based homes: Sales vs Ops vs Manager views
- Day-to-day execution: create/update leads, manage assigned campaigns
- Team ops: view teams/people, request leaves, assign creators </aside>

---

## B1. Onboarding (Agency)

**Figma Screens:**

- `Welcome/Onboarding- Influencer` (reused label, but on Agency page)
- Screens `1`, `8`, `9`, `10`, `11`, `12` (numbered onboarding steps)
- `Agency/ Manager App`

### Features

### B1.1 Welcome Flow

- Multi-step onboarding carousel
- “Manage Creators Seamlessly” — intro screen explaining the value
- “Track, view performance, and assign collaborators — no spreadsheets needed”

### B1.2 Role Selection

- Agency/Manager app entry point
- Different onboarding based on role (Sales vs Operations vs Manager)

---

## B2. Employee Home Screens

**Figma Screens:**

- `Sales- Home` (multiple variants)
- `Operation- Home` (multiple variants)
- `Sales + Operation- Home`
- `Homescreen` (multiple variants)
- `Sales- employee` / `Sales- manager`
- `Operation- employee` / `Operation- manager`

### Features

### B2.1 Sales Home

- Active leads assigned to the sales rep
- Lead pipeline summary (new, contacted, converted)
- Quick actions: add lead, follow up, view campaign

### B2.2 Operations Home

- Active campaigns assigned to the ops team member
- Campaign status overview
- Creator deliverable tracking

### B2.3 Manager Home

- Combined view of Sales + Operations
- Team performance overview
- Escalation alerts

### B2.4 Role-Based Views

- **Sales Employee** — sees only their own leads and targets
- **Sales Manager** — sees all sales team leads + team performance
- **Operations Employee** — sees their assigned campaigns
- **Operations Manager** — sees all campaigns + team performance

---

## B3. Leads (Employee View)

**Figma Screens:**

- `Lead` (multiple variants)
- `Lead expanded` / `Lead-expanded`
- `Leads`
- `add lead- Paid Campaign`
- `add lead- Barter Campaign`
- `create leads`
- `lead sucessful`

### Features

### B3.1 My Leads List

- Leads assigned to the logged-in employee
- Lead cards with brand, type, budget, status

### B3.2 Lead Expanded View

- Full details of a single lead
- Contact info, deal type, notes, history

### B3.3 Create Lead (Paid & Barter)

- Employee can create new leads
- Separate forms for Paid and Barter campaigns
- Success confirmation screen after lead creation

### B3.4 Lead Status Updates

- `Status Change` screen — update lead stage (New → Contacted → Connected → Converted)

---

## B4. Campaigns (Employee View)

**Figma Screens:**

- `campaign` (multiple variants)

### Features

### B4.1 My Campaigns

- Campaigns assigned to the employee
- Campaign card with brand, budget, timeline, progress

### B4.2 Campaign Detail

- View full campaign details, assigned creators, deliverables
- Update campaign progress

---

## B5. Creators (Employee View)

**Figma Screens:**

- `creators` (multiple variants)
- `creators detail`
- `add creator`
- `filter` / `Sort by` / `sort`

### Features

### B5.1 Creator List

- Browse creators assigned to the employee or available in the agency pool

### B5.2 Creator Detail

- View creator profile, stats, campaign history

### B5.3 Add Creator

- Add a new creator to the agency’s database

### B5.4 Filter & Sort

- Filter creators by niche, platform, engagement
- Sort by followers, rating, recent activity

---

## B6. Payments (Employee View)

**Figma Screens:**

- `Payment`

### Features

### B6.1 Payment Overview

- View payments related to the employee’s campaigns/leads
- Payment status for their deals

---

## B7. Team Management (Employee View)

**Figma Screens:**

- `team management`
- `teams`
- `team creation` (multiple variants)
- `sales team` / `sales team - ON`
- `detail view - operations` / `Detail view - sales`
- `Operaions team - ON` / `Sales + operations`
- `detail Sales + operations`
- `people`
- `teams - people` (multiple variants)
- `leaves`
- `assign creators`
- `ADD MEMBER`
- `team delete`

### Features

### B7.1 View Teams

- See Sales and Operations teams
- Toggle team on/off status
- Detail view per team

### B7.2 People Directory

- Browse team members
- Assign creators to team members

### B7.3 Team Creation

- Create new sub-teams
- Add members to teams
- Delete teams

### B7.4 Leave Management (Employee)

- View and request leaves

---

## B8. Profile & Settings (Employee)

**Figma Screens:**

- `profile` / `profile info`
- `edit profile`
- `brand info`
- `Lead Distribution`
- `Integrations`

### Features

### B8.1 Employee Profile

- View and edit personal profile
- Profile info and brand info sections

### B8.2 Settings (Limited)

- View lead distribution rules (how leads are assigned)
- View integrations (read-only for employees)

---

## B9. Videographers & Editors (Employee)

**Figma Screens:**

- `Videographer` (multiple variants)
- `Editor`

### Features

### B9.1 Browse Videographers & Editors

- View available videographers and editors
- See profiles, availability, and rates
- Assign to campaigns/creators

---

## B10. Target Setting (Employee)

**Figma Screens:**

- `Admin- set target` (2 variants)
- `set target`

### Features

### B10.1 View Targets

- See assigned revenue/performance targets
- Track personal progress against targets

### B10.2 Set Targets (Manager Only)

- Managers can set targets for their team members

---

## B11. Reminders (Employee)

**Figma Screens:**

- `reminder` (multiple variants)
- `Reminders`

### Features

### B11.1 Personal Reminders

- View upcoming reminders for follow-ups and deadlines
- Set new reminders for leads and campaigns

---

---

# Part C — Influencer UI (Creators)

> Page: `node-id=0-1` | ~147 screens The mobile app for influencers/creators who work with agencies

<aside> ⭐

**Highlights (Influencers)**

- Content planner + calendar (auto-suggest or self-select dates)
- Deal handling: incoming leads, follow-ups, mark closed
- AI content ideas + profile/portfolio management </aside>

---

## C1. Onboarding (Influencer)

**Figma Screens:**

- `Welcome/Onboarding- Influencer`
- Screens `1`, `2` (numbered onboarding steps)
- `Onboarding- Planner`

### Features

### C1.1 Welcome Flow

- Multi-step onboarding: “Your Gateway to Influencer Success!”
- Get Started button

### C1.2 Planner Onboarding

- Introduction to the content planner feature
- Setup preferences for content scheduling

---

## C2. Influencer Home Screen

**Figma Screens:**

- `Homescreen- Influencer`
- `homescreen` (multiple variants)

### Features

### C2.1 Creator Dashboard

- Overview of active campaigns/collaborations
- Upcoming content deadlines
- Notification count
- Quick access to content planner, leads, profile

---

## C3. Leads (Influencer View)

**Figma Screens:**

- `Inlfuencer Leads Management`
- `leads` (multiple variants)
- `leads - details` (multiple variants)
- `leads - details - self`
- `leads - mark closed`
- `leads - Followup`
- `leads - youtube`
- `leads - details- expanded`

### Features

### C3.1 Incoming Brand Deals

- View brand collaboration requests/leads sent by agencies
- Lead cards with brand name, deal type, budget

### C3.2 Lead Detail

- Full details of a brand deal opportunity
- Platform-specific views (YouTube-specific lead details)
- Self-managed vs agency-managed lead views

### C3.3 Lead Actions

- **Mark Closed** — close a deal
- **Follow Up** — schedule a follow-up with the brand/agency
- **Expanded View** — see full deal terms and requirements

---

## C4. Content Planner & Calendar

**Figma Screens:**

- `Influencer Content Planner`
- `Influencer Add Content`
- `Calendar` (multiple variants)
- `Calendar1`
- `Content - notes`
- `content delivery date`
- `random collab day`
- `Automatic Selection`
- `self selected`(multiple variants)

### Features

### C4.1 Content Planner

- Visual calendar of all scheduled content
- Add new content entries with notes

### C4.2 Content Scheduling

- Set content delivery dates for campaigns
- **Automatic Selection** — system suggests optimal posting dates
- **Self Selected** — creator manually picks dates
- Random collab day feature

### C4.3 Calendar Views

- Monthly calendar view
- Content notes per date
- Multiple calendar states (empty, populated, conflict)

### C4.4 Collaboration Days

- Mark available days for brand collaborations
- Save preferred collab days (`Self- Save Collab Days`)

---

## C5. AI Content Generation

**Figma Screens:**

- `AI content` (multiple variants)
- `Generate Content` (2 variants)
- `generate content` (5 variants)

### Features

### C5.1 AI-Powered Content Ideas

- Generate content ideas based on campaign brief
- AI suggests captions, hooks, content angles

### C5.2 Content Generation Flow

- Multi-step flow to generate content
- Input: campaign details, platform, content type
- Output: AI-generated content suggestions

---

## C6. Influencer Profile

**Figma Screens:**

- `Influencer Profile`
- `profile` (10+ variants)
- `profile - landing page`
- `profile- Self Managed`
- `edit profile`

### Features

### C6.1 Creator Profile

- Name, bio, platforms, follower stats
- Profile photo and cover
- Portfolio/content showcase

### C6.2 Profile Types

- **Self Managed** — creator manages their own deals
- **Agency Managed** (`socyio managed`) — agency handles everything

### C6.3 Profile Landing Page

- Public-facing profile page (shareable with brands)

### C6.4 Edit Profile

- Update bio, photos, platform links, rates

### C6.5 Levels & Gamification

- `Levels` screen — creator level/tier system
- Likely: Bronze, Silver, Gold tiers based on performance

---

## C7. Notifications

**Figma Screens:**

- `Notification`

### Features

### C7.1 Notification Center

- All notifications: new leads, campaign updates, payment alerts, reminders
- Read/unread states

---

## C8. Reminders (Influencer)

**Figma Screens:**

- `Influencer Reminder`
- `Reminders`
- `add reminder`

### Features

### C8.1 View Reminders

- List of upcoming reminders (content deadlines, follow-ups)

### C8.2 Add Reminder

- Create custom reminders with date, time, and note

---

## C9. Videographer & Editor Details

**Figma Screens:**

- `Details Videographer` (multiple variants)
- `Details editors`
- `Videographer` (multiple variants)

### Features

### C9.1 Browse Videographers

- View available videographers assigned by agency
- Profile, portfolio, contact info

### C9.2 Browse Editors

- View available editors assigned by agency
- Skills, portfolio, contact info

### C9.3 Book/Request

- Request a videographer or editor for a campaign shoot

---

## C10. Agency Connection

**Figma Screens:**

- `Agency - Connected`
- `Notes`
- `socyio managed` / `self managed`

### Features

### C10.1 Agency Connection Status

- See which agency the influencer is connected to
- Connection details and terms

### C10.2 Management Mode

- **Socyio/Yunto Managed** — agency handles lead negotiation, scheduling, payments
- **Self Managed** — creator handles their own deals, agency provides tools only

### C10.3 Notes

- Shared notes between agency and creator

---

## C11. Influencer Web Views

**Figma Screens:**

- `planner web` (multiple variants)
- `scan web` (2 variants)
- `Influencer pages`

### Features

### C11.1 Web Planner

- Desktop/web version of the content planner
- Full-screen calendar with richer detail than mobile

### C11.2 QR Scan / Web Connection

- Scan feature to connect web and mobile sessions
- Link mobile app to web dashboard

### C11.3 Influencer Pages

- Dedicated web pages for influencer profiles (public-facing)

---

## C12. Onboarding Flows (Mobile)

**Figma Screens:**

- `flow 1` (2 variants)
- `flow 2` (2 variants)
- `mobile based` (3 variants)

### Features

### C12.1 Mobile Onboarding

- Step-by-step mobile onboarding flows
- Multiple flow variants for different onboarding paths

### C12.2 Mobile-First Setup

- Optimized for mobile-first creators
- Quick profile setup, platform linking, calendar setup

---

---

# Summary: All Three Portals

## Screen Count by Portal


| Portal          | Page  | Screens  | Target User                     |
| --------------- | ----- | -------- | ------------------------------- |
| Admin Dashboard | `0-3` | ~447     | Agency Owner / Super Admin      |
| Agency UI       | `0-4` | ~198     | Sales Reps, Ops Staff, Managers |
| Influencer UI   | `0-1` | ~147     | Creators / Influencers          |
| **Total**       |       | **~792** |                                 |


## Feature Matrix: Who Has Access to What


| Feature         | Super Admin    | Sales Employee   | Ops Employee     | Manager        | Influencer     |
| --------------- | -------------- | ---------------- | ---------------- | -------------- | -------------- |
| Dashboard       | Full           | Own metrics      | Own metrics      | Team metrics   | Personal       |
| Leads           | All leads      | Assigned leads   | View only        | Team leads     | Incoming deals |
| Campaigns       | All campaigns  | Related to leads | Assigned         | Team campaigns | Assigned       |
| Creators        | Full CRUD      | View + filter    | View + filter    | View + assign  | Own profile    |
| Blacklist       | Full control   | View only        | View only        | View only      | N/A            |
| Calendar        | All creators   | Own creators     | Own campaigns    | Team view      | Own calendar   |
| Team/People     | Full HR        | View team        | View team        | Manage team    | N/A            |
| Chat            | All rooms      | Team + leads     | Team + campaigns | All            | Agency chat    |
| Polls           | Create + view  | Vote             | Vote             | Create + view  | Vote           |
| Invoices        | Full control   | View own         | View own         | View team      | N/A            |
| Payments        | Full ledger    | Own deals        | Own campaigns    | Team deals     | View own       |
| Revenue         | Full analytics | Own targets      | Own targets      | Team analytics | N/A            |
| Contacts        | Full CRUD      | View + add       | View             | View + add     | N/A            |
| Contracts       | Full CRUD      | View             | View             | View           | N/A            |
| Reminders       | All            | Own              | Own              | Own + team     | Own            |
| Search          | Global         | Scoped           | Scoped           | Scoped         | Own data       |
| Add-ons         | Full control   | View + request   | View + request   | Assign         | View + request |
| Settings        | Full control   | Limited          | Limited          | Limited        | Profile only   |
| AI Content      | N/A            | N/A              | N/A              | N/A            | Full access    |
| Content Planner | View all       | View assigned    | View assigned    | View team      | Full control   |


## Priority for MVP


| Priority      | Modules                                                                                   | Portal                  |
| ------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| **P0 - MVP**  | Auth, Dashboard, Leads, Campaigns, Creators                                               | Admin + Agency Employee |
| **P1 - V1.1** | Blacklist, Calendar, Team/People, Payments, Invoices, Revenue, Contacts, Settings, Search | Admin                   |
| **P2 - V1.2** | Messaging, Polls, Reminders, Add-ons, Contracts                                           | Admin + Agency          |
| **P3 - V2.0** | Full Influencer App, AI Content, Content Planner, Mobile Apps                             | Influencer              |


