import * as R from 'ramda'
import React, {useState} from 'react'
import {useSharedStateReducer} from './state'

// import io from 'socket.io-client';

// const getClientId = () => {
//   let clientId = localStorage.getItem('rosterClientId')
//   if (clientId == null) {
//     clientId = uuid.v4()
//     localStorage.setItem('rosterClientId', clientId)
//   }
//   return clientId
// }

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
  // const [socket, setSocket] = useState(null);
  const [name, setName] = useState('')

  // const getSocket = () => {
  //   return socket
  // }

  const [state, dispatch] = useSharedStateReducer()

  const team = state.teams[state.activeTeamId]

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

  const players = R.sortBy(R.prop('playTimeMillis'), Object.values(team.players))
  const inPlay = players.filter(x => x.isAvailable && x.isPlaying)
  const onTheBench = players.filter(x => x.isAvailable && !x.isPlaying)
  const unavailable = players.filter(x => !x.isAvailable)

  const totalPlayTime = players.reduce((sum, player) => sum + player.playTimeMillis, 0)
  const avgPlayTime = totalPlayTime / players.length

  const baseStyle = {
    fontSize: '20px'
  }

  const headerStyle = {background: 'lightgrey', fontSize: '20px', textAlign: 'center', margin: '0', padding: '4px 0'}

  const addPlayer = () => {
    dispatch({type: 'addPlayer', name})
    setName('')
  }

  return <div style={baseStyle}>
    <div style={{background: team.isPlaying ? 'green' : 'red', textAlign: 'center', margin: '0', padding: '6px 0', fontSize: '22px'}}
      onClick={() => dispatch({type: 'toggleIsPlaying'})}>
      {team.isPlaying ? 'Playing ' : 'Paused '}
      {formatDuration(team.totalGameTime)}{' '}
      (Tap to {team.isPlaying ? 'pause' : 'resume'})
    </div>

    {state.editMode &&
      <div>
        <input style={inputStyle} type="text" value={name} onChange={evt => setName(evt.target.value)} />
        <button onClick={addPlayer}>Add Player</button>
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
    <button onClick={() => dispatch({type: 'newGame'})}>Reset</button>
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