// Function to apply text formatting
function formatText(command, value = null) {
    if (command === 'fontSize') {
        document.execCommand('styleWithCSS', false, true); // Ensure the command uses CSS styles
        document.execCommand('fontSize', false, '7'); // Set fontSize to the highest level
        const elements = document.querySelectorAll('#editor font[size="7"]');
        elements.forEach(el => el.style.fontSize = value); // Apply selected size
    } else {
        if (document.queryCommandSupported(command)) {
            document.execCommand(command, false, value);
            updateStatus("Formatting applied");
        } else {
            updateStatus("Command not supported");
        }
    }
}

// Create a new document
function newFile() {
    if (confirm("Are you sure you want to create a new document? Any unsaved changes will be lost.")) {
        document.getElementById('editor').innerHTML = '';
        updateStatus("New document created");
    }
}

// Open a file dialog
function openFile() {
    document.getElementById('fileInput').click();
}

// Save the document
function saveFile() {
    const textToSave = document.getElementById('editor').innerText;
    const blob = new Blob([textToSave], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.txt';  // Save as .txt
    link.click();
    updateStatus("Document saved");
}

// Load a file
function loadFile(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {  // Check for text/plain type
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editor').innerText = e.target.result;
            updateStatus("File loaded");
        };
        reader.readAsText(file);
    } else {
        updateStatus("Invalid file type");
    }
}

// Insert a hyperlink
function insertLink() {
    const url = prompt("Enter the URL:");
    if (url && isValidURL(url)) {
        document.execCommand('createLink', false, url);
        updateStatus("Link inserted");
    } else {
        updateStatus("Invalid URL");
    }
}

// Undo the last action
function undo() {
    if (document.queryCommandSupported('undo')) {
        document.execCommand('undo', false, null);
        updateStatus("Undo action performed");
    } else {
        updateStatus("Undo not supported");
    }
}

// Redo the last undone action
function redo() {
    if (document.queryCommandSupported('redo')) {
        document.execCommand('redo', false, null);
        updateStatus("Redo action performed");
    } else {
        updateStatus("Redo not supported");
    }
}

// Update the status message
function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Check spelling using LanguageTool API
async function checkSpelling(text) {
    try {
        const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                text: text,
                language: 'en'
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error checking spelling:", error);
        updateStatus("Error checking spelling");
    }
}

// Check text for spelling errors
function checkText() {
    const editor = document.getElementById('editor');
    const text = editor.innerText;
    checkSpelling(text).then(data => {
        // Process and display spelling suggestions
        console.log(data);
    });
}

// Validate URL
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// Event listeners
document.getElementById('fileInput').addEventListener('change', loadFile);
document.getElementById('editor').addEventListener('input', checkText);
document.getElementById('fontSizeSelector').addEventListener('change', function() {
    const selectedSize = this.value;
    formatText('fontSize', selectedSize);
});
