import React from 'react'

export default function NewGameModal(props) {
    const {
        onClose,
        onNewGame
    } = props

    return (
        <div>
            <div className="modal show" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">New Game</h5>
                            <button type="button" className="close" aria-label="Close" onClick={onClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to start a new game? Current game progress will be lost.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-lg btn-primary" onClick={onNewGame}>
                                Yes, new game
                            </button>
                            <button type="button" className="btn btn-lg btn-secondary" onClick={onClose}>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop show"></div>
        </div>
    )
}