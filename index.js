const binId = '67102253ad19ca34f8b9ba09';   
const apiKey = '$2a$10$rMrW9YM8x3fpzVQdEUnjaOEvr5J81aS7fwZwxUcZyby5xgPAddQ.W';  

let isEditing = false;
let editingId = null;

document.addEventListener('DOMContentLoaded', function () {
    // Form submission handler
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

    // Search input handler
    document.getElementById('searchInput').addEventListener('input', function() {
        const query = this.value.toLowerCase();
        searchEntries(query);
    });

    // Function to search entries
    function searchEntries(query) {
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const filteredEntries = data.record.entries.filter(entry =>
                entry.events.toLowerCase().includes(query) ||
                entry.areas.toLowerCase().includes(query) ||
                entry.notes.toLowerCase().includes(query) ||
                entry.favorites.toLowerCase().includes(query) ||
                entry['bucket-list'].toLowerCase().includes(query)
            );
            displayFilteredEntries(filteredEntries);
        })
        .catch(error => console.error('Error fetching entries for search:', error));
    }

    // Function to display filtered entries
    function displayFilteredEntries(entries) {
        const entriesList = document.getElementById('capsuleContent');
        entriesList.innerHTML = ''; 
        
        const ul = document.createElement('ul');

        entries.forEach(entry => {
            const li = document.createElement('li');
            const openDate = new Date(entry['open-date']);
            const currentDate = new Date();

            // Check if the entry is locked based on the open date
            const isLocked = currentDate < openDate;

            li.innerHTML = `
                <strong>Event:</strong> ${entry.events} <br>
                <strong>Open Date:</strong> ${entry['open-date']} <br>
                ${entry['image-url'] ? `<div style="max-width: 200px;"><img src="${entry['image-url']}" alt="Entry Image" style="max-width: 100%;"/></div>` : ''}
                ${isLocked ? `<p>This entry is locked until ${entry['open-date']}.</p>` : `
                    <strong>Areas:</strong> ${entry.areas} <br>
                    <strong>Notes:</strong> ${entry.notes} <br>
                    <strong>Favorites:</strong> ${entry.favorites} <br>
                    <strong>Bucket List:</strong> ${entry['bucket-list']} <br>
                `}
                <button class="edit-btn" data-id="${entry.id}">Edit</button>
                <button class="delete-btn" data-id="${entry.id}">Delete</button>
            `;

            ul.appendChild(li);
        });

        entriesList.appendChild(ul);
        attachEditAndDeleteHandlers();
    }

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
                    ${entry['image-url'] ? `<div style="max-width: 200px;"><img src="${entry['image-url']}" alt="Entry Image" style="max-width: 100%;"/></div>` : ''}
                    ${isLocked ? `<p>This entry is locked until ${entry['open-date']}.</p>` : `
                        <strong>Areas:</strong> ${entry.areas} <br>
                        <strong>Notes:</strong> ${entry.notes} <br>
                        <strong>Favorites:</strong> ${entry.favorites} <br>
                        <strong>Bucket List:</strong> ${entry['bucket-list']} <br>
                    `}
                    <button class="edit-btn" data-id="${entry.id}">Edit</button>
                    <button class="delete-btn" data-id="${entry.id}">Delete</button>
                `;

                ul.appendChild(li);
            });

            entriesList.appendChild(ul);
            attachEditAndDeleteHandlers();
        })
        .catch(error => console.error('Error fetching entries:', error));
    }

    // Function to attach event handlers for edit and delete buttons
    function attachEditAndDeleteHandlers() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                    method: 'GET',
                    headers: {
                        'X-Master-Key': apiKey
                    }
                })
                .then(response => response.json())
                .then(data => {
                    const entryToEdit = data.record.entries.find(entry => entry.id === id);
                    if (entryToEdit) {
                        document.getElementById('events').value = entryToEdit.events || '';
                        document.getElementById('areas').value = entryToEdit.areas || '';
                        document.getElementById('notes').value = entryToEdit.notes || '';
                        document.getElementById('favorites').value = entryToEdit.favorites || '';
                        document.getElementById('bucket-list').value = entryToEdit['bucket-list'] || '';
                        document.getElementById('open-date').value = entryToEdit['open-date'] || '';
                        document.getElementById('image-url').value = entryToEdit['image-url'] || '';
                        isEditing = true;
                        editingId = id;
                    }
                });
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                    method: 'GET',
                    headers: {
                        'X-Master-Key': apiKey
                    }
                })
                .then(response => response.json())
                .then(data => {
                    const updatedEntries = data.record.entries.filter(entry => entry.id !== id);
                    return fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Master-Key': apiKey
                        },
                        body: JSON.stringify({ entries: updatedEntries })
                    });
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Entry deleted:', data);
                    displayEntries();
                })
                .catch(error => console.error('Error deleting entry:', error));
            });
        });
    }

    displayEntries(); 
});
