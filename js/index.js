const apiBooks = "http://localhost:1337/api/books?populate=*";

const booksGrid   = document.getElementById("books-grid");
const searchInput = document.getElementById("search-input");
const sortSelect  = document.getElementById("sort-select");
const modal       = document.getElementById("book-modal");
const closeModalBtn = document.getElementById("close-modal");

const modalTitle = document.getElementById("modal-title");
const modalAutho = document.getElementById("modal-autho");
const modalPages = document.getElementById("modal-pages");
const modalDate  = document.getElementById("modal-date");
const modalImage = document.getElementById("modal-image");
const saveBtn    = document.getElementById("save-book-btn");

let allBooks = [];

function getAttr(book) {
    return book.attributes || book;
}

function getCoverUrl(book) {
    const cover = book?.attributes?.cover ?? book?.cover ?? null;
    const url =
        cover?.data?.attributes?.url ??
        cover?.attributes?.url ??
        cover?.url ??
        null;
    return url
        ? `http://localhost:1337${url}`
        : "https://placehold.co/300x450?text=No+Image";
}

function getFilteredSorted() {
    const query    = (searchInput?.value ?? "").toLowerCase().trim();
    const sortKey  = sortSelect?.value ?? "title";

    let books = [...allBooks];

    if (query) {
        books = books.filter(b => {
            const a = getAttr(b);
            return (
                (a.title ?? "").toLowerCase().includes(query) ||
                (a.autho ?? "").toLowerCase().includes(query)
            );
        });
    }

    books.sort((a, b) => {
        const attrA = getAttr(a);
        const attrB = getAttr(b);
        const key   = sortKey === "author" ? "autho" : "title";
        const valA  = (attrA[key] ?? "").toLowerCase();
        const valB  = (attrB[key] ?? "").toLowerCase();
        return valA.localeCompare(valB, "sv");
    });

    return books;
}

function renderBooks(books) {
    if (!booksGrid) return;

    booksGrid.innerHTML = "";

    if (!books.length) {
        booksGrid.innerHTML = `<p class="loading">Inga böcker hittades.</p>`;
        return;
    }

    books.forEach(book => {
        const attr  = getAttr(book);
        const title = attr.title ?? "Ingen titel";
        const autho = attr.autho ?? "Okänd författare";
        const pages = attr.pages ?? "-";
        const date  = attr.publishedDate
            ? new Date(attr.publishedDate).toLocaleDateString("sv-SE")
            : "-";
        const cover = getCoverUrl(book);

        const card = document.createElement("div");
        card.className = "book-card";
        card.innerHTML = `
            <img src="${cover}" alt="${title}" loading="lazy">
            <div class="book-info">
                <h3>${title}</h3>
                <p>${autho}</p>
                <p>${pages} sidor</p>
                <p>${date}</p>
            </div>
        `;

        card.addEventListener("click", () => openBookModal(book));
        booksGrid.appendChild(card);
    });
}

async function fetchBooks() {
    try {
        const res = await axios.get(apiBooks);
        allBooks  = res.data.data;
        renderBooks(getFilteredSorted());
    } catch (err) {
        console.error("Error fetching books:", err);
        if (booksGrid) booksGrid.innerHTML = `<p class="loading">Kunde inte hämta böcker.</p>`;
    }
}

function openBookModal(book) {
    const attr  = getAttr(book);
    const title = attr.title ?? "Ingen titel";
    const autho = attr.autho ?? "Okänd författare";
    const pages = attr.pages ?? "-";
    const date  = attr.publishedDate
        ? new Date(attr.publishedDate).toLocaleDateString("sv-SE")
        : "-";

    modalTitle.textContent = title;
    modalAutho.innerHTML   = `<strong>Författare</strong>${autho}`;
    modalPages.innerHTML   = `<strong>Sidor</strong>${pages}`;
    modalDate.innerHTML    = `<strong>Utgiven</strong>${date}`;
    modalImage.src         = getCoverUrl(book);
    modalImage.alt         = title;

    saveBtn.onclick = () => saveBookToReadList(book.id);

    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
}

async function saveBookToReadList(bookId) {
    const token = localStorage.getItem("jwt");
    if (!token) {
        alert("Du måste vara inloggad för att spara böcker.");
        return;
    }

    try {
        const { data: user } = await axios.get(
            "http://localhost:1337/api/users/me?populate=readList",
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const currentList = (user.readList ?? []).map(b => b.id);

        if (currentList.includes(bookId)) {
            alert("Boken finns redan i din läslista!");
            return;
        }

        await axios.put(
            `http://localhost:1337/api/users/${user.id}`,
            { readList: [...currentList, bookId] },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Boken sparad i din läslista! 📚");

    } catch (err) {
        console.error(err);
        alert("Kunde inte spara boken. Försök igen.");
    }
}

if (booksGrid) {
    fetchBooks();

    closeModalBtn?.addEventListener("click", closeModal);

    window.addEventListener("click", e => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener("keydown", e => {
        if (e.key === "Escape") closeModal();
    });

    searchInput?.addEventListener("input", () => renderBooks(getFilteredSorted()));
    sortSelect?.addEventListener("change",  () => renderBooks(getFilteredSorted()));
}