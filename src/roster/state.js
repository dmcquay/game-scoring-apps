import uuid from 'uuid'
import * as R from 'ramda'
import {useReducer, useEffect} from 'react'

const buildTeam = (props) => {
  return {
    id: uuid.v4(),
    name: 'New Team',
    players: {},
    isPlaying: false,
    playTimeStart: undefined,
    totalGameTime: 0,
    ...props
  }
}

const DEFAULT_TEAM = buildTeam()

const DEFAULT_STATE = {
  version: 1,
  teams: {
    [DEFAULT_TEAM.id]: DEFAULT_TEAM
  },
  activeTeamId: DEFAULT_TEAM.id,
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

export const setTeamState = (state, cb) => {
  const prevTeamState = state.teams[state.activeTeamId]
  const newTeamState = cb(prevTeamState)
  const combined = {
    ...prevTeamState,
    ...newTeamState
  }
  return {
    ...state,
    teams: {
      ...state.teams,
      [state.activeTeamId]: combined
    }
  }
}

export const setPlayerState = (state, playerId, cb) => {
  return setTeamState(state, (teamState) => {
    const prevPlayerState = teamState.players[playerId]
    return {
      players: {
        ...teamState.players,
        [playerId]: {
          ...prevPlayerState,
          ...cb(prevPlayerState)
        }
      }
    }
  })
}

const reducers = {
  addTeam(state, action) {
    const team = buildTeam({ name: action.name })
    return {
      ...state,
      teams: {
        ...state.teams,
        [team.id]: team
      }
    }
  },

  setTeamName(state, action) {
    return {
      ...state,
      teams: {
        ...state.teams,
        [action.teamId]: {
          ...state.teams[action.teamId],
          name: action.name
        }
      }
    }
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
    const player = {
      id: uuid.v4(),
      name: action.name,
      playTimeMillis: 0,
      isPlaying: false,
      isAvailable: true
    }

    return setTeamState(state, team => ({
      players: {
        ...team.players,
        [player.id]: player
      }
    }))
  },

  toggleIsPlaying(state) {
    return setTeamState(state, team => {
      return {
        isPlaying: !team.isPlaying,
        playTimeStart: Date.now()
      }
    })
  },

  updatePlayTimes(state) {
    return setTeamState(state, team => {
      let elapsedMillis = Date.now() - team.playTimeStart
      const playTimeStart = Date.now()

      const players = R.mapObjIndexed(
        (player) => {
          return {
            ...player,
            playTimeMillis: player.isPlaying ? player.playTimeMillis + elapsedMillis : player.playTimeMillis
          }
        },
        team.players
      )
      
      return {
        players,
        playTimeStart,
        totalGameTime: team.totalGameTime + elapsedMillis
      }
    })
  },

  togglePlayerIsPlaying(state, action) {
    return setPlayerState(state, action.playerId, (player) => ({
        isPlaying: !player.isPlaying
    }))
  },

  togglePlayerIsAvailable(state, action) {
    return setPlayerState(state, action.playerId, (player) => ({
      isAvailable: !player.isAvailable,
      isPlaying: false
    }))
  },

  setPlayerName(state, action) {
    return setPlayerState(state, action.playerId, () => ({
      name: action.name
    }))
  },

  deletePlayer(state, action) {
    return setTeamState(state, team => {
      return {
        players: R.omit([action.playerId], team.players)
      }
    })
  },

  newGame(state) {
    return setTeamState(state, team => {
      const players = R.mapObjIndexed(
        (player) => {
          return {
            ...player,
            playTimeMillis: 0,
            isPlaying: false
          }
        },
        team.players
      )

      return {
        players,
        isPlaying: false,
        totalGameTime: 0
      }
    })
  },

  toggleEditMode(state) {
    return {
      ...state,
      editMode: !state.editMode
    }
  }
}

export const useSharedStateReducer = () => {
  const initialState = getInitialState()
  const [state, dispatch] = useReducer(reducer, initialState)
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      const team = state.teams[state.activeTeamId]
      if (!team.isPlaying) return
      dispatch({type: 'updatePlayTimes'})
    }, 1000)
  
    return () => clearInterval(intervalId)
  })

  return [state, dispatch]
}