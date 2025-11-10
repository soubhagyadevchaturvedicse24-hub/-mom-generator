/**
 * app.js - Main application logic
 * 
 * Handles:
 * - Routing/navigation between modes
 * - Form submissions and data collection
 * - RTF and Text generation
 * - Clipboard copy operations
 * - File downloads
 */

// ===========================
// State Management
// ===========================
let currentMode = 'landing'; // 'landing', 'notice', 'mom'
let aiEnabled = false; // AI generation toggle

// ===========================
// DOM Elements
// ===========================
const elements = {
    // Landing
    landing: document.getElementById('landing'),
    btnNoticeMode: document.getElementById('btn-notice-mode'),
    btnMomMode: document.getElementById('btn-mom-mode'),
    
    // Navigation
    navTabs: document.getElementById('nav-tabs'),
    tabNotice: document.getElementById('tab-notice'),
    tabMom: document.getElementById('tab-mom'),
    btnBackToLanding: document.getElementById('btn-back-to-landing'),
    
    // Notice Section
    sectionNotice: document.getElementById('section-notice'),
    formNotice: document.getElementById('form-notice'),
    noticeError: document.getElementById('notice-error'),
    noticeOutputSection: document.getElementById('notice-output-section'),
    noticeRtfOutput: document.getElementById('notice-rtf-output'),
    noticeTextOutput: document.getElementById('notice-text-output'),
    btnCopyNoticeRtf: document.getElementById('btn-copy-notice-rtf'),
    btnDownloadNoticeRtf: document.getElementById('btn-download-notice-rtf'),
    btnCopyNoticeText: document.getElementById('btn-copy-notice-text'),
    btnDownloadNoticeText: document.getElementById('btn-download-notice-text'),
    
    // MOM Section
    sectionMom: document.getElementById('section-mom'),
    formMom: document.getElementById('form-mom'),
    momError: document.getElementById('mom-error'),
    momOutputSection: document.getElementById('mom-output-section'),
    momRtfOutput: document.getElementById('mom-rtf-output'),
    momTextOutput: document.getElementById('mom-text-output'),
    btnCopyMomRtf: document.getElementById('btn-copy-mom-rtf'),
    btnDownloadMomRtf: document.getElementById('btn-download-mom-rtf'),
    btnCopyMomText: document.getElementById('btn-copy-mom-text'),
    btnDownloadMomText: document.getElementById('btn-download-mom-text'),
    
    // AI Settings
    btnAiSettings: document.getElementById('btn-ai-settings'),
    aiModal: document.getElementById('ai-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelAi: document.getElementById('btn-cancel-ai'),
    btnSaveAi: document.getElementById('btn-save-ai'),
    aiProvider: document.getElementById('ai-provider'),
    aiApiKey: document.getElementById('ai-api-key'),
    aiApiKeyOpenai: document.getElementById('ai-api-key-openai'),
    geminiKeyGroup: document.getElementById('gemini-key-group'),
    openaiKeyGroup: document.getElementById('openai-key-group'),
    aiCostEstimate: document.getElementById('ai-cost-estimate'),
    aiEnabledCheckbox: document.getElementById('ai-enabled')
};

// ===========================
// Navigation Functions
// ===========================
function showLanding() {
    currentMode = 'landing';
    elements.landing.classList.remove('hidden');
    elements.navTabs.classList.add('hidden');
    elements.sectionNotice.classList.add('hidden');
    elements.sectionMom.classList.add('hidden');
}

function showNotice() {
    currentMode = 'notice';
    elements.landing.classList.add('hidden');
    elements.navTabs.classList.remove('hidden');
    elements.sectionNotice.classList.remove('hidden');
    elements.sectionMom.classList.add('hidden');
    elements.tabNotice.classList.add('active');
    elements.tabMom.classList.remove('active');
    elements.noticeOutputSection.classList.add('hidden');
}

function showMom() {
    currentMode = 'mom';
    elements.landing.classList.add('hidden');
    elements.navTabs.classList.remove('hidden');
    elements.sectionNotice.classList.add('hidden');
    elements.sectionMom.classList.remove('hidden');
    elements.tabNotice.classList.remove('active');
    elements.tabMom.classList.add('active');
    elements.momOutputSection.classList.add('hidden');
}

// ===========================
// Error Display
// ===========================
function showError(errorElement, messages) {
    if (!messages || messages.length === 0) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
        return;
    }
    
    errorElement.textContent = messages.join('. ');
    errorElement.classList.add('show');
}

function clearError(errorElement) {
    errorElement.classList.remove('show');
    errorElement.textContent = '';
}

