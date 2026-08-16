document.addEventListener('DOMContentLoaded', () => {
    renderOngoingProjects();
    loadNowItems();
    loadRecentFiles();

    const form = document.getElementById('now-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Load 'inprogress' projects from projectsData (assumes projects.js is loaded before this)
function renderOngoingProjects() {
    const container = document.getElementById('now-projects');
    if (!container || typeof projectsData === 'undefined') return;

    const ongoing = projectsData.filter(p => p.status === 'inprogress');
    
    if (ongoing.length === 0) {
        container.innerHTML = '<p class="empty-state">현재 진행중인 프로젝트가 없습니다.</p>';
        return;
    }

    container.innerHTML = ongoing.map(project => `
        <div class="now-project-card">
            <h4>${project.title}</h4>
            <p>${project.description.substring(0, 80)}...</p>
            <div class="tech-stack">
                ${project.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Load studies and plans from localStorage
function loadNowItems() {
    const plansList = document.getElementById('now-plans');
    if (!plansList) return;

    const plans = JSON.parse(localStorage.getItem('nowPlans')) || [];
    renderList(plansList, plans, 'plan');
}

// Load recent files from generated json
function loadRecentFiles() {
    const container = document.getElementById('now-recent-files');
    if (!container) return;

    fetch('obsidian/recent.json')
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(files => {
            if (files.length === 0) {
                container.innerHTML = '<li class="empty-state">최근 작성된 문서가 없습니다.</li>';
                return;
            }
            container.innerHTML = files.map(file => `
                <li>
                    <a href="study.html" class="recent-file-link">
                        <i class='bx bx-file'></i>
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-date">${file.date}</span>
                        </div>
                    </a>
                </li>
            `).join('');
        })
        .catch(err => {
            container.innerHTML = '<li class="empty-state">최근 문서를 불러올 수 없습니다.<br>(update_recent 스크립트를 실행해 주세요)</li>';
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
