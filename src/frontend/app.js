// Simple SPA router and state management

let state = {
  currentView: 'projects',
  currentProject: null,
  currentModule: null,
  projects: [],
  modules: [],
  selectedModules: []
};

// API helpers
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// LocalStorage helpers for module selection
function getSelectedModules(projectId) {
  try {
    const stored = localStorage.getItem('gtl_selected_modules_' + projectId);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setSelectedModules(projectId, moduleIds) {
  localStorage.setItem('gtl_selected_modules_' + projectId, JSON.stringify(moduleIds));
  state.selectedModules = moduleIds;
}

// Router
function navigate(path) {
  window.location.hash = path;
}

function getCurrentRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return hash;
}

function parseRoute(route) {
  const parts = route.split('/').filter(p => p);

  if (parts.length === 0) {
    return { view: 'projects' };
  }

  if (parts[0] === 'projects' && parts.length === 1) {
    return { view: 'projects' };
  }

  if (parts[0] === 'projects' && parts.length === 2) {
    return { view: 'project-content', projectId: parseInt(parts[1]) };
  }

  if (parts[0] === 'projects' && parts.length === 3 && parts[2] === 'review') {
    return { view: 'project-review', projectId: parseInt(parts[1]) };
  }

  if (parts[0] === 'modules' && parts.length === 2) {
    return { view: 'content', moduleId: parseInt(parts[1]) };
  }

  if (parts[0] === 'modules' && parts.length === 3 && parts[2] === 'review') {
    return { view: 'review', moduleId: parseInt(parts[1]) };
  }

  return { view: 'projects' };
}

async function handleRoute() {
  const route = getCurrentRoute();
  const parsed = parseRoute(route);

  state.currentView = parsed.view;

  try {
    if (parsed.view === 'projects') {
      await renderProjectList();
    } else if (parsed.view === 'project-content') {
      await renderProjectContent(parsed.projectId);
    } else if (parsed.view === 'project-review') {
      await startProjectReviewMode(parsed.projectId);
    } else if (parsed.view === 'content') {
      await renderModuleContent(parsed.moduleId);
    } else if (parsed.view === 'review') {
      await startReviewMode(parsed.moduleId);
    }
  } catch (error) {
    console.error('Route error:', error);
    showError('Failed to load page: ' + error.message);
  }
}

// Project List View
async function renderProjectList() {
  const app = document.getElementById('app');
  const breadcrumb = document.getElementById('breadcrumb');

  breadcrumb.innerHTML = '';
  app.innerHTML = '<div class="loading">Loading projects...</div>';

  try {
    const projects = await fetchAPI('/projects');
    state.projects = projects;

    let html = `
      <div class="page-header">
        <h2>Projects</h2>
        <button class="btn-primary" onclick="showCreateProjectForm()">New Project</button>
      </div>
    `;

    if (projects.length === 0) {
      html += `
        <div class="empty-state">
          <p>No projects yet</p>
          <button class="btn-primary" onclick="showCreateProjectForm()">Create Your First Project</button>
        </div>
      `;
    } else {
      html += '<div class="card-grid">';
      projects.forEach(project => {
        html += `
          <div class="card" onclick="navigate('/projects/${project.id}')">
            <h3>${escapeHtml(project.name)}</h3>
            <p>${project.description ? escapeHtml(project.description) : 'No description'}</p>
            <div class="card-actions">
              <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showEditProjectForm(${project.id})">Edit</button>
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteProject(${project.id})">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    app.innerHTML = html;
  } catch (error) {
    showError('Failed to load projects: ' + error.message);
  }
}

// Project Content View with Module Selector
async function renderProjectContent(projectId) {
  const app = document.getElementById('app');
  const breadcrumb = document.getElementById('breadcrumb');

  state.currentProject = projectId;
  app.innerHTML = '<div class="loading">Loading project content...</div>';

  try {
    const project = await fetchAPI(`/projects/${projectId}`);
    state.modules = project.modules || [];

    // Load selected modules from localStorage, default to all if none stored
    let selectedModules = getSelectedModules(projectId);
    if (selectedModules.length === 0 && state.modules.length > 0) {
      selectedModules = state.modules.map(m => m.id);
      setSelectedModules(projectId, selectedModules);
    } else {
      state.selectedModules = selectedModules;
    }

    breadcrumb.innerHTML = `
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      <span>${escapeHtml(project.name)}</span>
    `;

    let html = `
      <a href="#/" class="back-link" onclick="navigate('/')">← Back to Projects</a>
      <div class="page-header">
        <h2>${escapeHtml(project.name)}</h2>
        <button class="btn-primary" onclick="showCreateModuleForm()">New Module</button>
      </div>
    `;

    if (project.description) {
      html += '<p style="margin-bottom: 2rem; color: #666;">' + escapeHtml(project.description) + '</p>';
    }

    if (state.modules.length === 0) {
      html += `
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `;
    } else {
      html += renderModuleSelector();
      html += '<div id="flashcard-container"></div>';
      html += '<div id="faq-container"></div>';
    }

    app.innerHTML = html;

    // Load flashcards and FAQs if modules are selected
    if (state.selectedModules.length > 0) {
      if (typeof FlashcardList !== 'undefined') {
        FlashcardList.loadMultiple(projectId, state.selectedModules);
      }
      if (typeof FAQList !== 'undefined') {
        FAQList.loadMultiple(projectId, state.selectedModules);
      }
    }
  } catch (error) {
    showError('Failed to load project content: ' + error.message);
  }
}

// Module Selector UI
function renderModuleSelector() {
  if (state.modules.length === 0) return '';

  const allSelected = state.selectedModules.length === state.modules.length;

  let html = '<div class="module-selector">';
  html += '<div class="module-selector-header">';
  html += '<h3>Modules</h3>';
  html += '<button class="btn-secondary btn-small" onclick="toggleAllModules()">';
  html += allSelected ? 'Deselect All' : 'Select All';
  html += '</button>';
  html += '</div>';
  html += '<div class="module-checkboxes">';

  state.modules.forEach(module => {
    const isSelected = state.selectedModules.includes(module.id);
    html += '<div class="module-checkbox' + (isSelected ? ' selected' : '') + '" onclick="toggleModule(' + module.id + ')">';
    html += '<input type="checkbox"' + (isSelected ? ' checked' : '') + ' onclick="event.stopPropagation(); toggleModule(' + module.id + ')">';
    html += '<label>' + escapeHtml(module.name) + '</label>';
    html += '</div>';
  });

  html += '</div>';
  html += '</div>';

  return html;
}

// Toggle individual module selection
function toggleModule(moduleId) {
  const index = state.selectedModules.indexOf(moduleId);
  if (index > -1) {
    state.selectedModules.splice(index, 1);
  } else {
    state.selectedModules.push(moduleId);
  }

  setSelectedModules(state.currentProject, state.selectedModules);
  reloadContent();
}

// Toggle all modules
function toggleAllModules() {
  if (state.selectedModules.length === state.modules.length) {
    state.selectedModules = [];
  } else {
    state.selectedModules = state.modules.map(m => m.id);
  }

  setSelectedModules(state.currentProject, state.selectedModules);
  reloadContent();
}

// Reload content after module selection change
function reloadContent() {
  // Re-render the module selector to update checkboxes
  const selector = document.querySelector('.module-selector');
  if (selector) {
    selector.outerHTML = renderModuleSelector();
  }

  // Reload flashcards and FAQs
  if (state.selectedModules.length > 0) {
    if (typeof FlashcardList !== 'undefined') {
      FlashcardList.loadMultiple(state.currentProject, state.selectedModules);
    }
    if (typeof FAQList !== 'undefined') {
      FAQList.loadMultiple(state.currentProject, state.selectedModules);
    }
  } else {
    // Clear containers if no modules selected
    const fcContainer = document.getElementById('flashcard-container');
    const faqContainer = document.getElementById('faq-container');
    if (fcContainer) fcContainer.innerHTML = '';
    if (faqContainer) faqContainer.innerHTML = '';
  }
}

// Module Content View with Flashcards and FAQs
async function renderModuleContent(moduleId) {
  const app = document.getElementById('app');
  const breadcrumb = document.getElementById('breadcrumb');

  state.currentModule = moduleId;
  app.innerHTML = '<div class="loading">Loading module content...</div>';

  try {
    // Fetch module details
    const module = await fetchAPI(`/modules/${moduleId}`);

    // Find the parent project for breadcrumb
    let projectName = 'Project';
    let projectId = null;
    if (module.project_id) {
      const project = await fetchAPI(`/projects/${module.project_id}`);
      projectName = project.name;
      projectId = project.id;
      state.currentProject = projectId;
    }

    breadcrumb.innerHTML = `
      <a href="#/" onclick="navigate('/')">Projects</a>
      <span>/</span>
      ${projectId ? `<a href="#/projects/${projectId}" onclick="navigate('/projects/${projectId}')">${escapeHtml(projectName)}</a>` : `<span>${escapeHtml(projectName)}</span>`}
      <span>/</span>
      <span>${escapeHtml(module.name)}</span>
    `;

    app.innerHTML = `
      <a href="#/projects/${projectId}" class="back-link" onclick="navigate('/projects/${projectId}')">← Back to Modules</a>
      <div class="page-header">
        <h2>${escapeHtml(module.name)}</h2>
      </div>
      ${module.description ? `<p style="margin-bottom: 2rem; color: #666;">${escapeHtml(module.description)}</p>` : ''}

      ${module.summary ? `
      <!-- Summary section -->
      <div class="module-summary">
        <div class="summary-header" onclick="toggleSummary()">
          <h3><span id="summary-icon">&#9654;</span> Summary</h3>
        </div>
        <div id="summary-content" class="summary-content hidden">${renderMarkdown(module.summary)}</div>
      </div>
      ` : ''}

      <!-- Flashcard container -->
      <div id="flashcard-container"></div>

      <!-- FAQ container -->
      <div id="faq-container"></div>
    `;

    // Load flashcards and FAQs using the content components
    if (typeof FlashcardList !== 'undefined') {
      FlashcardList.load(moduleId);
    }
    if (typeof FAQList !== 'undefined') {
      FAQList.load(moduleId);
    }
  } catch (error) {
    showError('Failed to load module content: ' + error.message);
  }
}

// Review Mode (single module - legacy)
async function startReviewMode(moduleId) {
  try {
    const flashcards = await fetchAPI(`/modules/${moduleId}/flashcards`);
    if (flashcards.length === 0) {
      showError('No flashcards to review');
      navigate(`/modules/${moduleId}`);
      return;
    }
    if (typeof ReviewMode !== 'undefined') {
      ReviewMode.start(moduleId, flashcards);
    } else {
      showError('Review mode not available');
    }
  } catch (error) {
    showError('Failed to start review: ' + error.message);
  }
}

// Project Review Mode (multi-module)
async function startProjectReviewMode(projectId) {
  try {
    const selectedModules = getSelectedModules(projectId);
    if (selectedModules.length === 0) {
      showError('No modules selected for review');
      navigate(`/projects/${projectId}`);
      return;
    }

    const moduleParams = selectedModules.join(',');
    const flashcards = await fetchAPI(`/projects/${projectId}/flashcards?modules=${moduleParams}`);

    if (flashcards.length === 0) {
      showError('No flashcards to review in selected modules');
      navigate(`/projects/${projectId}`);
      return;
    }

    if (typeof ReviewMode !== 'undefined') {
      ReviewMode.startWithProject(projectId, flashcards);
    } else {
      showError('Review mode not available');
    }
  } catch (error) {
    showError('Failed to start review: ' + error.message);
  }
}

// Modal management
function showModal(title, content) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');

  modalBody.innerHTML = `
    <h2 style="margin-bottom: 1.5rem;">${title}</h2>
    ${content}
  `;

  modal.classList.add('show');
}

function hideModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('show');
}

// Project CRUD operations
function showCreateProjectForm() {
  showModal('New Project', `
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
  `);
}

function showEditProjectForm(projectId) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  showModal('Edit Project', `
    <form onsubmit="updateProject(event, ${projectId})">
      <div class="form-group">
        <label for="project-name">Name *</label>
        <input type="text" id="project-name" value="${escapeHtml(project.name)}" required>
      </div>
      <div class="form-group">
        <label for="project-description">Description</label>
        <textarea id="project-description">${project.description ? escapeHtml(project.description) : ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `);
}

async function createProject(event) {
  event.preventDefault();

  const name = document.getElementById('project-name').value;
  const description = document.getElementById('project-description').value;

  try {
    await fetchAPI('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description: description || undefined })
    });

    hideModal();
    await renderProjectList();
  } catch (error) {
    showError('Failed to create project: ' + error.message);
  }
}

async function updateProject(event, projectId) {
  event.preventDefault();

  const name = document.getElementById('project-name').value;
  const description = document.getElementById('project-description').value;

  try {
    await fetchAPI(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description: description || undefined })
    });

    hideModal();
    await renderProjectList();
  } catch (error) {
    showError('Failed to update project: ' + error.message);
  }
}

async function deleteProject(projectId) {
  const password = prompt('Enter password to delete this project (this will also delete all modules and content):');
  if (!password) return;

  try {
    await fetchAPI(`/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'X-Delete-Password': password }
    });
    await renderProjectList();
  } catch (error) {
    showError('Failed to delete project: ' + error.message);
  }
}

// Module CRUD operations
function showCreateModuleForm() {
  showModal('New Module', `
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
  `);
}

function showEditModuleForm(moduleId) {
  const module = state.modules.find(m => m.id === moduleId);
  if (!module) return;

  showModal('Edit Module', `
    <form onsubmit="updateModule(event, ${moduleId})">
      <div class="form-group">
        <label for="module-name">Name *</label>
        <input type="text" id="module-name" value="${escapeHtml(module.name)}" required>
      </div>
      <div class="form-group">
        <label for="module-description">Description</label>
        <textarea id="module-description">${module.description ? escapeHtml(module.description) : ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `);
}

async function createModule(event) {
  event.preventDefault();

  const name = document.getElementById('module-name').value;
  const description = document.getElementById('module-description').value;

  try {
    await fetchAPI(`/projects/${state.currentProject}/modules`, {
      method: 'POST',
      body: JSON.stringify({ name, description: description || undefined })
    });

    hideModal();
    await renderModuleList(state.currentProject);
  } catch (error) {
    showError('Failed to create module: ' + error.message);
  }
}

async function updateModule(event, moduleId) {
  event.preventDefault();

  const name = document.getElementById('module-name').value;
  const description = document.getElementById('module-description').value;

  try {
    await fetchAPI(`/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description: description || undefined })
    });

    hideModal();
    await renderModuleList(state.currentProject);
  } catch (error) {
    showError('Failed to update module: ' + error.message);
  }
}

async function deleteModule(moduleId) {
  const password = prompt('Enter password to delete this module (this will also delete all flashcards and FAQs):');
  if (!password) return;

  try {
    await fetchAPI(`/modules/${moduleId}`, {
      method: 'DELETE',
      headers: { 'X-Delete-Password': password }
    });
    await renderModuleList(state.currentProject);
  } catch (error) {
    showError('Failed to delete module: ' + error.message);
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderMarkdown(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
    .replace(/^## (.+)$/gm, '<h4>$1</h4>')  // ## headings
    .replace(/^- \*\*([^*]+)\*\*(.*)$/gm, '<li><strong>$1</strong>$2</li>')  // - **term** description
    .replace(/---/g, '<hr>')  // horizontal rules
    .replace(/\n\n/g, '</p><p>')  // paragraphs
    .replace(/\n/g, '<br>');  // line breaks
}

function toggleSummary() {
  const content = document.getElementById('summary-content');
  const icon = document.getElementById('summary-icon');
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    icon.innerHTML = '&#9660;';
  } else {
    content.classList.add('hidden');
    icon.innerHTML = '&#9654;';
  }
}

function showError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="error">
      <strong>Error:</strong> ${escapeHtml(message)}
    </div>
    ${app.innerHTML}
  `;
}

// Event listeners
window.addEventListener('hashchange', handleRoute);

document.addEventListener('DOMContentLoaded', () => {
  // Close modal on click outside
  const modal = document.getElementById('modal');
  const closeBtn = modal.querySelector('.close');

  closeBtn.addEventListener('click', hideModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });

  // Initial route
  handleRoute();
});

// Expose functions to global scope for onclick handlers
window.navigate = navigate;
window.showCreateProjectForm = showCreateProjectForm;
window.showEditProjectForm = showEditProjectForm;
window.createProject = createProject;
window.updateProject = updateProject;
window.deleteProject = deleteProject;
window.showCreateModuleForm = showCreateModuleForm;
window.showEditModuleForm = showEditModuleForm;
window.createModule = createModule;
window.updateModule = updateModule;
window.deleteModule = deleteModule;
window.hideModal = hideModal;
window.toggleSummary = toggleSummary;
window.toggleModule = toggleModule;
window.toggleAllModules = toggleAllModules;
