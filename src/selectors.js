const R = require('ramda')

export function getPlayerTrickCount(player, round, state) {
    return R.path(['rounds', round, 'tricks', player], state) || 0
}

export function getPlayerBid(player, round, state) {
    return R.path(['rounds', round, 'bids', player], state)
}

export function getCompletedRoundsCount(state) {
    const completeRounds = R.compose(
        R.filter(R.prop('complete')),
        R.prop('rounds')
    )(state)

    return completeRounds.length
}

export function computeScoreForPlayerRound(player, round, state) {
    const bid = getPlayerBid(player, round, state)
    const tricks = getPlayerTrickCount(player, round, state)

    if (bid === undefined)
        return 0
    if (tricks >= bid)
        return (bid * 3) + (tricks - bid)
    else
        return bid * -3
}

export function getPlayerTotalScore(player, state) {
    const numRounds = getCompletedRoundsCount(state)
    let totalScore = R.path(['initialPoints', player], state) || 0
    for (let round = 0; round < numRounds; round++) {
        totalScore += computeScoreForPlayerRound(player, round, state)
    }
    return totalScore
}

export function getLeaderboard(state) {
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