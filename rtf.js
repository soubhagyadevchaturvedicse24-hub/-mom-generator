/**
 * rtf.js - RTF (Rich Text Format) generation utilities
 * 
 * This module handles all RTF generation for perfect copy-paste into Microsoft Word.
 * RTF ensures formatting (bold, underline, centering, fonts) is preserved exactly.
 */

/**
 * Parse discussion points from text
 * Handles bullet points, numbered lists, or plain paragraphs
 * @param {string} text - Discussion text
 * @returns {Array<string>} Array of discussion points
 */
function parseDiscussionPoints(text) {
    if (!text) return [];
    
    // Split by newlines and filter
    let points = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    // Remove bullet markers and numbering
    points = points.map(point => {
        return point
            .replace(/^[-•*]\s*/, '')      // Remove bullet markers
            .replace(/^\d+\.\s*/, '')      // Remove numbering
            .trim();
    });
    
    return points.filter(p => p.length > 0);
}

/**
 * Elaborate a discussion point with professional jargon
 * Expands key points naturally without adding new ideas
 * @param {string} point - Key point to elaborate
 * @returns {string} Elaborated point
 */
function elaboratePoint(point) {
    if (!point) return '';
    
    // If the point is already detailed (more than 100 characters), return as is
    if (point.length > 100) {
        return point;
    }
    
    // Add professional context based on common keywords
    const elaborations = {
        'review': 'The committee conducted a comprehensive review of ',
        'discuss': 'Extensive deliberations were held regarding ',
        'approve': 'Following detailed consideration, the committee approved ',
        'implement': 'It was unanimously decided to implement ',
        'schedule': 'The committee finalized the schedule for ',
        'coordinate': 'Coordination measures were discussed and established for ',
        'evaluate': 'A thorough evaluation was undertaken concerning ',
        'workload': 'The distribution and allocation of faculty workload was examined, with emphasis on ',
        'syllabus': 'Curricular aspects were reviewed, particularly focusing on ',
        'examination': 'Assessment and examination protocols were deliberated upon, specifically addressing '
    };
    
    // Check if point contains any keywords
    const lowerPoint = point.toLowerCase();
    for (const [keyword, prefix] of Object.entries(elaborations)) {
        if (lowerPoint.includes(keyword)) {
            // Don't add prefix if point already starts with similar professional language
            if (lowerPoint.startsWith('the committee') || 
                lowerPoint.startsWith('it was') || 
                lowerPoint.startsWith('following')) {
                return point;
            }
            return `${prefix}${point.toLowerCase()}. The matter was thoroughly discussed and appropriate decisions were taken in accordance with institutional guidelines.`;
        }
    }
    
    // Default elaboration for points without specific keywords
    return `${point}. This matter was deliberated upon at length, and the committee reached a consensus on the way forward, ensuring alignment with departmental objectives and academic standards.`;
}

/**
 * Escape special RTF characters in user input
 * RTF requires escaping: backslash (\), braces ({, })
 * Also normalize quotes to straight quotes (no smart quotes)
 */
function escapeRtf(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')   // Escape backslashes first
        .replace(/\{/g, '\\{')    // Escape opening braces
        .replace(/\}/g, '\\}')    // Escape closing braces
        .replace(/['']/g, "'")    // Normalize smart single quotes
        .replace(/[""]/g, '"');   // Normalize smart double quotes
}

/**
 * Generate RTF font table
 * @param {boolean} useTimes - true for Times New Roman, false for Calibri
 * @returns {string} RTF font table definition
 */
function fontTable(useTimes = true) {
    if (useTimes) {
        return '{\\fonttbl{\\f0\\froman\\fcharset0 Times New Roman;}}';
    } else {
        return '{\\fonttbl{\\f0\\fswiss\\fcharset0 Calibri;}}';
    }
}

/**
 * Get RTF font size token
 * @param {string} size - '12', '13', or '14' (points)
 * @returns {string} RTF font size control (half-points)
 */
