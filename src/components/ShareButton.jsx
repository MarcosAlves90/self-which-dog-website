import PropTypes from 'prop-types';
import {useState} from 'react';

export default function ShareButton({ text }) {
    const [copied, setCopied] = useState(false);

    async function handleShare() {
        const shareData = {
            title: 'Which Dog Are You?',
            text,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // user canceled share — log for debugging
                console.info('Share canceled', err);
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(`${text} - ${window.location.href}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy to clipboard failed', err);
            alert('Copying failed.');
        }
    }

    return (
        <button className={"c-btn"} onClick={handleShare} aria-label="Share result">
            {copied ? 'Copied!' : 'Share'}
        </button>
    );
}

ShareButton.propTypes = {
    text: PropTypes.string.isRequired,
};
