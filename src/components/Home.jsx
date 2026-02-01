import UserForm from './UserForm.jsx';
import PawIcon from './PawIcon.jsx';

export default function Home() {
    return (
        <section className="c-hero">
            <div className="c-hero__inner">
                <div className="c-hero__top">
                    <div className="c-hero__illu" aria-hidden>
                        <PawIcon size={48} style={{color:'white'}} />
                    </div>
                </div>
                <div style={{textAlign:'center'}}>
                    <h1 className="c-hero__title">Which Dog Are You?</h1>
                    <p className="c-hero__subtitle">Quick, fun & shareable — find your dog match in 30 seconds</p>
                </div>
                <div className="c-card">
                    <UserForm />
                    <p className="u-small u-text-muted" style={{marginTop:12}}>No sign-ups. Just answers and a cute dog.</p>
                </div>
            </div>
        </section>
    )
}
