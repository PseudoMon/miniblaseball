import TeamsData from './teams.json'
import GuestTeamsData from './guestTeams.json'

const allTeams = TeamsData.concat(GuestTeamsData)

const teamsList = allTeams.map(subleague => {
    return subleague.teams
}).flat()

let teamsReverseId = {}

teamsList.forEach((teamname, index) => {
    teamsReverseId[teamname] = index
})

export default teamsReverseId