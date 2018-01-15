import React, {Component} from 'react'
import * as R from 'ramda'

import './App.css'

function getPlayerTrickCount(player, round, state) {
    return R.path(['rounds', round, 'tricks', player], state) || 0
}

function getPlayerBid(player, round, state) {
    return R.path(['rounds', round, 'bids', player], state)
}

function getCompletedRoundsCount(state) {
    const completeRounds = R.compose(
        R.filter(R.prop('complete')),
        R.prop('rounds')
    )(state)

    return completeRounds.length
}

function computeScoreForPlayerRound(player, round, state) {
    const bid = getPlayerBid(player, round, state)
    const tricks = getPlayerTrickCount(player, round, state)
    if (tricks >= bid)
        return (bid * 3) + (tricks - bid)
    else
        return bid * -3
}

function getPlayerTotalScore(player, state) {
    const numRounds = getCompletedRoundsCount(state)
    let totalScore = 0
    for (let round = 0; round < numRounds; round++) {
        totalScore += computeScoreForPlayerRound(player, round, state)
    }
    return totalScore
}

function getLeaderboard(state) {
    const playerScores = state.players.map(player => {
        const score = getPlayerTotalScore(player, state)
        return {player, score}
    })

    return R.reverse(R.sortBy(R.prop('score'), playerScores))
}

export function getDealer(players, round) {
    const idx = round % players.length
    return players[idx]
}

export function getOrderedPlayersForBidding(players, round) {
    const first = (round + 1) % players.length
    return players.slice(first).concat(players.slice(0, first))
}

const DEFAULT_STATE = {
    stage: 'input-players',
    showNewGameModal: false,
    playerInput: '',
    playerInputError: undefined,
    players: [],
    round: 0,
    rounds: []
}

class App extends Component {
    constructor(props) {
        super(props)
        this.state = DEFAULT_STATE

        const gameStateString = localStorage.getItem('gameState')
        if (gameStateString) {
            this.state = JSON.parse(gameStateString)
        }
    }

    componentWillUpdate(_, nextState) {
        localStorage.setItem('gameState', JSON.stringify(nextState))
    }

    updatePlayerInput(name) {
        let playerInputError = undefined
        if (name && this.state.players.find(player => player === name)) {
            playerInputError = 'Player names must be unique'
        }

        this.setState(state => ({
            playerInput: name,
            playerInputError
        }))
    }

    addPlayer(evt) {
        evt.preventDefault()

        if (!this.state.playerInputError) {
            this.setState(state => ({
                players: [
                    ...state.players,
                    state.playerInput
                ],
                playerInput: ''
            }))
        }

        return false
    }

    startGame(evt) {
        evt.preventDefault()
        if (this.state.playerInput) {
            this.addPlayer(evt)
        }
        this.setState(state => ({stage: 'bids'}))
        return false
    }

    getNextPlayerToBid() {
        const bids = R.path(['rounds', this.state.round, 'bids'], this.state) || {}
        const orderedPlayers = getOrderedPlayersForBidding(this.state.players, this.state.round)
        return orderedPlayers.find(player => bids[player] === undefined)
    }

    submitBid(player, bid) {
        this.setState(state => {
            return R.set(R.lensPath(['rounds', state.round, 'bids', player]), bid, state)
        })
    }

    setPlayerTrickCount(player, trickCount) {
        const tricksLens = R.lensPath(['rounds', this.state.round, 'tricks', player])
        this.setState(state => R.set(tricksLens, trickCount, state))
    }

    incrementPlayerTrickCount(player) {
        this.setPlayerTrickCount(player, getPlayerTrickCount(player, this.state.round, this.state) + 1)
    }

    decrementPlayerTrickCount(player) {
        const newCount = getPlayerTrickCount(player, this.state.round, this.state) - 1
        this.setPlayerTrickCount(player, Math.max(0, newCount))
    }

    completeRound() {
        this.setState(state => {
            return R.compose(
                R.set(R.lensPath(['rounds', state.round, 'complete']), true),
                R.set(R.lensProp('stage'), 'bids'),
                R.set(R.lensProp('round'), state.round + 1)
            )(state)
        })
    }

    doneBidding() {
        this.setState(state => ({
            ...state,
            stage: 'tricks'
        }))
    }

    showNewGameModal() {
        this.setState(state => ({showNewGameModal: true}))
    }

    closeNewGameModal() {
        this.setState(state => ({showNewGameModal: false}))
    }

    startNewGame() {
        this.setState(state => DEFAULT_STATE)
    }

    renderTricks() {
        const trickSum = R.compose(
            R.sum,
            R.values,
            R.path(['rounds', this.state.round, 'tricks'])
        )(this.state)

        const roundComplete = trickSum === this.state.round + 1

        return (
            <div>
                {this.state.players.map(player =>
                    <div key={player} className="row player-tricks-row">
                        <div className="col-6">
                            {player} ({getPlayerBid(player, this.state.round, this.state)})
                        </div>
                        <div className="col-6 player-tricks-scoring-controls">
                            <button className="btn btn-primary"
                                    onClick={() => this.incrementPlayerTrickCount(player)}>+
                            </button>
                            <span
                                className="player-tricks-count">{getPlayerTrickCount(player, this.state.round, this.state)}</span>
                            <button className="btn btn-primary"
                                    onClick={() => this.decrementPlayerTrickCount(player)}>-
                            </button>
                        </div>
                    </div>
                )}
                <button className="btn btn-block btn-primary" disabled={!roundComplete}
                        onClick={this.completeRound.bind(this)}>Complete Round
                </button>
            </div>
        )
    }

