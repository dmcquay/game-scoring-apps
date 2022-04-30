import React from 'react'

import GreedRules from './GreedRules'

export default function RulesModal(props) {
    const {
        onClose
    } = props

    return (
        <div>
            <div className="modal show" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Rules of Greed</h5>
                            <button type="button" className="close" aria-label="Close" onClick={onClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body rules-modal-body">
                            <GreedRules/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop show"></div>
        </div>
    )
}