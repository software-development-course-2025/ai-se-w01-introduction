// Simple mini e-learning SPA prototype

// Sample course data (can be replaced with JSON or fetched from an API)
const coursesSeed = [
  {
    id: "c1",
    title: "Introduction to Web Development",
    description: "HTML, CSS, and JavaScript basics to get you started.",
    lessons: [
      { id: "c1-l1", title: "HTML Basics", duration: "10m" },
      { id: "c1-l2", title: "CSS Foundations", duration: "14m" },
      { id: "c1-l3", title: "Intro to JavaScript", duration: "18m" }
    ]
  },
  {
    id: "c2",
    title: "Responsive Design",
    description: "Create layouts that look great on any screen.",
    lessons: [
      { id: "c2-l1", title: "Flexbox", duration: "12m" },
      { id: "c2-l2", title: "Grid", duration: "16m" },
      { id: "c2-l3", title: "Media Queries", duration: "10m" }
    ]
  },
  {
    id: "c3",
    title: "JavaScript Essentials",
    description: "Core JS concepts: variables, control flow, functions.",
    lessons: [
      { id: "c3-l1", title: "Variables & Types", duration: "8m" },
      { id: "c3-l2", title: "Functions", duration: "15m" },
      { id: "c3-l3", title: "Async Basics", duration: "20m" }
    ]
  }
];

const STORAGE_KEY = "mini-elearning:progress";
let courses = []; // will hold courses with progress info
const appEl = document.getElementById("app");
const homeBtn = document.getElementById("homeBtn");

homeBtn.addEventListener("click", () => {
  history.pushState({ view: "home" }, "", "/");
  renderHome();
});

// Initialize app: hydrate from localStorage or seed
function init() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      courses = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse storage, using seed", e);
      courses = attachProgress(coursesSeed);
    }
  } else {
    courses = attachProgress(coursesSeed);
  }

  // router - handle back/forward
  window.addEventListener("popstate", (e) => {
    const state = (e.state && e.state.view) || "home";
    if (state === "home") renderHome();
    else if (state.view === "course") renderCourse(state.courseId);
    else renderHome();
  });

  // initial render
  renderHome();
}

// Add progress metadata to seed
function attachProgress(seed) {
  return seed.map(c => ({
    ...c,
    completed: false,
    lessonsProgress: c.lessons.map(l => ({ lessonId: l.id, done: false }))
  }));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function findCourse(id) {
  return courses.find(c => c.id === id);
}

function calculatePercent(course) {
  const total = course.lessons.length;
  const doneCount = course.lessonsProgress.filter(lp => lp.done).length;
  return Math.round((doneCount / total) * 100);
}

/* ---------- Renderers ---------- */

function renderHome() {
  document.title = "Mini e-Learning — Home";
  appEl.innerHTML = `
    <section>
      <div class="space-between">
        <div>
          <h2>Available Courses</h2>
          <p class="muted">Browse courses and track your progress.</p>
        </div>
        <div class="row">
          <button id="resetBtn" class="btn btn-ghost">Reset Progress</button>
        </div>
      </div>

      <div class="grid" id="coursesGrid"></div>
    </section>
  `;

  const grid = document.getElementById("coursesGrid");
  courses.forEach(c => {
    const percent = calculatePercent(c);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="meta">
        <div>
          <h3>${escapeHtml(c.title)}</h3>
          <p class="muted">${escapeHtml(c.description)}</p>
        </div>
        <div style="text-align:right">
          ${c.completed ? `<span class="badge success">Completed</span>` : `<span class="small muted">${percent}%</span>`}
        </div>
      </div>

      <div>
        <div class="progress-wrap" aria-hidden="true">
          <div class="progress" style="width:${percent}%"></div>
        </div>
      </div>

      <div class="space-between">
        <div class="small muted">${c.lessons.length} lessons</div>
        <div class="row">
          ${c.completed ? 
            `<button class="btn btn-ghost" data-course="${c.id}" disabled>Completed</button>` :
            `<button class="btn" data-action="mark-complete" data-course="${c.id}">Mark Completed</button>`
          }
          <button class="btn btn-ghost" data-action="view-course" data-course="${c.id}">View</button>
        </div>
      </div>
    `;

    // clicking whole card opens course detail
    card.addEventListener("click", (ev) => {
      // don't trigger when clicking buttons inside card
      if (ev.target.closest("button")) return;
      history.pushState({ view: "course", courseId: c.id }, "", `#${c.id}`);
      renderCourse(c.id);
    });

    grid.appendChild(card);
  });

  // attach event handlers for buttons inside grid
  grid.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    const cId = btn.dataset.course;
    const action = btn.dataset.action;
    if (action === "mark-complete") {
      markCourseCompleted(cId);
      renderHome();
    } else if (action === "view-course") {
      history.pushState({ view: "course", courseId: cId }, "", `#${cId}`);
      renderCourse(cId);
    }
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all progress?")) return;
    courses = attachProgress(coursesSeed);
    saveState();
    renderHome();
  });
}

