import PropTypes from "prop-types";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext.jsx";
import Progress from "./Progress.jsx";

export default function Question({ question, options, onAnswer, index, total }) {

    const { name } = useContext(UserContext);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (name === null) {
            window.history.pushState({}, '', '/');
            const navEvent = new PopStateEvent('popstate');
            window.dispatchEvent(navEvent);
        }
    }, [name]);

    function handleClick(optionIndex) {
        setSelected(optionIndex);
        // quick feedback then send answer
        setTimeout(() => {
            setSelected(null);
            onAnswer(optionIndex);
        }, 160);
    }

    return (
        <article className={"c-question"} aria-live="polite">
            <div className={"c-question__progress-wrap"}>
                <Progress index={index} total={total} />
                <div className="c-progress__text">{index}/{total}</div>
            </div>
            <h2 className={"c-question__heading"}>{question}</h2>
            <div className={"c-options"}>
                {options.map(function (option, i) {
                    return (
                        <button
                            className={`c-option${selected === i ? ' is-selected' : ''}`}
                            key={option.label}
                            onClick={() => handleClick(i)}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </article>
    );
}

Question.propTypes = {
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, delta: PropTypes.object })).isRequired,
    onAnswer: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
};