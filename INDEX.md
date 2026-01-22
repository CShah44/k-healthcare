# Svastheya Healthcare App - Codebase Index

## Overview
Svastheya is a React Native healthcare application built with Expo Router, Firebase, and TypeScript. It provides separate interfaces for patients and healthcare providers (doctors and lab assistants) to manage medical records, family health data, prescriptions, and more.

## Technology Stack
- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Routing**: Expo Router 6.0.21 (file-based routing)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Language**: TypeScript 5.9.2
- **State Management**: React Context API
- **UI Libraries**: 
  - Lucide React Native (icons)
  - React Native Reanimated (animations)
  - Expo Image Picker, Camera, Document Picker
  - jsPDF (PDF generation)

## Project Structure

```
k-healthcare/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with auth routing
│   ├── index.tsx                # Entry point with splash screen
│   ├── (patient-tabs)/          # Patient user interface
│   │   ├── _layout.tsx          # Patient tab navigation
│   │   ├── index.tsx            # Patient home/dashboard
│   │   ├── records.tsx          # Medical records list
│   │   ├── member-records.tsx   # Family member records
│   │   ├── upload-record.tsx    # Upload new medical record
│   │   ├── family-tree.tsx      # Family management
│   │   ├── profile.tsx           # Patient profile
│   │   ├── edit-profile.tsx     # Edit profile screen
│   │   ├── access-requests.tsx # Family access requests
│   │   └── services/            # Patient-specific services
│   │       ├── accountDeletion.ts
│   │       ├── familyHelpers.ts
│   │       ├── memberRecordHelpers.ts
│   │       ├── profileHelpers.ts
│   │       ├── recordHelpers.ts
│   │       ├── recordsService.ts
│   │       └── uploadHelpers.ts
│   ├── (healthcare-tabs)/        # Healthcare provider interface
│   │   ├── _layout.tsx          # Healthcare tab navigation
│   │   ├── index.tsx            # Provider dashboard
│   │   ├── patients.tsx         # Patient list/search
│   │   ├── records.tsx          # Patient records view
│   │   ├── create-prescription.tsx
│   │   ├── profile.tsx          # Provider profile
│   │   └── edit-profile.tsx     # Edit provider profile
│   ├── auth/                    # Authentication flows
│   │   ├── _layout.tsx          # Auth layout
│   │   ├── role-selection.tsx   # Initial role selection
│   │   ├── patient-login.tsx
│   │   ├── patient-signup.tsx
│   │   ├── healthcare-login.tsx
│   │   └── healthcare-signup.tsx
│   ├── constants/
│   │   └── medical-councils.ts  # Medical council data
│   ├── about.tsx
│   ├── help.tsx
│   ├── privacy.tsx
│   └── +not-found.tsx
├── components/                   # Reusable UI components
│   ├── CustomAlert.tsx
│   └── ui/
│       ├── AnimatedCard.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── LoadingSpinner.tsx
│       ├── Logo.tsx
│       ├── SplashScreen.tsx
│       └── ThemeToggle.tsx
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx          # Authentication & user state
│   └── ThemeContext.tsx         # Theme management
├── constants/                    # App constants
│   ├── Colors.ts                # Color palette
│   ├── firebase.ts              # Firebase initialization
│   └── Styles.ts                # Global styles
├── services/                     # Business logic services
│   ├── familyService.ts         # Family management operations
│   └── recordsService.ts        # Medical records operations
├── types/                        # TypeScript type definitions
│   ├── auth.ts                  # Authentication types
│   ├── family.ts                # Family-related types
│   └── medical.ts               # Medical record types
├── utils/                        # Utility functions
│   ├── patientIdGenerator.ts    # Generate unique patient IDs
│   ├── pdfGenerator.ts          # PDF generation (native)
│   └── pdfGenerator.web.ts      # PDF generation (web)
├── styles/                       # Style definitions
│   ├── index.ts
│   ├── layout.ts
│   ├── profile.ts
│   ├── records.ts
│   ├── member-records.ts
│   ├── upload-record.ts
│   ├── family-tree.ts
│   └── edit-profile.ts
├── hooks/                        # Custom React hooks
│   └── useFrameworkReady.ts
├── assets/                       # Static assets
│   ├── Fonts/                   # Custom fonts
│   └── images/                  # Images and logos
├── mail-server/                  # Email server (Node.js/Express)
│   └── server.js
└── app.config.js                 # Expo configuration

```

## Key Features

### Authentication & User Management
- **Multi-role authentication**: Patients, Doctors, Lab Assistants
- **Child account system**: Parents can create and manage child accounts
- **Account switching**: Users can switch between parent and child accounts
- **Flexible login**: Login by email, phone number, or name
- **Password reset**: Email-based password recovery

### Patient Features
- **Medical Records Management**: Upload, view, and organize medical records
- **Family Health Tree**: Create family groups and manage family health data
- **Family Member Records**: View and manage records for family members
- **Access Requests**: Manage family member access requests
- **Profile Management**: Edit personal information and preferences
- **Record Upload**: Upload documents, images, and medical files

