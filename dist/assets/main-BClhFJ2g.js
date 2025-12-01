(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&o(u)}).observe(document,{childList:!0,subtree:!0});function r(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(n){if(n.ep)return;n.ep=!0;const i=r(n);fetch(n.href,i)}})();let s={currentView:"projects",currentProject:null,currentModule:null,projects:[],modules:[]};async function d(t,e={}){const r=await fetch(`/api${t}`,{...e,headers:{"Content-Type":"application/json",...e.headers}});if(!r.ok)throw new Error(`API error: ${r.statusText}`);return r.json()}function v(t){window.location.hash=t}function h(){return window.location.hash.slice(1)||"/"}function g(t){const e=t.split("/").filter(r=>r);return e.length===0?{view:"projects"}:e[0]==="projects"&&e.length===1?{view:"projects"}:e[0]==="projects"&&e.length===2?{view:"modules",projectId:parseInt(e[1])}:e[0]==="modules"&&e.length===2?{view:"content",moduleId:parseInt(e[1])}:e[0]==="modules"&&e.length===3&&e[2]==="review"?{view:"review",moduleId:parseInt(e[1])}:{view:"projects"}}async function y(){const t=h(),e=g(t);s.currentView=e.view;try{e.view==="projects"?await m():e.view==="modules"?await p(e.projectId):e.view==="content"?await b(e.moduleId):e.view==="review"&&await w(e.moduleId)}catch(r){console.error("Route error:",r),c("Failed to load page: "+r.message)}}async function m(){const t=document.getElementById("app"),e=document.getElementById("breadcrumb");e.innerHTML="",t.innerHTML='<div class="loading">Loading projects...</div>';try{const r=await d("/projects");s.projects=r;let o=`
      <div class="page-header">
        <h2>Projects</h2>
        <button class="btn-primary" onclick="showCreateProjectForm()">New Project</button>
      </div>
    `;r.length===0?o+=`
        <div class="empty-state">
          <p>No projects yet</p>
          <button class="btn-primary" onclick="showCreateProjectForm()">Create Your First Project</button>
        </div>
      `:(o+='<div class="card-grid">',r.forEach(n=>{o+=`
          <div class="card" onclick="navigate('/projects/${n.id}')">
            <h3>${a(n.name)}</h3>
            <p>${n.description?a(n.description):"No description"}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${n.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${n.id})">Delete</button>
            </div>
          </div>
        `}),o+="</div>"),t.innerHTML=o}catch(r){c("Failed to load projects: "+r.message)}}async function p(t){const e=document.getElementById("app"),r=document.getElementById("breadcrumb");s.currentProject=t,e.innerHTML='<div class="loading">Loading modules...</div>';try{const o=await d(`/projects/${t}`);s.modules=o.modules||[],r.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${a(o.name)}</span>
    `;let n=`
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${a(o.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;o.description&&(n+=`<p style="margin-bottom: 2rem; color: #666;">${a(o.description)}</p>`),s.modules.length===0?n+=`
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `:(n+='<div class="list-view">',s.modules.forEach(i=>{n+=`
          <div class="list-item" onclick="navigate('/modules/${i.id}')">
            <h3>${a(i.name)}</h3>
            ${i.description?`<p>${a(i.description)}</p>`:""}
            <div class="list-item-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditModuleForm(${i.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteModule(${i.id})">Delete</button>
            </div>
          </div>
        `}),n+="</div>"),e.innerHTML=n}catch(o){c("Failed to load modules: "+o.message)}}async function b(t){const e=document.getElementById("app"),r=document.getElementById("breadcrumb");s.currentModule=t,e.innerHTML='<div class="loading">Loading module content...</div>';try{const o=await d(`/modules/${t}`);let n="Project",i=null;if(o.project_id){const u=await d(`/projects/${o.project_id}`);n=u.name,i=u.id,s.currentProject=i}r.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      ${i?`<a href="#/projects/${i}" onclick="navigate('/projects/${i}')">${a(n)}</a>`:`<span>${a(n)}</span>`}
      <span>/</span>
      <span>${a(o.name)}</span>
    `,e.innerHTML=`
      <a href="#/projects/${i}" class="back-link" onclick="navigate('/projects/${i}')">← Back to Modules</a>
      <div class="page-header">
        <h2>${a(o.name)}</h2>
      </div>
      ${o.description?`<p style="margin-bottom: 2rem; color: #666;">${a(o.description)}</p>`:""}

      ${o.summary?`
      <!-- Summary section -->
      <div class="module-summary">
        <div class="summary-header" onclick="toggleSummary()">
          <h3><span id="summary-icon">&#9654;</span> Summary</h3>
        </div>
        <div id="summary-content" class="summary-content hidden">${T(o.summary)}</div>
      </div>
      `:""}

      <!-- Flashcard container -->
      <div id="flashcard-container"></div>

      <!-- FAQ container -->
      <div id="faq-container"></div>
    `,typeof FlashcardList<"u"&&FlashcardList.load(t),typeof FAQList<"u"&&FAQList.load(t)}catch(o){c("Failed to load module content: "+o.message)}}async function w(t){try{const e=await d(`/modules/${t}/flashcards`);if(e.length===0){c("No flashcards to review"),v(`/modules/${t}`);return}typeof ReviewMode<"u"?ReviewMode.start(t,e):c("Review mode not available")}catch(e){c("Failed to start review: "+e.message)}}function f(t,e){const r=document.getElementById("modal"),o=document.getElementById("modal-body");o.innerHTML=`
    <h2 style="margin-bottom: 1.5rem;">${t}</h2>
    ${e}
  `,r.classList.add("show")}function l(){document.getElementById("modal").classList.remove("show")}function j(){f("New Project",`
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
  `)}function $(t){const e=s.projects.find(r=>r.id===t);e&&f("Edit Project",`
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
  `)}async function M(t){t.preventDefault();const e=document.getElementById("project-name").value,r=document.getElementById("project-description").value;try{await d("/projects",{method:"POST",body:JSON.stringify({name:e,description:r||void 0})}),l(),await m()}catch(o){c("Failed to create project: "+o.message)}}async function E(t,e){t.preventDefault();const r=document.getElementById("project-name").value,o=document.getElementById("project-description").value;try{await d(`/projects/${e}`,{method:"PUT",body:JSON.stringify({name:r,description:o||void 0})}),l(),await m()}catch(n){c("Failed to update project: "+n.message)}}async function P(t){if(confirm("Are you sure you want to delete this project? This will also delete all modules and content."))try{await d(`/projects/${t}`,{method:"DELETE"}),await m()}catch(e){c("Failed to delete project: "+e.message)}}function L(){f("New Module",`
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
  `)}function F(t){const e=s.modules.find(r=>r.id===t);e&&f("Edit Module",`
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
  `)}async function B(t){t.preventDefault();const e=document.getElementById("module-name").value,r=document.getElementById("module-description").value;try{await d(`/projects/${s.currentProject}/modules`,{method:"POST",body:JSON.stringify({name:e,description:r||void 0})}),l(),await p(s.currentProject)}catch(o){c("Failed to create module: "+o.message)}}async function I(t,e){t.preventDefault();const r=document.getElementById("module-name").value,o=document.getElementById("module-description").value;try{await d(`/modules/${e}`,{method:"PUT",body:JSON.stringify({name:r,description:o||void 0})}),l(),await p(s.currentProject)}catch(n){c("Failed to update module: "+n.message)}}async function k(t){if(confirm("Are you sure you want to delete this module? This will also delete all flashcards and FAQs."))try{await d(`/modules/${t}`,{method:"DELETE"}),await p(s.currentProject)}catch(e){c("Failed to delete module: "+e.message)}}function a(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function T(t){return t?a(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/^## (.+)$/gm,"<h4>$1</h4>").replace(/^- \*\*([^*]+)\*\*(.*)$/gm,"<li><strong>$1</strong>$2</li>").replace(/---/g,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>"):""}function C(){const t=document.getElementById("summary-content"),e=document.getElementById("summary-icon");t.classList.contains("hidden")?(t.classList.remove("hidden"),e.innerHTML="&#9660;"):(t.classList.add("hidden"),e.innerHTML="&#9654;")}function c(t){const e=document.getElementById("app");e.innerHTML=`
    <div class="error">
      <strong>Error:</strong> ${a(t)}
    </div>
    ${e.innerHTML}
  `}window.addEventListener("hashchange",y);document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("modal");t.querySelector(".close").addEventListener("click",l),t.addEventListener("click",r=>{r.target===t&&l()}),y()});window.navigate=v;window.showCreateProjectForm=j;window.showEditProjectForm=$;window.createProject=M;window.updateProject=E;window.deleteProject=P;window.showCreateModuleForm=L;window.showEditModuleForm=F;window.createModule=B;window.updateModule=I;window.deleteModule=k;window.hideModal=l;window.toggleSummary=C;
