import * as R from 'ramda'
import React, {useReducer, useEffect, useState} from 'react'
import uuid from 'uuid'
// import io from 'socket.io-client';

const DEFAULT_TEAM = {
  id: uuid.v4(),
  name: 'My Team',
  players: {}
}

const DEFAULT_STATE = {
  version: 1,
  teams: {
    [DEFAULT_TEAM.id]: DEFAULT_TEAM
  },
  activeTeamId: DEFAULT_TEAM.id,
  isPlaying: false,
  playTimeStart: undefined,
  totalGameTime: 0,
  editMode: false,
  showTeamList: false
}

const getInitialState = () => {
  const gameStateString = localStorage.getItem('rosterState')
  if (gameStateString) {
    return JSON.parse(gameStateString)
  } else {
    return DEFAULT_STATE
  }
}

// const getClientId = () => {
//   let clientId = localStorage.getItem('rosterClientId')
//   if (clientId == null) {
//     clientId = uuid.v4()
//     localStorage.setItem('rosterClientId', clientId)
//   }
//   return clientId
// }

const reducer = (state, action) => {
  const newState = reducers[action.type](state, action)
  localStorage.setItem('rosterState', JSON.stringify(newState))
  // const socket = getSocket()
  // if (socket != null && ['addPlayer'].includes(action.type) && !action.clientId) {
  //   console.log('sending action to socket')
  //   socket.emit('rosterAction', {...action, clientId: getClientId()})
  // }
  return newState
}

