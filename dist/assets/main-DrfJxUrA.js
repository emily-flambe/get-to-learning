(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();let c={currentView:"projects",currentProject:null,currentModule:null,projects:[],modules:[]};async function d(t,e={}){const n=await fetch(`/api${t}`,{...e,headers:{"Content-Type":"application/json",...e.headers}});if(!n.ok)throw new Error(`API error: ${n.statusText}`);return n.json()}function v(t){window.location.hash=t}function b(){return window.location.hash.slice(1)||"/"}function w(t){const e=t.split("/").filter(n=>n);return e.length===0?{view:"projects"}:e[0]==="projects"&&e.length===1?{view:"projects"}:e[0]==="projects"&&e.length===2?{view:"modules",projectId:parseInt(e[1])}:e[0]==="modules"&&e.length===2?{view:"content",moduleId:parseInt(e[1])}:e[0]==="modules"&&e.length===3&&e[2]==="review"?{view:"review",moduleId:parseInt(e[1])}:{view:"projects"}}async function h(){const t=b(),e=w(t);c.currentView=e.view;try{e.view==="projects"?await m():e.view==="modules"?await p(e.projectId):e.view==="content"?await y(e.moduleId):e.view==="review"&&await g(e.moduleId)}catch(n){console.error("Route error:",n),s("Failed to load page: "+n.message)}}async function m(){const t=document.getElementById("app"),e=document.getElementById("breadcrumb");e.innerHTML="",t.innerHTML='<div class="loading">Loading projects...</div>';try{const n=await d("/projects");c.projects=n;let r=`
      <div class="page-header">
        <h2>Projects</h2>
        <button class="btn-primary" onclick="showCreateProjectForm()">New Project</button>
      </div>
    `;n.length===0?r+=`
        <div class="empty-state">
          <p>No projects yet</p>
          <button class="btn-primary" onclick="showCreateProjectForm()">Create Your First Project</button>
        </div>
      `:(r+='<div class="card-grid">',n.forEach(o=>{r+=`
          <div class="card" onclick="navigate('/projects/${o.id}')">
            <h3>${a(o.name)}</h3>
            <p>${o.description?a(o.description):"No description"}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${o.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${o.id})">Delete</button>
            </div>
          </div>
        `}),r+="</div>"),t.innerHTML=r}catch(n){s("Failed to load projects: "+n.message)}}async function p(t){const e=document.getElementById("app"),n=document.getElementById("breadcrumb");c.currentProject=t,e.innerHTML='<div class="loading">Loading modules...</div>';try{const r=await d(`/projects/${t}`);c.modules=r.modules||[],n.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${a(r.name)}</span>
    `;let o=`
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${a(r.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;r.description&&(o+=`<p style="margin-bottom: 2rem; color: #666;">${a(r.description)}</p>`),c.modules.length===0?o+=`
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `:(o+='<div class="list-view">',c.modules.forEach(i=>{o+=`
          <div class="list-item" onclick="navigate('/modules/${i.id}')">
            <h3>${a(i.name)}</h3>
            ${i.description?`<p>${a(i.description)}</p>`:""}
            <div class="list-item-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditModuleForm(${i.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteModule(${i.id})">Delete</button>
            </div>
          </div>
        `}),o+="</div>"),e.innerHTML=o}catch(r){s("Failed to load modules: "+r.message)}}async function y(t){const e=document.getElementById("app"),n=document.getElementById("breadcrumb");c.currentModule=t,e.innerHTML='<div class="loading">Loading module content...</div>';try{const r=await d(`/modules/${t}`);let o="Project",i=null;if(r.project_id){const u=await d(`/projects/${r.project_id}`);o=u.name,i=u.id,c.currentProject=i}n.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      ${i?`<a href="#/projects/${i}" onclick="navigate('/projects/${i}')">${a(o)}</a>`:`<span>${a(o)}</span>`}
      <span>/</span>
      <span>${a(r.name)}</span>
    `,e.innerHTML=`
      <a href="#/projects/${i}" class="back-link" onclick="navigate('/projects/${i}')">← Back to Modules</a>
      <div class="page-header">
        <h2>${a(r.name)}</h2>
      </div>
      ${r.description?`<p style="margin-bottom: 2rem; color: #666;">${a(r.description)}</p>`:""}

      <!-- Flashcard container -->
      <div id="flashcard-container"></div>

      <!-- FAQ container -->
      <div id="faq-container"></div>
    `,typeof FlashcardList<"u"&&FlashcardList.load(t),typeof FAQList<"u"&&FAQList.load(t)}catch(r){s("Failed to load module content: "+r.message)}}async function g(t){try{const e=await d(`/modules/${t}/flashcards`);if(e.length===0){s("No flashcards to review"),v(`/modules/${t}`);return}typeof ReviewMode<"u"?ReviewMode.start(t,e):s("Review mode not available")}catch(e){s("Failed to start review: "+e.message)}}function f(t,e){const n=document.getElementById("modal"),r=document.getElementById("modal-body");r.innerHTML=`
    <h2 style="margin-bottom: 1.5rem;">${t}</h2>
    ${e}
  `,n.classList.add("show")}function l(){document.getElementById("modal").classList.remove("show")}function j(){f("New Project",`
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
  `)}function M(t){const e=c.projects.find(n=>n.id===t);e&&f("Edit Project",`
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
  `)}async function P(t){t.preventDefault();const e=document.getElementById("project-name").value,n=document.getElementById("project-description").value;try{await d("/projects",{method:"POST",body:JSON.stringify({name:e,description:n||void 0})}),l(),await m()}catch(r){s("Failed to create project: "+r.message)}}async function $(t,e){t.preventDefault();const n=document.getElementById("project-name").value,r=document.getElementById("project-description").value;try{await d(`/projects/${e}`,{method:"PUT",body:JSON.stringify({name:n,description:r||void 0})}),l(),await m()}catch(o){s("Failed to update project: "+o.message)}}async function E(t){if(confirm("Are you sure you want to delete this project? This will also delete all modules and content."))try{await d(`/projects/${t}`,{method:"DELETE"}),await m()}catch(e){s("Failed to delete project: "+e.message)}}function L(){f("New Module",`
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
  `)}function F(t){const e=c.modules.find(n=>n.id===t);e&&f("Edit Module",`
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
  `)}async function B(t){t.preventDefault();const e=document.getElementById("module-name").value,n=document.getElementById("module-description").value;try{await d(`/projects/${c.currentProject}/modules`,{method:"POST",body:JSON.stringify({name:e,description:n||void 0})}),l(),await p(c.currentProject)}catch(r){s("Failed to create module: "+r.message)}}async function I(t,e){t.preventDefault();const n=document.getElementById("module-name").value,r=document.getElementById("module-description").value;try{await d(`/modules/${e}`,{method:"PUT",body:JSON.stringify({name:n,description:r||void 0})}),l(),await p(c.currentProject)}catch(o){s("Failed to update module: "+o.message)}}async function k(t){if(confirm("Are you sure you want to delete this module? This will also delete all flashcards and FAQs."))try{await d(`/modules/${t}`,{method:"DELETE"}),await p(c.currentProject)}catch(e){s("Failed to delete module: "+e.message)}}function a(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function s(t){const e=document.getElementById("app");e.innerHTML=`
    <div class="error">
      <strong>Error:</strong> ${a(t)}
    </div>
    ${e.innerHTML}
  `}window.addEventListener("hashchange",h);document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("modal");t.querySelector(".close").addEventListener("click",l),t.addEventListener("click",n=>{n.target===t&&l()}),h()});window.navigate=v;window.showCreateProjectForm=j;window.showEditProjectForm=M;window.createProject=P;window.updateProject=$;window.deleteProject=E;window.showCreateModuleForm=L;window.showEditModuleForm=F;window.createModule=B;window.updateModule=I;window.deleteModule=k;window.hideModal=l;
