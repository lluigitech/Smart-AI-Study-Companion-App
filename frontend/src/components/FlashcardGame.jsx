import React, { useState } from "react";
import QuizFlashcard from "./QuizFlashcard"; // Siguraduhin tama ang path mo dito
import { IoTrophy, IoArrowUndo } from "react-icons/io5";

export default function FlashcardGame() {
    // 1. Dito natin ilalagay ang mga TANONG (Sample Data)
    // Sa future, pwede itong manggaling sa database mo.
    const [questions] = useState([
        { id: 1, question: "Ano ang tawag sa 'Brain of the Computer'?", answer: "CPU" },
        { id: 2, question: "Anong HTML tag ang gamit para sa malaking heading?", answer: "<h1>" },
        { id: 3, question: "Ano ang full form ng CSS?", answer: "Cascading Style Sheets" },
        { id: 4, question: "True or False: Ang Java ay parehas sa JavaScript.", answer: "False" },
        { id: 5, question: "Anong symbol ang gamit para sa ID selector sa CSS?", answer: "#" }
    ]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // 2. Logic pag Next Question na
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true); // Tapos na ang quiz
        }
    };

    // 3. Logic pag Tama ang sagot
    const handleCorrect = () => {
        setScore(prev => prev + 1);
    };

    // 4. Restart Logic
    const handleRestart = () => {
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#f8fafc', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: 20, fontFamily: 'sans-serif'
        }}>
            
            {/* KUNG TAPOS NA ANG QUIZ */}
            {isFinished ? (
                <div style={{
                    background: 'white', padding: 40, borderRadius: 20, 
                    textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    maxWidth: 400, width: '100%'
                }}>
                    <IoTrophy size={60} color="#fbbf24" />
                    <h1 style={{color: '#1e293b', marginBottom: 10}}>Quiz Complete!</h1>
                    <p style={{color: '#64748b', fontSize: 18}}>
                        You got <strong>{score}</strong> out of <strong>{questions.length}</strong> correct.
                    </p>
                    <button onClick={handleRestart} style={{
                        marginTop: 20, padding: '12px 24px', background: '#4f46e5', 
                        color: 'white', border: 'none', borderRadius: 10, 
                        fontWeight: 'bold', cursor: 'pointer', display: 'flex', 
                        alignItems: 'center', gap: 8, margin: '20px auto 0'
                    }}>
                        <IoArrowUndo /> Try Again
                    </button>
                </div>
            ) : (
                
                /* HABANG NAG QUI-QUIZ */
                <div style={{width: '100%', maxWidth: 500}}>
                    {/* Header ng Quiz */}
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20, padding: '0 10px'}}>
                        <span style={{fontWeight: 'bold', color: '#64748b'}}>
                            Question {currentIndex + 1} / {questions.length}
                        </span>
                        <span style={{fontWeight: 'bold', color: '#4f46e5'}}>
                            Score: {score}
                        </span>
                    </div>

                    {/* DITO TINATAWAG YUNG FLASHCARD COMPONENT MO */}
                    {/* Check mo kung walang question, wag mag render */}
                    {questions.length > 0 && (
                        <QuizFlashcard 
                            question={questions[currentIndex].question}
                            answer={questions[currentIndex].answer}
                            onCorrect={handleCorrect}
                            onNext={handleNext}
                        />
                    )}
                </div>
            )}
        </div>
    );
}