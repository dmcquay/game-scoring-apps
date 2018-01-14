import React from 'react'
import ReactDOM from 'react-dom'
import App, {getOrderedPlayersForBidding, getDealer} from './App'

it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App/>, div)
})

describe('#getOrderedPlayersForBidding', () => {
    describe('2 players', () => {
        const players = ['Dustin', 'Jill']

        it('round 0', () => {
            expect(getOrderedPlayersForBidding(players, 0)).toEqual(['Jill', 'Dustin'])
        })

        it('round 1', () => {
            expect(getOrderedPlayersForBidding(players, 1)).toEqual(['Dustin', 'Jill'])
        })

        it('round 2', () => {
            expect(getOrderedPlayersForBidding(players, 2)).toEqual(['Jill', 'Dustin'])
        })

        it('round 3', () => {
            expect(getOrderedPlayersForBidding(players, 3)).toEqual(['Dustin', 'Jill'])
        })
    })

    describe('3 players', () => {
        const players = ['Dustin', 'Jill', 'Diane']

        it('round 0', () => {
            expect(getOrderedPlayersForBidding(players, 0)).toEqual(['Jill', 'Diane', 'Dustin'])
        })

        it('round 1', () => {
            expect(getOrderedPlayersForBidding(players, 1)).toEqual(['Diane', 'Dustin', 'Jill'])
        })

        it('round 2', () => {
            expect(getOrderedPlayersForBidding(players, 2)).toEqual(['Dustin', 'Jill', 'Diane'])
        })

        it('round 3', () => {
            expect(getOrderedPlayersForBidding(players, 3)).toEqual(['Jill', 'Diane', 'Dustin'])
        })
    })
})

describe('#getDealer', () => {
    describe('2 players', () => {
        const players = ['Dustin', 'Jill']

        it('round 0', () => {
            expect(getDealer(players, 0)).toEqual('Dustin')
        })

        it('round 1', () => {
            expect(getDealer(players, 1)).toEqual('Jill')
        })

        it('round 2', () => {
            expect(getDealer(players, 2)).toEqual('Dustin')
        })

        it('round 3', () => {
            expect(getDealer(players, 3)).toEqual('Jill')
        })
    })

    describe('3 players', () => {
        const players = ['Dustin', 'Jill', 'Diane']

        it('round 0', () => {
            expect(getDealer(players, 0)).toEqual('Dustin')
        })

        it('round 1', () => {
            expect(getDealer(players, 1)).toEqual('Jill')
        })

        it('round 2', () => {
            expect(getDealer(players, 2)).toEqual('Diane')
        })

        it('round 3', () => {
            expect(getDealer(players, 3)).toEqual('Dustin')
        })
    })
})