const apiBooks = "http://localhost:1337/api/books?populate=*";

const booksGrid = document.getElementById("books-grid");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

let allBooks = [];


async function fetchBooks() {
    try {
        const response = await axios.get(apiBooks);

        allBooks = response.data.data;

        renderBooks(allBooks);

    } catch (error) {
        console.error("Error fetching books:", error);

        booksGrid.innerHTML = `
            <p class="error-message">
                Kunde inte hämta böcker.
            </p>
        `;
    }
}

function renderBooks(books) {

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <p>Inga böcker hittades.</p>
        `;
        return;
    }

    booksGrid.innerHTML = "";

    books.forEach(book => {

        const title = book.title;
        const author = book.author;
        const pages = book.pages;
        const publishedDate = book.publishedDate;

        let coverUrl = "";

        if (book.cover && book.cover.url) {
            coverUrl = `http://localhost:1337${book.cover.url}`;
        } else {
            coverUrl = "https://placehold.co/300x450?text=No+Image";
        }

        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        bookCard.innerHTML = `
            <div class="book-image">
                <img src="${coverUrl}" alt="${title}">
            </div>

            <div class="book-content">
                <h3>${title}</h3>

                <p><strong>Författare:</strong> ${author}</p>

                <p><strong>Sidor:</strong> ${pages}</p>

                <p><strong>Utgiven:</strong> ${publishedDate}</p>
            </div>
        `;

        booksGrid.appendChild(bookCard);
    });
}

searchInput.addEventListener("input", () => {

    const searchValue = searchInput.value.toLowerCase();

    const filteredBooks = allBooks.filter(book => {

        return (
            book.title.toLowerCase().includes(searchValue) ||
            book.author.toLowerCase().includes(searchValue)
        );
    });

    sortAndRender(filteredBooks);
});

sortSelect.addEventListener("change", () => {
    sortAndRender([...allBooks]);
});

function sortAndRender(books) {

    const sortValue = sortSelect.value;

    if (sortValue === "title") {

        books.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

    } else if (sortValue === "author") {

        books.sort((a, b) =>
            a.author.localeCompare(b.author)
        );
    }

    renderBooks(books);
}

fetchBooks();