import {Route, Routes} from "react-router-dom";
import {useContext, useState} from "react";
import Question from "./components/Question.jsx";
import Results from "./components/Results.jsx";
import Home from "./components/Home.jsx";
import {UserContext} from "./components/UserContext.jsx";
import { determineBreedFromTraits, fetchArtworkByApi as fetchArtworkUtil } from "./utils/breedUtils";
import { initialTraits, breeds } from "./utils/breeds"; 

function App() {

    const { currentQuestionIndex, setCurrentQuestionIndex } = useContext(UserContext);
    const { answers, setAnswers } = useContext(UserContext);
    const [breed, setBreed] = useState("");
    const [artwork, setArtwork] = useState(null);

    // Traits-based quiz model (imported from shared `initialTraits`)
    // Using shared `initialTraits` from `./utils/breeds` for a single source of truth
    const [traits, setTraits] = useState(initialTraits);

    // Breed profiles are sourced from `./utils/breeds` to avoid duplication and ensure a single source of truth

    // Questions with trait deltas for each option
    const questions = [
        {
            question: "On an ideal weekend, you prefer:",
            options: [
                { label: "Sleeping in and relaxing 😴", delta: { energy: -1, sociability: -1 } },
                { label: "Going out to explore something new 🧭", delta: { energy: 1, independence: 1 } },
                { label: "Meeting friends or family 🧑‍🤝‍🧑", delta: { sociability: 2 } },
                { label: "Doing exercise or physical activities 🏃", delta: { energy: 2 } }
            ]
        },
        {
            question: "How do you handle meeting new people?",
            options: [
                { label: "I'm reserved at first 🐢", delta: { sociability: -2 } },
                { label: "I talk if they start the conversation 🙂", delta: { } },
                { label: "I make friends easily 😄", delta: { sociability: 2 } },
                { label: "I take the initiative always 🗣️", delta: { sociability: 1, impulsivity: 1 } }
            ]
        },
        {
            question: "Your daily energy level is:",
            options: [
                { label: "Low, I like calm 🌙", delta: { energy: -2 } },
                { label: "Moderate and balanced ⚖️", delta: { } },
                { label: "High, I'm always on the move ⚡", delta: { energy: 1 } },
                { label: "Explosive, I stop only when I crash 🔥", delta: { energy: 2, impulsivity: 1 } }
            ]
        },
        {
            question: "When a problem arises, you:",
            options: [
                { label: "Avoid confrontation 🙈", delta: { impulsivity: -1, independence: -1 } },
                { label: "Analyze before acting 🧠", delta: { discipline: 2 } },
                { label: "Fix it right away 🛠️", delta: { discipline: 1 } },
                { label: "Act on instinct 🎯", delta: { impulsivity: 2 } }
            ]
        },
        {
            question: "In a group, you usually are:",
            options: [
                { label: "The quiet observer 👀", delta: { sociability: -1 } },
                { label: "The advisor 🤝", delta: { discipline: 1, sociability: 1 } },
                { label: "The entertainer 🎉", delta: { sociability: 2 } },
                { label: "The natural leader 🧑‍✈️", delta: { protection: 1, discipline: 1 } }
            ]
        },
        {
            question: "Your ideal environment is:",
            options: [
                { label: "A calm home 🏠", delta: { energy: -1 } },
                { label: "A tidy, predictable place 📚", delta: { discipline: 2 } },
                { label: "A social, lively space 🏙️", delta: { sociability: 2 } },
                { label: "Anywhere with adventure 🌄", delta: { energy: 1, independence: 1 } }
            ]
        },
        {
            question: "How do you react to unexpected changes?",
            options: [
                { label: "I feel uncomfortable 😬", delta: { discipline: 1, impulsivity: -1 } },
                { label: "I adapt with effort 🔄", delta: { discipline: 1 } },
                { label: "I enjoy the novelty ✨", delta: { independence: 1 } },
                { label: "I try to change things before they change 🚀", delta: { impulsivity: 2 } }
            ]
        },
        {
            question: "What motivates you the most?",
            options: [
                { label: "Comfort and security 🛋️", delta: { energy: -1 } },
                { label: "Stability 📏", delta: { discipline: 2 } },
                { label: "Recognition 💬", delta: { sociability: 1 } },
                { label: "Challenges 🎯", delta: { energy: 1, impulsivity: 1 } }
            ]
        },
        {
            question: "When you're tired, you prefer:",
            options: [
                { label: "Being alone 🧘", delta: { sociability: -1 } },
                { label: "Silence and rest 😌", delta: { energy: -1 } },
                { label: "Talk to someone 💭", delta: { sociability: 1 } },
                { label: "Do something to distract myself 🕹️", delta: { impulsivity: 1 } }
            ]
        },
        {
            question: "How do you see rules?",
            options: [
                { label: "Necessary for order 📐", delta: { discipline: 1 } },
                { label: "Useful but flexible 📎", delta: { } },
                { label: "Depends on the situation 🤔", delta: { independence: 1 } },
                { label: "An obstacle 😈", delta: { impulsivity: 1 } }
            ]
        },
        {
            question: "Your work pace is:",
            options: [
                { label: "Slow and steady 🐌", delta: { discipline: -1 } },
                { label: "Regular and disciplined ⏱️", delta: { discipline: 1 } },
                { label: "Fast when needed ⚡", delta: { energy: 1 } },
                { label: "Intense and unpredictable 🌪️", delta: { energy: 2, impulsivity: 1 } }
            ]
        },
        {
            question: "How do you react to criticism?",
            options: [
                { label: "I take it personally 😔", delta: { protection: -1 } },
                { label: "I reflect on it 🤓", delta: { discipline: 1 } },
                { label: "I ignore it if I disagree 🙃", delta: { independence: 1 } },
                { label: "I use it as fuel 🔥", delta: { impulsivity: 1, energy: 1 } }
            ]
        },
        {
            question: "In conflicts, you tend to:",
            options: [
                { label: "Avoid at all costs 🕊️", delta: { protection: -1 } },
                { label: "Negotiate 🤝", delta: { discipline: 1 } },
                { label: "Defend your point 🛡️", delta: { protection: 1 } },
                { label: "Confront directly ⚔️", delta: { impulsivity: 1, protection: 1 } }
            ]
        },
        {
            question: "What best describes you?",
            options: [
                { label: "Loyal 🐾", delta: { protection: 1 } },
                { label: "Intelligent 🧠", delta: { discipline: 1 } },
                { label: "Sociable 🐕", delta: { sociability: 2 } },
                { label: "Independent 🐺", delta: { independence: 2 } }
            ]
        },
        {
            question: "Your ideal type of routine is:",
            options: [
                { label: "Predictable & calm 📅", delta: { discipline: 1 } },
                { label: "Organized but flexible 📘", delta: { discipline: 1 } },
                { label: "Busy with commitments 📞", delta: { sociability: 1 } },
                { label: "No fixed routine 🛣️", delta: { independence: 1 } }
            ]
        },
        {
            question: "How do you show affection?",
            options: [
                { label: "Quiet presence 🤍", delta: { protection: 1 } },
                { label: "Helping when needed 🛠️", delta: { discipline: 1 } },
                { label: "With words and attention 💬", delta: { sociability: 1 } },
                { label: "With full intensity ❤️‍🔥", delta: { impulsivity: 1, energy: 1 } }
            ]
        },
        {
            question: "Under pressure, you:",
            options: [
                { label: "Freeze 😶", delta: { discipline: -1 } },
                { label: "Keep it logical 🧮", delta: { discipline: 1 } },
                { label: "Adapt quickly 🔄", delta: { independence: 1 } },
                { label: "Act impulsively ⚡", delta: { impulsivity: 2 } }
            ]
        },
        {
            question: "What do you value most in relationships?",
            options: [
                { label: "Trust 🛡️", delta: { protection: 1 } },
                { label: "Respect 🤝", delta: { discipline: 1 } },
                { label: "Companionship 🐕‍🦺", delta: { sociability: 1 } },
                { label: "Freedom 🕊️", delta: { independence: 1 } }
            ]
        },
        {
            question: "Your ideal role in a team is:",
            options: [
                { label: "Quiet support 🧩", delta: { discipline: 1 } },
                { label: "Planner 📐", delta: { discipline: 1 } },
                { label: "Communicator 📣", delta: { sociability: 1 } },
                { label: "Executor 🏹", delta: { energy: 1, impulsivity: 1 } }
            ]
        },
        {
            question: "If someone described you, they would say you are:",
            options: [
                { label: "Calm and reliable 🐶", delta: { energy: -1, protection: 1 } },
                { label: "Clever and alert 🦊", delta: { discipline: 1 } },
                { label: "Cheerful and outgoing 🐕", delta: { sociability: 2 } },
                { label: "Strong and independent 🐺", delta: { independence: 2 } }
            ]
        }
    ];


    function applyDelta(baseTraits, delta) {
        const t = { ...baseTraits };
        for (const k of Object.keys(delta || {})) {
            t[k] = (t[k] || 0) + delta[k];
        }
        return t;
    }

    // Breed selection and RNG are provided by shared implementations in `./utils/breedUtils` to avoid duplication

    function handleAnswer(optionIndex) {
        const q = questions[currentQuestionIndex];
        const option = q.options[optionIndex];
        const updatedTraits = applyDelta(traits, option.delta);
        setTraits(updatedTraits);
        setAnswers([...answers, option.label]);

        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        if (nextIndex === questions.length) {
                    // Build a lightweight seed so results can be reproducible per user/session
            const seedBase = sessionStorage.getItem('userName') || ''; 
            const seedArgs = [...answers, option.label].join('|');
            const seed = seedBase + '|' + seedArgs;

            const selectedBreed = determineBreedFromTraits(updatedTraits, seed);
            setBreed(selectedBreed);
            // try fetch artwork by breed's api name
            const apiName = breeds[selectedBreed]?.api || selectedBreed.toLowerCase().replace(/ /g, '-');
            fetchArtworkByApi(apiName);
        }
    }

    function restartQuiz() {
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setTraits(initialTraits);
        setBreed('');
        setArtwork(null);
        window.history.pushState({}, '', '/');
        const navEvent = new PopStateEvent('popstate');
        window.dispatchEvent(navEvent);
    }

    // Lightweight wrapper that calls the shared `fetchArtworkByApi` util and updates component state
    async function fetchArtworkByApi(apiName) {
        const data = await fetchArtworkUtil(apiName);
        if (data && data.message) setArtwork(data);
        else setArtwork(null);
    }

  return (
    <main className="l-container">
      <div className="l-content">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route
                path="/quiz"
                element={
                    currentQuestionIndex < questions.length  ? (
                        <Question
                            question={questions[currentQuestionIndex].question}
                            options={questions[currentQuestionIndex].options}
                            onAnswer={handleAnswer}
                            index={currentQuestionIndex + 1}
                            total={questions.length}
                        />
                    ) : (
                        <Results element={breed} artwork={artwork} traits={traits} onRestart={restartQuiz} />
                    )
                }
            />

        </Routes>
      </div>
    </main>
  )
}

export default App
