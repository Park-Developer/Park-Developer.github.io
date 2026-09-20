document.addEventListener('DOMContentLoaded', () => {
    fetch('../data.yaml?t=' + new Date().getTime())
        .then(res => res.text())
        .then(yamlText => {
            const data = jsyaml.load(yamlText);
            loadNowDescription(data);
            renderOngoingProjects(data);
            loadNowItems(data);
            loadRecentFiles(data);
        })
        .catch(err => {
            console.error("Failed to parse data.yaml:", err);
            const projectsContainer = document.getElementById('now-projects');
            if (projectsContainer) projectsContainer.innerHTML = `<p class="empty-state text-error">데이터를 불러올 수 없습니다.<br>원인: ${err.message}</p>`;
        });

    const form = document.getElementById('now-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Load 'What I'm doing Now' description from data.yaml
function loadNowDescription(data) {
    if (!data.WHAT_IM_DOING_NOW) return;
    const descItem = data.WHAT_IM_DOING_NOW.find(item => item.name === "Description");
    if (descItem && descItem.value) {
        const el = document.getElementById('now-description-text');
        if (el) {
            el.textContent = descItem.value;
        }
    }
}

// Load 'inprogress' projects from data.yaml
function renderOngoingProjects(data) {
    const container = document.getElementById('now-projects');
    if (!container || !data) return;

    let ongoing = [];
    if (data.WHAT_IM_DOING_NOW) {
        const projItem = data.WHAT_IM_DOING_NOW.find(item => item.name === "In_Progress_Project");
        if (projItem) {
            if (typeof projItem.value === 'string' && data[projItem.value] && Array.isArray(data[projItem.value].value)) {
                // Resolve string reference (e.g. "IN_PROGGRESS_PROJECT")
                ongoing = data[projItem.value].value;
            } else if (Array.isArray(projItem.value)) {
                ongoing = projItem.value;
            }
        }
    }
    
    if (ongoing.length === 0) {
        container.innerHTML = '<p class="empty-state text-text-secondary text-sm">현재 진행중인 프로젝트가 없습니다.</p>';
        return;
    }

    container.innerHTML = ongoing.map(project => `
        <div class="now-project-card p-4 border border-surface-border rounded-lg bg-surface hover:border-primary transition-colors cursor-pointer" onclick="window.open('${project.url}', '_blank')">
            <h4 class="font-headline-md text-base text-text-primary mb-2 hover:text-primary transition-colors flex items-center gap-2">
                ${project.name}
                <i class='bx bx-link-external text-text-secondary text-sm'></i>
            </h4>
            <p class="text-text-secondary text-sm leading-relaxed">${(project.attributes && project.attributes.Overview) ? project.attributes.Overview.replace(/^:\s*/, '') : ''}</p>
        </div>
    `).join('');
}

// Load studies and plans from TODO_LIST.md
function loadNowItems(data) {
    const plansList = document.getElementById('now-plans');
    if (!plansList || !data) return;

    let todoPath = null;
    if (data.WHAT_IM_DOING_NOW) {
        const todoItem = data.WHAT_IM_DOING_NOW.find(item => item.name === "TODO_List");
        if (todoItem && todoItem.value && todoItem.value !== "None") {
            todoPath = '../' + todoItem.value;
        }
    }

    if (!todoPath) {
        plansList.innerHTML = '<li class="empty-state text-error text-sm">TODO_List 경로를 찾을 수 없습니다.</li>';
        return;
    }

    fetch(todoPath + '?t=' + new Date().getTime())
        .then(res => {
            if (!res.ok) throw new Error("Failed to load TODO_LIST.md");
            return res.text();
        })
        .then(text => {
            const lines = text.split('\n');
            let html = '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('- [ ] ')) {
                    const textContent = trimmed.substring(6);
                    html += `
                    <li class="plan-item" style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" disabled style="width: 16px; height: 16px;">
                        <span class="plan-text text-text-primary text-sm">${textContent}</span>
                    </li>`;
                } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
                    const textContent = trimmed.substring(6);
                    html += `
                    <li class="plan-item" style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" checked disabled style="width: 16px; height: 16px;">
                        <span class="plan-text text-text-secondary text-sm" style="text-decoration: line-through;">${textContent}</span>
                    </li>`;
                } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                     const headerText = trimmed.replace(/#/g, '').trim();
                     if (headerText !== 'Logseq TODOs') {
                         html += `<li style="margin-top: 12px; margin-bottom: 4px; font-weight: bold; color: var(--text-primary); font-size: 14px;">${headerText}</li>`;
                     }
                } else if (trimmed.length > 0 && !trimmed.startsWith('*')) {
                     html += `<li style="margin-left: 24px; color: var(--text-secondary); font-size: 13px;">${trimmed}</li>`;
                }
            }
            if (html === '') {
                plansList.innerHTML = '<li class="empty-state text-text-secondary text-sm">할 일이 없습니다.</li>';
            } else {
                plansList.innerHTML = html;
            }
        })
        .catch(err => {
            console.error("TODO Fetch Error:", err);
            plansList.innerHTML = `<li class="empty-state text-error text-sm" style="word-break: break-all;">할 일 목록을 불러올 수 없습니다.<br>원인: ${err.message}</li>`;
        });
}