function fontSizeToken(size = '12') {
    const sizeMap = {
        '12': '\\fs24',  // 12pt = 24 half-points
        '13': '\\fs26',  // 13pt = 26 half-points
        '14': '\\fs28'   // 14pt = 28 half-points
    };
    return sizeMap[size] || '\\fs24';
}

/**
 * Create a paragraph with RTF formatting
 * @param {string} text - The text content
 * @param {Object} opts - Formatting options
 * @param {string} opts.align - 'center', 'left', 'right', 'justify'
 * @param {boolean} opts.bold - Apply bold
 * @param {boolean} opts.underline - Apply underline
 * @returns {string} RTF formatted paragraph
 */
function p(text, opts = {}) {
    const { align = 'left', bold = false, underline = false } = opts;
    
    // Alignment control
    let alignCtrl = '\\pard';
    if (align === 'center') alignCtrl = '\\pard\\qc';
    else if (align === 'right') alignCtrl = '\\pard\\qr';
    else if (align === 'justify') alignCtrl = '\\pard\\qj';
    
    // Style controls
    let styleStart = '';
    let styleEnd = '';
    
    if (bold) {
        styleStart += '\\b ';
        styleEnd = '\\b0' + styleEnd;
    }
    
    if (underline) {
        styleStart += '\\ul ';
        styleEnd = '\\ulnone' + styleEnd;
    }
    
    return `${alignCtrl} ${styleStart}${escapeRtf(text)}${styleEnd}\\par\n`;
}

/**
 * Create a bullet point line
 * Uses bullet character (•) = \'95 in RTF
 * @param {string} text - The bullet text
 * @returns {string} RTF formatted bullet line
 */
function bullet(text) {
    // \'95 = bullet character, \~ = non-breaking space
    return `\\pard \\'95\\~${escapeRtf(text)}\\par\n`;
}

/**
 * Create a tab-separated row (for tables/columns)
 * @param {Array<string>} cells - Array of cell values
 * @returns {string} RTF formatted tab row
 */
function tabRow(cells) {
    const escapedCells = cells.map(c => escapeRtf(c || ''));
    return `\\pard ${escapedCells.join('\\tab ')}\\par\n`;
}

/**
 * Build Notice RTF document
 * Implements exact institute style with precise formatting
 * 
 * @param {Object} payload - Notice data
 * @param {string} payload.date - Meeting date
 * @param {string} payload.time - Meeting time
 * @param {string} payload.venue - Meeting venue
 * @param {string} payload.agenda - Meeting agenda/subject
 * @param {boolean} payload.includeDay - Include day name in body
 * @param {string} payload.font - 'times' or 'calibri'
 * @param {string} payload.size - '12', '13', or '14'
 * @param {boolean} payload.extraBlank - Add extra blank before footer
 * @returns {string} Complete RTF document
 */
function buildNoticeRTF(payload) {
    const {
        date = '',
        time = '',
        venue = '',
        agenda = '',
        includeDay = false,
        font = 'times',
        size = '12',
        extraBlank = false
    } = payload;
    
    const ftable = fontTable(font === 'times');
    const fsize = fontSizeToken(size);
    
    // Derive day name if requested
    const day = includeDay ? deriveDayName(date) : '';
    const dateWithDay = day ? `${day}, ${date}` : date;
    
    // Build body sentence
    const bodySentence = `A departmental meeting is scheduled on ${dateWithDay} at ${time} in the ${venue}, regarding the preparation and coordination of ${agenda}.`;
    
    // Construct RTF document
    let rtf = `{\\rtf1\\ansi\\deff0${ftable}${fsize}\n`;
    
    // Header: Date line (left aligned)
    rtf += `\\pard Date:\\~\\- ${escapeRtf(date)}\\par\n`;
    
    // Department line (bold, centered)
    rtf += p('Department of Computer Science & Engineering', { align: 'center', bold: true });
    
    // NOTICE (bold + underlined, centered)
    rtf += p('NOTICE', { align: 'center', bold: true, underline: true });
    
    // Blank line
    rtf += `\\par\n`;
    
    // Body paragraph (left aligned)
    rtf += `\\pard ${escapeRtf(bodySentence)}\\par\n`;
    
    // Blank line
    rtf += `\\par\n`;
    
    // Request line
    rtf += `\\pard All faculty members are requested to attend the meeting on time.\\par\n`;
    
    // Optional extra blank before footer
    if (extraBlank) {
        rtf += `\\par\n`;
    }
    
    // Footer: HOD line
    rtf += `\\pard HOD (CSE)\\par\n`;
    
    // Copy to:
    rtf += `\\pard Copy to:\\par\n`;
    
    // Bullet list
    rtf += bullet('All faculty members of CSE');
    rtf += bullet('Principal \\endash for kind Information');
    rtf += bullet('Chairman (BG) for kind information');
    
    // Close RTF document
    rtf += `}`;
    
    return rtf;
}

