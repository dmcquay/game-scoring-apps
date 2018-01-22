import React from 'react'

export default class Grid extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            player: props.players[0]
        }
    }

    handleSelectPlayer(evt) {
        this.setState({player: evt.target.value})
    }

    render() {
        const {
            onClose,
            players,
            completedRounds
        } = this.props

        const {
            player
        } = this.state

        return (
            <div>
                <div className="form-group">
                    <select className="form-control" value={player} onChange={this.handleSelectPlayer.bind(this)}>
                        {players.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <table className="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Bid</th>
                        <th>Won</th>
                        <th>Points</th>
                        <th>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {completedRounds.map((r, idx) => <tr key={idx}>
                        <td key={`grid-${idx}`}>{idx+1}</td>
                        <td key={`grid-${idx}-bid`}>3</td>
                        <td key={`grid-${idx}-won`}>4</td>
                        <td key={`grid-${idx}-points`}>10</td>
                        <td key={`grid-${idx}-total`}>15</td>
                    </tr>)}
                    </tbody>
                </table>
                <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
        )
    }
}