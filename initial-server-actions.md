# RecorderLoop Initial Server Actions

This is the first server action set to implement after scaffolding.

## 1. Authentication / Session Entry

### `requestMagicLink(formData: FormData)`
**Purpose:** start sign-in via email magic link.

**Inputs**
- `email`

**Validation**
- required
- valid email shape

**Behavior**
- call Auth.js provider sign-in
- redirect user into onboarding-aware flow

---

## 2. Onboarding

### `completeOnboarding(formData: FormData)`
**Purpose:** set user role and create/update profile.

**Inputs**
- `role`
- `displayName`
- `timezone`

**Validation**
- role required
- display name optional
- timezone optional

**Behavior**
- require authenticated session
- update `User.role`
- upsert `Profile`
- redirect to role dashboard

---

## 3. Student Practice Items

### `createPracticeItem(formData: FormData)`
**Purpose:** create a student-owned practice item.

**Inputs**
- `title`
- `category`
- `notes`

**Rules**
- user must be student
- `studentId` comes from session, never form input

### `updatePracticeItem(formData: FormData)`
**Purpose:** edit existing practice item.

**Inputs**
- `practiceItemId`
- `title`
- `category`
- `notes`
- `isActive`

**Rules**
- user must own the item unless later teacher-edit behavior is added

---

## 4. Student Practice Sessions

### `createPracticeSession(formData: FormData)`
**Purpose:** log a practice session with one or more practiced items.

**Inputs**
- `sessionDate`
- `durationMinutes`
- `notes`
- repeated item rows with:
  - `practiceItemId`
  - `tempoReached`
  - `improvementNotes`
  - `weakSpots`

**Rules**
- user must be student
- at least one practiced item required
- item ids must belong to student

---

## 5. Teacher/Student Linking

### `requestTeacherStudentLink(formData: FormData)`
**Purpose:** begin a link relationship using code/link/email flow.

### `acceptTeacherStudentLink(formData: FormData)`
**Purpose:** activate a pending relationship.

For MVP, exact mechanism is still flexible, but the actions should map onto `TeacherStudentLink` cleanly.

---

## 6. Teacher Assignments

### `createAssignment(formData: FormData)`
**Purpose:** create an assignment for a linked student.

**Inputs**
- `studentId`
- `title`
- `notes`
- `focusAreas`
- `dueDate`
- selected `practiceItemIds[]`

**Rules**
- user must be teacher
- teacher must be actively linked to student
- all item ids must belong to that student

---

## 7. Priority Build Order

Implement in this order:
1. `requestMagicLink`
2. `completeOnboarding`
3. `createPracticeItem`
4. `createPracticeSession`
5. `createAssignment`
6. linking actions

That sequence gets the app into a usable student-first state quickly while leaving teacher workflow expansion straightforward.
