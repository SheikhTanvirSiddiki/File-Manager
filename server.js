const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Create folder endpoint
app.post('/create-folder', (req, res) => {
    const { folderName } = req.body;

    if (!folderName || folderName.trim() === '') {
        return res.status(400).json({ error: 'Folder name cannot be empty.' });
    }

    const folderPath = path.join(__dirname, 'folders', folderName);

    if (fs.existsSync(folderPath)) {
        return res.status(400).json({ error: 'Folder already exists.' });
    }

    fs.mkdirSync(folderPath, { recursive: true });
    res.status(200).json({ message: `Folder '${folderName}' created successfully!` });
});

// Get list of folders
app.get('/get-folders', (req, res) => {
    const folders = fs.readdirSync(path.join(__dirname, 'folders'));
    res.json(folders);
});

// Get list of files in a folder
app.get('/get-files', (req, res) => {
    const { folder } = req.query;
    const folderPath = path.join(__dirname, 'folders', folder);

    if (!fs.existsSync(folderPath)) {
        return res.status(400).json({ error: 'Folder does not exist.' });
    }

    const files = fs.readdirSync(folderPath);
    res.json(files);
});

// Upload file to a folder
app.post('/upload-file', upload.single('file'), (req, res) => {
    const { folderName } = req.body;
    const file = req.file;

    const folderPath = path.join(__dirname, 'folders', folderName);
    if (!fs.existsSync(folderPath)) {
        return res.status(400).json({ error: 'Folder does not exist.' });
    }

    const filePath = path.join(folderPath, file.originalname);
    fs.renameSync(file.path, filePath);  // Move the file from the upload temp folder

    res.status(200).json({ message: `File '${file.originalname}' uploaded successfully!` });
});

// Delete a folder
app.delete('/delete-folder', (req, res) => {
    const { folder } = req.query;

    const folderPath = path.join(__dirname, 'folders', folder);
    if (!fs.existsSync(folderPath)) {
        return res.status(400).json({ error: 'Folder does not exist.' });
    }

    fs.rmdirSync(folderPath, { recursive: true });
    res.status(200).json({ message: `Folder '${folder}' deleted successfully!` });
});

// Delete a file from a folder
app.delete('/delete-file', (req, res) => {
    const { folder, file } = req.query;

    const filePath = path.join(__dirname, 'folders', folder, file);
    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ error: 'File does not exist.' });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: `File '${file}' deleted successfully!` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
