import React, { useState, useRef, useCallback } from 'react';
import {
    ShieldCheck, ShieldAlert, Upload, FileText, X, AlertTriangle,
    CheckCircle, Loader2, Info, ChevronDown, ChevronUp, Trash2, Eye
} from 'lucide-react';
import { documentFraudAPI } from '../services/api';

// ─── Map backend API response to the UI format ─────────────────────────────
const mapBackendResponseToUI = (apiResponse) => {
    const data = apiResponse.data;
    if (!data) throw new Error('Invalid API response: missing data');

    const riskScore = data.overallRiskScore ?? 0;
    const riskLevel = data.riskLevel || 'LOW';

    // Map riskLevel to verdict
    const verdictMap = {
        LOW: 'GENUINE',
        MEDIUM: 'SUSPICIOUS',
        HIGH: 'FRAUDULENT',
        CRITICAL: 'FRAUDULENT',
    };
    const verdict = verdictMap[riskLevel] || 'INCONCLUSIVE';

    // Map findings to red flags
    const redFlags = (data.findings || []).map(f => ({
        issue: f.type?.replace(/_/g, ' ') || 'Unknown Issue',
        detail: f.detail || 'No detail provided',
        severity: (f.severity || 'low').toUpperCase(),
    }));

    // Build positive indicators from aiAnalysis
    const positiveIndicators = [];
    const ai = data.aiAnalysis || {};
    if (ai.documentClassification?.length > 0) {
        const top = ai.documentClassification[0];
        positiveIndicators.push(`Document classified as "${top.label}" (${top.confidence} confidence)`);
    }
    if (ai.imageMetadata) {
        positiveIndicators.push(`Image dimensions: ${ai.imageMetadata.width}×${ai.imageMetadata.height}`);
    }
    if (ai.extractedText) {
        positiveIndicators.push('Text successfully extracted from document');
    }

    // Build recommendation from API recommendations
    const recommendation = (data.recommendations || []).join(' ');

    // Build analysisDetails
    const analysisDetails = {};
    if (ai.fraudAnalysis) analysisDetails.fraudAnalysis = ai.fraudAnalysis;
    if (ai.extractedText) analysisDetails.extractedText = typeof ai.extractedText === 'string'
        ? (ai.extractedText.length > 300 ? ai.extractedText.slice(0, 300) + '…' : ai.extractedText)
        : JSON.stringify(ai.extractedText);
    if (ai.imageMetadata) analysisDetails.imageMetadata = `${ai.imageMetadata.width}×${ai.imageMetadata.height} pixels`;
    if (data.fileName) analysisDetails.fileName = data.fileName;
    if (data.fileSize) analysisDetails.fileSize = `${(data.fileSize / 1024).toFixed(1)} KB`;

    return {
        verdict,
        confidence: Math.max(0, Math.min(100, 100 - riskScore)),
        riskLevel,
        documentType: data.documentType || 'Unknown',
        summary: recommendation || `Document analysis complete. Risk score: ${riskScore}/100. Risk level: ${riskLevel}.`,
        redFlags,
        positiveIndicators,
        recommendation: recommendation || 'Review the findings above for any suspicious indicators.',
        analysisDetails: Object.keys(analysisDetails).length > 0 ? analysisDetails : null,
        _rawResponse: data,
    };
};

// ─── Document type options ──────────────────────────────────────────────────
const DOCUMENT_TYPES = [
    { value: 'passport', label: 'Passport' },
    { value: 'visa', label: 'Visa' },
    { value: 'degree', label: 'Degree / Certificate' },
    { value: 'id_card', label: 'ID Card' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'transcript', label: 'Transcript' },
    { value: 'other', label: 'Other' },
];

// ─── Helper UI Components ───────────────────────────────────────────────────

