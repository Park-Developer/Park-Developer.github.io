let projectsData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('../data.yaml?t=' + new Date().getTime())
        .then(res => res.text())
        .then(yamlText => {
            const data = jsyaml.load(yamlText);
            parseYamlToProjects(data);
            renderKanbanBoard();
            setupModalListeners();
        })
        .catch(err => {
            console.error("Failed to load projects data from data.yaml", err);
        });
});

function parseYamlToProjects(data) {
    projectsData = [];
    let idCounter = 1;

    const mapStatus = {
        'Not_STARTED_PROJECT': 'todo',
        'IN_PROGGRESS_PROJECT': 'inprogress',
        'STOP_PROJECT': 'halted',
        'COMPLETED_PROJECT': 'done'
    };

    for (const [yamlKey, status] of Object.entries(mapStatus)) {
        if (data[yamlKey] && Array.isArray(data[yamlKey].value)) {
            data[yamlKey].value.forEach(proj => {
                projectsData.push({
                    id: idCounter++,
                    title: proj.name,
                    status: status,
                    description: (proj.attributes && proj.attributes.Overview) ? proj.attributes.Overview.replace(/^:\s*/, '') : 'No description provided.',
                    techStack: [], // We can extract this if available, leaving empty for now
                    url: proj.url,
                    attributes: proj.attributes || {}
                });
            });
        }
    }
}

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
                <p>${project.description.substring(0, 60)}${project.description.length > 60 ? '...' : ''}</p>
                <div class="card-footer">
                    <span class="tech-tag">Notion</span>
                    <button class="view-btn" data-id="${project.id}">View Details</button>
                </div>
            `;
            
            // Add double click listener
            card.addEventListener('dblclick', () => {
                openProjectModal(project.id);
            });
            
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
    if (!modal) return;
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    }

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
    const titleEl = document.getElementById('modal-title');
    if (titleEl) titleEl.textContent = project.title;
    
    const statusBadge = document.getElementById('modal-status');
    if (statusBadge) {
        statusBadge.textContent = project.status === 'todo' ? '진행 예정' : 
                                  project.status === 'inprogress' ? '진행중' : 
                                  project.status === 'halted' ? '중단됨' : '완료됨';
        statusBadge.className = `status-badge ${project.status}`;
    }

    const descEl = document.getElementById('modal-desc');
    if (descEl) descEl.textContent = project.attributes.Overview || project.description;

    // Tech Stack (Empty for now)
    const techContainer = document.getElementById('modal-tech');
    if (techContainer) {
        techContainer.innerHTML = '';
    }

    // Replace the tasks and timeline with Notion Attributes
    // Since projects.html originally had Progress and Timeline, we will repurpose those or just inject our HTML
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        let attrsHtml = '<div class="notion-attributes" style="margin-top: 20px; text-align: left;">';
        
        const attrs = ['Description', 'Features', 'TODO', 'Schedule', 'Reference', 'Memo', 'Result'];
        attrs.forEach(key => {
            if (project.attributes[key] && project.attributes[key].trim() !== '') {
                attrsHtml += `<div style="margin-bottom: 16px;">
                    <h5 style="font-weight: 600; margin-bottom: 8px; color: var(--primary);">${key}</h5>
                    <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; background: var(--surface-container-low); padding: 10px; border-radius: 8px;">${project.attributes[key]}</pre>
                </div>`;
            }
        });
        
        if (project.attributes.Image && project.attributes.Image.trim() !== '') {
            attrsHtml += `<div style="margin-bottom: 16px;">
                <h5 style="font-weight: 600; margin-bottom: 8px; color: var(--primary);">Image</h5>
                <img src="${project.attributes.Image}" style="max-width: 100%; border-radius: 8px;" />
            </div>`;
        }
        
        attrsHtml += '</div>';

        // Find or create the notion details container
        let detailsContainer = document.getElementById('notion-details-container');
        if (!detailsContainer) {
            detailsContainer = document.createElement('div');
            detailsContainer.id = 'notion-details-container';
            modalBody.appendChild(detailsContainer);
        }
        detailsContainer.innerHTML = attrsHtml;
    }

    // Links
    const linksContainer = document.getElementById('modal-links');
    if (linksContainer) {
        if (project.url) {
            linksContainer.innerHTML = `
                <a href="${project.url}" class="project-link" target="_blank">
                    <i class='bx bx-link-external'></i> Notion Page
                </a>
            `;
        } else {
            linksContainer.innerHTML = '<p>No links available.</p>';
        }
    }

    // Show modal
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}
