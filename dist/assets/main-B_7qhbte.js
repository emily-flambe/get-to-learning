(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const f of i.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&r(f)}).observe(document,{childList:!0,subtree:!0});function o(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=o(n);fetch(n.href,i)}})();let c={currentView:"projects",currentProject:null,currentModule:null,projects:[],modules:[]};async function d(t,e={}){const o=await fetch(`/api${t}`,{...e,headers:{"Content-Type":"application/json",...e.headers}});if(!o.ok)throw new Error(`API error: ${o.statusText}`);return o.json()}function v(t){window.location.hash=t}function h(){return window.location.hash.slice(1)||"/"}function y(t){const e=t.split("/").filter(o=>o);return e.length===0?{view:"projects"}:e[0]==="projects"&&e.length===1?{view:"projects"}:e[0]==="projects"&&e.length===2?{view:"modules",projectId:parseInt(e[1])}:e[0]==="modules"&&e.length===2?{view:"content",moduleId:parseInt(e[1])}:{view:"projects"}}async function b(){const t=h(),e=y(t);c.currentView=e.view;try{e.view==="projects"?await u():e.view==="modules"?await m(e.projectId):e.view==="content"&&w(e.moduleId)}catch(o){console.error("Route error:",o),s("Failed to load page: "+o.message)}}async function u(){const t=document.getElementById("app"),e=document.getElementById("breadcrumb");e.innerHTML="",t.innerHTML='<div class="loading">Loading projects...</div>';try{const o=await d("/projects");c.projects=o;let r=`
      <div class="page-header">
        <h2>Projects</h2>
        <button class="btn-primary" onclick="showCreateProjectForm()">New Project</button>
      </div>
    `;o.length===0?r+=`
        <div class="empty-state">
          <p>No projects yet</p>
          <button class="btn-primary" onclick="showCreateProjectForm()">Create Your First Project</button>
        </div>
      `:(r+='<div class="card-grid">',o.forEach(n=>{r+=`
          <div class="card" onclick="navigate('/projects/${n.id}')">
            <h3>${a(n.name)}</h3>
            <p>${n.description?a(n.description):"No description"}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${n.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${n.id})">Delete</button>
            </div>
          </div>
        `}),r+="</div>"),t.innerHTML=r}catch(o){s("Failed to load projects: "+o.message)}}async function m(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");c.currentProject=t,e.innerHTML='<div class="loading">Loading modules...</div>';try{const r=await d(`/projects/${t}`);c.modules=r.modules||[],o.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${a(r.name)}</span>
    `;let n=`
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${a(r.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;r.description&&(n+=`<p style="margin-bottom: 2rem; color: #666;">${a(r.description)}</p>`),c.modules.length===0?n+=`
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `:(n+='<div class="list-view">',c.modules.forEach(i=>{n+=`
          <div class="list-item" onclick="navigate('/modules/${i.id}')">
            <h3>${a(i.name)}</h3>
            ${i.description?`<p>${a(i.description)}</p>`:""}
            <div class="list-item-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditModuleForm(${i.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteModule(${i.id})">Delete</button>
            </div>
          </div>
        `}),n+="</div>"),e.innerHTML=n}catch(r){s("Failed to load modules: "+r.message)}}function w(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");o.innerHTML=`
    <a href="#/" onclick="navigate('/')">Projects</a>
    <span>/</span>
    <span>Module ${t}</span>
  `,e.innerHTML=`
    <div class="page-header">
      <h2>Module Content</h2>
    </div>
    <p>Content view will be implemented by another agent. Module ID: ${t}</p>
    <p style="margin-top: 1rem;"><a href="#/" onclick="navigate('/')">Back to Projects</a></p>
  `}function p(t,e){const o=document.getElementById("modal"),r=document.getElementById("modal-body");r.innerHTML=`
    <h2 style="margin-bottom: 1.5rem;">${t}</h2>
    ${e}
  `,o.classList.add("show")}function l(){document.getElementById("modal").classList.remove("show")}function g(){p("New Project",`
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
  `)}function j(t){const e=c.projects.find(o=>o.id===t);e&&p("Edit Project",`
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
  `)}async function P(t){t.preventDefault();const e=document.getElementById("project-name").value,o=document.getElementById("project-description").value;try{await d("/projects",{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),l(),await u()}catch(r){s("Failed to create project: "+r.message)}}async function E(t,e){t.preventDefault();const o=document.getElementById("project-name").value,r=document.getElementById("project-description").value;try{await d(`/projects/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:r||void 0})}),l(),await u()}catch(n){s("Failed to update project: "+n.message)}}async function M(t){if(confirm("Are you sure you want to delete this project? This will also delete all modules and content."))try{await d(`/projects/${t}`,{method:"DELETE"}),await u()}catch(e){s("Failed to delete project: "+e.message)}}function $(){p("New Module",`
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
  `)}function L(t){const e=c.modules.find(o=>o.id===t);e&&p("Edit Module",`
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
  `)}async function F(t){t.preventDefault();const e=document.getElementById("module-name").value,o=document.getElementById("module-description").value;try{await d(`/projects/${c.currentProject}/modules`,{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),l(),await m(c.currentProject)}catch(r){s("Failed to create module: "+r.message)}}async function I(t,e){t.preventDefault();const o=document.getElementById("module-name").value,r=document.getElementById("module-description").value;try{await d(`/modules/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:r||void 0})}),l(),await m(c.currentProject)}catch(n){s("Failed to update module: "+n.message)}}async function B(t){if(confirm("Are you sure you want to delete this module? This will also delete all flashcards and FAQs."))try{await d(`/modules/${t}`,{method:"DELETE"}),await m(c.currentProject)}catch(e){s("Failed to delete module: "+e.message)}}function a(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function s(t){const e=document.getElementById("app");e.innerHTML=`
    <div class="error">
      <strong>Error:</strong> ${a(t)}
    </div>
    ${e.innerHTML}
  `}window.addEventListener("hashchange",b);document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("modal");t.querySelector(".close").addEventListener("click",l),t.addEventListener("click",o=>{o.target===t&&l()}),b()});window.navigate=v;window.showCreateProjectForm=g;window.showEditProjectForm=j;window.createProject=P;window.updateProject=E;window.deleteProject=M;window.showCreateModuleForm=$;window.showEditModuleForm=L;window.createModule=F;window.updateModule=I;window.deleteModule=B;window.hideModal=l;
