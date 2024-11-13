// DOM Elements
const urlInput = document.getElementById('url-input');
const addButton = document.getElementById('add-button');
const statusTableBody = document.querySelector('#status-table tbody');

// Local Storage Key
const STORAGE_KEY = 'websiteStatusList';

// Load websites from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedWebsites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    savedWebsites.forEach(site => addWebsiteRow(site));
});

// Add Website Event Listener
addButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (isValidURL(url)) {
        const website = { url, status: 'Checking...', lastChecked: 'Never' };
        addWebsiteRow(website);
        saveWebsiteToLocalStorage(website);
        urlInput.value = ''; // Clear input field
        checkWebsiteStatus(website);
    } else {
        alert('Please enter a valid URL.');
    }
});

// Validate URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Add Website Row to Table
function addWebsiteRow({ url, status, lastChecked }) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${url}</td>
        <td>${status}</td>
        <td>${lastChecked}</td>
        <td><button class="remove-button">Remove</button></td>
    `;

    // Add Remove Button Event
    row.querySelector('.remove-button').addEventListener('click', () => {
        row.remove();
        removeWebsiteFromLocalStorage(url);
    });

    statusTableBody.appendChild(row);
}

// Save Website to Local Storage
function saveWebsiteToLocalStorage(website) {
    const websites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    websites.push(website);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(websites));
}

// Remove Website from Local Storage
function removeWebsiteFromLocalStorage(url) {
    const websites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const updatedWebsites = websites.filter(site => site.url !== url);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWebsites));
}

// Check Website Status
function checkWebsiteStatus(website) {
    fetch(website.url, { method: 'HEAD' })
        .then(response => {
            const status = response.ok ? 'Operational' : 'Down';
            updateWebsiteStatus(website.url, status);
        })
        .catch(() => updateWebsiteStatus(website.url, 'Down'));
}

// Update Website Status in Table
function updateWebsiteStatus(url, status) {
    const rows = statusTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === url) {
            row.cells[1].textContent = status;
            row.cells[2].textContent = new Date().toLocaleString();
        }
    });
}

// Periodic Check Interval (in milliseconds)
const CHECK_INTERVAL = 30000; // 30 seconds

// Check Website Status and Update Periodically
function checkWebsiteStatus(website, periodic = false) {
    fetch(website.url, { method: 'HEAD' })
        .then(response => {
            const status = response.ok ? 'Operational' : 'Down';
            updateWebsiteStatus(website.url, status);
        })
        .catch(() => updateWebsiteStatus(website.url, 'Down'))
        .finally(() => {
            if (periodic) {
                setTimeout(() => checkWebsiteStatus(website, true), CHECK_INTERVAL);
            }
        });
}

// Update Website Status in Table
function updateWebsiteStatus(url, status) {
    const rows = statusTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === url) {
            row.cells[1].textContent = status;
            row.cells[2].textContent = new Date().toLocaleString();
        }
    });

    // Update Local Storage
    const websites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const updatedWebsites = websites.map(site => {
        if (site.url === url) {
            site.status = status;
            site.lastChecked = new Date().toLocaleString();
        }
        return site;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWebsites));
}

// Trigger Periodic Checks for All Websites
function startPeriodicChecks() {
    const websites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    websites.forEach(website => checkWebsiteStatus(website, true));
}

// Start periodic checks on page load
document.addEventListener('DOMContentLoaded', startPeriodicChecks);

