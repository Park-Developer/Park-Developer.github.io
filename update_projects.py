import json
import re

with open('projects_data.json', 'r', encoding='utf-8') as f:
    projects = json.load(f)

groups = {
    "Not Started": [],
    "In Progress": [],
    "Stop": [],
    "Completed": []
}

for p in projects:
    s = p['status']
    if s == "Not started":
        groups["Not Started"].append(p)
    elif s == "In progress":
        groups["In Progress"].append(p)
    elif s == "STOP":
        groups["Stop"].append(p)
    elif s == "Done" or s == "Completed":
        groups["Completed"].append(p)

def generate_card(title, tags):
    tags_html = "".join([f'<span class="font-label-sm text-label-sm bg-surface-container-low px-2 py-1 rounded text-text-secondary uppercase">{t}</span>\n' for t in tags])
    return f"""
<div class="bg-surface-container-lowest border border-surface-border shadow-sm rounded-lg p-sm flex flex-col transition-all glow-hover group relative overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div class="relative z-10 flex flex-col h-full">
<div class="w-full h-48 bg-surface-container-low rounded mb-sm overflow-hidden flex items-center justify-center bg-[#1e293b]">
  <span class="material-symbols-outlined text-[64px] text-[#475569]">folder</span>
</div>
<h3 class="font-headline-md text-headline-md text-text-primary mb-base group-hover:text-primary transition-colors">{title}</h3>
<p class="text-text-secondary mb-sm flex-grow"></p>
<div class="flex flex-wrap gap-xs mb-md">
{tags_html}
</div>
<div class="flex items-center justify-between border-t border-surface-border pt-sm mt-auto">
<a class="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]">code</span>
<span class="font-label-sm text-label-sm uppercase">GitHub</span>
</a>
</div>
</div>
</div>
"""

new_grid_html = "<!-- Projects Grid -->\n"

for group_name in ["In Progress", "Not Started", "Stop", "Completed"]:
    items = groups[group_name]
    if not items:
        continue
    new_grid_html += f'<h2 class="font-headline-lg text-headline-lg text-text-primary mt-lg mb-md">{group_name}</h2>\n'
    new_grid_html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">\n'
    for p in items:
        new_grid_html += generate_card(p['title'], p['tags'])
    new_grid_html += '</div>\n'

with open('projects.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<!-- Projects Grid -->.*?(?=</main>)', re.DOTALL)
new_content = pattern.sub(new_grid_html, content)

with open('projects.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
