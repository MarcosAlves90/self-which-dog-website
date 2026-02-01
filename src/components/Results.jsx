import PropTypes from "prop-types";
import {useContext, useState, useEffect} from "react";
import {UserContext} from "./UserContext.jsx";
import ShareButton from "./ShareButton.jsx";

const BREED_DESCRIPTIONS = {
    'Golden Retriever': 'Friendly, loyal and great with people — a classic companion.',
    'Husky': 'Energetic and independent, loves outdoor activities.',
    'Border Collie': 'Highly active and focused, perfect for those who love challenges.',
    'Bulldog': 'Calm and steady, with a relaxed, resilient temperament.',
    'Shiba Inu': 'Independent and observant, with a strong personality.'
};

const TRAIT_LABEL = {
  energy: 'energy',
  sociability: 'sociability',
  independence: 'independence',
  discipline: 'discipline',
  protection: 'protection',
  impulsivity: 'impulsivity'
};

export default function Results({ element, artwork, traits = {}, onRestart }) {

    const { name } = useContext(UserContext);
    const { setCurrentQuestionIndex } = useContext(UserContext);
    const { setAnswers } = useContext(UserContext);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        if (artwork && artwork.message) {
            const img = new Image();
            img.src = artwork.message;
            img.onload = () => setLoaded(true);
        }
    }, [artwork]);

    function Restart() {
        if (typeof onRestart === 'function') {
            onRestart();
            return;
        }
        setCurrentQuestionIndex(0);
        setAnswers([]);
        window.history.pushState({}, '', '/');
        const navEvent = new PopStateEvent('popstate');
        window.dispatchEvent(navEvent);
    }

    function reasonFor(breed, traits) {
        const desc = BREED_DESCRIPTIONS[breed] || '';
        const pairs = Object.entries(traits || {}).map(([k, v]) => ({k, v: Math.abs(v), sign: Math.sign(v)})).sort((a,b)=>b.v-a.v).slice(0,2);
        const reasons = pairs.map(p => TRAIT_LABEL[p.k]);
        if (reasons.length) {
            return `You show strong ${reasons.join(' and ')} traits. ${desc}`;
        }
        return desc;
    }

    return (
        <article className="c-card">
            <div className="c-results__text">
                <div className="c-results__header">
                    <p className="c-results__title">
                        <strong>{name ? name : "Friend"}</strong>, you are a
                        <span className="c-inline-badge" aria-live="polite">
                            <span className="c-badge--breed c-badge--breed--inline">
                                <span className="c-badge__paw">🐾</span>
                                <span className="c-badge__text">{element ? element : '—'}</span>
                            </span>
                        </span>
                    </p>
                </div>
            </div>

            <div style={{marginTop:12}}>
                <p className="u-small u-text-muted">{reasonFor(element, traits)}</p>
            </div>

            <div className="c-artwork" style={{marginTop:16}}>
                {!loaded ? (
                    <div className="c-skeleton" aria-hidden></div>
                ) : (
                    artwork && artwork.message ? (
                        <img className="c-img--dog" src={artwork.message}  alt={`Picture of a ${element}`} />
                    ) : (
                        <div className="c-skeleton" style={{height:200}}></div>
                    )
                )}
            </div>

            <div className="c-results__actions">
                <button className={"c-btn c-btn--secondary"} onClick={Restart}>Try again</button>
                <ShareButton text={`${name ? name : 'Someone'} is a ${element} on Which Dog Are You?`} />
            </div>
        </article>
    );
}

Results.propTypes = {
    element: PropTypes.string.isRequired,
    artwork: PropTypes.object,
    traits: PropTypes.object,
    onRestart: PropTypes.func
}