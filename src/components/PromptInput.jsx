import './PromptInput.css';

function PromptInput({ prompt, onPromptChange, onSubmit, disabled }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="prompt-input-container">
            <form onSubmit={handleSubmit}>
                <div className="prompt-group">
                    <label htmlFor="prompt">Editing Instructions</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Describe how you'd like to edit the image... (e.g., 'Make it black and white', 'Add a vintage filter', 'Increase brightness')"
                        rows={4}
                        disabled={disabled}
                    />
                </div>
                <button
                    type="submit"
                    className="edit-button"
                    disabled={disabled || !prompt.trim()}
                >
                    {disabled ? 'Processing...' : 'Edit Image'}
                </button>
            </form>
        </div>
    );
}

export default PromptInput;
