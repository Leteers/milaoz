const imageInput = document.getElementById("imageInput");
const artTitle = document.getElementById("artTitle");

const adminGallery = document.getElementById("adminGallery");

const finishBtn = document.getElementById("finishBtn");
const cancelBtn = document.getElementById("cancelBtn");

let selectedFile = null;
let tempPreviewItem = null;

/* -----------------------------------
   LOAD REAL EXISTING GALLERY IMAGES
----------------------------------- */
fetch("../../data/images.json")
    .then(res => res.json())
    .then(images => {
        images.forEach(img => {
    const item = document.createElement("div");
    item.className = "gallery-item admin-img-wrapper";

    const image = document.createElement("img");
    image.src = img.src;
    image.alt = img.title;

    const title = document.createElement("div");
    title.className = "gallery-item-title";
    title.textContent = img.title || "";

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="
                M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z
            "/>
        </svg>
    `;

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

    item.appendChild(image);
    item.appendChild(delBtn);
    item.appendChild(title);

    gallery.appendChild(item);
});
    })


/* -----------------------------------
   UPLOAD PREVIEW LOGIC
----------------------------------- */

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => {
        // Remove old preview if any
        if (tempPreviewItem) tempPreviewItem.remove();

        // Build new preview item
        tempPreviewItem = document.createElement("div");
        tempPreviewItem.classList.add("gallery-item");

        const imgEl = document.createElement("img");
        imgEl.src = e.target.result;

        const titleEl = document.createElement("div");
        titleEl.classList.add("gallery-item-title");
        titleEl.textContent = artTitle.value || "(No Title)";

        tempPreviewItem.appendChild(imgEl);
        tempPreviewItem.appendChild(titleEl);

        // Add to gallery preview
        adminGallery.appendChild(tempPreviewItem);

        finishBtn.disabled = false;
        cancelBtn.disabled = false;
    };

    reader.readAsDataURL(file);
});



// Live update title
artTitle.addEventListener("input", () => {
    if (tempPreviewItem) {
        tempPreviewItem.querySelector(".gallery-item-title").textContent =
            artTitle.value || "(No Title)";
    }
});



// Cancel upload
cancelBtn.addEventListener("click", () => {
    if (tempPreviewItem) tempPreviewItem.remove();

    artTitle.value = "";
    imageInput.value = "";

    selectedFile = null;
    tempPreviewItem = null;

    finishBtn.disabled = true;
    cancelBtn.disabled = true;
});


const titleInput = document.getElementById("artTitle");

imageInput.addEventListener("change", () => {
    finishBtn.disabled = !imageInput.files.length;
});

const gallery = document.getElementById("adminGallery");

/* ---------- load gallery ---------- */
async function loadGallery() {
    const res = await fetch("/data/images.json?v=" + Date.now());
    const images = await res.json();

    gallery.innerHTML = "";

    images.forEach(img => {
        const wrapper = document.createElement("div");
        wrapper.className = "admin-img-wrapper";

        const image = document.createElement("img");
        image.src = img.src;
        image.alt = img.title;

        const delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.textContent = "✕";

        delBtn.onclick = async () => {
            if (!confirm("Delete this image?")) return;

            await fetch("/admin/delete-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ src: img.src })
            });

            loadGallery();
        };

        wrapper.appendChild(image);
        wrapper.appendChild(delBtn);
        gallery.appendChild(wrapper);
    });
}

/* ---------- upload ---------- */
imageInput.addEventListener("change", () => {
    finishBtn.disabled = !imageInput.files.length;
});

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

    titleInput.value = "";
    imageInput.value = "";
    finishBtn.disabled = true;

    loadGallery();
});


const delBtn = document.createElement("button");
delBtn.className = "delete-btn";
delBtn.innerHTML = `
<svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="currentColor" d="
        M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z
    "/>
</svg>
`;

delBtn.onclick = async (e) => {
    e.stopPropagation(); // важно: не кликаем по картинке
    if (!confirm("Delete this image?")) return;

    await fetch("/admin/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src: img.src })
    });

    loadGallery();
};

/* ---------- init ---------- */
loadGallery();