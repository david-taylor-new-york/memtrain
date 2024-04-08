import React from 'react'
import { useMyTrainingContext, useMyTrainingUpdateContext } from '../../contexts/TrainingContextProvider'
import { useMyAppContext, useMyAppUpdateContext } from '../../contexts/AppContextProvider'
import { PageHeader, SubmitButton } from '../Components'
import '../commonStyles.css'

export const TrainingSetupPage = () => {
    return (
        <div className="page-container">
            < PageHeader pageTitle="Training Setup Page" />
            < TrainingSetupPageBody />
        </div>
    )
}

const TrainingSetupPageBody = () => {
    const myAppContext = useMyAppContext()

    return (
        <div className="page-section-container">
            <h3> Total Questions: {myAppContext.allCardsBySubject.length} </h3>
            < PracticeOrRecordedRadioButtons />
            < ButtonGroup />
        </div>
    )
}

const PracticeOrRecordedRadioButtons = () => {
    const myTrainingContext = useMyTrainingContext()
    return (
        <div className="radio-tray">
            <form ref={myTrainingContext.trainingSettingsFormRef}>
                <label className="radio-label">
                    <input type="radio" name="trainingType" value="practice" defaultChecked />
                    Practice
                </label>
                <label className="radio-label">
                    <input type="radio" name="trainingType" value="recorded" />
                    Recorded
                </label>
            </form>
        </div>
    )
}

const ButtonGroup = () => {
    const myAppUpdateContext = useMyAppUpdateContext()
    const myTrainingUpdateContext = useMyTrainingUpdateContext()
    return (
        <div className="main-menu-button-group">
            < SubmitButton onClick={() => myTrainingUpdateContext.startTraining()}> Train </SubmitButton>
            < SubmitButton onClick={() => myAppUpdateContext.updateCurrentPageTo("TrainingMenuPage")}> Cancel </SubmitButton>
        </div>
    )
}
