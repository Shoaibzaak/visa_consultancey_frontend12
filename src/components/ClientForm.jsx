import React, { useState } from 'react';
import { X, User, MapPin, Phone, Mail, FileText, CheckCircle } from 'lucide-react';

const ClientForm = ({ onClose, onSubmit, editClient = null }) => {
    const [formData, setFormData] = useState({
        name: editClient?.name || '',
        country: editClient?.country || '',
        category: editClient?.category || 'Study Visa',
        status: editClient?.status || 'Pending',
        phone: editClient?.phone || '',
        email: editClient?.email || '',
        address: editClient?.address || '',
        notes: editClient?.notes || ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to save client. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Styling components
    const FormGroup = ({ label, error, children, icon: Icon }) => (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                {label} {error && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
                {Icon && (
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <Icon size={16} />
                    </div>
                )}
                <div style={{ position: 'relative' }}>
                    {children}
                </div>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
        </div>
    );

    const inputStyle = (hasIcon) => ({
        width: '100%',
        padding: hasIcon ? '10px 14px 10px 40px' : '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        transition: 'all 0.2s',
        backgroundColor: '#fff'
    });

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
            <div className="modal-content" style={{ maxWidth: '650px', padding: '0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                {/* Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'white'
                }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                            {editClient ? 'Edit Client Details' : 'Add New Client'}
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                            fill in the information below to {editClient ? 'update' : 'create'} a client record
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                        onMouseOut={(e) => e.target.style.background = '#f8fafc'}
                    >
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                {/* Form Body */}
                <div style={{ padding: '32px', maxHeight: 'calc(90vh - 140px)', overflowY: 'auto', background: '#ffffff' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            {/* Personal Info Section */}
                            <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '16px' }}>Personal Information</h3>
                            </div>

                            <FormGroup label="Full Name" error={errors.name} icon={User}>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    style={{ ...inputStyle(true), borderColor: errors.name ? '#ef4444' : '#e2e8f0' }}
                                />
                            </FormGroup>

                            <FormGroup label="Destination Country" error={errors.country} icon={MapPin}>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="e.g. UK, Canada"
                                    style={{ ...inputStyle(true), borderColor: errors.country ? '#ef4444' : '#e2e8f0' }}
                                />
                            </FormGroup>

                            <FormGroup label="Phone Number" error={errors.phone} icon={Phone}>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+92 300 0000000"
                                    style={{ ...inputStyle(true), borderColor: errors.phone ? '#ef4444' : '#e2e8f0' }}
                                />
                            </FormGroup>

                            <FormGroup label="Email Address" error={errors.email} icon={Mail}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="client@example.com"
                                    style={{ ...inputStyle(true), borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
                                />
                            </FormGroup>

                            {/* Application Info Section */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '12px', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '16px' }}>Application Details</h3>
                            </div>

                            <FormGroup label="Visa Category" icon={FileText}>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    style={inputStyle(true)}
                                >
                                    <option value="Study Visa">Study Visa</option>
                                    <option value="Work Permit">Work Permit</option>
                                    <option value="Visit Visa">Visit Visa</option>
                                    <option value="Residency">Residency</option>
                                </select>
                            </FormGroup>

                            <FormGroup label="Application Status" icon={CheckCircle}>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    style={inputStyle(true)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </FormGroup>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormGroup label="Address">
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Full residential address"
                                        style={inputStyle(false)}
                                    />
                                </FormGroup>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormGroup label="Notes">
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Add any additional notes here..."
                                        rows="3"
                                        style={{ ...inputStyle(false), resize: 'vertical', minHeight: '80px' }}
                                    />
                                </FormGroup>
                            </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            marginTop: '32px',
                            paddingTop: '24px',
                            borderTop: '1px solid #f1f5f9'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={isSubmitting}
                                style={{ width: 'auto' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                                style={{ width: 'auto', minWidth: '120px' }}
                            >
                                {isSubmitting ? 'Saving...' : (editClient ? 'Update Record' : 'Create Record')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientForm;
