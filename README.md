# Mini e-Learning Prototype

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This repository contains the practical assignment for **Week 1** of the specialization module **"AI for Software Engineering"**, focusing on the introduction to AI and AI-assisted coding.

---

### 🎯 Project Objective

The goal of this assignment was to apply the **VibeCoding** methodology to quickly build a functional front-end prototype of a mini e-learning platform (HTML, CSS, JavaScript). The development process was guided by natural language prompts to rapidly generate the core structure and logic.

### ✨ Implemented Features

This is a small Single Page Application (SPA) prototype demonstrating a minimal e-learning UI with the following features:

* **Course Listing:** Home page displaying a list of available courses.
* **Course Details:** Separate view showing course descriptions, lessons, and progress upon clicking a course.
* **Progress Tracking:** Ability to mark individual lessons as completed.
* **Course Completion:** Button to "Mark course completed," which automatically updates all lesson statuses.
* **Persistence:** Progress status is saved and loaded using the browser's `localStorage`.
* **Design:** Simple, clean visual design using plain CSS (no frameworks), including hover effects on interactive elements.

### ⚙️ How to Use

1.  Save `index.html`, `styles.css`, and `app.js` into a single folder.
2.  Open **`index.html`** in your web browser.
3.  Click a course to view lessons, check lessons as completed, or mark the full course as completed.
4.  Progress is saved in your browser's `localStorage`.

The course data is defined within the JavaScript file in the `coursesSeed` array and can be easily adapted to add or remove content.

---

### 📜 License

This project is licensed under the **MIT License**.
