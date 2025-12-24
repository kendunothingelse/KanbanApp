# Kanban Board with Progress Forecasting

This project is a web application for managing tasks using a visual Kanban board. It includes features like drag-and-drop for tasks and columns, task detail editing, member assignment, due dates, and labels.

## Repository Layout & Code Versions

*   `fe/` (frontend): React **19.2.0** with TypeScript **4.9.x** via `react-scripts` 5.0.1. UI is built with Chakra UI **2.10.x**, drag-and-drop uses `@dnd-kit/sortable` **10.0.0**, and routing is handled by React Router **7.9.x**.
*   `be/` (backend): Spring Boot **3.5.7** project targeting Java **23** (Gradle toolchain). It includes starters for Web, Security, Validation, Data JPA, plus JWT (`jjwt` **0.13.0**) and MySQL connector for persistence.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm (or yarn) installed on your machine.

### Installation

1.  Clone the repo
    ```sh
    git clone <your-repo-url>
    ```
2.  Navigate to the `fe` directory
    ```sh
    cd fe
    ```
3.  Install NPM packages
    ```sh
    npm install
    ```
4.  Start the development server
    ```sh
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## Core Libraries

*   **[React](https://react.dev/learn)**: A JavaScript library for building user interfaces.
*   **[Chakra UI](https://v2.chakra-ui.com/getting-started)**: A simple, modular and accessible component library for React.
*   **[dnd-kit](https://docs.dndkit.com/introduction/installation)**: A modern, lightweight, and extensible drag-and-drop toolkit for React.
*   **[React Router](https://reactrouter.com/)**: For declarative routing in the application.
*   **[React Datepicker](https://reactdatepicker.com/)**: A simple and reusable datepicker component for React.

## Project Structure

The project is organized into several directories to separate concerns.

### Pages

*   `src/pages/WorkspacePage.tsx`: The main landing page that displays a grid of all available Kanban boards. Users can create new boards from this page.
*   `src/pages/KanbanPage.tsx`: Displays the detailed Kanban board for a selected project. This is where users interact with task cards and lists.

### Components

The components are organized by their domain.

*   **`kanban-components`**: Components directly related to the Kanban board interface.
    *   `KBBoard.tsx`: The main container that orchestrates the entire board, managing state for lists, cards, and drag-and-drop functionality.
    *   `KBColumn.tsx`: Represents a vertical list/column on the board (e.g., "To Do", "In Progress"). It contains the tasks.
    *   `KBTask.tsx`: Represents an individual task card within a column.
    *   `NewCardCreator.tsx`: A UI element at the bottom of each column for adding new tasks.

*   **`workspace-components`**: Components related to the workspace and board selection.
    *   `BoardCard.tsx`: A card used on the `WorkspacePage` to represent and link to a specific Kanban board.
    *   `CardDetailModal.tsx`: A comprehensive modal that opens when a task is clicked. It allows for detailed viewing and editing of a task's properties like members, labels, and due dates.

*   **`shared`**: Reusable components used across different parts of the application.
    *   `DueDateSelector.tsx`: A specialized date picker for setting task due dates.
    *   `LabelManager.tsx`: A popover component for creating, editing, and assigning labels to tasks.

## Data Structures (API)

The application uses a set of interfaces to model its data, currently mocked in `src/api/dummy-data.ts`.

*   **`Board`**: Represents a single Kanban board.
    ```typescript
    export interface Board {
        id: string;
        name: string;
        workspaceId: string;
    }
    ```

*   **`List`**: Represents a column on the board.
    ```typescript
    export interface List {
        id: string;
        title: string;
        cards: Card[];
    }
    ```

*   **`Card`**: Represents a task card.
    ```typescript
    export interface Card {
        id: string;
        title: string;
        description?: string;
        members?: Member[];
        labels?: Label[];
        checklist?: ChecklistItem[];
        comments?: Comment[];
        dueDate?: string;
    }
    ```

*   **`Member`**: Represents a user who can be assigned to a card.
    ```typescript
    export interface Member {
        id: string;
        name: string;
        avatarUrl?: string;
    }
    ```

*   **`Label`**: Represents a colored tag for categorizing cards.
    ```typescript
    export interface Label {
        id: string;
        name: string;
        color: string;
    }
    ```
