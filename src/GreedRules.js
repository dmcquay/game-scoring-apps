import React from 'react'

export default function GreedRules(props) {
    return (
        <div className="rules">
            <h3>Getting Started</h3>

            <p>Greed consists of several rounds. In each round, players are dealt as many cards as the round. For
                example, in round one, each player gets one card. In round two each player gets two cards. You can play
                as many rounds as you want until you run out of cards (e.g. maximum of 10 rounds for 5 players).</p>

            <h3>The Bidding Phase</h3>

            <p>The begging phase is next, but to understand bidding, you must first understand the next phase (the
                “Tricks” phase), so we’ll come back to bidding in a moment.</p>

            <h3>The Tricks Phase</h3>

            <p>The goal of this phase is to win as many tricks as you can. A trick is when every player puts down one
                card. The player with the best card wins the trick. The first card of the trick determines the suit.
                We’ll call this the leading suit. To win the trick, a subsequent player must play a larger card of the
                same suit (or of the trump suit, which we’ll explain in a moment).</p>

            <p>If a player has a card of the leading suit, she must play that card of that suit.</p>

            <p>For the first trick of the round, the player who bids highest plays first. After that, the winner of the
                previous trick plays first.</p>

            <h4>The Trump Suit</h4>

            <p>After dealing, the next card is flipped over to determine the trump suit for that round. Normally, to win
                a trick, you must play a card of the same suit as the leading card. Cards of all other suits have zero
                value. The trump suit is an exception to this. Cards of the trump suit all have a higher value than the
                leading suit. If the leading suit is hearts and the trump suit is spades, a 2 of spades has a higher
                value than the ace of hearts.</p>

            <p>The trump suit cannot be played in the first trick unless a player has no other cards in their hand. The
                trump suit cannot be the first card played for any trick until the trump suit has been “broken.” To
                “break” the trump suit for a given round, a player must not have a card of the leading suit in their
                hand and they choose to play a card of the trump suit at that time. In rare cases, if a trump card is
                played on the first trick (because that player has no non-trump cards in their hand), that counts as
                “breaking” the trump suit as well.</p>

            <h4>More on Bidding</h4>

            <p>Once the cards are dealt (before the Tricks phase), the bidding phase begins. The player to the dealer’s
                left bids first and then bidding proceeds clockwise. Each player states how many tricks they think they
                will win for that round. The player that bids highest gets to play first on the first trick.</p>

            <h3>Scoring</h3>

            <p>Your score for each round is determined by your bid and how many tricks you win. Winning a trick is worth
                one point. Winning a trick that you bid for is worth 3 points. But beware because if you win fewer
                tricks than you bid, then you get negative three points for each trick you bid and no points for each
                trick you won.</p>

            <p>Let’s look at a few scoring examples:</p>

            <table className="table">
                <thead>
                <tr>
                    <th>Bid</th>
                    <th>Tricks won</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>0</td>
                    <td>2</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>3</td>
                    <td>7</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>2</td>
                    <td>-9</td>
                </tr>
                </tbody>
            </table>

            <h3>Other details</h3>

            <p>Greed is played without jokers.</p>
        </div>
    )
}