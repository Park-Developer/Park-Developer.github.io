import glob
import re
import os

css_overrides = """
<style>
    /* Dark Mode Overrides */
    .dark .bg-background { background-color: #0f172a !important; }
    .dark .text-on-background { color: #e2e8f0 !important; }
    .dark .bg-surface-container-lowest { background-color: #1e293b !important; }
    .dark .bg-surface-container-low { background-color: #334155 !important; }
    .dark .bg-surface-container { background-color: #1e293b !important; }
    .dark .text-text-primary { color: #f8fafc !important; }
    .dark .text-text-secondary { color: #94a3b8 !important; }
    .dark .text-on-surface { color: #f1f5f9 !important; }
    .dark .border-surface-border { border-color: #475569 !important; }
    .dark .bg-code-bg { background-color: #020617 !important; }
    .dark .bg-surface-variant { background-color: #334155 !important; }
    .dark .text-primary { color: #22d3ee !important; }
    .dark .border-primary { border-color: #22d3ee !important; }
    .dark iframe { background-color: #0f172a !important; color-scheme: dark; }
</style>
"""

script_replacement = """
    // Theme toggle logic
    (function() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        const themeIcon = themeToggle.tagName.toLowerCase() === 'span' ? themeToggle : themeToggle.querySelector('span');
        
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeIcon) themeIcon.textContent = 'light_mode';
        }

        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                if (themeIcon) themeIcon.textContent = 'dark_mode';
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                if (themeIcon) themeIcon.textContent = 'light_mode';
                localStorage.setItem('theme', 'dark');
            }
        });
    })();
"""

for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    if '/* Dark Mode Overrides */' not in content:
        content = content.replace('</head>', css_overrides + '\n</head>')
        changed = True

    # Regex to match the different variations of the old theme toggle logic
    # We use non-greedy matching .*? up to the closing }); or similar
    pattern1 = r'// Theme toggle logic \(basic\)\s*const themeToggle = document\.getElementById\(\'theme-toggle\'\);\s*themeToggle\.addEventListener\(\'click\', \(\) => \{.*?\}\);\s*'
    
    pattern2 = r'// Theme toggle logic \(basic\)\s*const themeToggle = document\.getElementById\(\'theme-toggle\'\);\s*if \(themeToggle\) \{.*?\}\);\s*\}\s*'
    
    pattern3 = r'// Theme toggle logic\s*const themeToggle = document\.getElementById\(\'theme-toggle\'\);\s*const themeIcon = themeToggle\.querySelector\(\'span\'\);\s*themeToggle\.addEventListener\(\'click\', \(\) => \{.*?\}\);\s*'

    if re.search(pattern1, content, re.DOTALL):
        content = re.sub(pattern1, script_replacement, content, flags=re.DOTALL)
        changed = True
    elif re.search(pattern2, content, re.DOTALL):
        content = re.sub(pattern2, script_replacement, content, flags=re.DOTALL)
        changed = True
    elif re.search(pattern3, content, re.DOTALL):
        content = re.sub(pattern3, script_replacement, content, flags=re.DOTALL)
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
