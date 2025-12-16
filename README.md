## Tech Stack

- **React 18** + **TypeScript** - Core framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Shadcn/UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Navigation

---

## Project Structure

```
src/
├── assets/                 # Images and static assets
├── components/
│   ├── layout/            # Layout components
│   ├── onboarding/        # Onboarding flow steps
│   ├── proposals/         # Proposal-related components
│   └── ui/                # Shadcn UI components
├── data/                  # Mock data
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── pages/                 # Page components
└── types/                 # TypeScript types
```

---

## Components

### Layout Components

#### `DashboardLayout.tsx`
Main layout wrapper for authenticated pages.
- Responsive sidebar (desktop) / sheet drawer (mobile)
- Topbar with currency selector and notifications
- Centered content area with max-width constraint

#### `Sidebar.tsx`
Navigation sidebar with:
- Logo and branding
- Navigation links (Insights, Proposals, Create, Funding, Settings)
- Active route indicator with animation
- Collapsible on desktop, full-width in mobile drawer
- Props: `onNavigate?: () => void` - callback for mobile menu close

#### `Topbar.tsx`
Top navigation bar with:
- Mobile hamburger menu trigger
- Breadcrumb navigation
- AI Assistant quick access
- Currency selector (USD, NGN, VET)
- Notifications popover with unread count
- User profile dropdown

---

### Page Components

#### `Insights.tsx` (Route: `/`)
Dashboard home with analytics overview.
- AI chat hero with African pattern background
- Quick action prompts for AI assistant
- Metrics cards (Total Funding, Approved, Pending, Success Rate)
- Funding trend area chart
- Category distribution with animated progress bars

#### `Proposals.tsx` (Route: `/proposals`)
Proposal management page.
- Status filter tabs (All, Draft, Submitted, In Review, etc.)
- Search functionality
- Proposals table with voting badges
- Pagination controls
- Export to CSV/JSON
- Delete confirmation dialog

#### `ProposalDetail.tsx` (Route: `/proposals/:id`)
Detailed proposal view.
- Full proposal information display
- Voting card with vote distribution
- Timeline milestone management
- Media gallery (images/videos)
- Documents section
- Q&A management
- Status-based action buttons

#### `CreateProposal.tsx` (Route: `/create`)
Multi-step proposal creation wizard.
- 6 steps: Basic Info, Media, Documents, Questions, Timeline, Budget
- Progress indicator with step icons
- Rich text editor for descriptions
- File upload for media and documents
- Dynamic form fields for timeline milestones and Q&A
- Draft saving capability

#### `Funding.tsx` (Route: `/funding`)
Financial management page.
- Balance cards (Available, Received, Disbursed)
- Withdrawal request dialog
- Connected wallet display
- Transactions table with pagination
- Type filtering (All, Received, Disbursed)
- Export functionality

#### `Settings.tsx` (Route: `/settings`)
Account and preferences management.
- **Profile Tab**: Organization details, mission/vision, focus areas, contact info, social links
- **KYC Tab**: Identity verification with document uploads
- **Wallets Tab**: Web3 wallet and bank account management
- **Preferences Tab**: Notifications, theme, language settings
- **Team Tab**: Team member management with role assignments
- **Account Tab**: Sign out, deactivate, delete account options

#### `AIChat.tsx` (Route: `/ai-chat`)
AI assistant chat interface.
- Conversational UI with message history
- Typing indicator animation
- Suggested prompts
- Accepts initial query from navigation state

#### `Auth.tsx` (Route: `/auth`)
Authentication page.
- Email/password login form
- Link to onboarding for new users

#### `Onboarding.tsx` (Route: `/onboarding`)
New user registration flow.
- Multi-step wizard
- Account creation
- Organization setup
- Mission and focus areas
- Contact information
- Web3 wallet connection

#### `Notifications.tsx` (Route: `/notifications`)
Full notifications list.
- All notifications with read/unread status
- Mark as read functionality

#### `NotFound.tsx` (Route: `*`)
404 error page.

---

### Proposal Components

#### `VotingCard.tsx`
Displays voting results for proposals.
- Vote distribution (Agree, Disapprove, Abstain)
- Progress bars with percentages
- Passing threshold indicator (51%)
- Voting buttons (disabled for completed proposals)
- `VotingBadge` sub-component for compact display

---

### Onboarding Step Components

#### `AccountStep.tsx`
User account creation form.
- Full name, email, password fields
- Terms agreement checkbox

#### `OrganizationStep.tsx`
Basic organization information.
- Name, registration number, founded year
- Team size, description

#### `MissionStep.tsx`
Mission and focus areas.
- Mission/vision statements
- Focus area tags

