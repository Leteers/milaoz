// ================================
// Admin Gallery Script (Clean)
// ================================

const imageInput = document.getElementById("imageInput");
const titleInput = document.getElementById("artTitle");
const gallery = document.getElementById("adminGallery");
const finishBtn = document.getElementById("finishBtn");
const cancelBtn = document.getElementById("cancelBtn");

let selectedFile = null;
let tempPreviewItem = null;

// --------------------------------
// Load gallery from JSON
// --------------------------------
async function loadGallery() {
    const res = await fetch("/data/images.json?v=" + Date.now());
    const images = await res.json();

    gallery.innerHTML = "";

    images.forEach(img => {
        const item = document.createElement("div");
        item.className = "gallery-item admin-img-wrapper";

        const image = document.createElement("img");
        image.src = img.src;
        image.alt = img.title || "";

        const title = document.createElement("div");
        title.className = "gallery-item-title";
        title.textContent = img.title || "";

        const delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.innerHTML = "✕";

        delBtn.onclick = async (e) => {
            e.stopPropagation();
            if (!confirm("Delete this image?")) return;

            await fetch("/admin/delete-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ src: img.src })
            });

            loadGallery();
        };

        item.append(image, delBtn, title);
        gallery.appendChild(item);
    });
}

// --------------------------------
// Image select + preview
// --------------------------------
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    finishBtn.disabled = !file;

    if (!file) return;

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => {
        if (tempPreviewItem) tempPreviewItem.remove();

        tempPreviewItem = document.createElement("div");
        tempPreviewItem.className = "gallery-item preview";

        const imgEl = document.createElement("img");
        imgEl.src = e.target.result;

        const titleEl = document.createElement("div");
        titleEl.className = "gallery-item-title";
        titleEl.textContent = titleInput.value || "(No Title)";

        tempPreviewItem.append(imgEl, titleEl);
        gallery.appendChild(tempPreviewItem);

        cancelBtn.disabled = false;
    };

    reader.readAsDataURL(file);
});

// --------------------------------
// Live title update (preview)
// --------------------------------
titleInput.addEventListener("input", () => {
    if (tempPreviewItem) {
        tempPreviewItem.querySelector(".gallery-item-title").textContent =
            titleInput.value || "(No Title)";
    }
});

// --------------------------------
// Cancel upload
// --------------------------------
cancelBtn.addEventListener("click", () => {
    if (tempPreviewItem) tempPreviewItem.remove();

    imageInput.value = "";
    titleInput.value = "";

    selectedFile = null;
    tempPreviewItem = null;

    finishBtn.disabled = true;
    cancelBtn.disabled = true;
});

// --------------------------------
// Upload image
// --------------------------------
finishBtn.addEventListener("click", async () => {
    const file = imageInput.files[0];
    const title = titleInput.value.trim();

    if (!file || !title) {
        alert("Title and image required");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);

    await fetch("/admin/upload-image", {
        method: "POST",
        body: formData
    });

    if (tempPreviewItem) tempPreviewItem.remove();

    imageInput.value = "";
    titleInput.value = "";
    finishBtn.disabled = true;
    cancelBtn.disabled = true;

    selectedFile = null;
    tempPreviewItem = null;

    loadGallery();
});

// --------------------------------
// Init
// --------------------------------
finishBtn.disabled = true;
cancelBtn.disabled = true;
loadGallery();