import * as R from 'ramda'
import React, {useReducer, useEffect} from 'react'
import uuid from 'uuid'

const DEFAULT_STATE = {
  players: {},
  playerFormName: '',
  isPlaying: false,
  playTimeStart: undefined,
  totalGameTime: 0,
  editMode: false
}

const getInitialState = () => {
  const gameStateString = localStorage.getItem('rosterState')
  if (gameStateString) {
    return JSON.parse(gameStateString)
  } else {
    return DEFAULT_STATE
  }
}

const reducer = (state, action) => {
  const newState = reducers[action.type](state, action)
  localStorage.setItem('rosterState', JSON.stringify(newState))
  return newState
}

const reducers = {
  setPlayerFormName(state, action) {
    return {
      ...state,
      playerFormName: action.value
    }
  },

  addPlayer(state) {
    const id = uuid.v4()
    return {
      ...state,
      playerFormName: '',
      players: {
        ...state.players,
        [id]: {
          id,
          name: state.playerFormName,
          playTimeMillis: 0,
          isPlaying: false,
          isAvailable: true
        }
      }
    }
  },

  toggleIsPlaying(state) {
    const isPlaying = !state.isPlaying
    return {
      ...state,
      isPlaying,
      playTimeStart: Date.now()
    }
  },

  updatePlayTimes(state) {
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
  },

  togglePlayerIsPlaying(state, action) {
    return {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: {
          ...state.players[action.playerId],
          isPlaying: !state.players[action.playerId].isPlaying
        }
      }
    }
  },

  togglePlayerIsAvailable(state, action) {
    return {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: {
          ...state.players[action.playerId],
          isAvailable: !state.players[action.playerId].isAvailable
        }
      }
    }
  },

  setName(state, action) {
    return {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: {
          ...state.players[action.playerId],
          name: action.name
        }
      }
    }
  },

  deletePlayer(state, action) {
    const players = {...state.players}
      delete players[action.playerId]
      return {
        ...state,
        players
      }
  },

  newGame(state) {
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
      players,
      totalGameTime: 0
    }
  },

  toggleEditMode(state) {
    return {
      ...state,
      editMode: !state.editMode
    }
  }
}

const formatDuration = (durationMillis) => {
  return '' + Math.floor(durationMillis / 1000 / 60) + ':' +
    ('' + Math.floor(durationMillis / 1000 % 60)).padStart(2, '0')
}

export default () => {
  const initialState = getInitialState()
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
      if (!state.isPlaying) return
      dispatch({type: 'updatePlayTimes'})
    }, 1000)
  
    return () => clearInterval(intervalId); //This is important
  })

  const setPlayerFormName = (evt) => {
    const playerFormName = evt.target.value
    dispatch({
      type: 'setPlayerFormName',
      value: playerFormName
    })
  }

  const players = R.sortBy(R.prop('playTimeMillis'), Object.values(state.players))
  const inPlay = players.filter(x => x.isAvailable && x.isPlaying)
  const onTheBench = players.filter(x => x.isAvailable && !x.isPlaying)
  const unavailable = players.filter(x => !x.isAvailable)

  const totalPlayTime = players.reduce((sum, player) => sum + player.playTimeMillis, 0)
  const avgPlayTime = totalPlayTime / players.length

  return <div>
    {state.editMode &&
      <div>
        <input type="text" value={state.playerFormName} onChange={setPlayerFormName} />
        <button onClick={() => dispatch({type: 'addPlayer'})}>Add Player</button>
      </div>
    }
    
    <div>In Play</div>
    <PlayerList {...{players: inPlay, dispatch, avgPlayTime, editMode: state.editMode}} />
    <div>On the Bench</div>
    <PlayerList {...{players: onTheBench, dispatch, avgPlayTime, editMode: state.editMode}} />
    {state.editMode &&
      <>
        <div>Unavailable</div>
        <PlayerList {...{players: unavailable, dispatch, avgPlayTime, editMode: state.editMode}} />
      </>
    }
    <button onClick={() => dispatch({type: 'toggleIsPlaying'})}>{state.isPlaying ? 'Pause' : 'Play'}</button>
    <button onClick={() => dispatch({type: 'newGame'})}>New Game</button>
    <button onClick={() => dispatch({type: 'toggleEditMode'})}>{state.editMode ? 'Done Editing' : 'Edit Players'}</button>
    <div>Total Game Time: {formatDuration(state.totalGameTime)}</div>
  </div>
}

const PLAYER_STYLE_MAP = {
  UNDERPLAYED: { backgroundColor: 'lightblue' },
  NORMAL: {},
  OVERPLAYED: { backgroundColor: 'pink' }
}

const Player = ({player, dispatch, avgPlayTime, editMode}) => {
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

  if (editMode) {
    return <div>
      <input value={player.name} onChange={evt => dispatch({type: 'setName', playerId: player.id, name: evt.target.value})} />
      <button onClick={() => dispatch({type: 'deletePlayer', playerId: player.id})}>Delete</button>
      <button onClick={() => dispatch({type: 'togglePlayerIsAvailable', playerId: player.id})}>{player.isAvailable ? 'Unavailable' : 'Available'}</button>
    </div>
  } else {
    return <button onClick={() => dispatch({type: 'togglePlayerIsPlaying', playerId: player.id})} style={style}>
      {player.name} {formatDuration(player.playTimeMillis)}
    </button>
  }
}

const PlayerList = ({players, dispatch, avgPlayTime, editMode}) => {
  return <ul style={{listStyleType: 'none', margin: 0, padding: '5px'}}>
    {players.map(player => {
      return <li style={{margin: 0, padding: 0}} key={player.id}>
        <Player {...{player, dispatch, avgPlayTime, editMode}} />
      </li>
    })}
  </ul>
}