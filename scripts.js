if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").then(
        (registration) => {
          console.log("ServiceWorker registration successful:", registration);
        },
        (error) => {
          console.log("ServiceWorker registration failed:", error);
        }
      );
    });
  }
  

// Store state for Quick Go
let quickGoState = {
    date: null,
    startOdometer: null,
    endOdometer: null,
};

// Function to set today's date as the default
function setDefaultDate() {
    const dateField = document.getElementById('date');
    if (dateField) {
        const today = new Date();

        // Format the date as YYYY-MM-DD
        const formattedDate = today.toISOString().split('T')[0];

        // Set the value of the date field
        dateField.value = formattedDate;
    }
}

// Function to set the start miles to the previous entry's end miles
function setDefaultStartMiles() {
    const startMilesField = document.getElementById('start-odometer');
    const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];

    // Check if there are existing log entries
    if (logEntries.length > 0) {
        const lastEntry = logEntries[logEntries.length - 1];
        startMilesField.value = lastEntry.endOdometer;
    } else {
        startMilesField.value = '';
    }
}

// Function to initialize the Quick Go section
function initializeQuickGo() {
    const goButton = document.getElementById('go-button');
    const endButton = document.getElementById('end-button');
    const updateInput = document.getElementById('update-start-odometer');
    const updateLabel = document.querySelector('#quick-go-update label');

    // Load previous day's end KM
    const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
    const lastEntry = logEntries.length > 0 ? logEntries[logEntries.length - 1] : null;
    const yesterdayEndKM = lastEntry ? lastEntry.endOdometer : 0;

    // Set initial state and button text
    quickGoState.date = new Date().toISOString().split('T')[0]; // Today's date
    quickGoState.startOdometer = yesterdayEndKM;

    if (lastEntry) {
        goButton.textContent = `Resume with Last Reading: ${yesterdayEndKM.toLocaleString()}km`;
        updateInput.value = yesterdayEndKM;
    } else {
        goButton.textContent = 'Enter Start KM';
    }

    // Handle Go button click
    goButton.addEventListener('click', () => {
        quickGoState.startOdometer = parseFloat(updateInput.value);
        alert(`Starting KM set to ${quickGoState.startOdometer}`);

        // Switch to End KM mode
        goButton.style.display = 'none';
        endButton.style.display = 'inline-block';
        updateLabel.textContent = 'End KM:';
        updateInput.placeholder = 'Enter End KM';
        updateInput.value = ''; // Clear the field for end KM input
    });

    // Handle End Day button click
    endButton.addEventListener('click', () => {
        quickGoState.endOdometer = parseFloat(updateInput.value);

        if (isNaN(quickGoState.endOdometer) || quickGoState.endOdometer <= quickGoState.startOdometer) {
            alert('Please enter a valid end KM greater than the start KM.');
            return;
        }

        const purpose = prompt('Enter purpose of today\'s travel:');

        const kilometersDriven = quickGoState.endOdometer - quickGoState.startOdometer;

        // Save the log entry
        const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries.push({
            date: quickGoState.date,
            startOdometer: quickGoState.startOdometer,
            endOdometer: quickGoState.endOdometer,
            kilometersDriven,
            purpose,
        });
        localStorage.setItem('logEntries', JSON.stringify(logEntries));

        alert('Log entry saved!');
        location.reload(); // Reset the interface
    });
}

// Event listener for the manual entry form submission
document.getElementById('daily-log-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get form values
    const date = document.getElementById('date').value;
    const startOdometer = parseFloat(document.getElementById('start-odometer').value);
    const endOdometer = parseFloat(document.getElementById('end-odometer').value);
    const purpose = document.getElementById('purpose').value;

    // Calculate kilometers driven
    const kilometersDriven = endOdometer - startOdometer;

    // Save to localStorage
    const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
    logEntries.push({ 
        date, 
        startOdometer, 
        endOdometer, 
        kilometersDriven, 
        purpose 
    });
    localStorage.setItem('logEntries', JSON.stringify(logEntries));

    alert('Log entry saved!'); // Optional: Notify user
    this.reset();

    // Reset the date and start miles
    setDefaultDate();
    setDefaultStartMiles();
});

// Initialize the application on page load
window.onload = function () {
    initializeQuickGo(); // Initialize Quick Go functionality
    setDefaultDate();    // Set default date for manual entry
    setDefaultStartMiles(); // Set default start miles for manual entry
};
