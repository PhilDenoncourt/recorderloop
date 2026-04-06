# RecorderLoop Handoff Brief

## Idea
Recorder-specific practice tracker for students, with light teacher assignment support.

## Audience
- Primary: recorder students
- Secondary: recorder teachers who assign work and review progress

## Problem
Practice between lessons is often inconsistent, unstructured, and hard to review later. Students forget what to work on, lose continuity across sessions, and struggle to measure improvement. Teachers assign exercises and goals, but there’s often no simple feedback loop between lessons.

## Why this matters
A focused tool could make practice sessions more intentional and measurable without the overhead of a full learning management system. The wedge is narrow, clear, and usable by individual students immediately.

## Core MVP
- Practice session logging
- Repertoire and exercise tracking
- Tempo / duration / notes per session
- "Weak spots" or trouble-measure tracking
- Teacher assignments for the week
- Progress dashboard with simple streaks / completion view

## Primary user workflow
1. Student opens app before practice
2. Sees assigned items or self-managed practice list
3. Logs what they practiced
4. Records notes like tempo reached, trouble spots, and what improved
5. Reviews progress over time before next lesson

## Teacher workflow (lightweight MVP version)
1. Teacher creates or assigns practice items
2. Student completes practice and logs progress
3. Teacher reviews recent activity before or during lesson

## Product positioning
Not a generic music app. Not a full school platform. A focused practice continuity tool for recorder learning.

## Recommended build path
Start with a mobile-first web app:
- faster to ship than native mobile
- easy for students to use on phone/tablet during practice
- simple teacher access via browser
- good enough to validate retention and usefulness before expanding

## Suggested MVP feature set
- User accounts
- Student profile
- Practice items list
- Session log entry form
- Notes + tempo/progress fields
- Assignment status
- Basic teacher/student linking
- Simple progress history view

## Out of scope for v1
- audio analysis
- metronome/tuner
- sheet music annotation
- video feedback
- multi-instrument support
- advanced teacher studio management
- gamification beyond very basic streaks/progress

## Key risks
- too niche unless the workflow is extremely good
- teachers may want more studio-management features too early
- students may abandon logging if entry is too slow
- progress data may feel vague unless metrics are simple and useful

## Validation questions
- Will students actually log every session?
- What is the minimum amount of data needed per session to feel valuable?
- Do teachers want to actively assign inside the app, or just review logs?
- Is recorder-specific positioning stronger than "woodwind practice tracker" at launch?

## Success metrics
- weekly active student usage
- number of practice sessions logged per student
- assignment completion rate
- week-over-week retention
- percentage of teachers who review logs before lessons

## Recommendation
Build student-first with lightweight teacher support. Win on simplicity and continuity. If usage sticks, expand into stronger teacher workflows later.
