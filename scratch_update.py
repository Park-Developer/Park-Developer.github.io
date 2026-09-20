import json
import re

in_progress_data = [
    {
        "name": "AI 고속 학습",
        "attributes": {"Overview": ": LLM에 물어본 내용을 토대로 내가 모르는 개념과 앞으로 학습하면 좋을 내용들을 추천해주는 시스템", "Image": "", "Description": "", "Schedule": "", "Features": "", "TODO": "", "Reference": "", "Memo": "", "Result": ""}
    },
    {
        "name": "Github 블로그",
        "attributes": {"Overview": ": Notion과 Antigravity를 이용해서 만드는 AI 자동화 블로그", "Image": "https://prod-files-secure.s3.us-west-2.amazonaws.com/d32dd2bd-b4fe-40b6-a628-1097dbd2b359/bde1f377-b615-4d1b-b542-c32f6fcf13fe/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46627C2QI2H%2F20260920%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260920T114606Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIGGE%2By7ba6pwE58%2F3vlZDx875w9F6UNCdSSgTsO6vnfgAiEAtwK%2FQfWqQAE3q3MllErlERw4DAAKC0tfjxUAOK9%2BvI0q%2FwMIdBAAGgw2Mzc0MjMxODM4MDUiDEtoO829dbBVFBisYircA5z2g8VhLy8T%2FUQ6fg00k96fXmpSRn3TTGdIVVXLdkYEK4GXa4rL4eJo70yd8SGW2NvFDB1QLaOKwM2aeYyFzXrtlzLl6v8X1UkHZqKCqEte8CtQCPpb%2FFnk2ONnEsZ9PyVXutnbVJVUwqSpIuKlzTOv3h%2Bo7m4u%2FBJDRc2bA%2FYWIU%2FauCDS%2F5o5PvBx1nD2hIZZrcA4X6G4SrOQ4iCi3%2FLRqY0SCRaSgz7XpCpKuhXlcZ5aZDIi0pIHdxFO6PUHFK5vKjY4gpAUmq%2FgurvTbw0axDOOpp37aBCXi72oLqL%2Fi6R0RcFYh%2BEBjcRopyTTCJqWg%2FCS6VhtxpvDsWzPOG1sCYzWieF7WwYlDQvfOBvqSSEMCYuIGRdmNpWLCEUqI0CWglmaqu4JAau1xOT8YxZW3s18w5LdBJP7BDlG1MMYj3KItMW%2BJszP%2BAAxpHfJTIcYzp64pYWwdyDU4dby9mIE%2FwW%2BOLuexuMga6af4MK1HiUVs8ZlGjMUukL1cjbNTL2j082s644DXP8f8p9qCo42szWJNF8lWB2IENeJNaKAZ%2BO8M0CVs%2FRO1Utu7oppeZzjppfqcimL5MuLTFqwswfY7jCo9J63IyVbI0ThTAT2BLH6HYJyuHA0QaIUMKz8vtUGOqUBlBdamhxb8muWaQ9UgU4pRB4RFOZ06Ujmk%2F3P2xdPH0idUZk6HVa6alU2JA%2BvnPgXSGDEb4vtEnmLMduza5D3HqCITlVHvSCP4FryFsoGOIVpPnvGIRoHyQnUQPt%2FjtYH40hGvo8HBNFh2n0BW1bY0OfjjvG7sklCsYmshBfyrlOrs96YHbK%2BpCdBGIQi3Xyi9Mm2nFXFg3kgR8EhpWO1j25Z52O1&X-Amz-Signature=70d252a058fc4529150790beb7a25be979e5c37ba3e0e3dbc84d6d74234bafc4&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject", "Description": "", "Schedule": "", "Features": "", "TODO": "- [ ] linkedin 수정하기 \\n- [ ] notion open 링크 만들기\\n- [ ] 자동화율 표\\n- [ ] antigravity schedule task 이요\\n- [ ] Notion에 있는 데이터를 불러와서 data.yaml 파일에 연결시키기, html에 class를 설정해서 이 class를 이용해서 데이터가 매칭되도록 하기\\n- [ ] TODO List 정리하고, 일별 Load 계산까지 되도록 하기\\n- [ ] 스킬에서 참조하는 링크나 local address들은 config.yaml에 저장하기\\n- [ ] 모든 링크 및 로컬 디렉토리는 config.yaml 파일에 저장하기", "Reference": "[Github.io 블로그에 Google Analytics 적용하기](https://mino1982.tistory.com/39?category=1184394)", "Memo": ": 개인정보나 프로젝트 정보들은 공개 가능한 노션 page를 따로 만둘고, github에는 링크를 연결해두는게 작업하기 편할듯함", "Result": ""}
    }
]