### Healthcare Provider Features
- **Patient Search**: Find patients by various identifiers
- **Patient Records**: View and manage patient medical records
- **Prescription Creation**: Create and manage prescriptions
- **Dashboard**: Overview of patients and activities
- **Profile Management**: Manage professional information

### Family Management
- **Family Creation**: Create family groups
- **Member Invitations**: Invite family members via email/phone/name
- **Access Control**: Role-based access to family member records
- **Child Accounts**: Create authenticated child accounts linked to parents
- **Family Tree Visualization**: View family relationships

## Architecture

### Authentication Flow
1. **Root Layout** (`app/_layout.tsx`): 
   - Wraps app with AuthProvider and ThemeProvider
   - Handles route protection based on authentication state
   - Redirects based on user role (patient vs healthcare)

2. **AuthContext** (`contexts/AuthContext.tsx`):
   - Manages Firebase authentication state
   - Handles signup, login, logout
   - Manages user data from Firestore
   - Supports child account creation and switching
   - Provides `useAuth()` hook for components

3. **User Data Structure**:
   - Stored in Firestore `users` collection
   - Role-specific collections: `patients`, `doctors`, `lab_assistants`
   - Supports family linking via `familyId`
   - Child accounts linked via `parentAccountId` and `linkedAccounts`

### Data Models

#### User Data (`types/auth.ts`)
```typescript
interface UserData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  role: 'patient' | 'doctor' | 'lab_assistant';
  customUserId?: string;        // 8-character nanoid
  patientId?: string;            // Human-readable ID (e.g., SVP-A1B2C3)
  licenseNumber?: string;        // For healthcare providers
  department?: string;
  hospital?: string;
  familyId?: string;            // Family group ID
  linkedAccounts?: string[];    // Child account IDs
  parentAccountId?: string;     // Parent account ID (for children)
  isChildAccount?: boolean;
  specialty?: string;
  avatarUrl?: string;
  letterheadUrl?: string;
}
```

#### Medical Record (`types/medical.ts`)
```typescript
interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  labAssistantId?: string;
  date: string;
  type: 'consultation' | 'lab_result' | 'prescription' | 'imaging' | 'surgery';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  labResults?: LabResult[];
  attachments?: Attachment[];
  status: 'active' | 'completed' | 'pending';
}
```

#### Family (`types/family.ts`)
```typescript
interface Family {
  id: string;
  name: string;
  createdBy: string;
  members: FamilyMember[];
}

interface FamilyMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  relation: FamilyRelation;
  status: 'pending' | 'accepted' | 'declined';
}
```

### Firebase Collections

#### Core Collections
- `users`: All user accounts
- `patients`: Patient-specific data
- `doctors`: Doctor-specific data
- `lab_assistants`: Lab assistant-specific data
- `families`: Family groups
- `family_invitations`: Pending family invitations
- `medical_records`: Medical records (subcollection under `patients/{userId}/records`)

### Services

#### FamilyService (`services/familyService.ts`)
- `createFamily()`: Create a new family group
- `inviteFamilyMember()`: Send family invitation
- `acceptFamilyInvitation()`: Accept invitation
- `getFamilyById()`: Retrieve family data
- `kickFamilyMember()`: Remove member (owner only)
- `leaveFamily()`: Leave family group
- `addChildToFamily()`: Add child account to family
- `getFamilyMemberRecords()`: Get family member's records
- `canEditMemberRecord()`: Check edit permissions

#### RecordsService (`services/recordsService.ts`)
- `getRecentRecords()`: Get limited recent records
- `getAllRecords()`: Get all user records
- `getRecordsByType()`: Filter by record type
- `getRecordById()`: Get single record
- `subscribeToRecentRecords()`: Real-time updates
- `subscribeToAllRecords()`: Real-time all records
- `getRecordsCount()`: Get total count
- `hasRecords()`: Check if user has records

### Routing Structure

#### Patient Routes
- `/` → Role selection → Patient login/signup
- `/(patient-tabs)/` → Main patient interface
  - `index` → Home/Dashboard
  - `records` → Medical records list
  - `family-tree` → Family management
  - `profile` → Profile view
  - `upload-record` → Upload new record (hidden tab)
  - `member-records` → Family member records (hidden tab)
  - `edit-profile` → Edit profile (hidden tab)
  - `access-requests` → Access requests (hidden tab)

#### Healthcare Routes
- `/` → Role selection → Healthcare login/signup
- `/(healthcare-tabs)/` → Main provider interface
  - `index` → Dashboard
  - `patients` → Patient list/search
  - `profile` → Profile view
  - `create-prescription` → Create prescription (hidden tab)
  - `records` → Patient records view (hidden tab)
  - `edit-profile` → Edit profile (hidden tab)

#### Auth Routes
- `/auth/role-selection` → Choose role
- `/auth/patient-login` → Patient login
- `/auth/patient-signup` → Patient signup
- `/auth/healthcare-login` → Provider login
- `/auth/healthcare-signup` → Provider signup

### Context Providers

#### AuthContext
**Location**: `contexts/AuthContext.tsx`

