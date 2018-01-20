import React, {Component} from 'react'
import * as R from 'ramda'

import Menu from './Menu'
import NewGameModal from './NewGameModal'
import RulesModal from './RulesModal'
import AddPlayerModal from './AddPlayerModal'
import menuIcon from './menu.svg'
import './App.css'
import {
    getPlayerTrickCount,
    getPlayerBid,
    getLeaderboard,
    getDealer,
    getOrderedPlayersForBidding
} from './selectors'
import localStorage from './local-storage'

const DEFAULT_STATE = {
    stage: 'input-players',
    showMenu: false,
    showNewGameModal: false,
    showRulesModal: false,
    showAddPlayerModal: false,
    playerInput: '',
    playerInputError: undefined,
    players: [],
    round: 0,
    rounds: [],
    initialPoints: {}
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

    openMenu() {
        this.setState(state => ({showMenu: true}))
    }

    closeMenu() {
        this.setState(state => ({showMenu: false}))
    }

    showRulesModal() {
        this.setState(state => ({showRulesModal: true}))
    }

    closeRulesModal() {
        this.setState(state => ({showRulesModal: false}))
    }

    showNewGameModal() {
        this.setState(state => ({showNewGameModal: true}))
    }

    closeNewGameModal() {
        this.setState(state => ({showNewGameModal: false}))
    }

    showAddPlayerModal() {
        this.setState(state => ({showAddPlayerModal: true}))
    }

    closeAddPlayerModal() {
        this.setState(state => ({showAddPlayerModal: false}))
    }

    startNewGame() {
        this.setState(state => DEFAULT_STATE)
    }

    addPlayerMidGame(playerName, initialPoints) {
        this.setState(state => ({
            players: [
                ...this.state.players,
                playerName
            ],
            initialPoints: {
                ...this.state.initialPoints,
                [playerName]: parseInt(initialPoints, 10)
            }
        }))
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
                    <div key={player} className="player-tricks-row">
                        <div className="">
                            {player} ({getPlayerBid(player, this.state.round, this.state)})
                        </div>
                        <div className="player-tricks-scoring-controls">
                            <button className="btn btn-lg btn-primary"
                                    onClick={() => this.incrementPlayerTrickCount(player)}>+
                            </button>
                            <span
                                className="player-tricks-count">{getPlayerTrickCount(player, this.state.round, this.state)}</span>
                            <button className="btn btn-lg btn-primary"
                                    onClick={() => this.decrementPlayerTrickCount(player)}>-
                            </button>
                        </div>
                    </div>
                )}
                <button className="btn btn-lg btn-block btn-primary" disabled={!roundComplete}
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
                    {R.range(0, this.state.round + 2).map(v => <button className="btn btn-lg btn-primary btn-bid"
                                                                       key={v}
                                                                       onClick={() => this.submitBid(nextPlayerToBid, v)}>{v}</button>)}
                </div>}

                {!bids.length && <p>
                    {dealer} is dealing {this.state.round + 1} card{this.state.round > 0 ? 's' : ''}.
                    <br/>{nextPlayerToBid} bids first.</p>}

                {!!bids.length && <h3>Bids</h3>}
                {!!bids.length && <ul className="list-unstyled">
                    {bids.map(({player, bid}) => <li key={`bid-list-item-${player}`}>{player}: {bid}</li>)}
                </ul>}

                {!nextPlayerToBid && <div>
                    <p>All bids are in. {maxBidder} goes first.</p>
                    <button onClick={this.doneBidding.bind(this)} className="btn btn-lg btn-primary">Continue</button>
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

        return <NewGameModal
            onClose={this.closeNewGameModal.bind(this)}
            onNewGame={this.startNewGame.bind(this)}
        />
    }

    renderRulesModal() {
        if (!this.state.showRulesModal)
            return null

        return <RulesModal onClose={this.closeRulesModal.bind(this)}/>
    }

    renderAddPlayerModal() {
        if (!this.state.showAddPlayerModal)
            return null

        return <AddPlayerModal
            onClose={this.closeAddPlayerModal.bind(this)}
            onAddPlayer={this.addPlayerMidGame.bind(this)}
        />
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

        const menuProps = {
            onClose: this.closeMenu.bind(this),
            onShowRules: this.showRulesModal.bind(this),
            onNewGame: this.showNewGameModal.bind(this),
            onAddPlayer: this.showAddPlayerModal.bind(this)
        }

        return (
            <div>
                <main>
                    <header>
                        <div className="header-container container">
                            <h1 className="header-title">
                                <img className="menu-cta" onClick={this.openMenu.bind(this)} src={menuIcon} alt=""/>
                                <span>Greed</span>
                            </h1>
                            {this.state.stage !== 'input-players' && <h3>Round {this.state.round + 1}</h3>}
                        </div>
                    </header>
                    <div className="stage container">
                        {renderedStage}
                    </div>
                    {this.renderLeaderboard()}
                </main>
                {this.renderNewGameModal()}
                {this.renderRulesModal()}
                {this.renderAddPlayerModal()}
                {this.state.showMenu && <Menu {...menuProps} />}
            </div>
        )
    }
}

export default App