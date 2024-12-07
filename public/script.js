document.getElementById('createFolderBtn').addEventListener('click', async () => {
    const folderName = document.getElementById('folderName').value.trim();
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';

    if (!folderName) {
        showMessage('Folder name cannot be empty!', 'error');
        return;
    }

    try {
        const response = await fetch('/create-folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ folderName }),
        });

        const result = await response.json();
        if (response.ok) {
            showMessage(result.message, 'success');
            loadFolders();  // Reload folders after creation
        } else {
            showMessage(result.error || 'Failed to create folder.', 'error');
        }
    } catch (error) {
        showMessage('An error occurred. Please try again later.', 'error');
    }
});

document.getElementById('uploadFileBtn').addEventListener('click', async () => {
    const folderName = document.getElementById('folderSelect').value;
    const fileInput = document.getElementById('fileInput');
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';

    if (!folderName || !fileInput.files.length) {
        showMessage('Please select a folder and a file.', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('folderName', folderName);

    try {
        const response = await fetch('/upload-file', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            showMessage(result.message, 'success');
            loadFolders();  // Reload folders after file upload
        } else {
            showMessage(result.error || 'Failed to upload file.', 'error');
        }
    } catch (error) {
        showMessage('An error occurred. Please try again later.', 'error');
    }
});

async function loadFolders() {
    const response = await fetch('/get-folders');
    const folders = await response.json();

    // Populate folder select dropdown
    const folderSelect = document.getElementById('folderSelect');
    folderSelect.innerHTML = '<option value="">Select a Folder</option>';
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
    });

    // Display folder contents
    const foldersList = document.getElementById('foldersList');
    foldersList.innerHTML = '';  // Clear previous folder list
    folders.forEach(folder => {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        folderDiv.innerHTML = `
            <h4>${folder}</h4>
            <button onclick="deleteFolder('${folder}')">Delete Folder</button>
            <div id="files-${folder}"></div>
        `;
        foldersList.appendChild(folderDiv);
        loadFiles(folder);
    });
}

async function loadFiles(folder) {
    const response = await fetch(`/get-files?folder=${folder}`);
    const files = await response.json();

    const filesDiv = document.getElementById(`files-${folder}`);
    filesDiv.innerHTML = files.length ? '<strong>Files:</strong>' : 'No files in this folder.';
    files.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.innerHTML = `<span>${file}</span> <button onclick="deleteFile('${folder}', '${file}')">Delete File</button>`;
        filesDiv.appendChild(fileDiv);
    });
}

async function deleteFolder(folder) {
    const response = await fetch(`/delete-folder?folder=${folder}`, {
        method: 'DELETE',
    });

    const result = await response.json();
    showMessage(result.message || result.error, response.ok ? 'success' : 'error');
    loadFolders();  // Reload folders after deletion
}

async function deleteFile(folder, file) {
    const response = await fetch(`/delete-file?folder=${folder}&file=${file}`, {
        method: 'DELETE',
    });

    const result = await response.json();
    showMessage(result.message || result.error, response.ok ? 'success' : 'error');
    loadFiles(folder);  // Reload files after deletion
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
}

window.onload = loadFolders;
