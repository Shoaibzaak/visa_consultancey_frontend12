import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    Search,
    GraduationCap,
    Languages,
    Calendar,
    Clock,
    Globe,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { visaEligibilityAPI } from '../services/api';

const VisaEligibility = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        qualification: '',
        ielts: '',
        ageGap: '',
        currentAge: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await visaEligibilityAPI.analyze(formData);
            if (response.success) {
                setResult(response.data);
            } else {
                throw new Error(response.message || 'Failed to analyze eligibility');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="visa-eligibility-page">
            <div className="header">
                <div>
                    <h1 className="page-title">Visa Eligibility Analysis</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Check suitability for study abroad based on your profile
                    </p>
                </div>
            </div>

            <div className="charts-grid" style={{ gridTemplateColumns: result ? '1fr 1.5fr' : '1fr' }}>
                {/* Input Form Section */}
                <motion.div
                    className="chart-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="section-header">
                        <h2 className="section-title">Profile Information</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                <GraduationCap size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                Highest Qualification
                            </label>
                            <select
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'white',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            >
                                <option value="" disabled>Select Qualification</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Bachelors">Bachelor's</option>
                                <option value="Masters">Master's</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Languages size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                Have you taken IELTS?
                            </label>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: formData.ielts !== 'No' && formData.ielts !== '' ? '12px' : '0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="radio"
                                        name="hasIelts"
                                        checked={formData.ielts !== 'No' && formData.ielts !== ''}
                                        onChange={() => setFormData(prev => ({ ...prev, ielts: '' }))}
                                        style={{ width: 'auto', marginRight: '8px' }}
                                    />
                                    Yes
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="radio"
                                        name="hasIelts"
                                        checked={formData.ielts === 'No'}
                                        onChange={() => setFormData(prev => ({ ...prev, ielts: 'No' }))}
                                        style={{ width: 'auto', marginRight: '8px' }}
                                    />
                                    No
                                </label>
                            </div>

                            <AnimatePresence>
                                {formData.ielts !== 'No' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <input
                                            type="text"
                                            name="ielts"
                                            value={formData.ielts === 'No' ? '' : formData.ielts}
                                            onChange={handleInputChange}
                                            placeholder="Enter your IELTS bands (e.g. 6.5)"
                                            required={formData.ielts !== 'No'}
                                            style={{ marginTop: '8px' }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                Study Gap (if any)
                            </label>
                            <input
                                type="text"
                                name="ageGap"
                                value={formData.ageGap}
                                onChange={handleInputChange}
                                placeholder="e.g. 2 years, No gap"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                Current Age
                            </label>
                            <input
                                type="text"
                                name="currentAge"
                                value={formData.currentAge}
                                onChange={handleInputChange}
                                placeholder="e.g. 24"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary btn-block"
                            disabled={loading}
                            style={{ marginTop: '10px', height: '48px', position: 'relative' }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} style={{ marginRight: '10px' }} />
                                    Analyzing Profile...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} style={{ marginRight: '10px' }} />
                                    Analyze Eligibility
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            style={{
                                marginTop: '20px',
                                padding: '12px',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '14px'
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <AlertCircle size={18} style={{ marginRight: '10px', flexShrink: 0 }} />
                            {error}
                        </motion.div>
                    )}
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            className="chart-container"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
                        >
                            <div className="section-header" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center' }}>
                                    <Globe size={20} style={{ marginRight: '10px', color: 'var(--primary)' }} />
                                    Personalized Analysis
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        onClick={() => setResult(null)}
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        New Analysis
                                    </button>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {new Date(result.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="analysis-content" style={{ marginTop: '24px' }}>
                                <div className="profile-summary-tags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                                    <span className="status-badge status-approved" style={{ display: 'flex', alignItems: 'center' }}>
                                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> {result.profile.qualification}
                                    </span>
                                    <span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center' }}>
                                        <Languages size={12} style={{ marginRight: '4px' }} /> IELTS {result.profile.ielts}
                                    </span>
                                    <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center' }}>
                                        <Clock size={12} style={{ marginRight: '4px' }} /> {result.profile.ageGap} Gap
                                    </span>
                                </div>

                                <div className="markdown-body">
                                    <ReactMarkdown>{result.analysis}</ReactMarkdown>
                                </div>

                                <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                                    <h4 style={{ color: '#0369a1', marginBottom: '8px' }}>Expert Consultation</h4>
                                    <p style={{ fontSize: '14px', color: '#0c4a6e' }}>
                                        This analysis is AI-generated based on current trends. For a more detailed assessment and personalized roadmap, please schedule a call with our senior consultants.
                                    </p>
                                    <button className="btn-primary" style={{ marginTop: '16px' }}>
                                        Book Consultation <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
        .markdown-body {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-main);
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          color: var(--primary);
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: 700;
        }
        .markdown-body h1 { font-size: 22px; border-bottom: 2px solid var(--border); padding-bottom: 8px; }
        .markdown-body h2 { font-size: 18px; }
        .markdown-body h3 { font-size: 16px; }
        .markdown-body p { margin-bottom: 16px; }
        .markdown-body ul, .markdown-body ol { margin-bottom: 16px; padding-left: 20px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body strong { color: var(--text-main); font-weight: 600; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default VisaEligibility;