**State**:
- `user`: Current Firebase user
- `userData`: User data from Firestore
- `isLoading`: Loading state
- `isSwitchedAccount`: Whether viewing child account
- `originalUserId`: Original authenticated user ID

**Methods**:
- `signup(data)`: Create new account
- `createChildAccount(data, parentId)`: Create child account
- `login(identifier, password, role)`: Login
- `logout()`: Sign out
- `switchToAccount(accountId)`: Switch to child/parent account
- `getAccessibleAccounts()`: Get linked accounts
- `removeParentLink()`: Remove parent link (16+ years)
- `forgotPassword(email)`: Send password reset
- `refreshUserData()`: Refresh user data
- `updateUserProfile(updates)`: Update profile

#### ThemeContext
**Location**: `contexts/ThemeContext.tsx`

Manages app-wide theme (light/dark mode) and color schemes.

### Key Utilities

#### Patient ID Generator (`utils/patientIdGenerator.ts`)
- Generates unique human-readable patient IDs
- Format: `SVP-{ALPHANUMERIC}` (e.g., `SVP-A1B2C3`)
- Ensures uniqueness in Firestore

#### PDF Generator (`utils/pdfGenerator.ts`, `pdfGenerator.web.ts`)
- Platform-specific PDF generation
- Native implementation for mobile
- Web implementation for web platform

### Components

#### UI Components (`components/ui/`)
- **Button**: Custom button component
- **Input**: Form input component
- **LoadingSpinner**: Loading indicator
- **Logo**: App logo component
- **SplashScreen**: App splash screen
- **AnimatedCard**: Animated card component
- **ThemeToggle**: Theme switcher

#### Custom Components
- **CustomAlert**: Custom alert dialog

### Styling

#### Style Files (`styles/`)
- Modular style definitions per screen/feature
- Uses StyleSheet API
- Theme-aware colors via ThemeContext

#### Constants
- **Colors.ts**: Color palette definitions
- **Styles.ts**: Global style constants

### Configuration

#### Expo Config (`app.config.js`)
- App name: "Svastheya"
- Bundle IDs: `com.svastheya.khealthcare`
- Firebase configuration via environment variables
- Supabase configuration (if used)
- Asset bundle patterns

#### Firebase Config (`constants/firebase.ts`)
- Initializes Firebase app
- Sets up Auth, Firestore, Storage
- Platform-specific auth persistence
- Web: Browser session persistence
- Mobile: AsyncStorage persistence

## Security Features

1. **Role-Based Access Control**: Strict routing based on user role
2. **Family Access Control**: Permission checks for family member data
3. **Child Account Restrictions**: Limited access for child accounts
4. **Account Switching Validation**: Verifies access before switching accounts
5. **Age-Based Permissions**: 16+ requirement for removing parent links

## Data Flow

### Record Upload Flow
1. User selects file/image from device
2. File uploaded to Firebase Storage
3. Metadata saved to Firestore `patients/{userId}/records`
4. Real-time subscription updates UI

### Family Invitation Flow
1. User creates/joins family
2. Invites member via identifier (email/phone/name)
3. Invitation stored in `family_invitations` collection
4. Invited user receives notification
5. User accepts/declines invitation
6. Family membership updated atomically

### Child Account Flow
1. Parent creates child account via `createChildAccount()`
2. Child account created with Firebase Auth
3. Child linked to parent via `parentAccountId`
4. Parent's `linkedAccounts` updated
5. Child added to family if applicable
6. Parent can switch to child account to manage

## Development Notes

### Environment Variables
Required Firebase environment variables (via `app.config.js`):
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

### Running the App
```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

### Key Dependencies
- `expo-router`: File-based routing
- `firebase`: Backend services
- `@react-native-async-storage/async-storage`: Local storage
- `expo-image-picker`: Image selection
- `expo-document-picker`: Document selection
- `expo-camera`: Camera access
- `jspdf`: PDF generation
- `date-fns`: Date utilities
- `nanoid`: ID generation

## Future Enhancements

Potential areas for expansion:
- Push notifications
- Telemedicine features
- Lab result integration
- Prescription management
- Appointment scheduling
- Health analytics
- Export/import functionality
- Multi-language support

## File Naming Conventions

- **Components**: PascalCase (e.g., `CustomAlert.tsx`)
- **Services**: camelCase with `Service` suffix (e.g., `familyService.ts`)
- **Types**: camelCase (e.g., `auth.ts`, `medical.ts`)
- **Utils**: camelCase (e.g., `patientIdGenerator.ts`)
- **Styles**: camelCase (e.g., `profile.ts`, `records.ts`)
- **Constants**: PascalCase (e.g., `Colors.ts`)

## Important Notes

1. **Child Account System**: Uses secondary Firebase app instance to avoid signing out parent during child account creation
2. **Account Switching**: Maintains original authenticated user for permission checks
3. **Family Permissions**: Family creator has full access; members have limited access
4. **Record Privacy**: Family members see basic info only; full details require explicit permission
5. **Patient ID Format**: `SVP-{CODE}` where CODE is alphanumeric (e.g., `SVP-A1B2C3`)

---

*Last Updated: Based on current codebase structure*
*For questions or contributions, refer to the main repository documentation*
