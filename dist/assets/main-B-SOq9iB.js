(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function o(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=o(s);fetch(s.href,i)}})();let r={currentView:"projects",currentProject:null,currentModule:null,projects:[],modules:[],selectedModules:[]};async function a(t,e={}){const o=await fetch(`/api${t}`,{...e,headers:{"Content-Type":"application/json",...e.headers}});if(!o.ok)throw new Error(`API error: ${o.statusText}`);return o.json()}function v(t){try{const e=localStorage.getItem("gtl_selected_modules_"+t);return e?JSON.parse(e):[]}catch{return[]}}function h(t,e){localStorage.setItem("gtl_selected_modules_"+t,JSON.stringify(e)),r.selectedModules=e}function m(t){window.location.hash=t}function b(){return window.location.hash.slice(1)||"/"}function M(t){const e=t.split("/").filter(o=>o);return e.length===0?{view:"projects"}:e[0]==="projects"&&e.length===1?{view:"projects"}:e[0]==="projects"&&e.length===2?{view:"project-content",projectId:parseInt(e[1])}:e[0]==="projects"&&e.length===3&&e[2]==="review"?{view:"project-review",projectId:parseInt(e[1])}:e[0]==="modules"&&e.length===2?{view:"content",moduleId:parseInt(e[1])}:e[0]==="modules"&&e.length===3&&e[2]==="review"?{view:"review",moduleId:parseInt(e[1])}:{view:"projects"}}async function g(){const t=b(),e=M(t);r.currentView=e.view;try{e.view==="projects"?await p():e.view==="project-content"?await j(e.projectId):e.view==="project-review"?await F(e.projectId):e.view==="content"?await $(e.moduleId):e.view==="review"&&await E(e.moduleId)}catch(o){console.error("Route error:",o),d("Failed to load page: "+o.message)}}async function p(){const t=document.getElementById("app"),e=document.getElementById("breadcrumb");e.innerHTML="",t.innerHTML='<div class="loading">Loading projects...</div>';try{const o=await a("/projects");r.projects=o;let n=`
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
            <h3>${c(s.name)}</h3>
            <p>${s.description?c(s.description):"No description"}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${s.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${s.id})">Delete</button>
            </div>
          </div>
        `}),n+="</div>"),t.innerHTML=n}catch(o){d("Failed to load projects: "+o.message)}}async function j(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");r.currentProject=t,e.innerHTML='<div class="loading">Loading project content...</div>';try{const n=await a(`/projects/${t}`);r.modules=n.modules||[];let s=v(t);s.length===0&&r.modules.length>0?(s=r.modules.map(l=>l.id),h(t,s)):r.selectedModules=s,o.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${c(n.name)}</span>
    `;let i=`
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${c(n.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;n.description&&(i+='<p style="margin-bottom: 2rem; color: #666;">'+c(n.description)+"</p>"),r.modules.length===0?i+=`
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `:(i+=y(),i+='<div id="flashcard-container"></div>',i+='<div id="faq-container"></div>'),e.innerHTML=i,r.selectedModules.length>0&&(typeof FlashcardList<"u"&&FlashcardList.loadMultiple(t,r.selectedModules),typeof FAQList<"u"&&FAQList.loadMultiple(t,r.selectedModules))}catch(n){d("Failed to load project content: "+n.message)}}function y(){if(r.modules.length===0)return"";const t=r.selectedModules.length===r.modules.length;let e='<div class="module-selector">';return e+='<div class="module-selector-header">',e+="<h3>Modules</h3>",e+='<button class="btn-secondary btn-small" onclick="toggleAllModules()">',e+=t?"Deselect All":"Select All",e+="</button>",e+="</div>",e+='<div class="module-checkboxes">',r.modules.forEach(o=>{const n=r.selectedModules.includes(o.id);e+='<div class="module-checkbox'+(n?" selected":"")+'" onclick="toggleModule('+o.id+')">',e+='<input type="checkbox"'+(n?" checked":"")+' onclick="event.stopPropagation(); toggleModule('+o.id+')">',e+="<label>"+c(o.name)+"</label>",e+="</div>"}),e+="</div>",e+="</div>",e}function P(t){const e=r.selectedModules.indexOf(t);e>-1?r.selectedModules.splice(e,1):r.selectedModules.push(t),h(r.currentProject,r.selectedModules),w()}function L(){r.selectedModules.length===r.modules.length?r.selectedModules=[]:r.selectedModules=r.modules.map(t=>t.id),h(r.currentProject,r.selectedModules),w()}function w(){const t=document.querySelector(".module-selector");if(t&&(t.outerHTML=y()),r.selectedModules.length>0)typeof FlashcardList<"u"&&FlashcardList.loadMultiple(r.currentProject,r.selectedModules),typeof FAQList<"u"&&FAQList.loadMultiple(r.currentProject,r.selectedModules);else{const e=document.getElementById("flashcard-container"),o=document.getElementById("faq-container");e&&(e.innerHTML=""),o&&(o.innerHTML="")}}async function $(t){const e=document.getElementById("app"),o=document.getElementById("breadcrumb");r.currentModule=t,e.innerHTML='<div class="loading">Loading module content...</div>';try{const n=await a(`/modules/${t}`);let s="Project",i=null;if(n.project_id){const l=await a(`/projects/${n.project_id}`);s=l.name,i=l.id,r.currentProject=i}o.innerHTML=`
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      ${i?`<a href="#/projects/${i}" onclick="navigate('/projects/${i}')">${c(s)}</a>`:`<span>${c(s)}</span>`}
      <span>/</span>
      <span>${c(n.name)}</span>
    `,e.innerHTML=`
      <a href="#/projects/${i}" class="back-link" onclick="navigate('/projects/${i}')">← Back to Modules</a>
      <div class="page-header">
        <h2>${c(n.name)}</h2>
      </div>
      ${n.description?`<p style="margin-bottom: 2rem; color: #666;">${c(n.description)}</p>`:""}

      ${n.summary?`
      <!-- Summary section -->
      <div class="module-summary">
        <div class="summary-header" onclick="toggleSummary()">
          <h3><span id="summary-icon">&#9654;</span> Summary</h3>
        </div>
        <div id="summary-content" class="summary-content hidden">${O(n.summary)}</div>
      </div>
      `:""}

      <!-- Flashcard container -->
      <div id="flashcard-container"></div>

      <!-- FAQ container -->
      <div id="faq-container"></div>
    `,typeof FlashcardList<"u"&&FlashcardList.load(t),typeof FAQList<"u"&&FAQList.load(t)}catch(n){d("Failed to load module content: "+n.message)}}async function E(t){try{const e=await a(`/modules/${t}/flashcards`);if(e.length===0){d("No flashcards to review"),m(`/modules/${t}`);return}typeof ReviewMode<"u"?ReviewMode.start(t,e):d("Review mode not available")}catch(e){d("Failed to start review: "+e.message)}}async function F(t){try{const e=v(t);if(e.length===0){d("No modules selected for review"),m(`/projects/${t}`);return}const o=e.join(","),n=await a(`/projects/${t}/flashcards?modules=${o}`);if(n.length===0){d("No flashcards to review in selected modules"),m(`/projects/${t}`);return}typeof ReviewMode<"u"?ReviewMode.startWithProject(t,n):d("Review mode not available")}catch(e){d("Failed to start review: "+e.message)}}function f(t,e){const o=document.getElementById("modal"),n=document.getElementById("modal-body");n.innerHTML=`
    <h2 style="margin-bottom: 1.5rem;">${t}</h2>
    ${e}
  `,o.classList.add("show")}function u(){document.getElementById("modal").classList.remove("show")}function k(){f("New Project",`
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
  `)}function B(t){const e=r.projects.find(o=>o.id===t);e&&f("Edit Project",`
    <form onsubmit="updateProject(event, ${t})">
      <div class="form-group">
        <label for="project-name">Name *</label>
        <input type="text" id="project-name" value="${c(e.name)}" required>
      </div>
      <div class="form-group">
        <label for="project-description">Description</label>
        <textarea id="project-description">${e.description?c(e.description):""}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `)}async function S(t){t.preventDefault();const e=document.getElementById("project-name").value,o=document.getElementById("project-description").value;try{await a("/projects",{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),u(),await p()}catch(n){d("Failed to create project: "+n.message)}}async function T(t,e){t.preventDefault();const o=document.getElementById("project-name").value,n=document.getElementById("project-description").value;try{await a(`/projects/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:n||void 0})}),u(),await p()}catch(s){d("Failed to update project: "+s.message)}}async function C(t){const e=prompt("Enter password to delete this project (this will also delete all modules and content):");if(e)try{await a(`/projects/${t}`,{method:"DELETE",headers:{"X-Delete-Password":e}}),await p()}catch(o){d("Failed to delete project: "+o.message)}}function N(){f("New Module",`
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
  `)}function I(t){const e=r.modules.find(o=>o.id===t);e&&f("Edit Module",`
    <form onsubmit="updateModule(event, ${t})">
      <div class="form-group">
        <label for="module-name">Name *</label>
        <input type="text" id="module-name" value="${c(e.name)}" required>
      </div>
      <div class="form-group">
        <label for="module-description">Description</label>
        <textarea id="module-description">${e.description?c(e.description):""}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `)}async function H(t){t.preventDefault();const e=document.getElementById("module-name").value,o=document.getElementById("module-description").value;try{await a(`/projects/${r.currentProject}/modules`,{method:"POST",body:JSON.stringify({name:e,description:o||void 0})}),u(),await renderModuleList(r.currentProject)}catch(n){d("Failed to create module: "+n.message)}}async function x(t,e){t.preventDefault();const o=document.getElementById("module-name").value,n=document.getElementById("module-description").value;try{await a(`/modules/${e}`,{method:"PUT",body:JSON.stringify({name:o,description:n||void 0})}),u(),await renderModuleList(r.currentProject)}catch(s){d("Failed to update module: "+s.message)}}async function A(t){const e=prompt("Enter password to delete this module (this will also delete all flashcards and FAQs):");if(e)try{await a(`/modules/${t}`,{method:"DELETE",headers:{"X-Delete-Password":e}}),await renderModuleList(r.currentProject)}catch(o){d("Failed to delete module: "+o.message)}}function c(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function O(t){return t?c(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/^## (.+)$/gm,"<h4>$1</h4>").replace(/^- \*\*([^*]+)\*\*(.*)$/gm,"<li><strong>$1</strong>$2</li>").replace(/---/g,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>"):""}function D(){const t=document.getElementById("summary-content"),e=document.getElementById("summary-icon");t.classList.contains("hidden")?(t.classList.remove("hidden"),e.innerHTML="&#9660;"):(t.classList.add("hidden"),e.innerHTML="&#9654;")}function d(t){const e=document.getElementById("app");e.innerHTML=`
    <div class="error">
      <strong>Error:</strong> ${c(t)}
    </div>
    ${e.innerHTML}
  `}window.addEventListener("hashchange",g);document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("modal");t.querySelector(".close").addEventListener("click",u),t.addEventListener("click",o=>{o.target===t&&u()}),g()});window.navigate=m;window.showCreateProjectForm=k;window.showEditProjectForm=B;window.createProject=S;window.updateProject=T;window.deleteProject=C;window.showCreateModuleForm=N;window.showEditModuleForm=I;window.createModule=H;window.updateModule=x;window.deleteModule=A;window.hideModal=u;window.toggleSummary=D;window.toggleModule=P;window.toggleAllModules=L;
