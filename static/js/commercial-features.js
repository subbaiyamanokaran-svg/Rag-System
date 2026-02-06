// Commercial Features for DocuMind AI
// Additional functionality for enterprise/commercial use

class CommercialFeatures {
    constructor() {
        this.userPlan = 'free'; // free, starter, professional, enterprise
        this.usageStats = {
            documentsProcessed: 0,
            questionsAsked: 0,
            apiCalls: 0
        };
        this.init();
    }

    init() {
        this.loadUserPlan();
        this.setupUsageTracking();
        this.setupPlanLimits();
    }

    // User Plan Management
    loadUserPlan() {
        const savedPlan = localStorage.getItem('documind_user_plan');
        if (savedPlan) {
            this.userPlan = savedPlan;
        }
        this.updatePlanDisplay();
    }

    updatePlanDisplay() {
        const planElements = document.querySelectorAll('.current-plan');
        planElements.forEach(el => {
            el.textContent = this.userPlan.charAt(0).toUpperCase() + this.userPlan.slice(1);
        });
    }

    // Usage Tracking
    setupUsageTracking() {
        this.loadUsageStats();
        this.trackDocumentUpload();
        this.trackQuestionAsked();
        this.trackApiCall();
    }

    loadUsageStats() {
        const saved = localStorage.getItem('documind_usage_stats');
        if (saved) {
            this.usageStats = JSON.parse(saved);
        }
        this.updateUsageDisplay();
    }

    saveUsageStats() {
        localStorage.setItem('documind_usage_stats', JSON.stringify(this.usageStats));
    }

    trackDocumentUpload() {
        // Hook into the upload process
        const originalProcessFiles = window.processFiles;
        window.processFiles = async (files) => {
            this.usageStats.documentsProcessed += files.length;
            this.saveUsageStats();
            this.updateUsageDisplay();
            return originalProcessFiles(files);
        };
    }

    trackQuestionAsked() {
        // Hook into the chat process
        const originalSendMessage = window.sendMessage;
        window.sendMessage = async () => {
            this.usageStats.questionsAsked++;
            this.saveUsageStats();
            this.updateUsageDisplay();
            return originalSendMessage();
        };
    }

    trackApiCall() {
        // Hook into API calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            this.usageStats.apiCalls++;
            this.saveUsageStats();
            return originalFetch(...args);
        };
    }

    updateUsageDisplay() {
        // Update usage statistics in the UI
        const usageElements = {
            documents: document.querySelector('.usage-documents'),
            questions: document.querySelector('.usage-questions'),
            apiCalls: document.querySelector('.usage-api-calls')
        };

        if (usageElements.documents) {
            usageElements.documents.textContent = this.usageStats.documentsProcessed;
        }
        if (usageElements.questions) {
            usageElements.questions.textContent = this.usageStats.questionsAsked;
        }
        if (usageElements.apiCalls) {
            usageElements.apiCalls.textContent = this.usageStats.apiCalls;
        }
    }

    // Plan Limits
    setupPlanLimits() {
        this.planLimits = {
            free: {
                documentsPerMonth: 10,
                questionsPerMonth: 100,
                apiCallsPerMonth: 1000,
                features: ['basic_chat', 'document_upload']
            },
            starter: {
                documentsPerMonth: 100,
                questionsPerMonth: 1000,
                apiCallsPerMonth: 10000,
                features: ['basic_chat', 'document_upload', 'chat_history', 'basic_analytics']
            },
            professional: {
                documentsPerMonth: 1000,
                questionsPerMonth: 10000,
                apiCallsPerMonth: 100000,
                features: ['basic_chat', 'document_upload', 'chat_history', 'advanced_analytics', 'api_access', 'priority_support']
            },
            enterprise: {
                documentsPerMonth: -1, // unlimited
                questionsPerMonth: -1,
                apiCallsPerMonth: -1,
                features: ['all']
            }
        };
    }

    checkLimit(feature) {
        const limits = this.planLimits[this.userPlan];
        if (!limits) return true;

        switch (feature) {
            case 'document_upload':
                return limits.documentsPerMonth === -1 || this.usageStats.documentsProcessed < limits.documentsPerMonth;
            case 'question_ask':
                return limits.questionsPerMonth === -1 || this.usageStats.questionsAsked < limits.questionsPerMonth;
            case 'api_call':
                return limits.apiCallsPerMonth === -1 || this.usageStats.apiCalls < limits.apiCallsPerMonth;
            default:
                return limits.features.includes(feature) || limits.features.includes('all');
        }
    }

    showUpgradePrompt(feature) {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="upgrade-content">
                <h3>Upgrade Required</h3>
                <p>You've reached the limit for your current plan. Upgrade to continue using this feature.</p>
                <div class="upgrade-actions">
                    <button class="btn btn-primary" onclick="commercialFeatures.upgradePlan()">Upgrade Now</button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    upgradePlan() {
        // Redirect to pricing page or show upgrade options
        window.location.href = '#pricing';
        document.querySelector('.upgrade-modal')?.remove();
    }

    // Analytics and Reporting
    generateUsageReport() {
        const report = {
            plan: this.userPlan,
            usage: this.usageStats,
            limits: this.planLimits[this.userPlan],
            utilization: this.calculateUtilization()
        };
        return report;
    }

    calculateUtilization() {
        const limits = this.planLimits[this.userPlan];
        return {
            documents: limits.documentsPerMonth === -1 ? 0 : (this.usageStats.documentsProcessed / limits.documentsPerMonth) * 100,
            questions: limits.questionsPerMonth === -1 ? 0 : (this.usageStats.questionsAsked / limits.questionsPerMonth) * 100,
            apiCalls: limits.apiCallsPerMonth === -1 ? 0 : (this.usageStats.apiCalls / limits.apiCallsPerMonth) * 100
        };
    }

    // Feature Flags
    isFeatureEnabled(feature) {
        const limits = this.planLimits[this.userPlan];
        return limits.features.includes(feature) || limits.features.includes('all');
    }

    // Export/Import functionality
    exportData() {
        const data = {
            usageStats: this.usageStats,
            userPlan: this.userPlan,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documind-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Admin Functions
    resetUsage() {
        if (confirm('Are you sure you want to reset all usage statistics?')) {
            this.usageStats = {
                documentsProcessed: 0,
                questionsAsked: 0,
                apiCalls: 0
            };
            this.saveUsageStats();
            this.updateUsageDisplay();
        }
    }

    setUserPlan(plan) {
        if (this.planLimits[plan]) {
            this.userPlan = plan;
            localStorage.setItem('documind_user_plan', plan);
            this.updatePlanDisplay();
            this.updateUsageDisplay();
        }
    }
}

// Initialize commercial features
window.commercialFeatures = new CommercialFeatures();

// Add commercial features CSS
const commercialCSS = `
.upgrade-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.upgrade-content {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.upgrade-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.usage-stats {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
}

.usage-stat {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.usage-stat:last-child {
    margin-bottom: 0;
}

.plan-indicator {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    background: #667eea;
    color: white;
}

.plan-indicator.free { background: #6c757d; }
.plan-indicator.starter { background: #28a745; }
.plan-indicator.professional { background: #007bff; }
.plan-indicator.enterprise { background: #6f42c1; }
`;

const style = document.createElement('style');
style.textContent = commercialCSS;
document.head.appendChild(style);