completed_data = [
    {
        "name": "Logseq View V0",
        "attributes": {"Overview": ": Logseq를 이용한 TODO 관리 프로그램", "Image": "", "Description": "- Github : [https://github.com/Park-Developer/Logseq_Viewer](https://github.com/Park-Developer/Logseq_Viewer)\\n- 어디에서나 사용하기 좋음", "Schedule": "", "Features": "", "TODO": "- [ ] Today 랑 Tomorrow도 반영하기", "Reference": "", "Memo": "- pyinstaller 명령어\\n\\t`ash\\npyinstaller -w -F --icon=icon.ico -n logViewer main.py\\n\\t`\\n- pyinstasller 명령어\\n\\t`javascript\\npyinstaller -w -F --icon=Image\\\\icon.ico -n logViewer main.py\\n\\t`", "Result": ""}
    }
]

def make_cards(data_list):
    cards = []
    for p in data_list:
        attr_json = json.dumps(p['attributes'], ensure_ascii=False).replace("'", "&#39;")
        card = f'''<div class="project-card bg-surface-container-lowest border border-surface-border shadow-sm rounded-lg p-sm flex flex-col transition-all glow-hover group relative overflow-hidden cursor-pointer" data-attributes=\\'{attr_json}\\'>
<div class="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div class="relative z-10 flex flex-col h-full">
<div class="w-full h-48 bg-surface-container-low rounded mb-sm overflow-hidden flex items-center justify-center bg-[#1e293b]">
  <span class="material-symbols-outlined text-[64px] text-[#475569]">folder</span>
</div>
<h3 class="font-headline-md text-headline-md text-text-primary mb-base group-hover:text-primary transition-colors">{p['name']}</h3>
<p class="text-text-secondary mb-sm flex-grow"></p>
<div class="flex flex-wrap gap-xs mb-md">

</div>
<div class="flex items-center justify-between border-t border-surface-border pt-sm mt-auto">
<a class="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]">code</span>
<span class="font-label-sm text-label-sm uppercase">GitHub</span>
</a>
</div>
</div>
</div>'''
        cards.append(card)
    return "\\n".join(cards)

with open('C:/WH_Project/Github_IO/UI/projects.html', 'r', encoding='utf-8') as f:
    html = f.read()

in_progress_html = make_cards(in_progress_data)
completed_html = make_cards(completed_data)

html = re.sub(
    r'(<div class="project-section" data-category="in-progress">\\s*<h2[^>]+>In Progress</h2>\\s*<div class="grid[^>]+>\\s*)(.*?)(?=</div>\\s*</div>\\s*<div class="project-section" data-category="stop")',
    r'\\g<1>' + in_progress_html + '\\n',
    html,
    flags=re.DOTALL
)

html = re.sub(
    r'(<div class="project-section" data-category="completed">\\s*<h2[^>]+>Completed</h2>\\s*<div class="grid[^>]+>\\s*)(.*?)(?=</div>\\s*</div>\\s*</main>)',
    r'\\g<1>' + completed_html + '\\n',
    html,
    flags=re.DOTALL
)

with open('C:/WH_Project/Github_IO/UI/projects.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Done")
