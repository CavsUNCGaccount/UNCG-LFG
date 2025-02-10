const searchButton = document.getElementById("search-button");
const searchBox = document.getElementById("search-box");
const clearSearch = document.getElementById("clear-search");
const searchInput = document.getElementById("search-input");

searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    // Toggle visibility of the search box
    if (searchBox.style.display === "none" || !searchBox.style.display) {
        searchBox.style.display = "flex";
    } else {
        searchBox.style.display = "none";
    }
});

clearSearch.addEventListener("click", function () {
    searchInput.value = ""; // Clear the input field
});
