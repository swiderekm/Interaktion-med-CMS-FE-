const apiProfile = "http://localhost:1337/api";

const profileName      = document.getElementById("profile-name");
const profileEmail     = document.getElementById("profile-email");
const readListContainer = document.getElementById("readlist-container");
const bookCount        = document.getElementById("book-count");

let allBooks    = [];
let currentSort = "title";

function getToken() {
    return localStorage.getItem("jwt");
}

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
        : "https://placehold.co/80x115?text=No+Cover";
}

function sortBooks(books) {
    return [...books].sort((a, b) => {
        const attrA = getAttr(a);
        const attrB = getAttr(b);
        const key   = currentSort === "author" ? "autho" : "title";
        const valA  = (attrA[key] ?? "").toLowerCase();
        const valB  = (attrB[key] ?? "").toLowerCase();
        return valA.localeCompare(valB, "sv");
    });
}

function renderReadList(books) {
    if (!readListContainer) return;

    if (!books.length) {
        readListContainer.innerHTML = "<p>Inga sparade böcker.</p>";
        return;
    }

    readListContainer.innerHTML = "";

    books.forEach(book => {
        const attr    = getAttr(book);
        const title   = attr.title ?? "Ingen titel";
        const author  = attr.autho ?? "Okänd";
        const cover   = getCoverUrl(book);

        const item = document.createElement("div");
        item.className = "readlist-item";
        item.innerHTML = `
            <img src="${cover}" alt="${title}" loading="lazy">
            <div class="readlist-item-info">
                <strong>${title}</strong>
                <span>${author}</span>
            </div>
            <button class="btn btn-danger" aria-label="Ta bort ${title}">Ta bort</button>
        `;

        item.querySelector("button").addEventListener("click", () => {
            removeFromReadList(book.id);
        });

        readListContainer.appendChild(item);
    });
}

async function loadProfile() {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const { data: user } = await axios.get(
            `${apiProfile}/users/me?populate[readList][populate]=cover`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (profileName)  profileName.textContent  = user.username || "Användare";
        if (profileEmail) profileEmail.textContent = user.email;

        allBooks = user.readList ?? [];
        if (bookCount) bookCount.textContent = allBooks.length;

        renderReadList(sortBooks(allBooks));

    } catch (err) {
        console.error("Kunde inte ladda profil:", err);
    }
}

async function removeFromReadList(bookId) {
    const token = getToken();
    if (!token) return;

    try {
        const { data: user } = await axios.get(
            `${apiProfile}/users/me?populate[readList][populate]=cover`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedList = (user.readList ?? [])
            .map(b => b.id)
            .filter(id => id !== bookId);

        await axios.put(
            `${apiProfile}/users/${user.id}`,
            { readList: updatedList },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        loadProfile();

    } catch (err) {
        console.error("Kunde inte ta bort bok:", err);
    }
}

document.querySelectorAll(".btn-sort").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-sort").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSort = btn.dataset.sort;
        renderReadList(sortBooks(allBooks));
    });
});

loadProfile();