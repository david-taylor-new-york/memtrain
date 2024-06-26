import React from 'react'
import { useMyAppContext, useMyAppUpdateContext } from '../../contexts/AppContextProvider'
import { PageHeader, CurrentCardsTable, ChooseIdWidget, CardForm } from '../Components'

export const EditCardsPage = () => {
    return (
        <div className="page-container">
            <div id="edit-cards-page-id" style={{ display: 'none' }}> </div>
            <div className="section-container">
                <PageHeader/>
                <EditCardsPageBody/>
            </div>
        </div>
    )
}

const EditCardsPageBody = () => {
    return (
        <div>
            <EditPageWidget/>
            <CurrentCardsTable/>
        </div>
    )
}

const EditPageWidget = () => {
    const myAppContext = useMyAppContext()
    const myAppUpdateContext = useMyAppUpdateContext()

    if (myAppContext.cardToEdit === null) {
        return (
            <ChooseIdWidget formRef={myAppContext.editCardFormRef} buttonLabel={'Edit Card'} submitCall={myAppUpdateContext.handleSetCardToEdit} idLabel={'CARD:'}/>
        )
    } else {
        return (
            <CardForm formRef={myAppContext.editCardWidgetFormRef} onSubmit={myAppUpdateContext.handleEditCard} defaultValue={myAppContext.cardToEdit}/>
        )
    }
}
