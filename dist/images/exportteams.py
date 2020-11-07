import enolib, json

with open('teams.eno', 'r') as file:
    teams_input = file.read()

teams_doc = enolib.parse(teams_input)

# This should later contain e.g. 
# { "tacos": "Unlimited Tacos", "tigers": "Hades Tigers", ...}
teams_for_py = {}

# This should later contain an array of the subleages
# e.g. for each subleague
# { "name": "Wild High", "teams": ["Hades Tigers", ...]}
teams_for_json = []

for subleague_elem in teams_doc.elements():
    subleague_name = subleague_elem.string_key()
    print("Processing subleague " + subleague_name +  "...")

    teams = []

    for team_elem in subleague_elem.to_section().elements():
        team_name = team_elem.string_key()
        team_nickname = team_elem.to_section().field('nickname').required_string_value()

        teams_for_py[team_nickname] = team_name
        teams.append(team_name)

    teams_for_json.append({"name": subleague_name, "teams": teams})

print("Dumping to file...")
with open('../../src/teams.json', 'w') as file:
    json.dump(teams_for_json, file, indent=4)

print("Done processing teams")