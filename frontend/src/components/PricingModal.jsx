import React, { useState } from 'react';
import { X, CreditCard, Zap, Star, Crown, Loader2 } from 'lucide-react';
import './PricingModal.css';

const API_URL = 'http://192.168.96.1:8081';

const CREDIT_PACKAGES = [
    {
        id: 'starter',
        name: 'Starter',
        credits: 500,
        price: 10,
        images: 50,
        icon: Zap,
        popular: false,
    },
    {
        id: 'popular',
        name: 'Popular',
        credits: 2000,
        price: 30,
        images: 200,
        icon: Star,
        popular: true,
    },
    {
        id: 'professional',
        name: 'Professional',
        credits: 5000,
        price: 70,
        images: 500,
        icon: Crown,
        popular: false,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        credits: 10000,
        price: 100,
        images: 1000,
        icon: CreditCard,
        popular: false,
    }
];

function PricingModal({ isOpen, onClose, user }) {
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handlePurchase = async (pkg) => {
        if (!user || !user.token) {
            alert('Please sign in to purchase credits');
            return;
        }

        setLoading(true);
        setSelectedPackage(pkg.id);

        try {
            const response = await fetch(`${API_URL}/api/payment/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    credits: pkg.credits
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();

            if (data.success && data.checkoutUrl) {
                // Redirect to Stripe Checkout
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error(data.message || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initialize payment. Please try again.');
        } finally {
            setLoading(false);
            setSelectedPackage(null);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content pricing-modal">
                <button className="modal-close" onClick={onClose}>
                    <X />
                </button>

                <div className="pricing-header">
                    <h2 className="pricing-title">Choose Your Plan</h2>
                    <p className="pricing-subtitle">
                        Unlock unlimited creativity with our flexible credit packages
                    </p>
                    {user && (
                        <div className="current-credits">
                            <span className="credits-label">Current Balance:</span>
                            <span className="credits-amount">{user.credits} credits</span>
                        </div>
                    )}
                </div>

                <div className="pricing-grid">
                    {CREDIT_PACKAGES.map((pkg) => {
                        const Icon = pkg.icon;
                        const isLoading = loading && selectedPackage === pkg.id;

                        return (
                            <div
                                key={pkg.id}
                                className={`pricing-card ${pkg.popular ? 'popular' : ''}`}
                            >
                                {pkg.popular && (
                                    <div className="popular-badge">
                                        Most Popular
                                    </div>
                                )}

                                <div className="pricing-card-header">
                                    <div className="package-icon">
                                        <Icon size={32} />
                                    </div>
                                    <h3 className="package-name">{pkg.name}</h3>
                                </div>

                                <div className="pricing-card-body">
                                    <div className="package-price">
                                        <span className="price-currency">$</span>
                                        <span className="price-amount">{pkg.price}</span>
                                    </div>

                                    <div className="package-credits">
                                        <div className="credits-count">{pkg.credits.toLocaleString()}</div>
                                        <div className="credits-text">Credits</div>
                                    </div>

                                    <div className="package-features">
                                        <div className="feature">
                                            <span className="feature-check">✓</span>
                                            <span>{pkg.images} AI-generated images</span>
                                        </div>
                                        <div className="feature">
                                            <span className="feature-check">✓</span>
                                            <span>All 7 expert domains</span>
                                        </div>
                                        <div className="feature">
                                            <span className="feature-check">✓</span>
                                            <span>No expiration</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="pricing-button"
                                    onClick={() => handlePurchase(pkg)}
                                    disabled={loading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="spinner-icon" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Purchase Now'
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="pricing-footer">
                    <p className="pricing-note">
                        <CreditCard size={16} /> Secure payment powered by Stripe
                    </p>
                    <p className="pricing-guarantee">
                        ✓ 100% secure checkout · ✓ Credits never expire · ✓ Instant activation
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PricingModal;
