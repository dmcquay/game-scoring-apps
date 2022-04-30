import React from 'react'

export default class AddPlayerModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playerName: '',
            initialScore: '0'
        }
        this.addPlayer = this.addPlayer.bind(this)
        this.setFieldValue = this.setFieldValue.bind(this)
    }

    addPlayer() {
        this.props.onAddPlayer(this.state.playerName, this.state.initialScore)
        this.props.onClose()
    }

    setFieldValue(evt) {
        const name = evt.target.name
        const value = evt.target.value
        this.setState(state => ({[name]: value}))
    }

    render() {
        const {onClose} = this.props

        return (
            <div>
                <div className="modal show" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Player Mid-Game</h5>
                                <button type="button" className="close" aria-label="Close" onClick={onClose}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Player Name:</label>
                                    <input type="text" className="form-control" name="playerName" value={this.state.playerName}
                                           onChange={this.setFieldValue}/>
                                </div>
                                <div className="form-group">
                                    <label>Initial Score:</label>
                                    <input type="number" className="form-control" name="initialScore" value={this.state.initialScore}
                                           onChange={this.setFieldValue}/>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-lg btn-primary" onClick={this.addPlayer}>Add Player</button>
                                <button type="button" className="btn btn-lg btn-secondary" onClick={onClose}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop show"></div>
            </div>
        )
    }
}