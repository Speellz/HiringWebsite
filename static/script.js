document.addEventListener('DOMContentLoaded', () => {
    const addCandidateForm = document.getElementById('addCandidateForm');
    const addCompanyForm = document.getElementById('addCompanyForm');
    const addProjectForm = document.getElementById('addProjectForm');
    const addPositionForm = document.getElementById('addPositionForm');

    if (addCandidateForm) {
        addCandidateForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (addCandidateForm.dataset.id) {
                updateCandidate();
            } else {
                addCandidate();
            }
        });
    }

    if (addCompanyForm) {
        addCompanyForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (addCompanyForm.dataset.id) {
                updateCompany();
            } else {
                addCompany();
            }
        });
    }

    if (addProjectForm) {
        addProjectForm.addEventListener('submit', (event) => {
            event.preventDefault();
            addProject();
        });
    }

    if (addPositionForm) {
        addPositionForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const projectId = addPositionForm.dataset.projectId;
            if (projectId) {
                addProjectPosition(projectId);
            }
        });
    }

    fetchCandidates();
    fetchCompanies();
    populateCompanyDropdown(); // Şirket dropdown'ını doldur
    fetchProjects();
    fetchActiveCandidatesCount();
    fetchPassiveCandidatesCount();
});

function fetchCandidates() {
    fetch('/candidates')
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Log the data to check its structure
            const candidatesList = document.getElementById('candidatesList');
            if (candidatesList) {
                candidatesList.innerHTML = '';
                
                // Create table elements
                const table = document.createElement('table');
                table.className = 'candidatesTable';
                
                // Create table header
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th>Actions</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Status Explanation</th>
                        <th>Notes</th>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Recruiter</th>
                    </tr>
                `;
                table.appendChild(thead);
                
                // Create table body
                const tbody = document.createElement('tbody');
                data.forEach(candidate => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <button class="edit" onclick="editCandidate(${candidate.Id})">Edit</button>
                            <button class="delete" onclick="deleteCandidate(${candidate.Id})">Delete</button>
                        </td>
                        <td>${candidate.Name || 'N/A'}</td>
                        <td>${candidate.Surname || 'N/A'}</td>
                        <td>${candidate.Role || 'N/A'}</td>
                        <td>${candidate.Status || 'N/A'}</td>
                        <td>${candidate.StatusExplanation || 'N/A'}</td>
                        <td>${candidate.Notes || 'N/A'}</td>
                        <td>${candidate.CompanyName || 'N/A'}</td>
                        <td>${candidate.PositionName || 'N/A'}</td>
                        <td>${candidate.UserName || 'N/A'}</td>
                    `;
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                
                candidatesList.appendChild(table);
            }
        })
        .catch(error => console.error('Error fetching candidates:', error));
}

