(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function o(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=o(s);fetch(s.href,i)}})();let r={currentView:"projects",currentProject:null,currentModule:null,projects:[],modules:[],selectedModules:[]};async function l(t,e={}){const o=await fetch(`/api${t}`,{...e,headers:{"Content-Type":"application/json",...e.headers}});if(!o.ok)throw new Error(`API error: ${o.statusText}`);return o.json()}function g(t){try{const e=localStorage.getItem("gtl_selected_modules_"+t);return e?JSON.parse(e):[]}catch{return[]}}function y(t,e){localStorage.setItem("gtl_selected_modules_"+t,JSON.stringify(e)),r.selectedModules=e}function f(t){window.location.hash=t}function E(){return window.location.hash.slice(1)||"/"}function L(t){const e=t.split("/").filter(o=>o);return e.length===0?{view:"projects"}:e[0]==="projects"&&e.length===1?{view:"projects"}:e[0]==="projects"&&e.length===2?{view:"project-content",projectId:parseInt(e[1])}:e[0]==="projects"&&e.length===3&&e[2]==="review"?{view:"project-review",projectId:parseInt(e[1])}:e[0]==="modules"&&e.length===2?{view:"content",moduleId:parseInt(e[1])}:e[0]==="modules"&&e.length===3&&e[2]==="review"?{view:"review",moduleId:parseInt(e[1])}:{view:"projects"}}async function w(){const t=E(),e=L(t);r.currentView=e.view;try{e.view==="projects"?await h():e.view==="project-content"?await P(e.projectId):e.view==="project-review"?await B(e.projectId):e.view==="content"?await S(e.moduleId):e.view==="review"&&await k(e.moduleId)}catch(o){console.error("Route error:",o),d("Failed to load page: "+o.message)}}async function h(){const t=document.getElementById("app"),e=document.getElementById("breadcrumb");e.innerHTML="",t.innerHTML='<div class="loading">Loading projects...</div>';try{const o=await l("/projects");r.projects=o;let n=`
      <div class="page-header">
        <h2>Projects</h2>
        <button class="btn-primary" onclick="showCreateProjectForm()">New Project</button>
      </div>
    `;o.length===0?n+=`
        <div class="empty-state">
          <p>No projects yet</p>
          <button class="btn-primary" onclick="showCreateProjectForm()">Create Your First Project</button>
        </div>
      `:(n+='<div class="card-grid">',o.forEach(s=>{n+=`
          <div class="card" onclick="navigate('/projects/${s.id}')">
            <h3>${a(s.name)}</h3>
            <p>${s.description?a(s.description):"No description"}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${s.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${s.id})">Delete</button>
            </div>
          </div>
        `}),n+="</div>"),t.innerHTML=n}catch(o){d("Failed to load projects: "+o.message)}}async function P(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");r.currentProject=t,e.innerHTML='<div class="loading">Loading project content...</div>';try{const n=await l(`/projects/${t}`);r.modules=n.modules||[];const s=new Set(r.modules.map(m=>m.id));let i=g(t).filter(m=>s.has(m));i.length===0&&r.modules.length>0&&(i=r.modules.map(m=>m.id)),y(t,i),o.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${a(n.name)}</span>
    `;let c=`
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${a(n.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;n.description&&(c+='<p style="margin-bottom: 2rem; color: #666;">'+a(n.description)+"</p>"),r.modules.length===0?c+=`
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `:(c+=b(),c+='<div id="summary-container"></div>',c+='<div id="flashcard-container"></div>',c+='<div id="faq-container"></div>'),e.innerHTML=c,r.selectedModules.length>0&&(v(),typeof FlashcardList<"u"&&FlashcardList.loadMultiple(t,r.selectedModules),typeof FAQList<"u"&&FAQList.loadMultiple(t,r.selectedModules))}catch(n){d("Failed to load project content: "+n.message)}}function b(){if(r.modules.length===0)return"";const t=r.selectedModules.length===r.modules.length;let e='<div class="module-selector">';return e+='<div class="module-selector-header">',e+="<h3>Modules</h3>",e+='<button class="btn-secondary btn-small" onclick="toggleAllModules()">',e+=t?"Deselect All":"Select All",e+="</button>",e+="</div>",e+='<div class="module-checkboxes">',r.modules.forEach(o=>{const n=r.selectedModules.includes(o.id);e+='<div class="module-checkbox'+(n?" selected":"")+'" onclick="toggleModule('+o.id+')">',e+='<input type="checkbox"'+(n?" checked":"")+' onclick="event.stopPropagation(); toggleModule('+o.id+')">',e+="<label>"+a(o.name)+"</label>",e+='<button class="module-edit-btn" onclick="event.stopPropagation(); showEditModuleSummaryForm('+o.id+')" title="Edit summary">',e+='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',e+="</button>",e+="</div>"}),e+="</div>",e+="</div>",e}function $(t){const e=r.selectedModules.indexOf(t);e>-1?r.selectedModules.splice(e,1):r.selectedModules.push(t),y(r.currentProject,r.selectedModules),M()}function F(){r.selectedModules.length===r.modules.length?r.selectedModules=[]:r.selectedModules=r.modules.map(t=>t.id),y(r.currentProject,r.selectedModules),M()}function v(){const t=document.getElementById("summary-container");if(!t)return;const e=r.modules.filter(n=>r.selectedModules.includes(n.id)&&n.summary).sort((n,s)=>n.sort_order-s.sort_order);if(e.length===0){t.innerHTML="";return}let o='<div class="module-summary">';o+='<div class="summary-header" onclick="toggleSummary()">',o+='<h3><span id="summary-icon">&#9654;</span> Summary</h3>',o+="</div>",o+='<div id="summary-content" class="summary-content hidden">',e.forEach((n,s)=>{e.length>1&&(o+='<h4 style="color: #2563eb; margin-top: '+(s>0?"2rem":"0")+';">'+a(n.name)+"</h4>"),o+=j(n.summary)}),o+="</div></div>",t.innerHTML=o}function M(){const t=document.querySelector(".module-selector");if(t&&(t.outerHTML=b()),r.selectedModules.length>0)v(),typeof FlashcardList<"u"&&FlashcardList.loadMultiple(r.currentProject,r.selectedModules),typeof FAQList<"u"&&FAQList.loadMultiple(r.currentProject,r.selectedModules);else{const e=document.getElementById("summary-container"),o=document.getElementById("flashcard-container"),n=document.getElementById("faq-container");e&&(e.innerHTML=""),o&&(o.innerHTML=""),n&&(n.innerHTML="")}}async function S(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");r.currentModule=t,e.innerHTML='<div class="loading">Loading module content...</div>';try{const n=await l(`/modules/${t}`);let s="Project",i=null;if(n.project_id){const c=await l(`/projects/${n.project_id}`);s=c.name,i=c.id,r.currentProject=i}o.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      ${i?`<a href="#/projects/${i}" onclick="navigate('/projects/${i}')">${a(s)}</a>`:`<span>${a(s)}</span>`}
      <span>/</span>
      <span>${a(n.name)}</span>
    `,e.innerHTML=`
      <a href="#/projects/${i}" class="back-link" onclick="navigate('/projects/${i}')">← Back to Modules</a>
      <div class="page-header">
        <h2>${a(n.name)}</h2>
      </div>
      ${n.description?`<p style="margin-bottom: 2rem; color: #666;">${a(n.description)}</p>`:""}

      ${n.summary?`
      <!-- Summary section -->
      <div class="module-summary">
        <div class="summary-header" onclick="toggleSummary()">
          <h3><span id="summary-icon">&#9654;</span> Summary</h3>
        </div>
        <div id="summary-content" class="summary-content hidden">${j(n.summary)}</div>
      </div>
      `:""}

      <!-- Flashcard container -->
      <div id="flashcard-container"></div>

      <!-- FAQ container -->
      <div id="faq-container"></div>
    `,typeof FlashcardList<"u"&&FlashcardList.load(t),typeof FAQList<"u"&&FAQList.load(t)}catch(n){d("Failed to load module content: "+n.message)}}async function k(t){try{const e=await l(`/modules/${t}/flashcards`);if(e.length===0){d("No flashcards to review"),f(`/modules/${t}`);return}typeof ReviewMode<"u"?ReviewMode.start(t,e):d("Review mode not available")}catch(e){d("Failed to start review: "+e.message)}}async function B(t){try{const e=g(t);if(e.length===0){d("No modules selected for review"),f(`/projects/${t}`);return}const o=e.join(","),n=await l(`/projects/${t}/flashcards?modules=${o}`);if(n.length===0){d("No flashcards to review in selected modules"),f(`/projects/${t}`);return}typeof ReviewMode<"u"?ReviewMode.startWithProject(t,n):d("Review mode not available")}catch(e){d("Failed to start review: "+e.message)}}function p(t,e){const o=document.getElementById("modal"),n=document.getElementById("modal-body");n.innerHTML=`
    <h2 style="margin-bottom: 1.5rem;">${t}</h2>
    ${e}
  `,o.classList.add("show")}function u(){document.getElementById("modal").classList.remove("show")}function T(){p("New Project",`
    <form onsubmit="createProject(event)">
      <div class="form-group">
        <label for="project-name">Name *</label>
        <input type="text" id="project-name" required>
      </div>
      <div class="form-group">
        <label for="project-description">Description</label>
        <textarea id="project-description"></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Create</button>
      </div>
    </form>
  `)}function C(t){const e=r.projects.find(o=>o.id===t);e&&p("Edit Project",`
    <form onsubmit="updateProject(event, ${t})">
      <div class="form-group">
        <label for="project-name">Name *</label>
        <input type="text" id="project-name" value="${a(e.name)}" required>
      </div>
      <div class="form-group">
        <label for="project-description">Description</label>
        <textarea id="project-description">${e.description?a(e.description):""}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `)}async function I(t){t.preventDefault();const e=document.getElementById("project-name").value,o=document.getElementById("project-description").value;try{await l("/projects",{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),u(),await h()}catch(n){d("Failed to create project: "+n.message)}}async function N(t,e){t.preventDefault();const o=document.getElementById("project-name").value,n=document.getElementById("project-description").value;try{await l(`/projects/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:n||void 0})}),u(),await h()}catch(s){d("Failed to update project: "+s.message)}}async function H(t){const e=prompt("Enter password to delete this project (this will also delete all modules and content):");if(e)try{await l(`/projects/${t}`,{method:"DELETE",headers:{"X-Delete-Password":e}}),await h()}catch(o){d("Failed to delete project: "+o.message)}}function x(){p("New Module",`
    <form onsubmit="createModule(event)">
      <div class="form-group">
        <label for="module-name">Name *</label>
        <input type="text" id="module-name" required>
      </div>
      <div class="form-group">
        <label for="module-description">Description</label>
        <textarea id="module-description"></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Create</button>
      </div>
    </form>
  `)}function O(t){const e=r.modules.find(o=>o.id===t);e&&p("Edit Module",`
    <form onsubmit="updateModule(event, ${t})">
      <div class="form-group">
        <label for="module-name">Name *</label>
        <input type="text" id="module-name" value="${a(e.name)}" required>
      </div>
      <div class="form-group">
        <label for="module-description">Description</label>
        <textarea id="module-description">${e.description?a(e.description):""}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `)}async function A(t){t.preventDefault();const e=document.getElementById("module-name").value,o=document.getElementById("module-description").value;try{await l(`/projects/${r.currentProject}/modules`,{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),u(),await renderModuleList(r.currentProject)}catch(n){d("Failed to create module: "+n.message)}}async function D(t,e){t.preventDefault();const o=document.getElementById("module-name").value,n=document.getElementById("module-description").value;try{await l(`/modules/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:n||void 0})}),u(),await renderModuleList(r.currentProject)}catch(s){d("Failed to update module: "+s.message)}}function R(t){const e=r.modules.find(o=>o.id===t);e&&p("Edit Summary - "+a(e.name),`
    <form onsubmit="updateModuleSummary(event, ${t})">
      <div class="form-group">
        <label for="module-summary">Summary</label>
        <textarea id="module-summary" rows="15" placeholder="Use markdown-style formatting:
## Section Heading
**Bold text**
- Bullet points">${e.summary?a(e.summary):""}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `)}async function q(t,e){t.preventDefault();const o=document.getElementById("module-summary").value;try{await l(`/modules/${e}`,{method:"PUT",body:JSON.stringify({summary:o||void 0})}),u();const n=r.modules.find(s=>s.id===e);n&&(n.summary=o),v()}catch(n){d("Failed to update summary: "+n.message)}}async function _(t){const e=prompt("Enter password to delete this module (this will also delete all flashcards and FAQs):");if(e)try{await l(`/modules/${t}`,{method:"DELETE",headers:{"X-Delete-Password":e}}),await renderModuleList(r.currentProject)}catch(o){d("Failed to delete module: "+o.message)}}function a(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function j(t){return t?a(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/^## (.+)$/gm,"<h4>$1</h4>").replace(/^- \*\*([^*]+)\*\*(.*)$/gm,"<li><strong>$1</strong>$2</li>").replace(/---/g,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>"):""}function Q(){const t=document.getElementById("summary-content"),e=document.getElementById("summary-icon");t.classList.contains("hidden")?(t.classList.remove("hidden"),e.innerHTML="&#9660;"):(t.classList.add("hidden"),e.innerHTML="&#9654;")}function d(t){const e=document.getElementById("app");e.innerHTML=`
    <div class="error">
      <strong>Error:</strong> ${a(t)}
    </div>
    ${e.innerHTML}
  `}window.addEventListener("hashchange",w);document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("modal");t.querySelector(".close").addEventListener("click",u),t.addEventListener("click",o=>{o.target===t&&u()}),w()});window.navigate=f;window.showCreateProjectForm=T;window.showEditProjectForm=C;window.createProject=I;window.updateProject=N;window.deleteProject=H;window.showCreateModuleForm=x;window.showEditModuleForm=O;window.showEditModuleSummaryForm=R;window.createModule=A;window.updateModule=D;window.updateModuleSummary=q;window.deleteModule=_;window.hideModal=u;window.toggleSummary=Q;window.toggleModule=$;window.toggleAllModules=F;