// Load recent files from markdown analysis file
function loadRecentFiles(data) {
    const container = document.getElementById('now-recent-files');
    if (!container || !data) return;

    let docPath = null;
    if (data.WHAT_IM_DOING_NOW) {
        const docItem = data.WHAT_IM_DOING_NOW.find(item => item.name === "Recent_Document");
        if (docItem && docItem.value && docItem.value !== "None") {
            docPath = '../' + docItem.value;
        }
    }

    if (!docPath) {
        container.innerHTML = '<li class="empty-state text-text-secondary text-sm">최근 작성된 문서가 없습니다.</li>';
        return;
    }

    fetch(docPath + '?t=' + new Date().getTime())
        .then(res => {
            if (!res.ok) throw new Error('Failed to load markdown file');
            return res.text();
        })
        .then(text => {
            const lines = text.split('\n');
            const files = [];
            let inTable = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('|')) {
                    if (trimmed.includes('파일 이름') || trimmed.includes(':---')) {
                        inTable = true;
                        continue;
                    }
                    if (inTable) {
                        const parts = trimmed.split('|').map(s => s.trim());
                        if (parts.length >= 4 && parts[2]) {
                            const filename = parts[2];
                            files.push({ name: filename });
                        }
                    }
                }
            }

            if (files.length === 0) {
                container.innerHTML = '<li class="empty-state text-text-secondary text-sm">최근 작성된 문서가 없습니다.</li>';
                return;
            }

            container.innerHTML = files.map(file => `
                <li class="p-3 border border-surface-border rounded-lg bg-surface hover:border-primary transition-colors cursor-pointer" onclick="window.location.href='study.html'">
                    <div class="flex items-center gap-3">
                        <i class='bx bx-file text-primary text-lg'></i>
                        <div class="file-info flex flex-col">
                            <span class="file-name text-text-primary text-sm font-semibold">${file.name}</span>
                            <span class="file-date text-text-secondary text-xs mt-1">최근 변환됨</span>
                        </div>
                    </div>
                </li>
            `).join('');
        })
        .catch(err => {
            console.error("Recent Document Fetch Error:", err);
            container.innerHTML = `<li class="empty-state text-error text-sm" style="word-break: break-all;">문서를 불러올 수 없습니다.<br>원인: ${err.message}</li>`;
        });
}

function renderList(container, items, type) {
    if (items.length === 0) {
        container.innerHTML = '<li class="empty-state">등록된 항목이 없습니다.</li>';
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = items.map((item, index) => {
        // Upgrade legacy item format
        if (typeof item === 'string') {
            item = { text: item, history: [] };
            items[index] = item;
        }
        if (!item.history) item.history = [];
        
        const isDoneToday = item.history.includes(todayStr);
        const streak = calculateStreak(item.history);
        const total = item.history.length;

        // For plans, we add the checkbox UI
        if (type === 'plan') {
            return `
            <li class="plan-item">
                <div class="plan-header">
                    <label class="custom-checkbox">
                        <input type="checkbox" onchange="togglePlanDay(${index}, this.checked)" ${isDoneToday ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        <span class="plan-text ${isDoneToday ? 'completed-text' : ''}">${item.text}</span>
                    </label>
                    <button class="delete-btn" onclick="deleteItem('${type}', ${index})"><i class='bx bx-trash'></i></button>
                </div>
                <div class="plan-stats">
                    <span class="stat-badge"><i class='bx bx-calendar-check'></i> 총 ${total}일 달성</span>
                    ${streak > 1 ? `<span class="stat-badge fire-badge"><i class='bx bxs-hot'></i> ${streak}일 연속!</span>` : ''}
                </div>
            </li>
            `;
        }

        // Standard rendering for any other fallback (should not reach here now)
        return `
        <li>
            <span><i class='bx bx-check-circle'></i> ${item.text}</span>
            <button class="delete-btn" onclick="deleteItem('${type}', ${index})"><i class='bx bx-trash'></i></button>
        </li>
        `;
    }).join('');

    // Save back if we upgraded format
    localStorage.setItem('nowPlans', JSON.stringify(items));
}

function calculateStreak(history) {
    if (!history || history.length === 0) return 0;
    
    // Sort descending
    const sortedDates = [...history].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentDateToCheck = new Date(sortedDates[0]);
    currentDateToCheck.setHours(0,0,0,0);

    // If the latest date isn't today or yesterday, streak is broken
    if (currentDateToCheck < yesterday) return 0;

    streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i]);
        prevDate.setHours(0,0,0,0);
        
        const expectedPrevDate = new Date(currentDateToCheck);
        expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
        
        if (prevDate.getTime() === expectedPrevDate.getTime()) {
            streak++;
            currentDateToCheck = prevDate;
        } else {
            break;
        }
    }
    return streak;
}

window.togglePlanDay = function(index, isChecked) {
    const items = JSON.parse(localStorage.getItem('nowPlans')) || [];
    const item = items[index];
    if (!item) return;

    const todayStr = new Date().toISOString().split('T')[0];
    
    if (isChecked) {
        if (!item.history.includes(todayStr)) item.history.push(todayStr);
    } else {
        item.history = item.history.filter(d => d !== todayStr);
    }
    
    localStorage.setItem('nowPlans', JSON.stringify(items));
    loadNowItems(); // Re-render to update stats
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const textInput = document.getElementById('item-text');
    const text = textInput.value.trim();
    
    if (!text) return;

    const storageKey = 'nowPlans';
    const items = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    items.push({ text, createdAt: new Date().toISOString(), history: [] });
    localStorage.setItem(storageKey, JSON.stringify(items));
    
    textInput.value = '';
    
    // Animate addition slightly if desired
    const listElement = document.getElementById('now-plans');
    if(listElement) {
        listElement.classList.add('pulse');
        setTimeout(() => listElement.classList.remove('pulse'), 300);
    }

    loadNowItems();
}

window.deleteItem = function(type, index) {
    const storageKey = 'nowPlans';
    const items = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (index >= 0 && index < items.length) {
        items.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(items));
        loadNowItems();
    }
}
