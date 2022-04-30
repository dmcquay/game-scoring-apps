'use strict'

import {
    getOrderedPlayersForBidding,
    getDealer,
    computeScoreForPlayerRound,
    getPlayerTotalScore
} from './selectors'

describe('selectors', () => {
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

    describe('#computeScoreForPlayerRound', () => {
        it('when player bids less than they won', () => {
            const player = 'Dustin'
            const round = 0
            const state = {
                rounds: [
                    {
                        bids: {
                            Dustin: 2
                        },
                        tricks: {
                            Dustin: 3
                        }
                    }
                ]
            }
            const result = computeScoreForPlayerRound(player, round, state)
            expect(result).toEqual(7)
        })

        it('when player bids more than they won', () => {
            const player = 'Dustin'
            const round = 0
            const state = {
                rounds: [
                    {
                        bids: {
                            Dustin: 3
                        },
                        tricks: {
                            Dustin: 2
                        }
                    }
                ]
            }
            const result = computeScoreForPlayerRound(player, round, state)
            expect(result).toEqual(-9)
        })

        it('when player has no data for this round', () => {
            const player = 'Dustin'
            const round = 0
            const state = {
                rounds: [
                    {
                        bids: {},
                        tricks: {}
                    }
                ]
            }
            const result = computeScoreForPlayerRound(player, round, state)
            expect(result).toEqual(0)
        })
    })

    describe('#getPlayerTotalScore', () => {
        it('happy path', () => {
            const player = 'Dustin'
            const state = {
                rounds: [
                    {
                        bids: {
                            Dustin: 2
                        },
                        tricks: {
                            Dustin: 3
                        },
                        complete: true
                    },
                    {
                        bids: {
                            Dustin: 0
                        },
                        tricks: {
                            Dustin: 1
                        },
                        complete: true
                    }
                ]
            }
            const result = getPlayerTotalScore(player, state)
            expect(result).toEqual(8)
        })

        it('ignores incomplete rounds', () => {
            const player = 'Dustin'
            const state = {
                rounds: [
                    {
                        bids: {
                            Dustin: 0
                        },
                        tricks: {
                            Dustin: 1
                        },
                        complete: true
                    },
                    {
                        bids: {
                            Dustin: 0
                        },
                        tricks: {
                            Dustin: 1
                        }
                    }
                ]
            }
            const result = getPlayerTotalScore(player, state)
            expect(result).toEqual(1)
        })

        it('uses starting values (for players joining mid-game)', () => {
            const player = 'Dustin'
            const state = {
                initialPoints: {
                    Dustin: 1
                },
                rounds: [
                    {
                        bids: {},
                        tricks: {},
                        complete: true
                    },
                    {
                        bids: {
                            Dustin: 0
                        },
                        tricks: {
                            Dustin: 1
                        },
                        complete: true
                    }
                ]
            }
            const result = getPlayerTotalScore(player, state)
            expect(result).toEqual(2)
        })
    })
})