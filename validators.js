/**
 * validators.js - Input validation and formatting helpers
 * 
 * Provides utilities for date parsing, validation, and formatting
 */

/**
 * Derive day name from a date string
 * Attempts multiple date formats to be flexible
 * 
 * @param {string} dateString - Date in format like "08 January 2025" or "2025-01-08"
 * @returns {string} Day name (e.g., "Wednesday") or empty string if parse fails
 */
function deriveDayName(dateString) {
    if (!dateString) return '';
    
    try {
        // Try to parse various formats
        let dateObj = null;
        
        // Format: "08 January 2025" or "8 January 2025"
        const format1 = /^(\d{1,2})\s+(\w+)\s+(\d{4})$/i;
        const match1 = dateString.match(format1);
        
        if (match1) {
            const [, day, month, year] = match1;
            const monthNames = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'
            ];
            const monthIndex = monthNames.indexOf(month.toLowerCase());
            
            if (monthIndex !== -1) {
                // Create date string in format: YYYY-MM-DD
                const monthStr = String(monthIndex + 1).padStart(2, '0');
                const dayStr = day.padStart(2, '0');
                dateObj = new Date(`${year}-${monthStr}-${dayStr}`);
            }
        }
        
        // Fallback: try standard Date parsing
        if (!dateObj || isNaN(dateObj.getTime())) {
            dateObj = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        // Get day name
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayNames[dateObj.getDay()];
        
    } catch (error) {
        console.warn('Date parsing failed:', error);
        return '';
    }
}

/**
 * Validate required text field
 * @param {string} value - Field value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error: string }
 */
function validateRequired(value, fieldName) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
        return {
            valid: false,
            error: `${fieldName} is required`
        };
    }
    return { valid: true, error: '' };
}

/**
 * Validate Notice form data
 * @param {Object} data - Form data
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateNoticeForm(data) {
    const errors = [];
    
    if (!validateRequired(data.date, 'Date').valid) {
        errors.push('Date is required');
    }
    
    if (!validateRequired(data.time, 'Time').valid) {
        errors.push('Time is required');
    }
    
    if (!validateRequired(data.venue, 'Venue').valid) {
        errors.push('Venue is required');
    }
    
    if (!validateRequired(data.agenda, 'Agenda').valid) {
        errors.push('Agenda/Subject is required');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate MOM form data
 * @param {Object} data - Form data
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateMOMForm(data) {
    const errors = [];
    
    if (!validateRequired(data.date, 'Date').valid) {
        errors.push('Date is required');
    }
    
    if (!validateRequired(data.time, 'Time').valid) {
        errors.push('Time is required');
    }
    
    if (!validateRequired(data.venue, 'Venue').valid) {
        errors.push('Venue is required');
    }
    
    if (!data.agendaItems || data.agendaItems.length === 0) {
        errors.push('At least one agenda item is required');
    }
    
    if (!validateRequired(data.discussion, 'Key Discussion Points').valid) {
        errors.push('Key Discussion Points are required');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Parse multiline text into array (for agenda items, attendees, etc.)
 * Handles both line-separated and comma-separated formats
 * 
 * @param {string} text - Multiline or comma-separated text
 * @returns {Array<string>} Array of trimmed, non-empty items
 */
function parseMultilineInput(text) {
    if (!text) return [];
    
    // First try splitting by newlines
    let items = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // If only one item, try splitting by comma
    if (items.length === 1 && items[0].includes(',')) {
        items = items[0].split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    
    return items;
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format time string consistently
 * @param {string} timeStr - Time string
 * @returns {string} Formatted time
 */
function formatTime(timeStr) {
    // Basic cleanup - just trim
    return (timeStr || '').trim();
}

/**
 * Format venue string consistently
 * @param {string} venueStr - Venue string
 * @returns {string} Formatted venue
 */
function formatVenue(venueStr) {
    // Basic cleanup - just trim
    return (venueStr || '').trim();
}

/**
 * Normalize date string format
 * @param {string} dateStr - Date string
 * @returns {string} Normalized date string
 */
function normalizeDate(dateStr) {
    // Just trim and return - keep user format
    return (dateStr || '').trim();
}