function renderCourse(courseId) {
  const course = findCourse(courseId);
  if (!course) {
    appEl.innerHTML = `<div class="empty">Course not found</div>`;
    return;
  }

  document.title = `Mini e-Learning — ${course.title}`;

  const percent = calculatePercent(course);
  appEl.innerHTML = `
    <div class="detail">
      <div class="panel">
        <div class="space-between">
          <div>
            <h2>${escapeHtml(course.title)}</h2>
            <p class="muted">${escapeHtml(course.description)}</p>
          </div>
          <div>
            <div class="badge ${course.completed ? "success" : ""}">${course.completed ? "Completed" : `${percent}%`}</div>
          </div>
        </div>

        <div style="margin-top:12px" class="small muted">Lessons</div>
        <div class="lessons" id="lessonsList" style="margin-top:8px"></div>

        <div style="margin-top:16px" class="row">
          <button id="backBtn" class="btn btn-ghost">Back</button>
          ${course.completed ? `<button class="btn btn-ghost" disabled>Completed</button>` : `<button id="completeCourseBtn" class="btn">Mark course completed</button>`}
        </div>
      </div>

      <div class="panel">
        <div class="small muted">Course progress</div>
        <div style="margin-top:8px;">
          <div class="progress-wrap" aria-hidden="true"><div class="progress" style="width:${percent}%"></div></div>
        </div>

        <div style="margin-top:12px;">
          <div class="muted small">Details</div>
          <ul style="margin:8px 0 0 18px;">
            <li>${course.lessons.length} lessons</li>
            <li>Completion: ${percent}%</li>
          </ul>
        </div>

      </div>
    </div>
  `;

  const lessonsList = document.getElementById("lessonsList");
  course.lessons.forEach(lesson => {
    const lp = course.lessonsProgress.find(x => x.lessonId === lesson.id);
    const lessonEl = document.createElement("label");
    lessonEl.className = "lesson";
    lessonEl.innerHTML = `
      <input type="checkbox" ${lp && lp.done ? "checked" : ""} data-lesson="${lesson.id}" />
      <div style="flex:1">
        <div class="title">${escapeHtml(lesson.title)}</div>
        <div class="meta muted">${escapeHtml(lesson.duration)}</div>
      </div>
      <div class="muted small">${lp && lp.done ? "Done" : ""}</div>
    `;
    lessonsList.appendChild(lessonEl);
  });

  // event handlers
  document.getElementById("backBtn").addEventListener("click", () => {
    history.pushState({ view: "home" }, "", "/");
    renderHome();
  });

  const completeCourseBtn = document.getElementById("completeCourseBtn");
  if (completeCourseBtn) {
    completeCourseBtn.addEventListener("click", () => {
      markCourseCompleted(courseId);
      renderCourse(courseId);
    });
  }

  lessonsList.addEventListener("change", (ev) => {
    const cb = ev.target;
    if (cb && cb.type === "checkbox") {
      const lessonId = cb.dataset.lesson;
      toggleLesson(courseId, lessonId, cb.checked);
      // re-render progress indicator within detail
      const newPercent = calculatePercent(course);
      const progEls = document.querySelectorAll(".progress");
      progEls.forEach(pe => {
        // attempt to update widths (simple approach)
        pe.style.width = `${newPercent}%`;
      });

      // Update completed state if all lessons are done
      if (newPercent === 100) {
        markCourseCompleted(courseId);
      } else {
        // If any lesson unchecked, ensure course not marked completed
        course.completed = false;
      }
      saveState();
      // Update badge and button state
      const badge = document.querySelector(".badge");
      if (badge) badge.textContent = course.completed ? "Completed" : `${newPercent}%`;
      if (course.completed) {
        const ccBtn = document.getElementById("completeCourseBtn");
        if (ccBtn) ccBtn.disabled = true;
      }
    }
  });
}

/* ---------- Actions ---------- */

function toggleLesson(courseId, lessonId, done) {
  const course = findCourse(courseId);
  if (!course) return;
  const lp = course.lessonsProgress.find(x => x.lessonId === lessonId);
  if (!lp) return;
  lp.done = !!done;
  // if any undone, ensure course not completed
  if (!done) course.completed = false;
  else {
    const percent = calculatePercent(course);
    if (percent === 100) course.completed = true;
  }
  saveState();
}

function markCourseCompleted(courseId) {
  const course = findCourse(courseId);
  if (!course) return;
  course.completed = true;
  course.lessonsProgress.forEach(lp => lp.done = true);
  saveState();
}

/* ---------- Utilities ---------- */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// start
init();