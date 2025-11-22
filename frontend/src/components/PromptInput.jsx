import React from 'react';
import './PromptInput.css';

function PromptInput({ prompt, onPromptChange, disabled, hideButton }) {
    return (
        <div className="prompt-input-container">
            <form>
                <div className="prompt-group">
                    <label htmlFor="prompt">AI Directive</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Describe what you want to do with the image..."
                        disabled={disabled}
                    />
                </div>
                {!hideButton && (
                    <button
                        type="button"
                        className="edit-button"
                        disabled={disabled || !prompt.trim()}
                    >
                        Generate
                    </button>
                )}
            </form>
        </div>
    );
}

export default PromptInput;