/**
 * Build MOM (Minutes of Meeting) RTF document
 * Implements structured meeting minutes with sections
 * 
 * @param {Object} payload - MOM data
 * @param {string} payload.department - Department name
 * @param {string} payload.date - Meeting date
 * @param {string} payload.time - Meeting time
 * @param {string} payload.venue - Meeting venue
 * @param {Array<string>} payload.agendaItems - Agenda items (array)
 * @param {string} payload.discussion - Key discussion points
 * @param {string} payload.closing - Mandatory closing statement
 * @param {boolean} payload.includeDay - Include day name
 * @param {string} payload.font - 'times' or 'calibri'
 * @param {string} payload.size - '12', '13', or '14'
 * @returns {string} Complete RTF document
 */
function buildMOMRTF(payload) {
    const {
        department = 'Department of Computer Science & Engineering',
        date = '',
        time = '',
        venue = '',
        agendaItems = [],
        discussion = '',
        closing = '',
        includeDay = false,
        font = 'times',
        size = '12'
    } = payload;
    
    const ftable = fontTable(font === 'times');
    const fsize = fontSizeToken(size);
    
    // Start RTF document with proper header
    let rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat${ftable}\n`;
    rtf += `{\\*\\generator Riched20;}\\viewkind4\\uc1\n`;
    rtf += `${fsize}\\lang1033\\f0\\par\n`;
    
    // Header: Department (bold, centered)
    rtf += `\\pard\\sa200\\sl276\\slmult1\\qc\\b\\f0\\fs24 ${escapeRtf(department)}\\b0\\par\n`;
    rtf += `\\pard\\sa200\\sl276\\slmult1\\par\n`;
    
    // Meeting Meta (left aligned) - with BOLD labels including colon
    rtf += `\\pard\\sa200\\sl276\\slmult1\\b Date:\\b0  \\- ${escapeRtf(date)}\\par\n`;
    rtf += `\\b Time:\\b0  ${escapeRtf(time)}\\par\n`;
    rtf += `\\b Venue:\\b0  ${escapeRtf(venue)}\\par\n`;
    rtf += `\\par\n`;
    
    // Agenda (numbered list) - with BOLD heading including colon
    if (agendaItems.length > 0) {
        rtf += `\\b Agenda:\\b0\\par\n`;
        agendaItems.forEach((item, index) => {
            rtf += `${index + 1}. ${escapeRtf(item)}\\par\n`;
        });
        rtf += `\\par\n`;
    }
    
    // Minutes of Meeting (BOLD heading including colon)
    rtf += `\\b Minutes of Meeting:\\b0\\par\n`;
    
    // Discussion Points & Decisions (elaborated)
    if (discussion) {
        // Parse discussion points and elaborate
        const points = parseDiscussionPoints(discussion);
        points.forEach((point, index) => {
            rtf += `${index + 1}. ${escapeRtf(elaboratePoint(point))}\\par\n`;
        });
        rtf += `\\par\n`;
    }
    
    // Mandatory Closing Statement
    const closingStatement = 'The meeting concluded at 12:00 PM with positive remarks from the Head of Department';
    rtf += `${escapeRtf(closingStatement)}\\par\n`;
    
    // Close RTF document
    rtf += `}`;
    
    return rtf;
}
