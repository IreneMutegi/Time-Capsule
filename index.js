
document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('entryForm').addEventListener('submit', function(event) {
        event.preventDefault(); 

      
        const formData = new FormData(this);
        const entry = {};

      
        formData.forEach((value, key) => {
            entry[key] = value;
        });

       
        addEntry(entry);
    });

    // Function to add entry
    function addEntry(entry) {
        fetch('http://localhost:3000/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry),
        })
        .then(response => response.json())
        .then(data => {
            console.log('New entry added:', data);
            displayEntries(); // Refresh the displayed entries
            document.getElementById('entryForm').reset(); // Clear the form after submission
        })
        .catch(error => console.error('Error adding entry:', error));
    }

    // Function to display entries
    function displayEntries() {
        fetch('http://localhost:3000/entries')
            .then(response => response.json())
            .then(data => {
                const entriesList = document.getElementById('capsuleContent');
                entriesList.innerHTML = ''; 
                
                const ul = document.createElement('ul');

          
                data.forEach(entry => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>Events:</strong> ${entry.events} <br>
                        <strong>Areas:</strong> ${entry.areas} <br>
                        <strong>Notes:</strong> ${entry.notes} <br>
                        <strong>Favorites:</strong> ${entry.favorites} <br>
                        <strong>Bucket List:</strong> ${entry.bucketList} <br>
                        <strong>Open Date:</strong> ${entry.openDate} <br>
                        <button class="edit-btn" data-id="${entry.id}">Edit</button>
                        <button class="delete-btn" data-id="${entry.id}">Delete</button>
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

        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                console.log('Editing Entry ID:', id);
             
            });
        });

      
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                console.log('Deleting Entry ID:', id);
                deleteEntry(id);
            });
        });
    }

    // Function to delete entry
    function deleteEntry(id) {
        fetch(`http://localhost:3000/entries/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Entry deleted:', data);
            displayEntries(); 
        })
        .catch(error => console.error('Error deleting entry:', error));
    }

    // Initial call to display entries on page load
    displayEntries();
});
