const binId = '67102253ad19ca34f8b9ba09';  // Your JSONBin ID
const apiKey = '$2a$10$rMrW9YM8x3fpzVQdEUnjaOEvr5J81aS7fwZwxUcZyby5xgPAddQ.W';  // Your JSONBin API key

let isEditing = false;
let editingId = null;

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('entryForm').addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = new FormData(this);
        const entry = {};

        formData.forEach((value, key) => {
            entry[key] = value;
        });

        if (isEditing) {
            updateEntry(editingId, entry);
        } else {
            addEntry(entry);
        }
    });

    // Function to add entry
    function addEntry(newEntry) {
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const existingEntries = data.record.entries || [];

            newEntry.id = Date.now().toString(); 
            newEntry.locked = false; // Set the locked status
            existingEntries.push(newEntry);

            return fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify({ entries: existingEntries })
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log('New entry added:', data);
            displayEntries();
            document.getElementById('entryForm').reset();
        })
        .catch(error => console.error('Error adding entry:', error));
    }

    // Function to update an entry
    function updateEntry(id, updatedEntry) {
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const existingEntries = data.record.entries.map(entry => 
                entry.id === id ? { ...entry, ...updatedEntry } : entry
            );

            return fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify({ entries: existingEntries })
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log('Entry updated:', data);
            displayEntries();
            document.getElementById('entryForm').reset();
            isEditing = false;
            editingId = null;
        })
        .catch(error => console.error('Error updating entry:', error));
    }

    // Function to display entries
    function displayEntries() {
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const entriesList = document.getElementById('capsuleContent');
            entriesList.innerHTML = ''; 
            
            const ul = document.createElement('ul');

            data.record.entries.forEach(entry => {
                const li = document.createElement('li');
                const openDate = new Date(entry['open-date']);
                const currentDate = new Date();

                // Check if the entry is locked based on the open date
                const isLocked = currentDate < openDate;

                li.innerHTML = `
                    <strong>Event:</strong> ${entry.events} <br>
                    <strong>Open Date:</strong> ${entry['open-date']} <br>
                    ${isLocked ? `<p>This entry is locked until ${entry['open-date']}.</p>` : `
                    <strong>Areas:</strong> ${entry.areas} <br>
                    <strong>Notes:</strong> ${entry.notes} <br>
                    <strong>Favorites:</strong> ${entry.favorites} <br>
                    <strong>Bucket List:</strong> ${entry['bucket-list']} <br>
                    `}
                    <button class="edit-btn" data-id="${entry.id}">Edit</button>
                    <button class="delete-btn" data-id="${entry.id}">Delete</button>
                    <button class="lock-btn" data-id="${entry.id}" ${entry.locked ? 'disabled' : ''}>${entry.locked ? 'Locked' : 'Lock Entry'}</button>
                    <hr>`;
                ul.appendChild(li);
            });

            entriesList.appendChild(ul); 
            attachButtonEvents();
        })
        .catch(error => console.error('Error fetching entries:', error));
    }

    function attachButtonEvents() {
        const editButtons = document.querySelectorAll('.edit-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');
        const lockButtons = document.querySelectorAll('.lock-btn');

        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                loadEntryToEdit(id);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteEntry(id);
            });
        });

        lockButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                lockEntry(id);
            });
        });
    }

    // Function to load entry into the form for editing
    function loadEntryToEdit(id) {
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const entry = data.record.entries.find(entry => entry.id === id);
            if (entry) {
                document.getElementById('events').value = entry.events;
                document.getElementById('areas').value = entry.areas;
                document.getElementById('notes').value = entry.notes;
                document.getElementById('favorites').value = entry.favorites;
                document.getElementById('bucket-list').value = entry['bucket-list'];
                document.getElementById('open-date').value = entry['open-date'];
                isEditing = true;
                editingId = id;
            }
        })
        .catch(error => console.error('Error loading entry for edit:', error));
    }

    // Function to delete entry
    function deleteEntry(id) {
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const existingEntries = data.record.entries.filter(entry => entry.id !== id);

            return fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify({ entries: existingEntries })
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log('Entry deleted:', data);
            displayEntries();
        })
        .catch(error => console.error('Error deleting entry:', error));
    }

    // Function to lock an entry
    function lockEntry(id) {
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const existingEntries = data.record.entries.map(entry => {
                if (entry.id === id) {
                    // Set a property to indicate the entry is locked
                    entry.locked = true;
                }
                return entry;
            });

            return fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify({ entries: existingEntries })
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log('Entry locked:', data);
            displayEntries();
        })
        .catch(error => console.error('Error locking entry:', error));
    }
    const cloudName = 'YOURdd4w34sj4';  // Replace with your Cloudinary Cloud Name
    const uploadPreset = 'picture';  // Replace with your Upload Preset
    
    // // Function to upload file
    // const uploadFile = (file) => {
    //     const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    //     const formData = new FormData();
    //     formData.append('file', file);
    //     formData.append('upload_preset', uploadPreset);
    
    //     fetch(url, {
    //         method: 'POST',
    //         body: formData,
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('File uploaded successfully:', data);
    //         // You can save the data.secure_url to your JSON bin or use it in your app
    //         // For example, to display the uploaded image:
    //         const img = document.createElement('img');
    //         img.src = data.secure_url;
    //         document.getElementById('capsuleContent').appendChild(img);
    //     })
    //     .catch(error => console.error('Error uploading file:', error));
    // };
    
    // // Add event listener to the file input
    // document.getElementById('files').addEventListener('change', function(event) {
    //     const files = event.target.files;
    //     Array.from(files).forEach(file => uploadFile(file));
    // });
    
    // Initial call to display entries on page load
    displayEntries();
});
