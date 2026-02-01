import { useState, useContext } from 'react';
import { UserContext } from './UserContext';

export default function UserForm() {
    const [inputName, setInputName] = useState('');
    const { setName } = useContext(UserContext);

    function handleSubmit(e) {
        e.preventDefault();
        sessionStorage.setItem('userName', inputName);
        setName(inputName);
        window.history.pushState({}, '', '/quiz');
        const navEvent = new PopStateEvent('popstate');
        window.dispatchEvent(navEvent);  // Dispatch a navigation event
    }

    return (
        <form className="c-form" onSubmit={handleSubmit}>
            <input
                className="c-form__input"
                type={"text"}
                id={"name"}
                placeholder={"Enter your name"}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                required
            />
            <button className="c-btn" type={"submit"} disabled={!inputName}>Start Quiz</button>
        </form>
    )
}