    renderBids() {
        const nextPlayerToBid = this.getNextPlayerToBid()
        const orderedPlayers = getOrderedPlayersForBidding(this.state.players, this.state.round)
        const playersWithBids = orderedPlayers.filter(player => getPlayerBid(player, this.state.round, this.state) !== undefined)
        const bids = playersWithBids.map(player => ({player, bid: getPlayerBid(player, this.state.round, this.state)}))

        let maxBidder
        if (bids.length) {
            const maxBidValue = Math.max(...bids.map(({bid}) => bid))
            const maxBid = bids.find(({player, bid}) => bid === maxBidValue)
            maxBidder = maxBid.player
        }

        const dealer = getDealer(this.state.players, this.state.round)

        return (
            <div className="bids">
                {!!nextPlayerToBid && <div>
                    <h2>Bid for {nextPlayerToBid}</h2>
                    {R.range(0, this.state.round + 2).map(v => <button className="btn btn-primary btn-bid"
                                                                       key={v}
                                                                       onClick={() => this.submitBid(nextPlayerToBid, v)}>{v}</button>)}
                </div>}

                {!bids.length && <p>
                    {dealer} is dealing {this.state.round + 1} card{this.state.round > 0 ? 's' : ''}.
                    <br/>{nextPlayerToBid} bids first.</p>}

                {!!bids.length && <h3>Bids</h3>}
                {!!bids.length && <ul className="list-unstyled">
                    {bids.map(({player, bid}) => <li>{player}: {bid}</li>)}
                </ul>}

                {!nextPlayerToBid && <div>
                    <p>All bids are in. {maxBidder} goes first.</p>
                    <button onClick={this.doneBidding.bind(this)} className="btn btn-primary">Continue</button>
                </div>}
            </div>
        )
    }

    renderInputPlayers() {
        return (
            <div>
                <h2>Players</h2>
                {this.state.players.length
                    ? <ul>
                        {this.state.players.map(player => <li key={player}>{player}</li>)}
                    </ul>
                    : <p>No players yet.</p>
                }
                <form onSubmit={this.addPlayer.bind(this)}>
                    <div className="form-group">
                        <input className="form-control" id="player-name-input" type="text" placeholder="Player name"
                               onChange={evt => this.updatePlayerInput(evt.target.value)}
                               value={this.state.playerInput}/>
                    </div>
                    <div className="form-group">
                        <button className="add-player-btn btn btn-primary" onClick={this.addPlayer.bind(this)}>
                            Add Player
                        </button>
                        <button className="add-player-btn btn btn-success" onClick={this.startGame.bind(this)}>
                            Start
                        </button>
                        {this.state.playerInputError &&
                        <div className="alert alert-danger" style={{color: 'red'}}>{this.state.playerInputError}</div>}
                    </div>
                </form>
            </div>
        )
    }

    renderLeaderboard() {
        const leaders = getLeaderboard(this.state)

        if (!leaders.length || this.state.stage === 'input-players')
            return null

        return (
            <div className="scores">
                <div className="container">
                    <h3 className="scores-title">Leaders</h3>
                    <ul className="scores-list">
                        {leaders.map(({player, score}) => <li key={player}>{player} ({score})</li>)}
                    </ul>
                </div>
            </div>
        )
    }

    renderNewGameModal() {
        if (!this.state.showNewGameModal)
            return null

        return (
            <div>
                <div className="modal show" tabindex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Game</h5>
                                <button type="button" class="close" aria-label="Close"
                                        onClick={this.closeNewGameModal.bind(this)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p>Are you sure you want to start a new game? Current game progress will be lost.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" onClick={this.startNewGame.bind(this)}>
                                    Yes, new game
                                </button>
                                <button type="button" class="btn btn-secondary"
                                        onClick={this.closeNewGameModal.bind(this)}>Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop show"></div>
            </div>
        )
    }

    render() {
        const stage = this.state.stage

        let renderedStage

        if (stage === 'input-players')
            renderedStage = this.renderInputPlayers()
        else if (stage === 'bids')
            renderedStage = this.renderBids()
        else if (stage === 'tricks')
            renderedStage = this.renderTricks()

        return (
            <main>
                <header>
                    <h1 className="header-title container">
                        <span>Greed</span>
                        <button className="btn btn-sm btn-success new-game-btn"
                                onClick={this.showNewGameModal.bind(this)}>
                            New <span className="extended-new-game-btn-content">Game</span>
                        </button>
                        {this.state.stage !== 'input-players' &&
                        <small className="text-muted">Round {this.state.round + 1}</small>}
                    </h1>
                </header>
                <div className="stage container">
                    {renderedStage}
                </div>
                {this.renderLeaderboard()}
                {this.renderNewGameModal()}
            </main>
        )
    }
}

export default App