import React from 'react';
import { X, Lock, CreditCard, AlertCircle } from 'lucide-react';
import './DownloadModal.css';

function DownloadModal({ isOpen, onClose, isAuthenticated, user, onLogin, onBuyCredits }) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content download-modal">
                <button className="modal-close" onClick={onClose}>
                    <X />
                </button>

                {!isAuthenticated ? (
                    // Guest user - prompt to sign in
                    <div className="modal-body">
                        <div className="modal-icon lock-icon">
                            <Lock size={48} />
                        </div>
                        <h2 className="modal-title">Sign In Required</h2>
                        <p className="modal-description">
                            Create a free account to download your generated images and unlock premium features.
                        </p>
                        <div className="modal-features">
                            <div className="feature-item">
                                <span className="feature-check">✓</span>
                                <span>Download all generated images</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check">✓</span>
                                <span>Access to 7 expert AI domains</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check">✓</span>
                                <span>Save your creation history</span>
                            </div>
                        </div>
                        <button className="modal-primary-button" onClick={onLogin}>
                            Sign In to Download
                        </button>
                        <p className="modal-note">
                            New users get 50 free credits to start!
                        </p>
                    </div>
                ) : user && user.paid ? (
                    // Authenticated with paid flag - can download
                    <div className="modal-body">
                        <div className="modal-icon success-icon">
                            <CreditCard size={48} />
                        </div>
                        <h2 className="modal-title">Ready to Download!</h2>
                        <p className="modal-description">
                            Your image has been generated successfully.
                        </p>
                        <div className="credits-info">
                            <div className="credits-badge">
                                <span className="credits-label">Available Credits:</span>
                                <span className="credits-value">{user.credits}</span>
                            </div>
                        </div>
                        <p className="modal-note">
                            Click the download button on the image to save it.
                        </p>
                    </div>
                ) : (
                    // Authenticated but insufficient credits or not paid
                    <div className="modal-body">
                        <div className="modal-icon alert-icon">
                            <AlertCircle size={48} />
                        </div>
                        <h2 className="modal-title">Credits Required</h2>
                        <p className="modal-description">
                            You need credits to download images. Each image generation costs 10 credits.
                        </p>
                        <div className="credits-info warning">
                            <div className="credits-badge">
                                <span className="credits-label">Your Credits:</span>
                                <span className="credits-value">{user?.credits || 0}</span>
                            </div>
                            <p className="credits-note">You need at least 10 credits to generate and download.</p>
                        </div>
                        <button className="modal-primary-button" onClick={onBuyCredits}>
                            Purchase Credits
                        </button>
                        <p className="modal-note">
                            Plans start at $10 for 500 credits (50 images)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DownloadModal;
