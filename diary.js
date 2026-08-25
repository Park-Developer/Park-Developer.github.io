const diaryEntries = [
    {
        id: '1',
        date: 'OCT 24, 2024',
        icon: 'light_mode',
        iconColor: 'text-[#00b4d8]',
        title: 'The Refactoring Plateau',
        content: `Hit a wall today trying to untangle the legacy auth service. Sometimes it feels like pulling one thread unravels the entire sweater. Decided to step back, write some tests first, and tackle it piece by piece tomorrow. The 'clean architecture' dream is messy in reality.`,
        tags: ['Refactoring', 'LegacyCode', 'React']
    },
    {
        id: '2',
        date: 'OCT 22, 2024',
        icon: 'bolt',
        iconColor: 'text-[#732ee4]',
        title: 'A Eureka Moment',
        content: `Finally cracked the caching invalidation bug that's been haunting production for a week. Turns out it was a race condition in the Redis pub/sub mechanism. The relief is palpable. Celebrated with an extra shot of espresso.
        
        <div class="mt-4 bg-[#f1f5f9] dark:bg-[#0f172a] p-3 rounded text-sm text-[#475569] dark:text-[#94a3b8] font-mono whitespace-pre overflow-x-auto">
// The fix was deceptively simple
await cache.invalidate(key, { 
  force: true 
});
        </div>`,
        tags: ['Redis', 'Debugging', 'NestJS']
    },
    {
        id: '3',
        date: 'OCT 19, 2024',
        icon: 'rainy',
        iconColor: 'text-[#94a3b8]',
        title: 'Imposter Syndrome Flare-up',
        content: `Sat in a system design review today and felt completely out of my depth discussing distributed consensus algorithms. It's easy to forget that everyone is learning. Need to dedicate some study time to Paxos/Raft this weekend to build confidence.`,
        tags: ['SystemDesign', 'Study', 'github']
    },
    {
        id: '4',
        date: 'OCT 15, 2024',
        icon: 'light_mode',
        iconColor: 'text-[#00b4d8]',
        title: 'Mentoring Wins',
        content: `Spent the afternoon pairing with our new junior dev on React hooks. Seeing the "aha!" moment when useEffect dependencies finally made sense to them was incredibly rewarding. It reinforces my own understanding too.`,
        tags: ['Mentoring', 'React', 'nextjs']
    }
];

// Helper to count tags
function getTagCounts() {
    const counts = { '전체보기': diaryEntries.length };
    diaryEntries.forEach(entry => {
        entry.tags.forEach(tag => {
            counts[tag] = (counts[tag] || 0) + 1;
        });
    });
    return counts;
}

let activeTag = '전체보기';

function renderTags() {
    const container = document.getElementById('tags-container');
    const counts = getTagCounts();
    
    // Convert to array and sort (keeping '전체보기' first)
    const tagList = Object.keys(counts).sort((a, b) => {
        if (a === '전체보기') return -1;
        if (b === '전체보기') return 1;
        return counts[b] - counts[a]; // Sort by count descending
    });

    container.innerHTML = tagList.map(tag => {
        const isActive = tag === activeTag;
        const count = counts[tag];
        
        const baseClasses = "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors";
        const activeClasses = isActive 
            ? "bg-[#006877] text-white" 
            : "bg-[#f1f5f9] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8] hover:bg-[#e2e8f0] dark:hover:bg-[#334155]";

        return \`
            <div class="\${baseClasses} \${activeClasses}" onclick="filterByTag('\${tag}')">
                \${tag} (\${count})
            </div>
        \`;
    }).join('');
}

function renderEntries(searchTerm = '') {
    const container = document.getElementById('diary-grid');
    
    let filtered = diaryEntries;
    
    // Filter by tag
    if (activeTag !== '전체보기') {
        filtered = filtered.filter(entry => entry.tags.includes(activeTag));
    }
    
    // Filter by search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(entry => 
            entry.title.toLowerCase().includes(lowerTerm) || 
            entry.content.toLowerCase().includes(lowerTerm) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerTerm))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = \`<div class="col-span-full py-12 text-center text-[#94a3b8]">검색 결과가 없습니다.</div>\`;
        return;
    }

    container.innerHTML = filtered.map(entry => {
        return \`
            <article class="break-inside-avoid mb-6 bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#475569] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[11px] font-bold text-[#64748b] tracking-wider font-mono">\${entry.date}</span>
                    <span class="material-symbols-outlined text-[20px] \${entry.iconColor}">\${entry.icon}</span>
                </div>
                <h3 class="text-xl font-bold text-[#0f172a] dark:text-white mb-3">\${entry.title}</h3>
                <div class="text-[#475569] dark:text-[#94a3b8] text-[15px] leading-relaxed mb-6">
                    \${entry.content}
                </div>
                <div class="flex flex-wrap gap-2">
                    \${entry.tags.map(tag => \`
                        <span class="text-[12px] font-medium text-[#64748b] bg-[#f8fafc] dark:bg-[#0f172a] px-2 py-1 rounded">#\${tag}</span>
                    \`).join('')}
                </div>
            </article>
        \`;
    }).join('');
}

// Global functions for event handlers
window.filterByTag = (tag) => {
    activeTag = tag;
    renderTags();
    const searchInput = document.getElementById('search-input');
    renderEntries(searchInput.value);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTags();
    renderEntries();

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        renderEntries(e.target.value);
    });
});
