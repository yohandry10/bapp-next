console.log("Hola, estoy aquí, soy el frontend");

document.addEventListener("click", (e) => {
    if (e.target.dataset.short) {
        const url = `${window.location.origin}/${e.target.dataset.short}`;

        navigator.clipboard
            .writeText(url)
            .then(() => {
                console.log("Texto copiado al portapapeles...");
            })
            .catch((err) => {
                console.log("Algo salió mal", err);
            });
    }
});

const imageUploadForm = document.getElementById('imageUploadForm');
const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');

imageUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        console.log('Imagen subida exitosamente:', data.imageUrl);

        // Mostrar la imagen en la página
        const imgElement = document.createElement('img');
        imgElement.src = data.imageUrl;
        imageContainer.appendChild(imgElement);
    } catch (error) {
        console.error('Error al subir la imagen:', error);
    }
});
