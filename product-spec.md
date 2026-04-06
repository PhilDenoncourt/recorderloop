# RecorderLoop

*Structured practice between lessons*

## Product Spec

### 1. Product Overview
**RecorderLoop** is a mobile-first web app for recorder students and teachers. It helps students practice with more structure, consistency, and continuity between lessons, while giving teachers a lightweight way to assign work and review progress.

The product is intentionally narrow: it is built specifically for **recorder players**, not for all musicians in general. That specificity is a strength. It allows the experience, language, and workflows to feel focused rather than generic.

### 2. Product Vision
RecorderLoop exists to make recorder practice easier to sustain and easier to review.

The core vision is simple:

- students should always know what to practice
- practice sessions should be easy to log
- teachers should be able to see progress before the next lesson
- the gap between lessons should feel guided, not disconnected

### 3. Tagline
**Structured practice between lessons**

### 4. Problem Statement
Recorder students often struggle with consistency between lessons. Practice is frequently informal, under-documented, or forgotten entirely. Teachers assign exercises, repertoire, and goals, but there is often no shared system for tracking what happened during the week.

As a result:
- students lose focus or momentum
- assignments are inconsistently followed
- weak spots are not tracked well over time
- teachers start each lesson with incomplete context
- progress feels harder to see and harder to sustain

RecorderLoop addresses this by providing a simple, dedicated place for weekly practice continuity.

### 5. Target Users

#### Primary Users
- recorder students
- especially beginner and intermediate learners
- students taking private lessons or guided study

#### Secondary Users
- recorder teachers
- private instructors who want lightweight assignment and review tools

### 6. Product Positioning
RecorderLoop is **not**:
- a full music school platform
- a studio management system
- a generic habit tracker
- a broad multi-instrument app

RecorderLoop **is**:
- a recorder-specific practice continuity tool
- a bridge between lessons
- a lightweight system for assignments, session logs, and progress review

### 7. Core Value Proposition
For recorder students and teachers, RecorderLoop provides a focused way to organize practice, track improvement, and maintain continuity between lessons without the complexity of a full teaching platform.

### 8. Core Product Principles
RecorderLoop should be:

- **specific** — designed for recorder players
- **lightweight** — faster than a notebook, not more complicated
- **practical** — useful during real practice, not just theoretically helpful
- **supportive** — encouraging progress without feeling rigid or punitive
- **clear** — centered on continuity between lesson assignments and practice sessions

### 9. Primary Jobs To Be Done

#### For Students
- know what to practice this week
- log what was practiced in a fast, simple way
- note tempo, duration, and difficult passages
- see progress over time
- feel more organized and consistent

#### For Teachers
- assign work clearly
- review what students actually practiced
- identify recurring weak spots
- use practice history to inform the next lesson

### 10. MVP Scope

#### Included in MVP
- student accounts
- teacher accounts
- student-teacher connection flow
- practice item creation and management
- teacher assignments
- practice session logging
- notes on tempo, duration, and weak spots
- session history
- basic progress dashboard
- teacher review view of student activity

#### Excluded from MVP
- audio recording
- tone or pitch analysis
- metronome/tuner tools
- sheet music annotation
- video feedback
- billing/scheduling
- full studio admin
- multi-instrument support
- advanced gamification
- community/social features

### 11. User Stories

#### Student Stories
- As a student, I want to see what I should practice this week so I can start quickly.
- As a student, I want to log a practice session in under two minutes so it doesn’t interrupt my routine.
- As a student, I want to record trouble spots so I remember what still needs work.
- As a student, I want to see my progress over time so I stay motivated.

#### Teacher Stories
- As a teacher, I want to assign exercises and pieces so students know what to work on.
- As a teacher, I want to review recent student practice logs before a lesson so I have context.
- As a teacher, I want to spot repeated problems so I can teach more effectively.

### 12. Core Workflows

#### Workflow A: Teacher assigns weekly practice
1. Teacher selects a student
2. Teacher creates or selects practice items
3. Teacher adds assignment notes and optional due date
4. Student sees assigned items on their dashboard

#### Workflow B: Student logs a practice session
1. Student opens RecorderLoop
2. Student sees current assignments and practice items
3. Student selects what they practiced
4. Student logs duration, tempo reached, and notes
5. Student marks trouble spots or improvement areas
6. Session is saved to history

