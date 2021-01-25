import React, { useState, useEffect } from 'react';
import { content } from '../../data/LanguageContent';

import LanguageSelectionModal from '../../compositions/LanguageSelectionModal/LanguageSelectionModal';
import Navbar from '../../compositions/Navbar/Navbar';
import Footer from '../../compositions/Footer/Footer';
import LandingPage from '../../compositions/LandingPage/LandingPage';
import Video from '../../compositions/Video/Video';
import HubspotForm from '../../compositions/HubspotForm/HubspotForm';
import Questionnaire from '../../compositions/Questionnaire/Questionnaire';
import { Switch, Route } from 'react-router-dom';
import { addQuestionnaireResponse } from '../../sendRequest/apis';
import { sendRequest } from '../../sendRequest/sendRequest';

import './MainContainer.css';
import ProgressBar from '../../compositions/ProgressBar/ProgressBar';
import axios from 'axios';

const MainContainer = () => {
    const [language, setLanguage] = useState('en');
    const [showModal, setShowModal] = useState(true);
    const [step, setStep] = useState(2);
    const [videoState, setVideoState] = useState({ hasWatchedVideo: false });
    const { hasWatchedVideo } = videoState;
    const [questions, setQuestions] = useState([]);

    const browserLanguage =
        window.navigator.userLanguage || window.navigator.language;

    useEffect(() => {
        setLanguage(browserLanguage.substring(0, 2));
        const locallyStoredLanguage = localStorage.getItem('preferredLanguage');
        if (locallyStoredLanguage) {
            setLanguage(locallyStoredLanguage);
            setShowModal(false);
        }
    }, [browserLanguage]);

    const changeLanguage = (language) => {
        setLanguage(language);
        localStorage.setItem('preferredLanguage', language);
    };

    // useEffect(() => {
    //     const script = document.createElement('script');
    //     script.src = 'https://js.hsforms.net/forms/shell.js';
    //     document.body.appendChild(script);

    //     script.addEventListener('load', () => {
    //         if (window.hbspt) {
    //             window.hbspt.forms.create({
    //                 portalId: '8034478',
    //                 formId: content[language].hubspot,
    //                 target: `#hubspotForm-en`,
    //             });
    //         }
    //     });
    // }, [language]);

    const videoEndedHandler = (event) => {
        setVideoState({
            hasWatchedVideo: true,
        });
        nextStep();
    };

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/questionnaires')
            .then((response) => {
                setQuestions(response.data.responses[0].questions);
            });
    }, [language]);

    const submitQuestionnaireResponse = (userAnswers = []) => {
        const requestObj = {
            url: addQuestionnaireResponse,
            method: 'POST',
            body: JSON.stringify({
                title: 'test resonse for this questionnaire',
                questionnaireResponse: userAnswers,
            }),
        };
        sendRequest(requestObj).then((response) => {
            console.log('success', response);
        });
    };
    const changeStep = (nextStep) => {
        setStep(nextStep < 0 ? 0 : nextStep > 3 ? 3 : nextStep);
    };
    const nextStep = () => changeStep(step + 1);
    const previousStep = () => changeStep(step - 1);

    return (
        <div className="MainContainer">
            <div className="wrapper">
                <LanguageSelectionModal
                    language={language}
                    setLanguage={changeLanguage}
                    showModal={showModal}
                    setShowModal={setShowModal}
                />
                <div className={`items ${showModal ? 'blur' : ''}`}>
                    <Navbar language={language} setLanguage={changeLanguage} />
                    <Switch>
                        <Route exact path="/">
                            <LandingPage
                                content={content[language]}
                                nextStep={nextStep}
                            />
                        </Route>
                        <Route path="/video">
                            <ProgressBar
                                content={content[language]}
                                step={step}
                            />
                            <Video
                                onEnd={videoEndedHandler}
                                video={content[language].video}
                            />
                        </Route>
                        <Route path="/questionnaire">
                            <Questionnaire
                                language={language}
                                questions={questions}
                                hasWatchedVideo={hasWatchedVideo}
                            />
                            {/* <HubspotForm
                                hubspot={content[language].hubspot}
                                hasWatchedVideo={hasWatchedVideo}
                                language={language}
                            /> */}
                        </Route>
                    </Switch>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default MainContainer;
