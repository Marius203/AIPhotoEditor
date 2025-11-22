import React, { useState, useRef, useEffect } from 'react';
import { Home, Palette, Sparkles, Sun, Paintbrush, Clock, Package, Camera, ChevronDown } from 'lucide-react';

const EXPERTS = [
    { id: 'interior_decorator', name: 'Interior Decorator', icon: Home, description: 'Transform spaces with professional design expertise' },
    { id: 'celebrity_make_up_artist', name: 'Celebrity Makeup Artist', icon: Sparkles, description: 'High-fashion beauty enhancement and color cosmetics' },
    { id: 'fashion_stylist', name: 'Fashion Stylist', icon: Palette, description: 'Curate iconic looks with trend forecasting' },
    { id: 'lighting_director', name: 'Lighting Director', icon: Sun, description: 'Master cinematography and atmospheric depth control' },
    { id: 'digital_painter', name: 'Digital Painter', icon: Paintbrush, description: 'Artistic rendering with traditional media simulation' },
    { id: 'time_traveler', name: 'Time Traveler', icon: Clock, description: 'Photo restoration and historical colorization expert' },
    { id: 'product_photographer', name: 'Product Photographer', icon: Package, description: 'Commercial photography for e-commerce and marketing' },
];

function ExpertSelector({ selectedExpert, onExpertChange, disabled }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedExpertData = EXPERTS.find(e => e.id === selectedExpert) || EXPERTS[0];
    const SelectedIcon = selectedExpertData.icon;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (expertId) => {
        onExpertChange(expertId);
        setIsOpen(false);
    };

    return (
        <div className="expert-selector-dropdown" ref={dropdownRef}>
            <label className="expert-label">
                Domain Expert
            </label>
            <div className="expert-dropdown-wrapper">
                <button
                    type="button"
                    className={`expert-select ${isOpen ? 'expert-select-open' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    <SelectedIcon className="expert-icon" />
                    <span className="expert-name">{selectedExpertData.name}</span>
                    <ChevronDown className="expert-chevron" />
                </button>

                {isOpen && (
                    <div className="expert-dropdown-menu">
                        {EXPERTS.map((expert) => {
                            const Icon = expert.icon;
                            const isSelected = expert.id === selectedExpert;
                            return (
                                <button
                                    key={expert.id}
                                    type="button"
                                    className={`expert-option ${isSelected ? 'expert-option-selected' : ''}`}
                                    onClick={() => handleSelect(expert.id)}
                                >
                                    <Icon className="expert-option-icon" />
                                    <div className="expert-option-text">
                                        <span className="expert-option-name">{expert.name}</span>
                                        <span className="expert-option-description">{expert.description}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExpertSelector;