#### `ContactStep.tsx`
Contact and social information.
- Email, phone, website
- Location details
- Social media links

#### `WalletStep.tsx`
Web3 wallet connection.
- Wallet address input
- Connect wallet functionality

---

### Dashboard Components

#### `StatsCard.tsx`
Reusable statistics card.
- Icon, label, value display
- Trend indicator (up/down)
- Decorative ring elements

---

### UI Components (Shadcn)

All Shadcn components are in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| `accordion.tsx` | Expandable content sections |
| `alert-dialog.tsx` | Confirmation dialogs |
| `alert.tsx` | Alert messages |
| `avatar.tsx` | User avatars |
| `badge.tsx` | Status badges with variants |
| `button.tsx` | Button with multiple variants |
| `calendar.tsx` | Date picker calendar |
| `card.tsx` | Content cards |
| `checkbox.tsx` | Checkbox input |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `form.tsx` | Form components with validation |
| `input.tsx` | Text input fields |
| `label.tsx` | Form labels |
| `popover.tsx` | Popover tooltips |
| `progress.tsx` | Progress bars |
| `rich-text-editor.tsx` | TipTap rich text editor |
| `scroll-area.tsx` | Custom scrollbars |
| `select.tsx` | Select dropdowns |
| `separator.tsx` | Visual separators |
| `sheet.tsx` | Slide-out panels |
| `skeleton.tsx` | Loading skeletons |
| `switch.tsx` | Toggle switches |
| `table.tsx` | Data tables |
| `tabs.tsx` | Tab navigation |
| `textarea.tsx` | Multi-line text input |
| `toast.tsx` | Toast notifications |
| `tooltip.tsx` | Hover tooltips |

---

### Utility Components

#### `ThemeProvider.tsx`
Theme context provider for dark/light mode.
- Uses `next-themes` for persistence
- System preference detection

#### `NavLink.tsx`
Enhanced NavLink with active state styling.

---

## Custom Hooks

#### `use-mobile.tsx`
Detects mobile viewport.
```tsx
const isMobile = useMobile();
```

#### `use-toast.ts`
Toast notification hook.
```tsx
const { toast } = useToast();
toast({ title: "Success", description: "Action completed" });
```

---

## Data & Types

### `mockData.ts`
Contains mock data for:
- Proposals with full details
- NGO profile information
- Insights and analytics data
- Currency symbols

### `types/proposal.ts`
TypeScript interfaces:
- `Proposal` - Full proposal structure
- `ProposalStatus` - Status enum
- `MilestoneStatus` - Timeline milestone states
- `Currency` - Supported currencies
- `ProposalVotes` - Voting data structure

---

## Styling

### Design Tokens (`index.css`)
- CSS custom properties for colors, gradients, shadows
- Light and dark theme variables
- Glassmorphism utility classes
- Rich text editor styles

### Tailwind Config (`tailwind.config.ts`)
- Extended color palette
- Custom animations (fade, scale, slide)
- Responsive breakpoints

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Insights | Dashboard home |
| `/proposals` | Proposals | Proposal list |
| `/proposals/:id` | ProposalDetail | Proposal details |
| `/create` | CreateProposal | Create new proposal |
| `/funding` | Funding | Financial management |
| `/settings` | Settings | Account settings |
| `/ai-chat` | AIChat | AI assistant |
| `/auth` | Auth | Login page |
| `/onboarding` | Onboarding | Registration |
| `/notifications` | Notifications | All notifications |

---

## Features

- **Responsive Design**: Mobile-first approach with tablet and desktop layouts
- **Dark/Light Theme**: System preference detection with manual toggle
- **Web3 Integration**: Wallet connection and transaction tracking
- **Multi-currency Support**: USD, NGN, VET
- **Rich Text Editing**: TipTap-powered content editing
- **File Uploads**: Media and document management
- **Voting System**: Community governance for proposals
- **KYC Verification**: Identity verification flow
- **Team Management**: Role-based access control
- **Export Functionality**: CSV and JSON data export

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file in the `app` directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.cleanmate.app

# KYC Service Configuration
# URL of the KYC service backend (default: http://localhost:3001)
VITE_KYC_SERVICE_URL=http://localhost:3001

# API key for authenticating with the KYC service
# This should match one of the API keys configured in the KYC service
VITE_KYC_API_KEY=your-api-key-here
```

### KYC Service Integration

The app integrates with a separate KYC service for identity verification. The KYC service:
- Accepts multipart/form-data requests with file uploads
- Requires API key authentication via the `x-api-key` header
- Stores uploaded documents and KYC data in AWS S3
- Returns submission IDs and media URLs upon successful submission

See the `kycservice` directory for the KYC service implementation and configuration.

---

## License

MIT