const VerdictBadge = ({ verdict }) => {
    const configs = {
        GENUINE: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={16} />, label: 'Genuine' },
        FRAUDULENT: { bg: '#fee2e2', color: '#991b1b', icon: <ShieldAlert size={16} />, label: 'Fraudulent' },
        SUSPICIOUS: { bg: '#fef3c7', color: '#92400e', icon: <AlertTriangle size={16} />, label: 'Suspicious' },
        INCONCLUSIVE: { bg: '#f1f5f9', color: '#475569', icon: <Info size={16} />, label: 'Inconclusive' },
    };
    const c = configs[verdict] || configs.INCONCLUSIVE;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: c.bg, color: c.color,
            padding: '5px 12px', borderRadius: '100px',
            fontWeight: 700, fontSize: '13px',
        }}>
            {c.icon} {c.label}
        </span>
    );
};

const RiskBar = ({ confidence, riskLevel }) => {
    const colors = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7c3aed' };
    const color = colors[riskLevel] || '#64748b';
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>AI Confidence</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color }}>{confidence}%</span>
            </div>
            <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${confidence}%`, borderRadius: '100px',
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    transition: 'width 1.2s ease',
                }} />
            </div>
        </div>
    );
};

const SeverityDot = ({ severity }) => {
    const colors = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };
    return (
        <span style={{
            display: 'inline-block', width: '8px', height: '8px',
            borderRadius: '50%', background: colors[severity] || '#64748b',
            flexShrink: 0, marginTop: '4px',
        }} />
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const DocumentVerification = () => {
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState([]);
    const [analysisResults, setAnalysisResults] = useState({});
    const [analyzing, setAnalyzing] = useState({});
    const [expandedDetails, setExpandedDetails] = useState({});
    const [previewFile, setPreviewFile] = useState(null);
    const [docTypes, setDocTypes] = useState({}); // Track document type per file
    const [fileError, setFileError] = useState(null); // File validation error
    const fileInputRef = useRef(null);

    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'];
    const ALLOWED_EXTENSIONS = ['JPEG', 'PNG', 'WebP', 'TIFF'];

    const addFiles = useCallback((newFiles) => {
        const allFiles = Array.from(newFiles);
        const valid = allFiles.filter(f => acceptedTypes.includes(f.type));
        const invalid = allFiles.filter(f => !acceptedTypes.includes(f.type));

        if (invalid.length > 0) {
            const invalidNames = invalid.map(f => f.name).join(', ');
            setFileError(`Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed. Rejected: ${invalidNames}`);
            // Auto-dismiss after 5 seconds
            setTimeout(() => setFileError(null), 5000);
        }

        if (!valid.length) return;
        const withIds = valid.map(f => ({
            file: f,
            id: `${f.name}-${Date.now()}-${Math.random()}`,
            preview: URL.createObjectURL(f),
        }));
        setFiles(prev => [...prev, ...withIds]);
    }, []);

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        setAnalysisResults(prev => { const n = { ...prev }; delete n[id]; return n; });
        setAnalyzing(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    const analyzeFile = async (fileObj) => {
        const { file, id } = fileObj;
        setAnalyzing(prev => ({ ...prev, [id]: true }));
        try {
            const documentType = docTypes[id] || 'passport';
            const apiResponse = await documentFraudAPI.analyze(file, documentType);
            const result = mapBackendResponseToUI(apiResponse);
            setAnalysisResults(prev => ({ ...prev, [id]: result }));
        } catch (err) {
            setAnalysisResults(prev => ({ ...prev, [id]: { error: err.message } }));
        } finally {
            setAnalyzing(prev => ({ ...prev, [id]: false }));
        }
    };

    const analyzeAll = () => {
        files.forEach(f => {
            if (!analysisResults[f.id] && !analyzing[f.id]) analyzeFile(f);
        });
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    const verdictStats = Object.values(analysisResults).reduce((acc, r) => {
        if (!r.error && r.verdict) acc[r.verdict] = (acc[r.verdict] || 0) + 1;
        return acc;
    }, {});

    const isAnyAnalyzing = Object.values(analyzing).some(Boolean);

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
                    <div style={{
                        width: '46px', height: '46px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0066A1, #0088CC)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(0,102,161,0.3)',
                    }}>
                        <ShieldCheck size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                            Document Fraud Detection
                        </h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>
                            AI-powered analysis — passports, visas, ID cards, bank statements
                        </p>
                    </div>
                </div>

                {/* API error banner */}
                {Object.values(analysisResults).some(r => r.error) && (
                    <div style={{
                        marginTop: '16px',
                        background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px',
                        padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                    }}>
                        <AlertTriangle size={18} color="#92400e" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <div>
                            <p style={{ fontWeight: 700, color: '#92400e', margin: '0 0 3px', fontSize: '13px' }}>
                                Some documents failed analysis
                            </p>
                            <p style={{ color: '#78350f', fontSize: '12px', margin: 0 }}>
                                Check the error details below for each document. The backend API may be temporarily unavailable.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats row */}
                {Object.keys(analysisResults).length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Analyzed', value: Object.keys(analysisResults).length, color: '#0066A1', bg: '#dbeafe' },
                            { label: 'Genuine', value: verdictStats.GENUINE || 0, color: '#166534', bg: '#dcfce7' },
                            { label: 'Fraudulent', value: verdictStats.FRAUDULENT || 0, color: '#991b1b', bg: '#fee2e2' },
                            { label: 'Suspicious', value: verdictStats.SUSPICIOUS || 0, color: '#92400e', bg: '#fef3c7' },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: s.bg, padding: '8px 16px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <span style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</span>
                                <span style={{ fontSize: '12px', color: s.color, fontWeight: 600 }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── File Type Error Banner ── */}
            {fileError && (
                <div style={{
                    marginBottom: '16px',
                    background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px',
                    padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    <ShieldAlert size={18} color="#991b1b" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: '#991b1b', margin: '0 0 2px', fontSize: '13px' }}>
                            Invalid File Type
                        </p>
                        <p style={{ color: '#7f1d1d', fontSize: '12px', margin: 0 }}>
                            {fileError}
                        </p>
                    </div>
                    <button
                        onClick={() => setFileError(null)}
                        style={{ background: 'none', color: '#991b1b', padding: '4px', borderRadius: '6px', flexShrink: 0, cursor: 'pointer', border: 'none' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* ── Upload Zone ── */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragOver ? '#0066A1' : '#cbd5e1'}`,
                    borderRadius: '16px', padding: '44px 24px', textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'rgba(0,102,161,0.04)' : 'white',
                    transition: 'all 0.2s ease', marginBottom: '24px',
                }}
            >
                <input
                    ref={fileInputRef} type="file" multiple
                    accept=".jpg,.jpeg,.png,.webp,.tiff,.tif"
                    style={{ display: 'none' }}
                    onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                />
                <div style={{
                    width: '60px', height: '60px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                    transform: dragOver ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s',
                }}>
                    <Upload size={26} color="#0066A1" />
                </div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 5px' }}>
                    {dragOver ? 'Drop documents here' : 'Upload Documents for AI Analysis'}
                </p>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 10px' }}>
                    Drag &amp; drop or click — Passports, Visas, ID Cards, Bank Statements
                </p>
                <span style={{
                    display: 'inline-block', background: '#f1f5f9', color: '#64748b',
                    padding: '3px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 500,
                }}>
                    JPEG · PNG · WebP · TIFF
                </span>
            </div>

            {/* ── File List ── */}
            {files.length > 0 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            Documents ({files.length})
                        </h2>
                        <button
                            onClick={analyzeAll}
                            disabled={isAnyAnalyzing}
                            style={{
                                background: 'linear-gradient(135deg, #0066A1, #0088CC)',
                                color: 'white', padding: '9px 18px', borderRadius: '10px',
                                fontWeight: 600, fontSize: '13px', display: 'inline-flex',
                                alignItems: 'center', gap: '7px',
                                opacity: isAnyAnalyzing ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(0,102,161,0.25)',
                            }}
                        >
                            {isAnyAnalyzing
                                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                                : <><ShieldCheck size={15} /> Analyze All</>
                            }
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {files.map((fileObj) => {
                            const { id, file, preview } = fileObj;
                            const result = analysisResults[id];
                            const isAnalyzing = analyzing[id];
                            const isExpanded = expandedDetails[id];

                            return (
                                <div key={id} style={{
                                    background: 'white', borderRadius: '14px',
                                    border: `1px solid ${result?._isDemo ? '#fcd34d' : '#e2e8f0'}`,
                                    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                }}>
                                    {/* Demo badge */}
                                    {result?._isDemo && (
                                        <div style={{ background: '#fef9c3', padding: '6px 16px', fontSize: '12px', color: '#92400e', fontWeight: 600, borderBottom: '1px solid #fcd34d' }}>
                                            ⚠️ DEMO — Quota exceeded. Results below are illustrative only.
                                        </div>
                                    )}

                                    {/* File row */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '14px 18px',
                                        borderBottom: result ? '1px solid #f1f5f9' : 'none',
                                    }}>
                                        {/* Thumbnail */}
                                        <div
                                            style={{
                                                width: '48px', height: '48px', borderRadius: '10px',
                                                overflow: 'hidden', flexShrink: 0, background: '#f1f5f9',
                                                cursor: 'pointer', border: '2px solid #e2e8f0',
                                            }}
                                            onClick={() => setPreviewFile(fileObj)}
                                        >
                                            {file.type.startsWith('image/') ? (
                                                <img src={preview} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                    <FileText size={20} color="#64748b" />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {file.name}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px' }}>
                                                {(file.size / 1024).toFixed(1)} KB · {file.type.split('/')[1].toUpperCase()}
                                            </p>
                                            {/* Document type selector */}
                                            {!result && !isAnalyzing && (
                                                <select
                                                    value={docTypes[id] || 'passport'}
                                                    onChange={(e) => setDocTypes(prev => ({ ...prev, [id]: e.target.value }))}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        fontSize: '11px', padding: '3px 8px',
                                                        borderRadius: '6px', border: '1px solid #e2e8f0',
                                                        background: '#f8fafc', color: '#475569',
                                                        fontWeight: 500, cursor: 'pointer',
                                                    }}
                                                >
                                                    {DOCUMENT_TYPES.map(dt => (
                                                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {result && !result.error && <VerdictBadge verdict={result.verdict} />}
                                            {isAnalyzing && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0066A1', fontSize: '12px', fontWeight: 500 }}>
                                                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...
                                                </span>
                                            )}
                                            {result?.error && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>⚠ Error</span>}
                                            {!result && !isAnalyzing && (
                                                <button
                                                    onClick={() => analyzeFile(fileObj)}
                                                    style={{
                                                        background: '#f1f5f9', color: '#0066A1', padding: '6px 14px',
                                                        borderRadius: '8px', fontWeight: 600, fontSize: '12px',
                                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                    }}
                                                >
                                                    <ShieldCheck size={13} /> Analyze
                                                </button>
                                            )}
                                            <button onClick={() => setPreviewFile(fileObj)} title="Preview"
                                                style={{ background: 'none', color: '#94a3b8', padding: '5px', borderRadius: '6px' }}>
                                                <Eye size={15} />
                                            </button>
                                            <button onClick={() => removeFile(id)} title="Remove"
                                                style={{ background: 'none', color: '#94a3b8', padding: '5px', borderRadius: '6px' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {result?.error && (
                                        <div style={{ padding: '14px 18px', background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                                            <p style={{ color: '#991b1b', fontSize: '13px', margin: 0 }}>
                                                <strong>Error:</strong> {result.error}
                                            </p>
                                        </div>
                                    )}

                                    {/* Analysis Result */}
                                    {result && !result.error && (
                                        <div style={{ padding: '18px' }}>
                                            {/* Top row: confidence + summary */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                                <div>
                                                    <RiskBar confidence={result.confidence} riskLevel={result.riskLevel} />
                                                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 9px', borderRadius: '100px', fontSize: '11px', fontWeight: 600 }}>
                                                            Risk: {result.riskLevel}
                                                        </span>
                                                        {result.documentType && (
                                                            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 9px', borderRadius: '100px', fontSize: '11px', fontWeight: 600 }}>
                                                                {result.documentType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0' }}>
                                                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        AI Assessment
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                                                        {result.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Red Flags */}
                                            {result.redFlags?.length > 0 && (
                                                <div style={{ marginBottom: '14px' }}>
                                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <AlertTriangle size={13} /> Red Flags ({result.redFlags.length})
                                                    </p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        {result.redFlags.map((flag, i) => (
                                                            <div key={i} style={{
                                                                display: 'flex', gap: '9px', alignItems: 'flex-start',
                                                                background: '#fff7f7', borderRadius: '8px', padding: '9px 11px',
                                                                border: '1px solid #fee2e2',
                                                            }}>
                                                                <SeverityDot severity={flag.severity} />
                                                                <div>
                                                                    <span style={{ fontWeight: 600, fontSize: '12px', color: '#1e293b' }}>{flag.issue}</span>
                                                                    <span style={{ color: '#64748b', fontSize: '12px' }}> — {flag.detail}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Positive Indicators */}
                                            {result.positiveIndicators?.length > 0 && (
                                                <div style={{ marginBottom: '14px' }}>
                                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#166534', margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <CheckCircle size={13} /> Authenticity Indicators
                                                    </p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                        {result.positiveIndicators.map((pi, i) => (
                                                            <span key={i} style={{
                                                                background: '#f0fdf4', color: '#166534',
                                                                padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
                                                                border: '1px solid #bbf7d0',
                                                            }}>✓ {pi}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommendation */}
                                            {result.recommendation && (
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                                                    borderRadius: '10px', padding: '12px 14px',
                                                    border: '1px solid #bae6fd', marginBottom: '12px',
                                                    display: 'flex', gap: '9px', alignItems: 'flex-start',
                                                }}>
                                                    <Info size={15} color="#0369a1" style={{ flexShrink: 0, marginTop: '1px' }} />
                                                    <div>
                                                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            Officer Recommendation
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: '#0c4a6e', margin: 0 }}>{result.recommendation}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Detailed Analysis toggle */}
                                            {result.analysisDetails && (
                                                <button
                                                    onClick={() => setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }))}
                                                    style={{
                                                        background: 'none', color: '#0066A1', fontSize: '12px',
                                                        fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 0',
                                                    }}
                                                >
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    {isExpanded ? 'Hide' : 'Show'} Detailed Analysis
                                                </button>
                                            )}

                                            {isExpanded && result.analysisDetails && (
                                                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    {Object.entries(result.analysisDetails).map(([key, value]) => (
                                                        <div key={key} style={{
                                                            background: '#f8fafc', borderRadius: '8px', padding: '10px',
                                                            border: '1px solid #e2e8f0',
                                                        }}>
                                                            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </p>
                                                            <p style={{ fontSize: '12px', color: '#1e293b', margin: 0 }}>{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Empty State ── */}
            {files.length === 0 && (
                <div style={{
                    background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                    padding: '48px 24px', textAlign: 'center',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '16px', opacity: 0.4 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '50px', height: '66px', background: '#f1f5f9', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #e2e8f0',
                            }}>
                                <FileText size={20} color="#94a3b8" />
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: '0 0 5px' }}>No documents uploaded yet</p>
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                        Upload any visa document above and click Analyze — the AI will detect fraud in seconds
                    </p>
                </div>
            )}

            {/* ── Preview Modal ── */}
            {previewFile && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000, padding: '20px',
                    }}
                    onClick={() => setPreviewFile(null)}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '16px',
                            maxWidth: '800px', width: '100%', maxHeight: '90vh',
                            overflow: 'auto', padding: '20px',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <span style={{ fontWeight: 700, fontSize: '15px' }}>{previewFile.file.name}</span>
                            <button onClick={() => setPreviewFile(null)}
                                style={{ background: '#f1f5f9', color: '#64748b', padding: '6px', borderRadius: '8px' }}>
                                <X size={16} />
                            </button>
                        </div>
                        {previewFile.file.type.startsWith('image/') ? (
                            <img src={previewFile.preview} alt="preview" style={{ width: '100%', borderRadius: '10px' }} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px' }}>
                                <FileText size={46} color="#64748b" />
                                <p style={{ color: '#64748b', marginTop: '12px', fontSize: '14px' }}>
                                    Preview not available for this file type.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default DocumentVerification;
