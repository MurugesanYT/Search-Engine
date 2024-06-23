document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchButton').addEventListener('click', function() {
        search();
    });

    document.getElementById('searchInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            search();
        }
    });

    loadjQuery(function() {
        console.log("jQuery loaded successfully.");
    });
});

function loadjQuery(callback) {
    if (typeof jQuery === 'undefined') {
        var script = document.createElement('script');
        script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
        script.onload = callback;
        document.head.appendChild(script);
    } else {
        callback();
    }
}

function search() {
    var searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) {
        alert("Please enter a search term.");
        return;
    }

    var apiUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=" + encodeURIComponent(searchTerm) + "&callback=?";

    $.ajax({
        url: apiUrl,
        dataType: 'jsonp',
        success: function(data) {
            if (data.query && data.query.search) {
                displayResults(data.query.search);
            } else {
                displayNotFound();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data from Wikipedia:', error);
            alert("Error fetching data from Wikipedia. Please try again later.");
        }
    });
}

function displayResults(results) {
    var searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (results.length === 0) {
        displayNotFound();
        return;
    }

    results.forEach(function(result) {
        var title = result.title;
        var snippet = result.snippet;
        var div = document.createElement('div');
        div.classList.add('searchResult');
        div.dataset.title = title;

        var content = '<h3>' + title + '</h3>';
        content += '<p>' + snippet + '</p>';

        div.innerHTML = content;
        div.addEventListener('click', function() {
            displayPageContent(this.dataset.title);
        });
        searchResults.appendChild(div);
    });
}

function displayPageContent(title) {
    // Show loading bar
    document.getElementById('loadingBar').style.display = 'block';

    var apiUrl = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + encodeURIComponent(title) + "&callback=?";

    $.ajax({
        url: apiUrl,
        dataType: 'jsonp',
        success: function(data) {
            // Hide loading bar
            document.getElementById('loadingBar').style.display = 'none';

            if (data.parse && data.parse.text) {
                var pageContent = data.parse.text['*'];
                var searchResults = document.getElementById('searchResults');
                searchResults.innerHTML = pageContent;

                // Apply custom styles to the fetched content
                stylePageContent(searchResults);
            } else {
                alert("Unable to fetch page content.");
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching page content from Wikipedia:', error);
            alert("Error fetching page content from Wikipedia. Please try again later.");

            // Hide loading bar
            document.getElementById('loadingBar').style.display = 'none';
        }
    });
}

function stylePageContent(container) {
    // Remove Wikipedia-specific styles
    container.querySelectorAll('table, div, span').forEach(function(element) {
        element.removeAttribute('class');
        element.removeAttribute('style');
    });

    // Apply custom styles to headers
    container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(function(element) {
        element.style.color = '#007bff';
        element.style.fontFamily = 'Arial, sans-serif';
    });

    // Apply custom styles to paragraphs
    container.querySelectorAll('p').forEach(function(element) {
        element.style.color = '#333';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.lineHeight = '1.5';
    });

    // Apply custom styles to links
    container.querySelectorAll('a').forEach(function(element) {
        element.style.color = '#007bff';
        element.style.textDecoration = 'none';
    });

    // Apply custom styles to images
    container.querySelectorAll('img').forEach(function(element) {
        element.style.maxWidth = '100%';
        element.style.height = 'auto';
        element.style.display = 'block';
        element.style.margin = '10px 0';
    });
}

function displayNotFound() {
    document.getElementById('searchResults').innerHTML = '<p>Information not found.</p>';
}
