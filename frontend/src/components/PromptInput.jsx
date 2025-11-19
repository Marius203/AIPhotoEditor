import './PromptInput.css';

function PromptInput({ prompt, onPromptChange, onSubmit, disabled, hideButton }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit();
        }
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
                        placeholder="Describe how you'd like to edit the image..."
                        rows={6}
                        disabled={disabled}
                    />
                </div>
                {!hideButton && (
                    <button
                        type="submit"
                        className="edit-button"
                        disabled={disabled || !prompt.trim()}
                    >
                        {disabled ? 'Processing...' : 'Edit Image'}
                    </button>
                )}
            </form>
        </div>
    );
} export default PromptInput;
