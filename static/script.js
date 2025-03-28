let currentIndex = 0;
let canciones = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchCanciones();
    setInterval(fetchCanciones, 500);

    document.getElementById('updateButton').addEventListener('click', function(event) {
        event.preventDefault();
        console.log("Botón actualizar clickeado");

        const updatedCancion = {
            name: document.getElementById('name').value,
            author: document.getElementById('author').value,
            duration: document.getElementById('duration').value,
            genre: document.getElementById('genre').value
        };
        const currentIndex = parseInt(document.getElementById('currentIndex').value, 10);

        updateCancion(currentIndex, updatedCancion);
    });

    document.getElementById('deleteButton').addEventListener('click', function() {
        deleteCancion(currentIndex);
    });

    document.getElementById('guardarButton').addEventListener('click', function() {
        guardarCanciones();
    });
});

function fetchCanciones() {
    fetch('/canciones')
        .then(response => response.json())
        .then(data => {
            canciones = data;
            if (canciones.length > 0) {
                // Mantener currentIndex si sigue siendo válido
                if (currentIndex >= canciones.length) {
                    currentIndex = canciones.length - 1; // Si se eliminó la última, ajustar
                }
                displayCancion(canciones[currentIndex], currentIndex);
            }
        })
        .catch(error => console.error('Error al obtener canciones:', error));
}


function displayCancion(cancion, index) {
    document.getElementById('nombre-cancion').textContent = cancion.name;
    document.getElementById('autor').textContent = `Autor: ${cancion.author}`;
    document.getElementById('duracion').textContent = `Duración: ${cancion.duration}`;
    document.getElementById('genero').textContent = `Género: ${cancion.genre}`;
    document.getElementById('indice').textContent = `Índice: ${index}`;
    document.getElementById('currentIndex').value = index;
}

function anteriorCancion() {
    currentIndex = (currentIndex - 1 + canciones.length) % canciones.length;
    displayCancion(canciones[currentIndex], currentIndex);
}

function siguienteCancion() {
    currentIndex = (currentIndex + 1) % canciones.length;
    displayCancion(canciones[currentIndex], currentIndex);
}

document.getElementById('formPila').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const duration = formData.get('duration');
    const genre = formData.get('genre');

    if (!/^\d{1,2}:\d{2}$/.test(duration)) {
        alert('La duración debe estar en el formato mm:ss o m:ss');
        return;
    }

    if (!/^[a-zA-Z]+$/.test(genre)) {
        alert('El género solo debe contener letras');
        return;
    }

    fetch('/canciones/pila', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(cancion => {
        canciones.unshift(cancion);
        displayCancion(canciones[0], 0);
    });
});

document.getElementById('formCola').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const duration = formData.get('duration');
    const genre = formData.get('genre');

    if (!/^\d{1,2}:\d{2}$/.test(duration)) {
        alert('La duración debe estar en el formato mm:ss o m:ss');
        return;
    }

    if (!/^[a-zA-Z]+$/.test(genre)) {
        alert('El género solo debe contener letras');
        return;
    }

    fetch('/canciones/cola', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(cancion => {
        canciones.push(cancion);
        if (canciones.length === 1) {
            displayCancion(cancion, 0);
        }
    });
});

function deleteCancion(index) {
    fetch(`/canciones/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error); // Mostrar aviso si hay un error
        } else {
            console.log('Canción eliminada:', data);
            canciones.splice(index, 1);

            if (canciones.length > 0) {
                currentIndex = Math.min(index, canciones.length - 1);
                displayCancion(canciones[currentIndex], currentIndex);
            } else {
                displayCancion({ name: "Sin canciones", author: "-", duration: "-", genre: "-" }, -1);
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateCancion(index, cancion) {
    console.log("Intentando actualizar canción en el índice:", index, cancion);
    fetch(`/canciones/${index}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cancion)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Canción actualizada:', data);
        canciones[index] = data;
        displayCancion(data, index);
    })
    .catch(error => console.error('Error:', error));
}

function guardarCanciones() {
    fetch('/guardar', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        alert(data.message);
    })
    .catch(error => console.error('Error:', error));
}