#### Workflow C: Teacher reviews before lesson
1. Teacher opens student profile
2. Teacher views recent sessions and assignment completion
3. Teacher reads notes on weak spots and progress
4. Teacher uses that context to guide the lesson

#### Workflow D: Student reviews progress
1. Student opens progress/history view
2. Student sees recent sessions and completed assignments
3. Student notices patterns in consistency and improvement
4. Student better understands what to focus on next

### 13. Functional Requirements

#### 13.1 Accounts and Authentication
- users can sign up and log in securely
- users are assigned teacher or student roles
- students can join a teacher via invite code or link
- teachers can manage multiple students

#### 13.2 Practice Items
Each practice item should support:
- title
- type
- notes
- optional target tempo
- status

Suggested item types:
- piece
- exercise
- scale
- technique focus
- assignment item

#### 13.3 Assignments
Teachers can:
- assign one or more practice items
- add notes and focus instructions
- set optional due dates or target week
- mark assignments active or completed

Students can:
- view current assignments
- see assignment details
- track completion progress

#### 13.4 Practice Session Logging
Students can log:
- date
- duration
- practiced items
- tempo reached
- general notes
- what improved
- weak spots / difficult passages
- optional completion status for assigned items

Logging should prioritize:
- speed
- clarity
- minimal friction on mobile

#### 13.5 Dashboards and History
Student dashboard should show:
- current assignments
- recent sessions
- quick practice entry
- simple consistency/progress indicators

Teacher dashboard should show:
- student list
- recent student activity
- pending assignments
- quick access to student review pages

#### 13.6 Teacher Review View
Teachers should be able to see:
- recent practice frequency
- assignment completion
- notes from sessions
- recurring weak spots
- tempo/progress notes tied to practice items

### 14. UX Requirements
RecorderLoop should feel:
- calm
- clean
- supportive
- mobile-friendly
- easy enough for repeated daily use

UX goals:
- practice logging in 1–2 minutes
- no cluttered teacher admin experience
- clear distinction between assigned work and self-managed work
- easy review before lessons
- strong readability on phones and tablets

### 15. Design Direction
Brand tone:
- focused
- warm
- musical
- encouraging
- organized

Visual direction:
- modern but not overly “tech startup”
- minimal, readable interface
- subtle musical identity
- not childish, but accessible to younger learners
- should feel useful to both students and teachers

### 16. Data Model Overview

#### User
- id
- name
- email
- password_hash
- role
- created_at

#### StudentTeacherLink
- id
- teacher_id
- student_id
- status
- created_at

#### PracticeItem
- id
- student_id
- teacher_id (optional)
- title
- type
- notes
- target_tempo
- status
- created_at

#### Assignment
- id
- teacher_id
- student_id
- title
- description
- due_date
- status
- created_at

#### AssignmentItem
- id
- assignment_id
- practice_item_id

#### PracticeSession
- id
- student_id
- session_date
- duration_minutes
- general_notes
- created_at

#### PracticeSessionItem
- id
- practice_session_id
- practice_item_id
- tempo_reached
- improvement_notes
- weak_spots
- item_notes

### 17. Success Metrics
Key MVP metrics:
- % of students logging 3+ sessions per week
- average weekly sessions per student
- assignment completion rate
- teacher review frequency
- 4-week student retention
- qualitative satisfaction from teachers and students

### 18. Key Risks
- students may see logging as extra work
- teachers may expect broader studio management too early
- recorder-specific branding may narrow the market, even though it strengthens relevance
- too many required fields could reduce usage
- too little structure could make the product feel disposable

### 19. Validation Questions
Before expanding, RecorderLoop should answer:
- Will recorder students consistently log practice?
- Which logging fields are actually useful in real use?
- Do teachers want active assignment workflows or mostly passive review?
- Does recorder-specific branding improve trust and adoption?
- What is the minimum feature set that creates habit and retention?

### 20. Launch Recommendation
Launch RecorderLoop as a **mobile-first web app** for a small set of recorder teachers and students. Prioritize fast onboarding, low-friction practice entry, and teacher visibility into weekly progress.

The MVP should prove one thing above all:
**RecorderLoop makes practice between lessons more structured and more continuous.**

### 21. Future Opportunities
If the MVP succeeds, future expansions could include:
- reminders and nudges
- parent visibility
- richer progress analytics
- studio-level teacher tools
- repertoire milestones
- optional media attachments
- broader early music or woodwind expansion
