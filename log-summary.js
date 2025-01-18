document.addEventListener('DOMContentLoaded', function () {
    const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
    const tableBody = document.getElementById('log-entries');

    // Constants
    const MS_IN_A_DAY = 86400000;
    const MS_IN_A_WEEK = 7 * MS_IN_A_DAY;

    // Helper: Get the start date of the financial year
    function getFinancialYearStart() {
        const today = new Date();
        const currentYear = today.getFullYear();
        return new Date(today < new Date(currentYear, 6, 1) ? currentYear - 1 : currentYear, 6, 1); // July 1st
    }

    // Helper: Get the start of this week
    function getStartOfWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        return new Date(today - dayOfWeek * MS_IN_A_DAY);
    }

    // format date for log
    function formatDateToDMY(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    

    // Calculate Tally
    let totalKm = 0;
    let weeklyKm = 0;
    let totalFyKm = 0;
    let weeklyCounts = new Map(); // { WeekStartDate -> Total KM }
    const fyStart = getFinancialYearStart();
    const weekStart = getStartOfWeek();

    logEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const entryKm = entry.kilometersDriven;

        // Add to total KM
        totalKm += entryKm;

        // Add to weekly KM for the current week
        if (entryDate >= weekStart) {
            weeklyKm += entryKm;
        }

        // Group by week
        const weekStartDate = new Date(entryDate - entryDate.getDay() * MS_IN_A_DAY).toISOString().split('T')[0];
        weeklyCounts.set(weekStartDate, (weeklyCounts.get(weekStartDate) || 0) + entryKm);

        // Add to financial year total
        if (entryDate >= fyStart) {
            totalFyKm += entryKm;
        }
    });

    // Calculate average weekly KM
    const averageWeeklyKm = totalKm / weeklyCounts.size;

    // Update DOM
    document.getElementById('this-week-total').textContent = weeklyKm.toFixed(2);
    document.getElementById('weekly-average').textContent = averageWeeklyKm.toFixed(2);
    document.getElementById('total-fy').textContent = totalFyKm.toFixed(2);

    logEntries.forEach(entry => {
        const newRow = tableBody.insertRow();
    
        // Row for Date, Start, and End
        newRow.innerHTML = `
            <td colspan="4">
                <strong>Date:</strong> ${formatDateToDMY(entry.date)} </br>
            <strong>Start:</strong> ${entry.startOdometer} km, 
            <strong>End:</strong> ${entry.endOdometer} km </br>
                <strong>Purpose:</strong> ${entry.purpose}
            </td>
        `;
    });
    
});