// ===========================
// Notice Form Handling
// ===========================
function handleNoticeSubmit(e) {
    e.preventDefault();
    clearError(elements.noticeError);
    
    // Collect form data
    const formData = new FormData(elements.formNotice);
    const data = {
        date: formData.get('date').trim(),
        time: formData.get('time').trim(),
        venue: formData.get('venue').trim(),
        agenda: formData.get('agenda').trim(),
        includeDay: formData.get('includeDay') === 'on',
        font: formData.get('font'),
        size: formData.get('size'),
        extraBlank: formData.get('extraBlank') === 'on'
    };
    
    // Validate
    const validation = validateNoticeForm(data);
    if (!validation.valid) {
        showError(elements.noticeError, validation.errors);
        return;
    }
    
    // Generate RTF and Text
    try {
        const rtf = buildNoticeRTF(data);
        const text = noticeText(data);
        
        // Display outputs
        elements.noticeRtfOutput.value = rtf;
        elements.noticeTextOutput.value = text;
        
        // Show output section
        elements.noticeOutputSection.classList.remove('hidden');
        
        // Scroll to output
        elements.noticeOutputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Notice generation error:', error);
        showError(elements.noticeError, ['Failed to generate notice. Please check your inputs.']);
    }
}

// ===========================
// AI Settings Modal
// ===========================
function openAiModal() {
    elements.aiModal.classList.remove('hidden');
    // Load saved settings
    const savedKey = loadApiKey();
    const savedProvider = localStorage.getItem('ai_provider') || 'gemini';
    
    elements.aiProvider.value = savedProvider;
    updateProviderUI(savedProvider);
    
    if (savedKey) {
        if (savedProvider === 'gemini') {
            elements.aiApiKey.value = savedKey;
        } else {
            elements.aiApiKeyOpenai.value = savedKey;
        }
    }
    elements.aiEnabledCheckbox.checked = aiEnabled;
    updateCostEstimate();
}

function updateProviderUI(provider) {
    if (provider === 'gemini') {
        elements.geminiKeyGroup.classList.remove('hidden');
        elements.openaiKeyGroup.classList.add('hidden');
    } else {
        elements.geminiKeyGroup.classList.add('hidden');
        elements.openaiKeyGroup.classList.remove('hidden');
    }
}

function updateCostEstimate() {
    const provider = elements.aiProvider.value;
    if (provider === 'gemini') {
        elements.aiCostEstimate.textContent = 'FREE (Gemini free tier: 60 requests/min)';
        elements.aiCostEstimate.style.color = 'var(--success-color)';
    } else {
        elements.aiCostEstimate.textContent = '~$0.01 USD per MOM (GPT-3.5-turbo)';
        elements.aiCostEstimate.style.color = 'var(--text-secondary)';
    }
}

function closeAiModal() {
    elements.aiModal.classList.add('hidden');
}

function saveAiSettings() {
    const provider = elements.aiProvider.value;
    const apiKey = provider === 'gemini' 
        ? elements.aiApiKey.value.trim()
        : elements.aiApiKeyOpenai.value.trim();
    aiEnabled = elements.aiEnabledCheckbox.checked;
    
    if (apiKey) {
        setApiKey(apiKey, provider);
        console.log(`✓ ${provider.toUpperCase()} API key saved`);
    }
    
    // Save AI enabled state
    localStorage.setItem('ai_enabled', aiEnabled);
    
    closeAiModal();
    
    // Show confirmation
    if (aiEnabled && !apiKey) {
        alert('⚠️ AI enabled but no API key provided. AI features will not work.');
    } else if (aiEnabled && apiKey) {
        const providerName = provider === 'gemini' ? 'Google Gemini (FREE)' : 'OpenAI';
        alert(`✓ AI settings saved successfully!\nProvider: ${providerName}`);
    }
}

// ===========================
// MOM Form Handling
// ===========================
async function handleMomSubmit(e) {
    e.preventDefault();
    clearError(elements.momError);
    
    // Collect form data
    const formData = new FormData(elements.formMom);
    const data = {
        department: formData.get('department').trim(),
        date: formData.get('date').trim(),
        time: formData.get('time').trim(),
        venue: formData.get('venue').trim(),
        agendaItems: parseMultilineInput(formData.get('agenda')),
        discussion: formData.get('discussion').trim(),
        includeDay: formData.get('includeDay') === 'on',
        font: formData.get('font'),
        size: formData.get('size')
    };
    
    // Validate
    const validation = validateMOMForm(data);
    if (!validation.valid) {
        showError(elements.momError, validation.errors);
        return;
    }
    
    // Show loading state
    const submitBtn = elements.formMom.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = aiEnabled && isAIAvailable() ? '🤖 Generating with AI...' : 'Generating...';
    submitBtn.disabled = true;
    
    try {
        let rtf, text;
        
        // Use AI generation if enabled and available
        if (aiEnabled && isAIAvailable()) {
            try {
                // Generate MOM with AI
                const aiGeneratedText = await generateMOMWithAI({
                    agendaItems: data.agendaItems,
                    discussion: data.discussion,
                    closingStatement: 'The meeting concluded at 12:00 PM with positive remarks from the Head of Department.'
                });
                
                // For now, use AI for text output and regular for RTF
                // In future, you could parse AI output into RTF format
                text = aiGeneratedText;
                rtf = buildMOMRTF(data); // Fallback to template-based RTF
                
                console.log('✓ AI generation successful');
            } catch (aiError) {
                console.error('AI generation failed, using template:', aiError);
                showError(elements.momError, ['AI generation failed: ' + aiError.message + '. Using template-based generation.']);
                // Fall back to template-based
                rtf = buildMOMRTF(data);
                text = momText(data);
            }
        } else {
            // Template-based generation
            rtf = buildMOMRTF(data);
            text = momText(data);
        }
        
        // Display outputs
        elements.momRtfOutput.value = rtf;
        elements.momTextOutput.value = text;
        
        // Show output section
        elements.momOutputSection.classList.remove('hidden');
        
        // Scroll to output
        elements.momOutputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('MOM generation error:', error);
        showError(elements.momError, ['Failed to generate MOM. Please check your inputs.']);
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

    
    // MOM copy/download buttons
async function copyToClipboard(text, buttonElement) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✓ Copied!';
        buttonElement.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.background = '';
        }, 2000);
        
    } catch (error) {
        console.error('Copy failed:', error);
        
        // Fallback: select text
        const textarea = buttonElement.closest('.output-card').querySelector('textarea');
        textarea.select();
        document.execCommand('copy');
        
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✓ Copied!';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
        }, 2000);
    }
}

