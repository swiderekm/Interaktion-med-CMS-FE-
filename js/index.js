const apiBooks = "http://localhost:1337/api/books?populate=*";

const booksGrid = document.getElementById("books-grid");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const modal = document.getElementById("book-modal");
const closeModalBtn = document.getElementById("close-modal");

const modalTitle = document.getElementById("modal-title");
const modalAutho = document.getElementById("modal-autho");
const modalPages = document.getElementById("modal-pages");
const modalDate = document.getElementById("modal-date");
const modalImage = document.getElementById("modal-image");

const saveBtn = document.getElementById("save-book-btn");

let allBooks = [];

async function fetchBooks() {
    try {
        const response = await axios.get(apiBooks);
        allBooks = response.data.data;
        renderBooks(allBooks);
    } catch (error) {
        console.error("Error fetching books:", error);
        if (booksGrid) {
            booksGrid.innerHTML = `<p>Kunde inte hämta böcker.</p>`;
        }
    }
}

function renderBooks(books) {
    if (!booksGrid) return;

    booksGrid.innerHTML = "";

    books.forEach(book => {
        const attr = book.attributes || book;

        const title = attr.title || "Ingen titel";
        const autho = attr.autho || "Okänd författare";
        const pages = attr.pages || "-";
        const publishedDate = attr.publishedDate
            ? new Date(attr.publishedDate).toLocaleDateString("sv-SE")
            : "-";

        let coverUrl = "https://placehold.co/300x450?text=No+Image";

        const cover =
            book?.attributes?.cover ||
            book?.cover ||
            null;

        if (cover?.data?.attributes?.url) {
            coverUrl = `http://localhost:1337${cover.data.attributes.url}`;
        }
        else if (cover?.attributes?.url) {
            coverUrl = `http://localhost:1337${cover.attributes.url}`;
        }
        else if (cover?.url) {
            coverUrl = `http://localhost:1337${cover.url}`;
        }

        const card = document.createElement("div");
        card.classList.add("book-card");

        card.innerHTML = `
            <div class="book-image">
                <img src="${coverUrl}" alt="${title}">
            </div>
            <div class="book-content">
                <h3>${title}</h3>
                <p>${autho}</p>
                <p>${pages} pages</p>
                <p>${publishedDate}</p>
            </div>
        `;

        booksGrid.appendChild(card);

        card.addEventListener("click", () => {
            openBookModal(book);
        });
    });
}

if (booksGrid) {
    fetchBooks();

    closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });

    searchInput?.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();

        const filtered = allBooks.filter(b => {
            const a = b.attributes || b;
            return (
                (a.title || "").toLowerCase().includes(value) ||
                (a.autho || "").toLowerCase().includes(value)
            );
        });

        renderBooks(filtered);
    });

    sortSelect?.addEventListener("change", () => {
        const sorted = [...allBooks];

        sorted.sort((a, b) => {
            const A = (a.attributes?.title || "").toLowerCase();
            const B = (b.attributes?.title || "").toLowerCase();
            return A.localeCompare(B);
        });

        renderBooks(sorted);
    });
}

function openBookModal(book) {
    const attr = book.attributes || book;

    const title = attr.title || "Ingen titel";
    const autho = attr.autho || "Okänd författare";
    const pages = attr.pages || "-";
    const date = attr.publishedDate
        ? new Date(attr.publishedDate).toLocaleDateString("sv-SE")
        : "-";

    let coverUrl = "https://placehold.co/300x450?text=No+Image";

    const cover =
        book?.attributes?.cover ||
        book?.cover ||
        null;

    if (cover?.data?.attributes?.url) {
        coverUrl = `http://localhost:1337${cover.data.attributes.url}`;
    } else if (cover?.attributes?.url) {
        coverUrl = `http://localhost:1337${cover.attributes.url}`;
    } else if (cover?.url) {
        coverUrl = `http://localhost:1337${cover.url}`;
    }

    modalTitle.textContent = title;
    modalAutho.textContent = `Författare: ${autho}`;
    modalPages.textContent = `Sidor: ${pages}`;
    modalDate.textContent = `Utgiven: ${date}`;
    modalImage.src = coverUrl;

    saveBtn.onclick = () => {
        saveBookToReadList(book.id);
    };

    modal.classList.remove("hidden");
}

async function saveBookToReadList(bookId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Du måste vara inloggad");
        return;
    }

    try {
        const userRes = await axios.get(
            "http://localhost:1337/api/users/me?populate=readList",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const user = userRes.data;
        const currentList = user.readList.map(b => b.id);

        if (!currentList.includes(bookId)) {
            currentList.push(bookId);
        }

        await axios.put(
            `http://localhost:1337/api/users/${user.id}`,
            {
                readList: currentList
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        alert("Boken sparad!");

    } catch (err) {
        console.error(err);
        alert("Kunde inte spara bok");
    }
}