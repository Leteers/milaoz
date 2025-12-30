function loadGallery() {
    fetch(`/data/images.json?v=${Date.now()}`)
        .then(res => res.json())
        .then(images => {
            const gallery = document.getElementById("gallery");
            gallery.innerHTML = "";

            images.forEach(img => {
                const el = document.createElement("img");
                el.src = img.src;
                el.alt = img.title;
                el.onclick = () => openLightbox(img.src);
                gallery.appendChild(el);
            });
        });
}

loadGallery();


// Lightbox --------------------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.remove("hidden");
}

lightbox.addEventListener("click", () => {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
});