// Dropdown'ı doldurmak için yeni bir fonksiyon
function populateCompanyDropdown() {
    fetch('/companies')
        .then(response => response.json())
        .then(data => {
            const companySelect = document.getElementById('company');
            companySelect.innerHTML = '<option value="" disabled selected>Select company</option>'; // Reset options
            data.forEach(company => {
                const option = document.createElement('option');
                option.value = company.CompanyName;
                option.textContent = company.CompanyName;
                companySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
}

// Şirketleri listelemek için mevcut fonksiyon
function fetchCompanies() {
    fetch('/companies')
        .then(response => response.json())
        .then(data => {
            const companiesList = document.getElementById('companiesList');
            companiesList.innerHTML = '';
            data.forEach(company => {
                const companyDiv = document.createElement('div');
                companyDiv.className = 'companiesbox';
                companyDiv.dataset.id = company.CompanyID;
                companyDiv.innerHTML = `
                    <p><strong>Company Name:</strong> ${company.CompanyName}</p>
                    <p><strong>Role:</strong> ${company.Role}</p>
                    <p><strong>Date:</strong> ${company.Date}</p>
                    <button class="edit" onclick="editCompany(${company.CompanyID})">Edit</button>
                    <button class="delete" onclick="deleteCompany(${company.CompanyID})">Delete</button>
                `;
                companiesList.appendChild(companyDiv);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
}

// Sayfa yüklendiğinde dropdown'ı doldur
document.addEventListener('DOMContentLoaded', populateCompanyDropdown);

function fetchProjects() {
    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            // Verinin bir dizi olup olmadığını kontrol et
            if (Array.isArray(data)) {
                const projectsList = document.getElementById('projectsList');
                if (projectsList) {
                    projectsList.innerHTML = '';
                    data.forEach(project => {
                        const projectDiv = document.createElement('div');
                        projectDiv.className = 'projectsbox';
                        projectDiv.dataset.id = project.ProjectID;
                        projectDiv.innerHTML = `
                            <p><strong>Project Name:</strong> ${project.ProjectName}</p>
                            <p><strong>Company Name:</strong> ${project.CompanyName}</p>
                            <p><strong>Date:</strong> ${project.ProjectDate}</p>
                            <button class="view" onclick="viewProjectPositions(${project.ProjectID})">View Positions</button>
                        `;
                        projectsList.appendChild(projectDiv);
                    });
                }
            } else {
                console.error('Expected an array but got:', data);
            }
        })
        .catch(error => console.error('Error fetching projects:', error));
}

function fetchActiveCandidatesCount() {
    fetch('/active-candidates')
        .then(response => response.json())
        .then(data => {
            document.getElementById('activeCandidates').textContent = data.count;
        })
        .catch(error => console.error('Error fetching active candidates count:', error));
}

function fetchPassiveCandidatesCount() {
    fetch('/passive-candidates')
        .then(response => response.json())
        .then(data => {
            document.getElementById('passiveCandidates').textContent = data.count;
        })
        .catch(error => console.error('Error fetching passive candidates count:', error));
}

function addCandidate() {
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const role = document.getElementById('role').value;
    const status = document.getElementById('status').value;
    const statusExplanation = document.getElementById('statusexplanation').value || 'N/A';
    const notes = document.getElementById('notes').value || 'N/A';
    const companyElement = document.getElementById('company');
    const position = document.getElementById('position').value || 'N/A';

    if (!companyElement) {
        console.error('Company element is not found');
        return;
    }

    const company = companyElement.value;

    console.log({
        name,
        surname,
        role,
        status,
        statusExplanation,
        notes,
        company,
        position
    });

    fetch('/candidates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Name: name,
            Surname: surname,
            Role: role,
            Status: status,
            StatusExplanation: statusExplanation,
            Notes: notes,
            CompanyID: company,
            PositionName: position
        })
    })
    .then(response => response.json())
    .then(() => {
        fetchCandidates();
        fetchActiveCandidatesCount();
        document.getElementById('addCandidateForm').reset();
        delete document.getElementById('addCandidateForm').dataset.id;
    })
    .catch(error => console.error('Error adding candidate:', error));
}

function updateCandidate() {
    const id = document.getElementById('addCandidateForm').dataset.id;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const status = document.getElementById('status').value;
    const statusExplanation = document.getElementById('statusexplanation').value;
    const notes = document.getElementById('notes').value;
    const company = document.getElementById('company').value;
    const position = document.getElementById('position').value;

    fetch(`/candidates/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Name: name, Role: role, Status: status, StatusExplanation: statusExplanation, Notes: notes, CompanyName: company, PositionName: position })
    })
    .then(response => response.json())
    .then(() => {
        fetchCandidates();
        fetchActiveCandidatesCount();
        document.getElementById('addCandidateForm').reset();
        delete document.getElementById('addCandidateForm').dataset.id;
    })
    .catch(error => console.error('Error updating candidate:', error));
}

function editCandidate(id) {
    fetch(`/candidates/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(candidate => {
            document.getElementById('name').value = candidate.Name;
            document.getElementById('role').value = candidate.Role;
            document.getElementById('status').value = candidate.Status;
            document.getElementById('statusexplanation').value = candidate.StatusExplanation;
            document.getElementById('notes').value = candidate.Notes;
            document.getElementById('company').value = candidate.CompanyName;
            document.getElementById('position').value = candidate.PositionName;
            document.getElementById('addCandidateForm').dataset.id = id;
            showTab('addCandidate');
        })
        .catch(error => console.error('Error fetching candidate:', error));
}

function deleteCandidate(id) {
    fetch(`/candidates/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(() => {
        fetchCandidates();
        fetchActiveCandidatesCount();
    })
    .catch(error => console.error('Error deleting candidate:', error));
}

function addCompany() {
    const companyname = document.getElementById('companyname').value;
    const role = document.getElementById('role').value;
    const date = document.getElementById('date').value;

    fetch('/companies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ CompanyName: companyname, Role: role, Date: date })
    })
    .then(response => response.json())
    .then(() => {
        fetchCompanies();
        document.getElementById('addCompanyForm').reset();
        delete document.getElementById('addCompanyForm').dataset.id;
    })
    .catch(error => console.error('Error adding company:', error));
}

function updateCompany() {
    const id = document.getElementById('addCompanyForm').dataset.id;
    const companyname = document.getElementById('companyname').value;
    const role = document.getElementById('role').value;
    const date = document.getElementById('date').value;

    fetch(`/companies/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ CompanyName: companyname, Role: role, Date: date })
    })
    .then(response => response.json())
    .then(() => {
        fetchCompanies();
        document.getElementById('addCompanyForm').reset();
        delete document.getElementById('addCompanyForm').dataset.id;
    })
    .catch(error => console.error('Error updating company:', error));
}

function editCompany(id) {
    fetch(`/companies/${id}`)
        .then(response => response.json())
        .then(company => {
            document.getElementById('companyname').value = company.CompanyName;
            document.getElementById('role').value = company.Role;
            document.getElementById('date').value = company.Date;
            document.getElementById('addCompanyForm').dataset.id = id;
            showTab('addCompany');
        })
        .catch(error => console.error('Error fetching company:', error));
}

function deleteCompany(id) {
    fetch(`/companies/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(() => {
        fetchCompanies();
    })
    .catch(error => console.error('Error deleting company:', error));
}

function addProject() {
    const projectName = document.getElementById('projectName').value;
    const companyName = document.getElementById('companyName').value;
    const date = document.getElementById('date').value;

    fetch('/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ProjectName: projectName, CompanyName: companyName, Date: date })
    })
    .then(response => response.json())
    .then(() => {
        fetchCandidates();
        fetchActiveCandidatesCount();
        document.getElementById('addProjectForm').reset();
        delete document.getElementById('addProjectForm').dataset.id;
    })
    .catch(error => console.error('Error adding project:', error));
}

function viewProjectPositions(projectId) {
    fetch(`/projects/${projectId}/positions`)
        .then(response => response.json())
        .then(data => {
            const positionsList = document.getElementById('positionsList');
            positionsList.innerHTML = '';
            data.forEach(position => {
                const positionDiv = document.createElement('div');
                positionDiv.className = 'positionsbox';
                positionDiv.innerHTML = `
                    <p><strong>Position Title:</strong> ${position.PositionTitle}</p>
                    <p><strong>Number of Candidates:</strong> ${position.NumberOfCandidates}</p>
                `;
                positionsList.appendChild(positionDiv);
            });
            showTab('viewPositions');
        })
        .catch(error => console.error('Error fetching project positions:', error));
}

function addProjectPosition(projectId) {
    const positionTitle = document.getElementById('positionTitle').value;
    const numberOfCandidates = document.getElementById('numberOfCandidates').value;

    fetch(`/projects/${projectId}/positions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ PositionTitle: positionTitle, NumberOfCandidates: numberOfCandidates })
    })
    .then(response => response.json())
    .then(() => {
        viewProjectPositions(projectId);
        document.getElementById('addPositionForm').reset();
    })
    .catch(error => console.error('Error adding project position:', error));
}

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.style.display = 'block';
    } else {
        console.error(`Tab with ID "${tabId}" not found.`);
    }
}
