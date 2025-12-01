// Simple SPA router and state management

let state = {
  currentView: 'projects',
  currentProject: null,
  currentModule: null,
  projects: [],
  modules: []
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
    return { view: 'modules', projectId: parseInt(parts[1]) };
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
    } else if (parsed.view === 'modules') {
      await renderModuleList(parsed.projectId);
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

// Module List View
async function renderModuleList(projectId) {
  const app = document.getElementById('app');
  const breadcrumb = document.getElementById('breadcrumb');

  state.currentProject = projectId;
  app.innerHTML = '<div class="loading">Loading modules...</div>';

  try {
    const project = await fetchAPI(`/projects/${projectId}`);
    state.modules = project.modules || [];

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
      html += `<p style="margin-bottom: 2rem; color: #666;">${escapeHtml(project.description)}</p>`;
    }

    if (state.modules.length === 0) {
      html += `
        <div class="empty-state">
          <p>No modules yet</p>
          <button class="btn-primary" onclick="showCreateModuleForm()">Create Your First Module</button>
        </div>
      `;
    } else {
      html += '<div class="list-view">';
      state.modules.forEach(module => {
        html += `
          <div class="list-item" onclick="navigate('/modules/${module.id}')">
            <h3>${escapeHtml(module.name)}</h3>
            ${module.description ? `<p>${escapeHtml(module.description)}</p>` : ''}
            <div class="list-item-actions">
              <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteModule(${module.id})">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    app.innerHTML = html;
  } catch (error) {
    showError('Failed to load modules: ' + error.message);
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

// Review Mode
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
  if (!confirm('Are you sure you want to delete this project? This will also delete all modules and content.')) {
    return;
  }

  try {
    await fetchAPI(`/projects/${projectId}`, { method: 'DELETE' });
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
  if (!confirm('Are you sure you want to delete this module? This will also delete all flashcards and FAQs.')) {
    return;
  }

  try {
    await fetchAPI(`/modules/${moduleId}`, { method: 'DELETE' });
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
