// insight.js

let globalTodoData = {};
let currentPeriod = 7;

document.addEventListener('DOMContentLoaded', () => {
    loadTodoLoad();
    loadProjectProgress();
    loadObsidianChart();
    setupFilters();
});

function setupFilters() {
    const buttons = document.querySelectorAll('.period-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            buttons.forEach(b => {
                b.classList.remove('bg-white', 'dark:bg-surface', 'text-text-primary', 'shadow-sm', 'border', 'border-surface-border');
                b.classList.add('text-text-secondary');
            });
            const target = e.target;
            target.classList.remove('text-text-secondary');
            target.classList.add('bg-white', 'dark:bg-surface', 'text-text-primary', 'shadow-sm', 'border', 'border-surface-border');
            
            currentPeriod = parseInt(target.getAttribute('data-period'));
            renderTodoCalendar();
        });
    });
}

// Load and render TODO Load from JSON
async function loadTodoLoad() {
    const container = document.getElementById('todo-load-container');
    if (!container) return;
    
    try {
        const fetchUrl = window.location.protocol === 'file:' 
            ? '../Output/Logseq_TODO_List/todo_load.json' 
            : `../Output/Logseq_TODO_List/todo_load.json?t=${new Date().getTime()}`;
            
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`Failed to load todo_load.json`);
        }
        
        globalTodoData = await response.json();
        renderTodoCalendar();
        
    } catch (error) {
        console.error("Error loading TODO Load:", error);
        container.innerHTML = `<div class="text-error text-sm col-span-full">데이터를 불러오는 중 오류가 발생했습니다. (${error.toString()})</div>`;
    }
}

// (Skipping renderTodoCalendar since it's unmodified)

