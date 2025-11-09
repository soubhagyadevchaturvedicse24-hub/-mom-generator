/**
 * templates.js - Plain text templates for Notice and MOM
 * 
 * These functions generate plain text versions (fallback) of the documents
 * Same content as RTF but without styling codes
 */

/**
 * Convert text to Unicode bold characters
 * @param {string} text - Text to convert
 * @returns {string} Bold Unicode text
 */
function toBoldUnicode(text) {
    const boldMap = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈',
        'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑',
        'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
        'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢',
        'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫',
        's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
    };
    
    return text.split('').map(char => boldMap[char] || char).join('');
}

/**
 * Parse discussion points from text
 * @param {string} text - Discussion text
 * @returns {Array<string>} Array of discussion points
 */
function parseDiscussionPoints(text) {
    if (!text) return [];
    
    let points = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    points = points.map(point => {
        return point
            .replace(/^[-•*]\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .trim();
    });
    
    return points.filter(p => p.length > 0);
}

/**
 * Elaborate a discussion point with professional jargon
 * @param {string} point - Key point to elaborate
 * @returns {string} Elaborated point
 */
function elaboratePoint(point) {
    if (!point) return '';
    
    if (point.length > 100) {
        return point;
    }
    
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
    
    const lowerPoint = point.toLowerCase();
    for (const [keyword, prefix] of Object.entries(elaborations)) {
        if (lowerPoint.includes(keyword)) {
            if (lowerPoint.startsWith('the committee') || 
                lowerPoint.startsWith('it was') || 
                lowerPoint.startsWith('following')) {
                return point;
            }
            return `${prefix}${point.toLowerCase()}. The matter was thoroughly discussed and appropriate decisions were taken in accordance with institutional guidelines.`;
        }
    }
    
    return `${point}. This matter was deliberated upon at length, and the committee reached a consensus on the way forward, ensuring alignment with departmental objectives and academic standards.`;
}

/**
 * Generate plain text Notice
 * @param {Object} payload - Notice data (same structure as RTF)
 * @returns {string} Plain text Notice
 */
function noticeText(payload) {
    const {
        date = '',
        time = '',
        venue = '',
        agenda = '',
        includeDay = false,
        extraBlank = false
    } = payload;
    
    // Derive day name if requested
    const day = includeDay ? deriveDayName(date) : '';
    const dateWithDay = day ? `${day}, ${date}` : date;
    
    // Build body sentence
    const bodySentence = `A departmental meeting is scheduled on ${dateWithDay} at ${time} in the ${venue}, regarding the preparation and coordination of ${agenda}.`;
    
    // Construct plain text
    let text = '';
    
    // Header - use Unicode bold for labels
    text += `${toBoldUnicode('Date:')} - ${date}\n`;
    text += `Department of Computer Science & Engineering\n`;
    text += `NOTICE\n`;
    text += `\n`;
    
    // Body
    text += `${bodySentence}\n`;
    text += `\n`;
    text += `All faculty members are requested to attend the meeting on time.\n`;
    
    // Optional extra blank
    if (extraBlank) {
        text += `\n`;
    }
    
    // Footer
    text += `HOD (CSE)\n`;
    text += `Copy to:\n`;
    text += `• All faculty members of CSE\n`;
    text += `• Principal – for kind Information\n`;
    text += `• Chairman (BG) for kind information\n`;
    
    return text;
}

/**
 * Generate plain text MOM (Minutes of Meeting)
 * @param {Object} payload - MOM data (same structure as RTF)
 * @returns {string} Plain text MOM
 */
function momText(payload) {
    const {
        department = 'Department of Computer Science & Engineering',
        date = '',
        time = '',
        venue = '',
        agendaItems = [],
        discussion = '',
        closing = ''
    } = payload;
    
    let text = '';
    
    // Header
    text += `${department}\n`;
    text += `\n`;
    
    // Meeting Meta - with BOLD Unicode labels
    text += `${toBoldUnicode('Date:')} - ${date}\n`;
    text += `${toBoldUnicode('Time:')} ${time}\n`;
    text += `${toBoldUnicode('Venue:')} ${venue}\n`;
    text += `\n`;
    
    // Agenda - with BOLD Unicode heading
    if (agendaItems.length > 0) {
        text += `${toBoldUnicode('Agenda:')}\n`;
        agendaItems.forEach((item, index) => {
            text += `${index + 1}. ${item}\n`;
        });
        text += `\n`;
    }
    
    // Minutes of Meeting - with BOLD Unicode heading
    text += `${toBoldUnicode('Minutes of Meeting:')}\n`;
    
    // Discussion Points & Decisions
    if (discussion) {
        const points = parseDiscussionPoints(discussion);
        points.forEach((point, index) => {
            text += `${index + 1}. ${elaboratePoint(point)}\n`;
        });
        text += `\n`;
    }
    
    // Mandatory Closing Statement
    const closingStatement = 'The meeting concluded at 12:00 PM with positive remarks from the Head of Department';
    text += `${closingStatement}\n`;
    
    return text;
}

/**
 * Helper: Format date with optional day name
 * @param {string} dateStr - Date string
 * @param {boolean} includeDay - Whether to include day name
 * @returns {string} Formatted date
 */
function formatDateWithDay(dateStr, includeDay) {
    if (!includeDay) return dateStr;
    const day = deriveDayName(dateStr);
    return day ? `${day}, ${dateStr}` : dateStr;
}
