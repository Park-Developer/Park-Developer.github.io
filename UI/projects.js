const projectsData = [
    {
        id: 1,
        title: "Developer Portfolio Website",
        status: "done", // todo, inprogress, done
        description: "A personal developer portfolio built with HTML, CSS, and vanilla JavaScript. Features a glassmorphism design, dark mode, and a responsive layout.",
        techStack: ["HTML5", "CSS3", "JavaScript"],
        tasks: [
            { text: "Design UI mockups", completed: true },
            { text: "Implement Home and About sections", completed: true },
            { text: "Add dark mode toggle", completed: true },
            { text: "Build Projects Kanban board", completed: true }
        ],
        timeline: [
            { date: "2024-03-01", event: "Project initialized" },
            { date: "2024-03-05", event: "Completed base layout and styling" },
            { date: "2024-03-10", event: "Added Obsidian integration for Study page" },
            { date: "2024-03-15", event: "Project deployed to GitHub Pages" }
        ],
        links: [
            { text: "GitHub Repo", url: "#" },
            { text: "Live Demo", url: "#" }
        ]
    },
    {
        id: 2,
        title: "E-commerce Platform API",
        status: "inprogress",
        description: "A robust backend API for an e-commerce platform built with Node.js and Express. Features user authentication, product management, and order processing.",
        techStack: ["Node.js", "Express", "MongoDB", "JWT"],
        tasks: [
            { text: "Database schema design", completed: true },
            { text: "User authentication (JWT)", completed: true },
            { text: "Product CRUD endpoints", completed: false },
            { text: "Payment gateway integration", completed: false }
        ],
        timeline: [
            { date: "2024-04-01", event: "Repository created" },
            { date: "2024-04-05", event: "Database connected and schemas defined" },
            { date: "2024-04-12", event: "Auth middleware implemented" }
        ],
        links: [
            { text: "GitHub Repo", url: "#" }
        ]
    },
    {
        id: 3,
        title: "AI Chat Assistant",
        status: "todo",
        description: "A web-based chat application that integrates with OpenAI API to provide intelligent responses. Includes chat history and customizable personalities.",
        techStack: ["React", "Tailwind CSS", "OpenAI API"],
        tasks: [
            { text: "Set up React project", completed: false },
            { text: "Design chat interface", completed: false },
            { text: "Integrate OpenAI API", completed: false },
            { text: "Implement local storage for chat history", completed: false }
        ],
        timeline: [
            { date: "Pending", event: "Gathering requirements" }
        ],
        links: []
    },
    {
        id: 4,
        title: "Legacy Backend Service",
        status: "halted",
        description: "An old monolithic backend service that was planned to be refactored into microservices, but the project has been paused due to shifting priorities.",
        techStack: ["Java", "Spring Boot", "MySQL"],
        tasks: [
            { text: "Analyze current architecture", completed: true },
            { text: "Design microservice boundaries", completed: false },
            { text: "Migrate user data", completed: false }
        ],
        timeline: [
            { date: "2023-11-01", event: "Project started" },
            { date: "2023-12-15", event: "Project paused" }
        ],
        links: []
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderKanbanBoard();
    setupModalListeners();
});

function renderKanbanBoard() {
    const columns = {
        todo: document.querySelector('#todo-column .column-body'),
        inprogress: document.querySelector('#inprogress-column .column-body'),
        done: document.querySelector('#done-column .column-body'),
        halted: document.querySelector('#halted-column .column-body')
    };

    // Clear existing content
    Object.values(columns).forEach(col => {
        if(col) col.innerHTML = '';
    });

    const counts = { todo: 0, inprogress: 0, done: 0, halted: 0 };

    projectsData.forEach(project => {
        const col = columns[project.status];
        if (col) {
            counts[project.status]++;
            const card = document.createElement('div');
            card.className = 'project-card fade-in';
            card.innerHTML = `
                <h4>${project.title}</h4>
                <p>${project.description.substring(0, 60)}...</p>
                <div class="card-footer">
                    <span class="tech-tag">${project.techStack[0]}</span>
                    <button class="view-btn" data-id="${project.id}">View Details</button>
                </div>
            `;
            col.appendChild(card);
        }
    });

    // Update counts
    document.querySelector('#todo-column .count').textContent = counts.todo;
    document.querySelector('#inprogress-column .count').textContent = counts.inprogress;
    document.querySelector('#done-column .count').textContent = counts.done;
    if (document.querySelector('#halted-column .count')) {
        document.querySelector('#halted-column .count').textContent = counts.halted;
    }

    // Attach click events to buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = parseInt(e.target.getAttribute('data-id'));
            openProjectModal(projectId);
        });
    });
}

function setupModalListeners() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    });

    // Close when clicking outside modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

function openProjectModal(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    // Populate data
    document.getElementById('modal-title').textContent = project.title;
    
    const statusBadge = document.getElementById('modal-status');
    statusBadge.textContent = project.status === 'todo' ? '진행 예정' : 
                              project.status === 'inprogress' ? '진행중' : 
                              project.status === 'halted' ? '중단됨' : '완료됨';
    statusBadge.className = `status-badge ${project.status}`;

    document.getElementById('modal-desc').textContent = project.description;

    // Tech Stack
    const techContainer = document.getElementById('modal-tech');
    techContainer.innerHTML = project.techStack.map(tech => `<span class="skill-tag">${tech}</span>`).join('');

    // Tasks Progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.completed).length;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    document.getElementById('modal-progress-fill').style.width = `${progressPercent}%`;
    document.getElementById('modal-progress-text').textContent = `${progressPercent}%`;

    const tasksList = document.getElementById('modal-tasks');
    tasksList.innerHTML = project.tasks.map(task => `
        <li class="${task.completed ? 'completed' : ''}">
            <i class='bx ${task.completed ? 'bx-check-circle' : 'bx-circle'}'></i>
            <span>${task.text}</span>
        </li>
    `).join('');

    // Timeline
    const timelineContainer = document.getElementById('modal-timeline');
    timelineContainer.innerHTML = project.timeline.map(item => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${item.date}</div>
            <div class="timeline-content">${item.event}</div>
        </div>
    `).join('');

    // Links
    const linksContainer = document.getElementById('modal-links');
    if (project.links.length > 0) {
        linksContainer.innerHTML = project.links.map(link => `
            <a href="${link.url}" class="project-link" target="_blank">
                <i class='bx bx-link-external'></i> ${link.text}
            </a>
        `).join('');
    } else {
        linksContainer.innerHTML = '<p>No links available.</p>';
    }

    // Show modal
    const modal = document.getElementById('project-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}
