import * as R from 'ramda'
import React, {useState} from 'react'
import uuid from 'uuid'

let updatePlayTimeInterval = null

const DEFAULT_STATE = {
  players: {},
  playerFormName: '',
  isPlaying: false,
  playTimeStart: undefined,
  totalGameTime: 0
}

const getInitialState = () => {
  const gameStateString = localStorage.getItem('rosterState')
  if (gameStateString) {
    return JSON.parse(gameStateString)
  } else {
    return DEFAULT_STATE
  }
}

const formatDuration = (durationMillis) => {
  return '' + Math.floor(durationMillis / 1000 / 60) + ':' +
    ('' + Math.floor(durationMillis / 1000 % 60)).padStart(2, '0')
}

export default () => {
  const [state, _setState] = useState(getInitialState())

  const setState = (fnOrState) => {
    _setState(state => {
      const newState = typeof(fnOrState) === 'function' ? fnOrState(state) : fnOrState
      localStorage.setItem('rosterState', JSON.stringify(newState))
      return newState
    })
  }

  const addPlayer = () => {
    const id = uuid.v4()
    setState(state => ({
      ...state,
      playerFormName: '',
      players: {
        ...state.players,
        [id]: {
          id,
          name: state.playerFormName,
          playTimeMillis: 0,
          isPlaying: false
        }
      }
    }))
  }

  const updatePlayTimes = () => {
    setState(state => {
      let elapsedMillis = Date.now() - state.playTimeStart
      const playTimeStart = Date.now()

      const players = Object.values(state.players).map(player => {
        return {
          ...player,
          playTimeMillis: player.isPlaying ? player.playTimeMillis + elapsedMillis : player.playTimeMillis
        }
      }).reduce((byIds, player) => {
        return {
          ...byIds,
          [player.id]: player
        }
      }, {})

      return {
        ...state,
        players,
        playTimeStart,
        totalGameTime: state.totalGameTime + elapsedMillis
      }
    })
  }

  if (state.isPlaying && updatePlayTimeInterval == null) {
    updatePlayTimeInterval = setInterval(updatePlayTimes, 1000);
  }

  const toggleIsPlaying = () => {
    setState(state => {
      const isPlaying = !state.isPlaying
      if (isPlaying) {
        updatePlayTimeInterval = setInterval(updatePlayTimes, 1000);
      } else {
        clearInterval(updatePlayTimeInterval)
        updatePlayTimeInterval = null
      }
      return {
        ...state,
        isPlaying,
        playTimeStart: Date.now()
      }
    }, () => {
      console.log('it got called') 
    })
  }

  const setPlayerFormName = (evt) => {
    const playerFormName = evt.target.value
    setState(state => ({
      ...state,
      playerFormName
    }))
  }

  const togglePlayerIsPlaying = (playerId) => () => {
    setState(state => ({
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId],
          isPlaying: !state.players[playerId].isPlaying
        }
      }
    }))
  }

  const newGame = () => {
    setState(state => {
      const players = Object.values(state.players).map(player => {
        return {
          ...player,
          playTimeMillis: 0,
          isPlaying: false
        }
      }).reduce((byIds, player) => {
        return {
          ...byIds,
          [player.id]: player
        }
      }, {})

      return {
        ...state,
        isPlaying: false,
        players
      }
    })
  }

  const players = R.sortBy(R.prop('playTimeMillis'), Object.values(state.players))
  const inPlay = players.filter(x => x.isPlaying)
  const onTheBench = players.filter(x => !x.isPlaying)

  const totalPlayTime = players.reduce((sum, player) => sum + player.playTimeMillis, 0)
  const avgPlayTime = totalPlayTime / players.length

  return <div>
    <input type="text" value={state.playerFormName} onChange={setPlayerFormName} />
    <button onClick={addPlayer}>Add Player</button>
    <div>In Play</div>
    <PlayerList {...{players: inPlay, togglePlayerIsPlaying, avgPlayTime}} />
    <div>On the Bench</div>
    <PlayerList {...{players: onTheBench, togglePlayerIsPlaying, avgPlayTime}} />
    <button onClick={toggleIsPlaying}>{state.isPlaying ? 'Pause' : 'Play'}</button>
    <button onClick={newGame}>New Game</button>
    <div>Total Game Time: {formatDuration(state.totalGameTime)}</div>
  </div>
}

const PLAYER_STYLE_MAP = {
  UNDERPLAYED: { backgroundColor: 'lightblue' },
  NORMAL: {},
  OVERPLAYED: { backgroundColor: 'pink' }
}

const Player = ({player, togglePlayerIsPlaying, avgPlayTime}) => {
  const playRatio = player.playTimeMillis / avgPlayTime
  
  let status = 'NORMAL'
  if (avgPlayTime > 5 * 60 * 1000) {
    if (playRatio < .7) status = 'UNDERPLAYED'
    else if (playRatio > 1.3) status = 'OVERPLAYED'
  }

  const style = {
    margin: '5px 0',
    padding: '5px 10px',
    ...PLAYER_STYLE_MAP[status]
  }

  return <button onClick={togglePlayerIsPlaying(player.id)} style={style}>
    {player.name} {formatDuration(player.playTimeMillis)}
  </button>
}

const PlayerList = ({players, togglePlayerIsPlaying, avgPlayTime}) => {
  return <ul style={{listStyleType: 'none', margin: 0, padding: '5px'}}>
    {players.map(player => {
      return <li style={{margin: 0, padding: 0}} key={player.id}>
        <Player player={player} togglePlayerIsPlaying={togglePlayerIsPlaying} avgPlayTime={avgPlayTime} />
      </li>
    })}
  </ul>
}