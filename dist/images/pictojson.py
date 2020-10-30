import glob
import json
import enolib

TEAMS = {
    'tacos': "Unlimited Tacos",
    'flowers': "Boston Flowers",
    'sunbeams': "Hellmouth Sunbeams",
    'spies': "Houston Spies",
    'dale': "Miami Dale",

    'tigers': "Hades Tigers",
    'crabs': "Baltimore Crabs",
    'lift': "Tokyo Lift",
    'wild wings': "Mexico City Wild Wings",
    'firefighters': "Chicago Firefighters",
    'jazz hands': "Breckenridge Jazz Hands",

    'garages': "Seattle Garages",
    'steaks': "Dallas Steaks",
    'lovers': "San Francisco Lovers",
    'millennials': "New York Millennials",
    'pies': "Philly Pies",

    'shoe thieves': "Charleston Shoe Thieves",
    'moist talkers': "Canada Moist Talkers",
    'fridays': "Hawai'i Fridays",
    'breath mints': "Kansas City Breath Mints",
    'magic': "Yellowstone Magic",

    'stars': "Hall Stars",
    'riv': "RIV",
    'pods': "THE SHELLED ONE'S PODS"  
}

def getname(filename):
    name = ""

    # Slice to remove the file extension
    for char in filename[0:-4]:
        try:
            int(char)
        except ValueError:
            pass
        else:
            continue


        if char.isupper():
            if name == "":
                name += char
            else:
                name += " " + char

        else:
            name += char

    # turn e.g. Mc Dowell Mason into McDowell Mason
    if "Mc " in name:
        name = name.replace("Mc ", "Mc")

    # special cases
    if name == "Na N":
        name = "NaN"
    elif name == "Evelton McBlase I I":
        name = "Evelton McBlase II"

    return name

def idify(fullname):
    return fullname.lower().replace(" ", "-")

def decidesize(nameid):
    bigboys = [
        'sixpack-dogwalker', 
        'math-velazquez',
        'oliver-notarobot',
        'sexton-wheerer',
        'lenny-spruce',
        'oscar-dollie',
        'spears-taylor',
        'fish-summer',
        'howell-franklin',
        'hiroto-cerna',
        'miguel-javier',
        'caligula-lotus',
        'goobie-ballson',
        'isaac-rubberman',
        'ren-morin',
        'usurper-violet',
        'morrow-doyle',
        'conner-haley',
        'moody-cookbook',
        'nagomi-nava',

        'basilio-fig',
        'agan-harrison',
        'leach-herman',
        'alexander-horne',
        'dominic-marijuana',
        'sandie-turner',
        'agan-harrison',
        'freemium-seraph'
    ]

    biggerboys = [
        'sigmund-castillo',
        'washer-barajas',
        'axel-trololol',
        'zion-aliciakeyes',
    ]

    peanutiel = ['peanutiel-duffy']

    if nameid in bigboys:
        return 'large'
    elif nameid in biggerboys:
        return 'xlarge'
    elif nameid in peanutiel:
        return 'huge'
    else:
        return 'small'

def fillinTeams(players):
    with open('extradata.eno', 'r') as file:
        input = file.read()

    placements = enolib.parse(input)

    for player in players:
        try:
            team = placements.section(player['id']).field('team').required_string_value()
            player['team'] = TEAMS[team]

        except enolib.error_types.ValidationError:
            pass

        try:
            formerteams = placements.section(player['id']).list('former-teams').required_string_values()
            player['former-teams'] = list(map(lambda team: TEAMS[team], formerteams))

        except enolib.error_types.ValidationError:
            pass

    return players

# Manually add to the range when there are more blaseballers!
players = []

for i in range(1,173):

    if i < 10:
        playerid = "0" + str(i)
    else:
        playerid = str(i)

    sprites = glob.glob(playerid + '[A-Za-z]*.png')

    try:
        first_sprite = sprites[0]
    except  IndexError:
        print("SOMETHING'S WRONG WITH ID " + playerid)
        first_sprite = "ERROR.png"

    # Get full name
    player_name = getname(first_sprite)

    # Get a nice SIBR-compatible id
    name_id = idify(player_name)

    

    size = decidesize(name_id)

    print("Processing " + player_name)
    print("Who is deemed " + size.upper())

    players.append({
        "index": i,
        "id": name_id,
        "full-name": player_name,
        "size": size,
        "team": "Pending Team",
        "former-teams": [],
        "sprites": sprites
    })

players = fillinTeams(players)

with open('../../src/players.json', 'w') as file:
    json.dump(players, file, indent=4)
