const imageInput =
    document.getElementById("imageInput");

const uploadButton =
    document.getElementById("uploadButton");

const gallery =
    document.getElementById("gallery");

const statusText =
    document.getElementById("status");


// Load images when page opens
loadImages();


// ==============================
// LOAD IMAGES
// ==============================

async function loadImages() {

    try {

        const response =
            await fetch("/api/images");

        const images =
            await response.json();

        gallery.innerHTML = "";

        images.forEach(image => {

            const card =
                document.createElement("div");

            card.className = "image-card";

            card.innerHTML = `

                <img
                    src="${image.url}"
                    alt="Uploaded image"
                >

                <div class="image-info">

                    <div class="filename">
                        ${image.name}
                    </div>

                    <button
                        class="delete-button"
                        onclick="deleteImage('${image.name}')"
                    >
                        Delete
                    </button>

                </div>

            `;

            gallery.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        statusText.textContent =
            "Could not load images.";

    }
}


// ==============================
// UPLOAD IMAGE
// ==============================

uploadButton.addEventListener(
    "click",
    async () => {

        const file =
            imageInput.files[0];

        if (!file) {

            statusText.textContent =
                "Please select an image.";

            return;
        }

        const formData =
            new FormData();

        formData.append("image", file);

        statusText.textContent =
            "Uploading...";

        try {

            const response =
                await fetch(
                    "/api/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    result.error
                );

            }

            statusText.textContent =
                "Image uploaded!";

            imageInput.value = "";

            loadImages();

        } catch (error) {

            statusText.textContent =
                error.message;

        }

    }
);


// ==============================
// DELETE IMAGE
// ==============================

async function deleteImage(filename) {

    if (!confirm("Delete this image?")) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/images/${encodeURIComponent(filename)}`,
                {
                    method: "DELETE"
                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.error
            );

        }

        loadImages();

    } catch (error) {

        alert(error.message);

    }

}