function renderTodoCalendar() {
    const container = document.getElementById('todo-load-container');
    if (!container) return;
    
    // Generate dates for the selected period (starting today)
    const dates = [];
    for (let i = 0; i < currentPeriod; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        dates.push(dateStr);
    }
    
    let html = '';
    
    dates.forEach((date, index) => {
        const dayData = globalTodoData[date] || {};
        const total = dayData.Total || 0;
        
        // Formatter for day string (e.g. "10.03")
        const dateObj = new Date(date);
        const displayDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getDay()];
        
        // Generate list items for each category
        let categoryHtml = '';
        const categories = ["Project", "Study", "Life", "Other"];
        
        categories.forEach(cat => {
            if (dayData[cat]) {
                const todo = dayData[cat].TODO || 0;
                const doing = dayData[cat].DOING || 0;
                
                if (todo > 0 || doing > 0) {
                    categoryHtml += `
                    <div class="flex flex-col py-1.5 border-b border-surface-border last:border-0">
                        <span class="text-[11px] font-bold text-text-primary mb-1">${cat}</span>
                        <div class="flex flex-wrap gap-2 text-[10px] text-text-secondary">
                            ${todo > 0 ? `<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-error"></span>T:${todo}</span>` : ''}
                            ${doing > 0 ? `<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>D:${doing}</span>` : ''}
                        </div>
                    </div>`;
                }
            }
        });
        
        if (!categoryHtml) {
            categoryHtml = '<div class="text-[11px] text-text-secondary py-2 italic text-center opacity-50">Empty</div>';
        }

        const isToday = (index === 0);
        const borderClass = isToday ? 'border-primary shadow-sm' : 'border-surface-border hover:border-primary/50';

        html += `
        <div class="bg-surface-container-lowest border ${borderClass} rounded-lg p-3 flex flex-col h-full transition-colors">
            <div class="flex items-center justify-between mb-3 border-b border-surface-border pb-2">
                <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-text-secondary uppercase">${dayOfWeek}</span>
                    <span class="text-sm font-bold text-text-primary tracking-tight">${displayDate}</span>
                </div>
                <span class="${total > 0 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-low text-text-secondary'} text-[10px] font-bold px-2 py-1 rounded-full">
                    ${total}
                </span>
            </div>
            <div class="flex flex-col gap-1 flex-grow">
                ${categoryHtml}
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

// Load and render Project Progress from data.yaml
async function loadProjectProgress() {
    const inProgressContainer = document.getElementById('projects-in-progress');
    
    try {
        const fetchUrl = window.location.protocol === 'file:' 
            ? '../data.yaml' 
            : `../data.yaml?t=${new Date().getTime()}`;
            
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error('Failed to load data.yaml');
        }
        
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        
        // Render In Progress Projects
        if (data.IN_PROGGRESS_PROJECT && Array.isArray(data.IN_PROGGRESS_PROJECT.value)) {
            renderProjects(data.IN_PROGGRESS_PROJECT.value, inProgressContainer, true);
        } else {
            inProgressContainer.innerHTML = '<div class="text-text-secondary text-sm">진행 중인 프로젝트가 없습니다.</div>';
        }
        
    } catch (error) {
        console.error("Error loading Progress data:", error);
        if (inProgressContainer) inProgressContainer.innerHTML = `<div class="text-error text-sm">프로젝트 데이터를 불러오지 못했습니다. (${error.toString()})</div>`;
    }
}

function renderProjects(projects, container, isInProgress) {
    if (projects.length === 0) {
        container.innerHTML = '<div class="text-text-secondary text-sm">해당 상태의 프로젝트가 없습니다.</div>';
        return;
    }
    
    let html = '';
    projects.forEach(project => {
        const name = project.name || "Unnamed Project";
        const url = project.url || "#";
        const attrs = project.attributes || {};
        const overview = attrs.Overview || "개요가 없습니다.";
        
        const badgeColor = isInProgress ? 'bg-primary text-on-primary' : 'bg-surface-border text-text-primary';
        const badgeText = isInProgress ? 'In Progress' : 'Completed';
        const barColor = isInProgress ? 'bg-primary' : 'bg-surface-border';
        
        html += `
        <div class="bg-surface-container-lowest border border-surface-border rounded-xl p-5 shadow-sm hover:border-primary transition-colors flex flex-col">
            <div class="flex items-start justify-between mb-3">
                <a href="${url}" target="_blank" class="text-lg font-bold text-text-primary hover:text-primary transition-colors">${name}</a>
                <span class="${badgeColor} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">${badgeText}</span>
            </div>
            <p class="text-text-secondary text-sm mb-4 line-clamp-2">${overview.replace(/^:\s*/, '')}</p>
            
            <div class="mt-auto">
                <div class="flex items-center justify-between text-xs mb-1">
                    <span class="text-text-secondary font-semibold">Progress</span>
                    <span class="text-text-primary font-bold">${isInProgress ? '50%' : '100%'}</span>
                </div>
                <div class="w-full bg-surface-container rounded-full h-1.5">
                    <div class="${barColor} h-1.5 rounded-full" style="width: ${isInProgress ? '50%' : '100%'}"></div>
                </div>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

// Load and render Obsidian Analysis Chart
async function loadObsidianChart() {
    const canvas = document.getElementById('obsidian-chart');
    if (!canvas) return;

    try {
        const fetchUrl = window.location.protocol === 'file:' 
            ? '../Insight/obsidian_analysis.json' 
            : `../Insight/obsidian_analysis.json?t=${new Date().getTime()}`;
            
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error('Failed to load obsidian_analysis.json');
        }
        
        const data = await response.json();
        
        const labels = data.map(item => {
            const dateObj = new Date(item.date);
            return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        });
        const counts = data.map(item => item.count);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Obsidian Documents',
                    data: counts,
                    backgroundColor: 'rgba(0, 104, 119, 0.7)',
                    borderColor: 'rgba(0, 104, 119, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: '#475569'
                        },
                        grid: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#475569'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
    } catch (error) {
        console.error("Error loading Obsidian Chart:", error);
        canvas.parentElement.innerHTML = `<div class="text-error text-sm flex flex-col items-center justify-center h-full gap-2"><span class="material-symbols-outlined">error</span>차트 데이터를 불러오지 못했습니다. (${error.message})</div>`;
    }
}
