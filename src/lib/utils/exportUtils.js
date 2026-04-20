/**
 * Generic function to convert an array of objects/arrays to a CSV string 
 * and trigger a browser download.
 * 
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file (e.g., 'productos.csv')
 * @param {Object} columnMap - Mapping of data keys to human-readable headers { key: 'Name' }
 */
export function downloadCSV(data, fileName, columnMap) {
    if (!data || !data.length) {
        alert("No hay datos para exportar.");
        return;
    }

    const headers = Object.values(columnMap);
    const keys = Object.keys(columnMap);

    // Create CSV content
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
        const values = keys.map(key => {
            // Handle nested properties (e.g., 'products.name')
            let val;
            if (key.includes('.')) {
                val = key.split('.').reduce((obj, k) => (obj ? obj[k] : ''), row);
            } else {
                val = row[key];
            }

            // Sanitize value for CSV
            const escaped = ('' + (val ?? '')).replace(/"/g, '""'); // Escape quotes
            return `"${escaped}"`; // Wrap in quotes
        });
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
