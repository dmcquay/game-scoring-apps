import React from 'react'

export default function Menu(props) {
    function closeThen(handler) {
        return function() {
            props.onClose()
            handler()
        }
    }

    return (
        <nav className="menu">
            <ul>
                <li onClick={closeThen(props.onNewGame)}>New Game</li>
                <li onClick={closeThen(props.onShowRules)}>Rules</li>
                <li onClick={props.onClose}>Close Menu</li>
            </ul>
        </nav>
    )
}