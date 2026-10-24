# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side single-page web application that serves as a personal landing page. It aggregates four lightweight productivity widgets â€” a contextual greeting, a 25-minute focus timer, a to-do list, and a set of quick links to favorite websites â€” into one clean, minimal interface.

The application is built with plain HTML, a single CSS stylesheet, and a single Vanilla JavaScript file. No frameworks and no backend server are used. All user data is persisted entirely on the client using the browser Local Storage API, so the dashboard remains functional offline and retains state between sessions.

### Technical Constraints

- TC-1: Technology Stack â€” HTML for structure, CSS for styling, Vanilla JavaScript (no React, Vue, or similar frameworks). No backend server required.
- TC-2: Data Storage â€” Browser Local Storage API only. All data stored client-side.
- TC-3: Browser Compatibility â€” Must work in modern browsers (Chrome, Firefox, Edge, Safari). Usable as a standalone web app or browser extension.
- Folder Rules â€” Exactly one CSS file inside `css/` and exactly one JavaScript file inside `js/`. Code kept clean and readable.

### Non-Functional Requirements

- NFR-1: Simplicity â€” Clean, minimal interface; easy to understand and use; no complex setup; no test setup required.
- NFR-2: Performance â€” Fast load time; responsive UI interactions; no noticeable lag when updating data.
- NFR-3: Visual Design â€” User-friendly aesthetic; clear visual hierarchy; readable typography.

## Glossary

- **Dashboard**: The complete To-Do List Life Dashboard web application.
- **User**: The person interacting with the Dashboard in a browser.
- **Greeting_Widget**: The Dashboard component that displays the current time, current date, and a time-of-day greeting.
- **Focus_Timer**: The Dashboard component that runs a 25-minute countdown with start, stop, and reset controls.
- **To_Do_List**: The Dashboard component that stores, displays, and manages user tasks.
- **Quick_Links**: The Dashboard component that displays clickable buttons opening saved favorite websites.
- **Task**: A single to-do item owned by the User, consisting of text and a completion status.
- **Link**: A single Quick_Links entry consisting of a display name and a destination URL.
- **Local_Storage**: The browser Local Storage API used to persist Dashboard data on the client.
- **Clock_Tick**: A one-second interval during which the Dashboard refreshes time-based displays.

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a context-appropriate greeting, so that I have a personal anchor when I open my Dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current local time in hours and minutes using 24-hour format.
2. WHEN each 1-second Clock_Tick elapses, THE Greeting_Widget SHALL update the displayed time to the current local time.
3. THE Greeting_Widget SHALL display the current local date showing the day, month, and year.
4. WHEN the current local hour is between 0 and 4 inclusive, THE Greeting_Widget SHALL display "Good evening".
5. WHEN the current local hour is between 5 and 11 inclusive, THE Greeting_Widget SHALL display "Good morning".
6. WHEN the current local hour is between 12 and 16 inclusive, THE Greeting_Widget SHALL display "Good afternoon".
7. WHEN the current local hour is between 17 and 23 inclusive, THE Greeting_Widget SHALL display "Good evening".

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute timer with start, stop, and reset controls, so that I can run focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialize to a 25-minute countdown displaying minutes and seconds in MM:SS format.
2. WHEN the Start control is clicked, THE Focus_Timer SHALL begin counting down in one-second decrements.
3. WHEN the Stop control is clicked, THE Focus_Timer SHALL pause the countdown and retain the remaining time.
4. WHEN the Reset control is clicked, THE Focus_Timer SHALL restore the countdown to 25 minutes and stop the countdown.
5. WHEN the countdown reaches zero, THE Focus_Timer SHALL stop the countdown and remain at zero.
6. WHILE the countdown is running, THE Focus_Timer SHALL display the remaining minutes and seconds, updating the display once every second.
7. IF the countdown is already running, THEN THE Focus_Timer SHALL not modify the remaining time when the Start control is clicked.
8. IF the countdown has reached zero, THEN THE Focus_Timer SHALL not modify the remaining time when the Start control is clicked.

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, and delete tasks, so that I can track what I need to do across sessions.

#### Acceptance Criteria

1. WHEN a non-empty task with text not exceeding 200 characters is entered and submitted, THE To_Do_List SHALL add the task to the displayed list with a completion status of not done.
2. WHEN the complete control of a task is activated, THE To_Do_List SHALL toggle the task completion status and reflect the change in the displayed list.
3. WHEN the edit control of a task is activated, THE To_Do_List SHALL allow the User to modify the task text, limited to 200 characters, and save the updated text to the displayed list.
4. WHEN the delete control of a task is activated, THE To_Do_List SHALL remove the task from the displayed list.
5. IF an empty or whitespace-only task is submitted, THEN THE To_Do_List SHALL reject the submission, display an error indication that the task text is required, and add no task.
6. WHEN the Dashboard is loaded, THE To_Do_List SHALL load the saved task list from Local_Storage.
7. WHEN a task is added, edited, completed, or deleted, THE To_Do_List SHALL persist the updated task list to Local_Storage.
8. THE To_Do_List SHALL preserve the task list across persistence and loading such that, for every task, the task text, completion status, and list position are unchanged after a round-trip through Local_Storage.
9. IF the edited task text is empty or whitespace-only, THEN THE To_Do_List SHALL reject the edit, retain the original task text in the displayed list, and display an error indication that the task text is required.
10. IF Local_Storage is unavailable or the persistence operation fails, THEN THE To_Do_List SHALL retain the current task list in the displayed list and display an error indication that the change could not be saved.

### Requirement 4: Quick Links

**User Story:** As a user, I want clickable buttons that open my favorite websites, so that I can quickly navigate to sites I use often.

#### Acceptance Criteria

1. WHEN a Quick_Links button is clicked, THE Quick_Links SHALL open the linked website in a new browser tab.
2. WHEN a Link consisting of a name and a URL is submitted, THE Quick_Links SHALL add a button for the Link to the displayed set.
3. WHEN the remove control of a Link is activated, THE Quick_Links SHALL remove the Link from the displayed set.
4. IF a Link is submitted with a name that is empty, contains only whitespace, or exceeds 100 characters, or with a URL that does not begin with the http:// or https:// scheme, THEN THE Quick_Links SHALL reject the submission and add no button.
5. WHEN the Dashboard is loaded, THE Quick_Links SHALL load the saved Link set from Local_Storage.
6. WHEN a Link is added or removed, THE Quick_Links SHALL persist the updated Link set to Local_Storage.
7. WHEN a Link set persisted to Local_Storage is loaded, THE Quick_Links SHALL produce an equivalent set of Links containing the same Links with matching name and URL.
8. IF the Dashboard is loaded and Local_Storage contains no saved Link set, THEN THE Quick_Links SHALL display an empty set of Links.