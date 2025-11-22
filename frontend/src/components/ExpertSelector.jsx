import React, { useState, useRef, useEffect } from 'react';
import { Home, Palette, Briefcase, Leaf, Camera, ChevronDown } from 'lucide-react';

const EXPERTS = [
    { id: 'photographer', name: 'Photographer', icon: Camera, description: 'Photo enhancement' },
    { id: 'interior_decorator', name: 'Interior Decorator', icon: Home, description: 'Transform living spaces' },
    { id: 'fashion_stylist', name: 'Fashion Stylist', icon: Palette, description: 'Style & clothing design' },
    { id: 'makeup_artist', name: 'Makeup Artist', icon: Briefcase, description: 'Cosmetic enhancement' },
    { id: 'landscaper', name: 'Landscaper', icon: Leaf, description: 'Outdoor space design' },
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
                                    <span>{expert.name}</span>
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