const reducers = {
  addTeam(state, action) {
    const team = {
      id: uuid.v4(),
      name: action.name,
      players: {}
    }

    return R.set(
      R.lensPath(['teams', team.id]),
      team,
      state
    )
  },

  setTeamName(state, action) {
    return R.set(
      R.lensPath(['teams', action.teamId, 'name']),
      action.name,
      state
    )
  },

  selectTeam(state, action) {
    return {
      ...state,
      activeTeamId: action.teamId,
      showTeamList: false
    }
  },

  showTeamList(state) {
    return {
      ...state,
      showTeamList: true
    }
  },

  addPlayer(state, action) {
    console.log(action)
    const player = {
      id: uuid.v4(),
      name: action.name,
      playTimeMillis: 0,
      isPlaying: false,
      isAvailable: true
    }

    return {
      ...R.set(
        R.lensPath(['teams', state.activeTeamId, 'players', player.id]),
        player,
        state
      ),
      playerFormName: ''
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

    const players = R.mapObjIndexed(
      (player) => {
        return {
          ...player,
          playTimeMillis: player.isPlaying ? player.playTimeMillis + elapsedMillis : player.playTimeMillis
        }
      },
      state.teams[state.activeTeamId].players
    )

    return {
      ...R.set(
        R.lensPath(['teams', state.activeTeamId, 'players']),
        players,
        state
      ),
      playTimeStart,
      totalGameTime: state.totalGameTime + elapsedMillis
    }
  },

  togglePlayerIsPlaying(state, action) {
    return R.set(
      R.lensPath(['teams', state.activeTeamId, 'players', action.playerId, 'isPlaying']),
      !state.teams[state.activeTeamId].players[action.playerId].isPlaying,
      state
    )
  },

  togglePlayerIsAvailable(state, action) {
    const player = state.teams[state.activeTeamId].players[action.playerId]
    return R.set(
      R.lensPath(['teams', state.activeTeamId, 'players', action.playerId]),
      {
        ...player,
        isAvailable: !player.isAvailable,
        isPlaying: false
      },
      state
    )
  },

  setPlayerName(state, action) {
    return R.set(
      R.lensPath(['teams', state.activeTeamId, 'players', action.playerId, 'name']),
      action.name,
      state
    )
  },

  deletePlayer(state, action) {
    return R.set(
      R.lensPath(['teams', state.activeTeamId, 'players']),
      R.omit([action.playerId], state.teams[state.activeTeamId].players),
      state
    )
  },

  newGame(state) {
    const players = R.mapObjIndexed(
      (player) => {
        return {
          ...player,
          playTimeMillis: 0,
          isPlaying: false
        }
      },
      state.teams[state.activeTeamId].players
    )

    return {
      ...R.set(
        R.lensPath(['teams', state.activeTeamId, 'players']),
        players,
        state
      ),
      isPlaying: false,
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

const inputStyle = {
  padding: '5px',
  width: '100%',
  display: 'block'
}

export default () => {
  const initialState = getInitialState()
  // const [socket, setSocket] = useState(null);
  const [name, setName] = useState('')

  // const getSocket = () => {
  //   return socket
  // }

  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
      if (!state.isPlaying) return
      dispatch({type: 'updatePlayTimes'})
    }, 1000)
  
    return () => clearInterval(intervalId); //This is important
  })

  // useEffect(() => {
  //   const socket = io('http://localhost:3001')
  //   socket.emit('rosterSubscribe', getClientId())
  //   setSocket(socket)
  //   socket.on('rosterAction', action => {
  //     console.log('received action: ' + JSON.stringify(action))
  //     if (action.clientId === getClientId()) {
  //       console.log('client id matches. ignoring. ' + action.clientId)
  //     } else {
  //       dispatch(action)
  //     }
  //   })
  //   return () => socket.close()
  // }, [setSocket])

  if (state.showTeamList || state.activeTeamId == null) {
    return <TeamEditor teams={state.teams} dispatch={dispatch} />
  }

  const players = R.sortBy(R.prop('playTimeMillis'), Object.values(state.teams[state.activeTeamId].players))
  const inPlay = players.filter(x => x.isAvailable && x.isPlaying)
  const onTheBench = players.filter(x => x.isAvailable && !x.isPlaying)
  const unavailable = players.filter(x => !x.isAvailable)

  const totalPlayTime = players.reduce((sum, player) => sum + player.playTimeMillis, 0)
  const avgPlayTime = totalPlayTime / players.length


  const baseStyle = {
    fontSize: '20px'
  }

  const headerStyle = {background: 'lightgrey', fontSize: '20px', textAlign: 'center', margin: '0', padding: '4px 0'}

  return <div style={baseStyle}>
    <div style={{background: state.isPlaying ? 'green' : 'red', textAlign: 'center', margin: '0', padding: '6px 0', fontSize: '22px'}}
      onClick={() => dispatch({type: 'toggleIsPlaying'})}>
      {state.isPlaying ? 'Playing ' : 'Paused '}
      {formatDuration(state.totalGameTime)}{' '}
      (Tap to {state.isPlaying ? 'pause' : 'resume'})
    </div>

    {state.editMode &&
      <div>
        <input style={inputStyle} type="text" value={name} onChange={evt => setName(evt.target.value)} />
        <button onClick={() => dispatch({type: 'addPlayer', name})}>Add Player</button>
      </div>
    }
    
    <div style={headerStyle}>In Play</div>
    <PlayerList {...{players: inPlay, dispatch, avgPlayTime, editMode: state.editMode}} />
    <div style={headerStyle}>On the Bench</div>
    <PlayerList {...{players: onTheBench, dispatch, avgPlayTime, editMode: state.editMode}} />
    {state.editMode &&
      <>
        <div style={headerStyle}>Unavailable</div>
        <PlayerList {...{players: unavailable, dispatch, avgPlayTime, editMode: state.editMode}} />
      </>
    }
    <div style={headerStyle}>Actions</div>
    <button onClick={() => dispatch({type: 'newGame'})}>New Game</button>
    <button onClick={() => dispatch({type: 'toggleEditMode'})}>{state.editMode ? 'Done Editing' : 'Edit Players'}</button>
    <button onClick={() => dispatch({type: 'showTeamList'})}>Switch Team</button>
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
  if (avgPlayTime > .2 * 60 * 1000) {
    if (playRatio < .7) status = 'UNDERPLAYED'
    else if (playRatio > 1.3) status = 'OVERPLAYED'
  }

  const style = {
    fontSize: '20px',
    margin: '0',
    padding: '10px',
    borderStyle: 'solid',
    borderWidth: '0 0 1px 0',
    borderColor: 'light grey',
    ...PLAYER_STYLE_MAP[status]
  }

  if (editMode) {
    return <div>
      <input style={inputStyle} value={player.name} onChange={evt => dispatch({type: 'setPlayerName', playerId: player.id, name: evt.target.value})} />
      <button onClick={() => dispatch({type: 'deletePlayer', playerId: player.id})}>Delete</button>
      <button onClick={() => dispatch({type: 'togglePlayerIsAvailable', playerId: player.id})}>{player.isAvailable ? 'Unavailable' : 'Available'}</button>
    </div>
  } else {
    return <div 
      onClick={() => dispatch({type: 'togglePlayerIsPlaying', playerId: player.id})}
      style={style}>
        {player.name} {formatDuration(player.playTimeMillis)}
    </div>
  }
}

const PlayerList = ({players, dispatch, avgPlayTime, editMode}) => {
  return <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
    {players.map(player => {
      return <li style={{margin: 0, padding: 0}} key={player.id}>
        <Player {...{player, dispatch, avgPlayTime, editMode}} />
      </li>
    })}
  </ul>
}

const TeamEditor = ({teams, dispatch}) => {
  const addTeam = () => dispatch({type: 'addTeam', name: 'New Team'})
  
  return <div>
    <div>
      <button onClick={addTeam}>Add Team</button>
    </div>
    <ul style={{margin: 0, padding: 0, listStyleType: 'none'}}>
      {Object.values(teams).map(team => <li key={team.id}><Team team={team} dispatch={dispatch} /></li>)}
    </ul>
  </div>
}

const Team = ({team, dispatch}) => {
  const setTeamName = (evt) => {
    dispatch({
      type: 'setTeamName',
      teamId: team.id,
      name: evt.target.value
    })
  }
  
  return <div>
    <input style={inputStyle} type="text" value={team.name} onChange={setTeamName} />
    <button onClick={() => dispatch({type: 'selectTeam', teamId: team.id})}>Select</button>
  </div>
}