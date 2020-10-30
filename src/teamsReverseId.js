import TeamsData from './teams.json'

const teamsList = TeamsData.map(subleague => {
    return subleague.teams
}).flat()

let teamsReverseId = {}

teamsList.forEach((teamname, index) => {
    teamsReverseId[teamname] = index
})

export default teamsReverseId