// ===========================
// File Download Functions
// ===========================
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateFilename(type, extension) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, '');
    return `${type}_${dateStr}_${timeStr}.${extension}`;
}

// ===========================
// Event Listeners Setup
// ===========================
function setupEventListeners() {
    // Landing mode buttons
    elements.btnNoticeMode.addEventListener('click', showNotice);
    elements.btnMomMode.addEventListener('click', showMom);
    
    // Navigation tabs
    elements.tabNotice.addEventListener('click', showNotice);
    elements.tabMom.addEventListener('click', showMom);
    elements.btnBackToLanding.addEventListener('click', showLanding);
    
    // Form submissions
    elements.formNotice.addEventListener('submit', handleNoticeSubmit);
    elements.formMom.addEventListener('submit', handleMomSubmit);
    
    // AI Settings Modal
    elements.btnAiSettings.addEventListener('click', openAiModal);
    elements.btnCloseModal.addEventListener('click', closeAiModal);
    elements.btnCancelAi.addEventListener('click', closeAiModal);
    elements.btnSaveAi.addEventListener('click', saveAiSettings);
    
    // AI Provider change
    elements.aiProvider.addEventListener('change', (e) => {
        updateProviderUI(e.target.value);
        updateCostEstimate();
    });
    
    // Close modal on background click
    elements.aiModal.addEventListener('click', (e) => {
        if (e.target === elements.aiModal) {
            closeAiModal();
        }
    });
    
    // Notice copy/download buttons
    elements.btnCopyNoticeRtf.addEventListener('click', () => {
        copyToClipboard(elements.noticeRtfOutput.value, elements.btnCopyNoticeRtf);
    });
    
    elements.btnDownloadNoticeRtf.addEventListener('click', () => {
        downloadFile(
            elements.noticeRtfOutput.value,
            generateFilename('notice', 'rtf'),
            'application/rtf'
        );
    });
    
    elements.btnCopyNoticeText.addEventListener('click', () => {
        copyToClipboard(elements.noticeTextOutput.value, elements.btnCopyNoticeText);
    });
    
    elements.btnDownloadNoticeText.addEventListener('click', () => {
        downloadFile(
            elements.noticeTextOutput.value,
            generateFilename('notice', 'txt'),
            'text/plain'
        );
    });
    
    // MOM copy/download buttons
    elements.btnCopyMomRtf.addEventListener('click', () => {
        copyToClipboard(elements.momRtfOutput.value, elements.btnCopyMomRtf);
    });
    
    elements.btnDownloadMomRtf.addEventListener('click', () => {
        downloadFile(
            elements.momRtfOutput.value,
            generateFilename('mom', 'rtf'),
            'application/rtf'
        );
    });
    
    elements.btnCopyMomText.addEventListener('click', () => {
        copyToClipboard(elements.momTextOutput.value, elements.btnCopyMomText);
    });
    
    elements.btnDownloadMomText.addEventListener('click', () => {
        downloadFile(
            elements.momTextOutput.value,
            generateFilename('mom', 'txt'),
            'text/plain'
        );
    });
}

// ===========================
// Initialize App
// ===========================
function initApp() {
    console.log('CSE Notice & MOM Generator initialized');
    
    // Load AI settings
    loadApiKey();
    const savedAiEnabled = localStorage.getItem('ai_enabled');
    if (savedAiEnabled === 'true') {
        aiEnabled = true;
    }
    
    console.log('AI Status:', aiEnabled ? '✓ Enabled' : '✗ Disabled');
    if (isAIAvailable()) {
        const provider = localStorage.getItem('ai_provider') || 'gemini';
        console.log(`AI Provider: ${provider.toUpperCase()}`);
    }
    
    setupEventListeners();
    showLanding();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
