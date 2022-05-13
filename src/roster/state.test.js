import { setTeamState } from "./state"

describe('state', () => {
  describe('#setTeamState', () => {
    it('sets values correctly', () => {
      const initialState = {
        activeTeamId: 'b',
        teams: {
          a: { name: 'Team A', favoriteColor: 'blue' },
          b: { name: 'Team B', favoriteColor: 'red' }
        }
      }
      const newState = setTeamState(initialState, team => {
        return {
          favoriteColor: 'light ' + team.favoriteColor
        }
      })
      const expectedNewState = {
        activeTeamId: 'b',
        teams: {
          a: { name: 'Team A', favoriteColor: 'blue' },
          b: { name: 'Team B', favoriteColor: 'light red' }
        }
      }
      expect(newState).toEqual(expectedNewState)
    })
  })
})