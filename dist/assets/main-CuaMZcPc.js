(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const u of a.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&o(u)}).observe(document,{childList:!0,subtree:!0});function r(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=r(n);fetch(n.href,a)}})();let c={currentView:"projects",currentProject:null,currentModule:null,projects:[],modules:[]};async function d(t,e={}){const r=await fetch(`/api${t}`,{...e,headers:{"Content-Type":"application/json",...e.headers}});if(!r.ok)throw new Error(`API error: ${r.statusText}`);return r.json()}function v(t){window.location.hash=t}function y(){return window.location.hash.slice(1)||"/"}function b(t){const e=t.split("/").filter(r=>r);return e.length===0?{view:"projects"}:e[0]==="projects"&&e.length===1?{view:"projects"}:e[0]==="projects"&&e.length===2?{view:"modules",projectId:parseInt(e[1])}:e[0]==="modules"&&e.length===2?{view:"content",moduleId:parseInt(e[1])}:e[0]==="modules"&&e.length===3&&e[2]==="review"?{view:"review",moduleId:parseInt(e[1])}:{view:"projects"}}async function h(){const t=y(),e=b(t);c.currentView=e.view;try{e.view==="projects"?await m():e.view==="modules"?await p(e.projectId):e.view==="content"?await w(e.moduleId):e.view==="review"&&await g(e.moduleId)}catch(r){console.error("Route error:",r),s("Failed to load page: "+r.message)}}async function m(){const t=document.getElementById("app"),e=document.getElementById("breadcrumb");e.innerHTML="",t.innerHTML='<div class="loading">Loading projects...</div>';try{const r=await d("/projects");c.projects=r;let o=`
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
            <h3>${i(n.name)}</h3>
            <p>${n.description?i(n.description):"No description"}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${n.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${n.id})">Delete</button>
            </div>
          </div>
        `}),o+="</div>"),t.innerHTML=o}catch(r){s("Failed to load projects: "+r.message)}}async function p(t){const e=document.getElementById("app"),r=document.getElementById("breadcrumb");c.currentProject=t,e.innerHTML='<div class="loading">Loading modules...</div>';try{const o=await d(`/projects/${t}`);c.modules=o.modules||[],r.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${i(o.name)}</span>
    `;let n=`
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${i(o.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;o.description&&(n+=`<p style="margin-bottom: 2rem; color: #666;">${i(o.description)}</p>`),c.modules.length===0?n+=`
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `:(n+='<div class="list-view">',c.modules.forEach(a=>{n+=`
          <div class="list-item" onclick="navigate('/modules/${a.id}')">
            <h3>${i(a.name)}</h3>
            ${a.description?`<p>${i(a.description)}</p>`:""}
            <div class="list-item-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditModuleForm(${a.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteModule(${a.id})">Delete</button>
            </div>
          </div>
        `}),n+="</div>"),e.innerHTML=n}catch(o){s("Failed to load modules: "+o.message)}}async function w(t){const e=document.getElementById("app"),r=document.getElementById("breadcrumb");c.currentModule=t,e.innerHTML='<div class="loading">Loading module content...</div>';try{const o=await d(`/modules/${t}`);let n="Project",a=null;if(o.project_id){const u=await d(`/projects/${o.project_id}`);n=u.name,a=u.id,c.currentProject=a}r.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      ${a?`<a href="#/projects/${a}" onclick="navigate('/projects/${a}')">${i(n)}</a>`:`<span>${i(n)}</span>`}
      <span>/</span>
      <span>${i(o.name)}</span>
    `,e.innerHTML=`
      <a href="#/projects/${a}" class="back-link" onclick="navigate('/projects/${a}')">← Back to Modules</a>
      <div class="page-header">
        <h2>${i(o.name)}</h2>
      </div>
      ${o.description?`<p style="margin-bottom: 2rem; color: #666;">${i(o.description)}</p>`:""}

      ${o.summary?`
      <!-- Summary section -->
      <div class="module-summary">
        <h3>Summary</h3>
        <div class="summary-content">${T(o.summary)}</div>
      </div>
      `:""}

      <!-- Flashcard container -->
      <div id="flashcard-container"></div>

      <!-- FAQ container -->
      <div id="faq-container"></div>
    `,typeof FlashcardList<"u"&&FlashcardList.load(t),typeof FAQList<"u"&&FAQList.load(t)}catch(o){s("Failed to load module content: "+o.message)}}async function g(t){try{const e=await d(`/modules/${t}/flashcards`);if(e.length===0){s("No flashcards to review"),v(`/modules/${t}`);return}typeof ReviewMode<"u"?ReviewMode.start(t,e):s("Review mode not available")}catch(e){s("Failed to start review: "+e.message)}}function f(t,e){const r=document.getElementById("modal"),o=document.getElementById("modal-body");o.innerHTML=`
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
  `)}function $(t){const e=c.projects.find(r=>r.id===t);e&&f("Edit Project",`
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
  `)}async function M(t){t.preventDefault();const e=document.getElementById("project-name").value,r=document.getElementById("project-description").value;try{await d("/projects",{method:"POST",body:JSON.stringify({name:e,description:r||void 0})}),l(),await m()}catch(o){s("Failed to create project: "+o.message)}}async function P(t,e){t.preventDefault();const r=document.getElementById("project-name").value,o=document.getElementById("project-description").value;try{await d(`/projects/${e}`,{method:"PUT",body:JSON.stringify({name:r,description:o||void 0})}),l(),await m()}catch(n){s("Failed to update project: "+n.message)}}async function E(t){if(confirm("Are you sure you want to delete this project? This will also delete all modules and content."))try{await d(`/projects/${t}`,{method:"DELETE"}),await m()}catch(e){s("Failed to delete project: "+e.message)}}function L(){f("New Module",`
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
  `)}function F(t){const e=c.modules.find(r=>r.id===t);e&&f("Edit Module",`
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
  `)}async function k(t){t.preventDefault();const e=document.getElementById("module-name").value,r=document.getElementById("module-description").value;try{await d(`/projects/${c.currentProject}/modules`,{method:"POST",body:JSON.stringify({name:e,description:r||void 0})}),l(),await p(c.currentProject)}catch(o){s("Failed to create module: "+o.message)}}async function B(t,e){t.preventDefault();const r=document.getElementById("module-name").value,o=document.getElementById("module-description").value;try{await d(`/modules/${e}`,{method:"PUT",body:JSON.stringify({name:r,description:o||void 0})}),l(),await p(c.currentProject)}catch(n){s("Failed to update module: "+n.message)}}async function I(t){if(confirm("Are you sure you want to delete this module? This will also delete all flashcards and FAQs."))try{await d(`/modules/${t}`,{method:"DELETE"}),await p(c.currentProject)}catch(e){s("Failed to delete module: "+e.message)}}function i(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function T(t){return t?i(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/^## (.+)$/gm,"<h4>$1</h4>").replace(/^- \*\*([^*]+)\*\*(.*)$/gm,"<li><strong>$1</strong>$2</li>").replace(/---/g,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>"):""}function s(t){const e=document.getElementById("app");e.innerHTML=`
    <div class="error">
      <strong>Error:</strong> ${i(t)}
    </div>
    ${e.innerHTML}
  `}window.addEventListener("hashchange",h);document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("modal");t.querySelector(".close").addEventListener("click",l),t.addEventListener("click",r=>{r.target===t&&l()}),h()});window.navigate=v;window.showCreateProjectForm=j;window.showEditProjectForm=$;window.createProject=M;window.updateProject=P;window.deleteProject=E;window.showCreateModuleForm=L;window.showEditModuleForm=F;window.createModule=k;window.updateModule=B;window.deleteModule=I;window.hideModal=l;
