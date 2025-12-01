(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const u of a.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&n(u)}).observe(document,{childList:!0,subtree:!0});function o(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(r){if(r.ep)return;r.ep=!0;const a=o(r);fetch(r.href,a)}})();let s={currentView:"projects",currentProject:null,currentModule:null,projects:[],modules:[]};async function d(t,e={}){const o=await fetch(`/api${t}`,{...e,headers:{"Content-Type":"application/json",...e.headers}});if(!o.ok)throw new Error(`API error: ${o.statusText}`);return o.json()}function v(t){window.location.hash=t}function y(){return window.location.hash.slice(1)||"/"}function w(t){const e=t.split("/").filter(o=>o);return e.length===0?{view:"projects"}:e[0]==="projects"&&e.length===1?{view:"projects"}:e[0]==="projects"&&e.length===2?{view:"modules",projectId:parseInt(e[1])}:e[0]==="modules"&&e.length===2?{view:"content",moduleId:parseInt(e[1])}:e[0]==="modules"&&e.length===3&&e[2]==="review"?{view:"review",moduleId:parseInt(e[1])}:{view:"projects"}}async function h(){const t=y(),e=w(t);s.currentView=e.view;try{e.view==="projects"?await m():e.view==="modules"?await p(e.projectId):e.view==="content"?await g(e.moduleId):e.view==="review"&&await b(e.moduleId)}catch(o){console.error("Route error:",o),c("Failed to load page: "+o.message)}}async function m(){const t=document.getElementById("app"),e=document.getElementById("breadcrumb");e.innerHTML="",t.innerHTML='<div class="loading">Loading projects...</div>';try{const o=await d("/projects");s.projects=o;let n=`
      <div class="page-header">
        <h2>Projects</h2>
        <button class="btn-primary" onclick="showCreateProjectForm()">New Project</button>
      </div>
    `;o.length===0?n+=`
        <div class="empty-state">
          <p>No projects yet</p>
          <button class="btn-primary" onclick="showCreateProjectForm()">Create Your First Project</button>
        </div>
      `:(n+='<div class="card-grid">',o.forEach(r=>{n+=`
          <div class="card" onclick="navigate('/projects/${r.id}')">
            <h3>${i(r.name)}</h3>
            <p>${r.description?i(r.description):"No description"}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${r.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${r.id})">Delete</button>
            </div>
          </div>
        `}),n+="</div>"),t.innerHTML=n}catch(o){c("Failed to load projects: "+o.message)}}async function p(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");s.currentProject=t,e.innerHTML='<div class="loading">Loading modules...</div>';try{const n=await d(`/projects/${t}`);s.modules=n.modules||[],o.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${i(n.name)}</span>
    `;let r=`
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${i(n.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;n.description&&(r+=`<p style="margin-bottom: 2rem; color: #666;">${i(n.description)}</p>`),s.modules.length===0?r+=`
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `:(r+='<div class="list-view">',s.modules.forEach(a=>{r+=`
          <div class="list-item" onclick="navigate('/modules/${a.id}')">
            <h3>${i(a.name)}</h3>
            ${a.description?`<p>${i(a.description)}</p>`:""}
            <div class="list-item-actions">
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteModule(${a.id})">Delete</button>
            </div>
          </div>
        `}),r+="</div>"),e.innerHTML=r}catch(n){c("Failed to load modules: "+n.message)}}async function g(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");s.currentModule=t,e.innerHTML='<div class="loading">Loading module content...</div>';try{const n=await d(`/modules/${t}`);let r="Project",a=null;if(n.project_id){const u=await d(`/projects/${n.project_id}`);r=u.name,a=u.id,s.currentProject=a}o.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      ${a?`<a href="#/projects/${a}" onclick="navigate('/projects/${a}')">${i(r)}</a>`:`<span>${i(r)}</span>`}
      <span>/</span>
      <span>${i(n.name)}</span>
    `,e.innerHTML=`
      <a href="#/projects/${a}" class="back-link" onclick="navigate('/projects/${a}')">← Back to Modules</a>
      <div class="page-header">
        <h2>${i(n.name)}</h2>
      </div>
      ${n.description?`<p style="margin-bottom: 2rem; color: #666;">${i(n.description)}</p>`:""}

      ${n.summary?`
      <!-- Summary section -->
      <div class="module-summary">
        <div class="summary-header" onclick="toggleSummary()">
          <h3><span id="summary-icon">&#9654;</span> Summary</h3>
        </div>
        <div id="summary-content" class="summary-content hidden">${T(n.summary)}</div>
      </div>
      `:""}

      <!-- Flashcard container -->
      <div id="flashcard-container"></div>

      <!-- FAQ container -->
      <div id="faq-container"></div>
    `,typeof FlashcardList<"u"&&FlashcardList.load(t),typeof FAQList<"u"&&FAQList.load(t)}catch(n){c("Failed to load module content: "+n.message)}}async function b(t){try{const e=await d(`/modules/${t}/flashcards`);if(e.length===0){c("No flashcards to review"),v(`/modules/${t}`);return}typeof ReviewMode<"u"?ReviewMode.start(t,e):c("Review mode not available")}catch(e){c("Failed to start review: "+e.message)}}function f(t,e){const o=document.getElementById("modal"),n=document.getElementById("modal-body");n.innerHTML=`
    <h2 style="margin-bottom: 1.5rem;">${t}</h2>
    ${e}
  `,o.classList.add("show")}function l(){document.getElementById("modal").classList.remove("show")}function j(){f("New Project",`
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
  `)}function $(t){const e=s.projects.find(o=>o.id===t);e&&f("Edit Project",`
    <form onsubmit="updateProject(event, ${t})">
      <div class="form-group">
        <label for="project-name">Name *</label>
        <input type="text" id="project-name" value="${i(e.name)}" required>
      </div>
      <div class="form-group">
        <label for="project-description">Description</label>
        <textarea id="project-description">${e.description?i(e.description):""}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `)}async function M(t){t.preventDefault();const e=document.getElementById("project-name").value,o=document.getElementById("project-description").value;try{await d("/projects",{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),l(),await m()}catch(n){c("Failed to create project: "+n.message)}}async function E(t,e){t.preventDefault();const o=document.getElementById("project-name").value,n=document.getElementById("project-description").value;try{await d(`/projects/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:n||void 0})}),l(),await m()}catch(r){c("Failed to update project: "+r.message)}}async function P(t){const e=prompt("Enter password to delete this project (this will also delete all modules and content):");if(e)try{await d(`/projects/${t}`,{method:"DELETE",headers:{"X-Delete-Password":e}}),await m()}catch(o){c("Failed to delete project: "+o.message)}}function L(){f("New Module",`
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
  `)}function F(t){const e=s.modules.find(o=>o.id===t);e&&f("Edit Module",`
    <form onsubmit="updateModule(event, ${t})">
      <div class="form-group">
        <label for="module-name">Name *</label>
        <input type="text" id="module-name" value="${i(e.name)}" required>
      </div>
      <div class="form-group">
        <label for="module-description">Description</label>
        <textarea id="module-description">${e.description?i(e.description):""}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `)}async function B(t){t.preventDefault();const e=document.getElementById("module-name").value,o=document.getElementById("module-description").value;try{await d(`/projects/${s.currentProject}/modules`,{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),l(),await p(s.currentProject)}catch(n){c("Failed to create module: "+n.message)}}async function I(t,e){t.preventDefault();const o=document.getElementById("module-name").value,n=document.getElementById("module-description").value;try{await d(`/modules/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:n||void 0})}),l(),await p(s.currentProject)}catch(r){c("Failed to update module: "+r.message)}}async function k(t){const e=prompt("Enter password to delete this module (this will also delete all flashcards and FAQs):");if(e)try{await d(`/modules/${t}`,{method:"DELETE",headers:{"X-Delete-Password":e}}),await p(s.currentProject)}catch(o){c("Failed to delete module: "+o.message)}}function i(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function T(t){return t?i(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/^## (.+)$/gm,"<h4>$1</h4>").replace(/^- \*\*([^*]+)\*\*(.*)$/gm,"<li><strong>$1</strong>$2</li>").replace(/---/g,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>"):""}function C(){const t=document.getElementById("summary-content"),e=document.getElementById("summary-icon");t.classList.contains("hidden")?(t.classList.remove("hidden"),e.innerHTML="&#9660;"):(t.classList.add("hidden"),e.innerHTML="&#9654;")}function c(t){const e=document.getElementById("app");e.innerHTML=`
    <div class="error">
      <strong>Error:</strong> ${i(t)}
    </div>
    ${e.innerHTML}
  `}window.addEventListener("hashchange",h);document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("modal");t.querySelector(".close").addEventListener("click",l),t.addEventListener("click",o=>{o.target===t&&l()}),h()});window.navigate=v;window.showCreateProjectForm=j;window.showEditProjectForm=$;window.createProject=M;window.updateProject=E;window.deleteProject=P;window.showCreateModuleForm=L;window.showEditModuleForm=F;window.createModule=B;window.updateModule=I;window.deleteModule=k;window.hideModal=l;window.toggleSummary=C;
