const creationForm = document.getElementById("create-form");
const bookName = document.getElementById("book-name");
const bookAuther = document.getElementById("book-auther");
const bookList = document.getElementById("book-list");
const searchInput = document.getElementById("search-input");
let mode = "create";

document.addEventListener("DOMContentLoaded", () => {
  books = Storage.loadBooks();
  if (books.length) {
    books.forEach((book) => {
      UI.createBook(book)
        .then((res) => {
          bookName.value = "";
          bookAuther.value = "";
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
});

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  let rows = document.querySelectorAll("th");
  let rowsArr = Array.from(rows);
  if (searchInput.value !== "") {
    const matches = books
      .filter((book) => book.name.match(searchInput.value))
      .map((match) => match.name.trim());
    if (!matches.length) {
      alert(`couldn't find ${searchInput.value}`);
    } else {
      rowsArr.map((row) => {
        let rid = row.dataset.id;
        if (rid !== undefined) {
          const displayStyle = matches.includes(rid.trim())
            ? "table-row"
            : "none";
          row.parentElement.style.display = displayStyle;
        }
      });
    }
  } else {
    rowsArr.map((row) => {
      let rid = row.dataset.id;
      if (rid !== undefined) {
        row.parentElement.style.display = "table-row";
      }
    });
  }
});

class Book {
  constructor(name, auther) {
    this.name = name;
    this.auther = auther;
  }
}

class Storage {
  static loadBooks() {
    const books = localStorage.getItem("books");
    return books ? JSON.parse(books) : [];
  }
  static saveBook(book) {
    let books = this.loadBooks() || [];
    books.push(book);
    localStorage.setItem("books", JSON.stringify(books));
  }
  static updateBooks = (books) => {
    localStorage.setItem("books", JSON.stringify(books));
  };
}

class UI {
  static createBook({ name, auther }) {
    return new Promise((resolve, reject) => {
      let row = document.createElement("tr");
      let cells = `<th data-id="${name}" scope="row">${name}</th>
        <td>${auther}</td>
        <td>
          <a onclick="edit('${name}')" href="#"><i class="fa fa-pencil" aria-hidden="true"></i> </a>
        </td>
        <td>
          <a onclick="remove('${name}')" href="#"><i class="fa fa-times" aria-hidden="true"></i></a>
        </td>`;
      row.innerHTML = cells;
      if (bookList.appendChild(row)) {
        resolve("book created successfully");
      } else {
        reject("couldn't create row");
      }
    });
  }

  static updateBook(name, book) {
    return new Promise((res, rej) => {
      try {
        books = this.change(name);
        UI.createBook(book);
        res(books);
      } catch (error) {
        rej("Error: couldn't update this book");
      }
    });
  }

  static removeBook(name) {
    return new Promise((resolve, reject) => {
      try {
        books = this.change(name);
        resolve(books);
      } catch (error) {
        reject("Couldn't remove a book;");
      }
    });
  }

  static change(name) {
    books = books.filter((book) => book.name !== name);
    let rows = document.querySelectorAll("th");
    Array.from(rows).map((row) => {
      let rid = row.dataset.id;
      if (rid === name) {
        row.parentElement.remove();
      }
    });
    return books;
  }
}

const remove = (name) => {
  if (!confirm(`are you sure you wanna delete: ${name}?`)) {
    return;
  }
  UI.removeBook(name)
    .then((books) => Storage.updateBooks(books))
    .catch((err) => console.log(err));
};

const edit = (name) => {
  const book = books.find((book) => book.name === name);
  bookName.value = book.name;
  bookAuther.value = book.auther;
  mode = "edit";
  document.querySelector(".btn-primary").innerText = "Edit Book";
  const hiddenInput = document.createElement("input");
  hiddenInput.setAttribute("type", "hidden");
  hiddenInput.setAttribute("value", book.name);
  hiddenInput.setAttribute("id", "hidden-input");
  creationForm.appendChild(hiddenInput);
};

creationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (bookName.value !== "" && bookAuther.value !== "") {
    switch (mode) {
      case "edit":
        const id = document.getElementById("hidden-input").value;
        UI.updateBook(id, { name: bookName.value, auther: bookAuther.value })
          .then((res) => {
            bookName.value = "";
            bookAuther.value = "";
            mode = "create";
            document.querySelector(".btn-primary").innerText = "Add New Book";
            document.getElementById("hidden-input").remove();
            Storage.updateBooks(res);
          })
          .catch((err) => {
            console.log(err);
          });
        break;

      default:
        const book = new Book(bookName.value, bookAuther.value);
        UI.createBook(book)
          .then((res) => {
            bookName.value = "";
            bookAuther.value = "";
            Storage.saveBook(book);
          })
          .catch((error) => {
            console.log(error);
          });
        break;
    }
  }
});
