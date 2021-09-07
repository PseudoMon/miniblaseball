import enolib, json

with open('dist/scripts/teams.eno', 'r') as file:
    teams_input = file.read()

teams_doc = enolib.parse(teams_input)

# This should later contain e.g. 
# { "tacos": "Unlimited Tacos", "tigers": "Hades Tigers", ...}
teams_for_py = {}

# This should later contain an array of the subleages
# for each subleague e.g.
# { "name": "Wild High", "teams": ["Hades Tigers", ...]}
# Differentiate between guest teams and regular teams
main_teams_for_json = []
guest_teams_for_json = []

for subleague_elem in teams_doc.elements():
    subleague_name = subleague_elem.string_key()

    if subleague_name == "Guests":
        teams_for_json = guest_teams_for_json
    else:
        teams_for_json = main_teams_for_json

    print("Processing subleague " + subleague_name +  "...")

    teams = []

    for team_elem in subleague_elem.to_section().elements():
        team_name = team_elem.string_key()
        team_nickname = team_elem.to_section().field('nickname').required_string_value()

        teams_for_py[team_nickname] = team_name
        teams.append(team_name)

    teams_for_json.append({"name": subleague_name, "teams": teams})

print("Dumping to file...")
with open('src/teams.json', 'w') as file:
    json.dump(main_teams_for_json, file, indent=4)

with open('src/guestTeams.json', 'w') as file:
    json.dump(guest_teams_for_json, file, indent=4)

print("Done processing teams")