const apiLink = "http://localhost:1337/api";

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const readListContainer = document.getElementById("readlist-container");
const bookCount = document.getElementById("book-count");

let allBooks = [];
let currentSort = "title";

async function loadProfile() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await axios.get(
            `${apiLink}/users/me?populate[readList][populate]=cover`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const user = res.data;

        profileName.textContent = user.username || "Användare";
        profileEmail.textContent = user.email;

        allBooks = user.readList || [];

        renderReadList(getSortedBooks());

        if (bookCount) {
            bookCount.textContent = allBooks.length;
        }

    } catch (err) {
        console.error("Profile error:", err);
    }
}

function getSortedBooks() {
    return [...allBooks].sort((a, b) => {
        const attrA = a.attributes || a;
        const attrB = b.attributes || b;

        if (currentSort === "title") {
            const titleA = (attrA.title || "").toLowerCase();
            const titleB = (attrB.title || "").toLowerCase();
            return titleA.localeCompare(titleB, "sv");
        } else if (currentSort === "author") {
            const authorA = (attrA.autho || "").toLowerCase();
            const authorB = (attrB.autho || "").toLowerCase();
            return authorA.localeCompare(authorB, "sv");
        }

        return 0;
    });
}

function renderReadList(books) {
    if (!readListContainer) return;

    if (books.length === 0) {
        readListContainer.innerHTML = "<p>Inga sparade böcker.</p>";
        return;
    }

    readListContainer.innerHTML = "";

    books.forEach(book => {
        const attr = book.attributes || book;

        const title = attr.title || "Ingen titel";
        const autho = attr.autho || "Okänd";

        let coverUrl = "https://placehold.co/100x150?text=No+Image";

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

        const div = document.createElement("div");
        div.classList.add("readlist-item");

        div.innerHTML = `
            <img src="${coverUrl}" alt="${title}" style="width:80px; border-radius:6px;">

            <p><strong>${title}</strong> – ${autho}</p>

            <button class="btn btn-danger">Ta bort</button>
        `;

        div.querySelector("button").onclick = () => {
            removeBookFromReadList(book.id);
        };

        readListContainer.appendChild(div);
    });
}

async function removeBookFromReadList(bookId) {
    const token = localStorage.getItem("jwt");

    if (!token) return;

    try {
        const res = await axios.get(
            `${apiLink}/users/me?populate[readList][populate]=cover`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const user = res.data;

        const currentList = (user.readList || []).map(b => b.id);

        const updatedList = currentList.filter(id => id !== bookId);

        await axios.put(
            `${apiLink}/users/${user.id}`,
            {
                readList: updatedList
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        loadProfile();

    } catch (err) {
        console.error("Delete error:", err);
    }
}

// Sort button logic
document.querySelectorAll(".btn-sort").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-sort").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSort = btn.dataset.sort;
        renderReadList(getSortedBooks());
    });
});

loadProfile();