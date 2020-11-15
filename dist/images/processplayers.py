import glob, json, enolib
from exportteams import teams_for_py as TEAMS
# importing from exportteams should also create teams.json file

with open('extradata.eno', 'r') as file:
    extradata_input = file.read()

EXTRADATA = enolib.parse(extradata_input)

def getname(filename):
    """Get player name from the filename"""

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
    """Transforms e.g. Wyatt Quitter to wyatt-quitter"""
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
        'freemium-seraph',
        
        'frasier-shmurmgle',
        'brock-watson'
    ]

    biggerboys = [
        'sigmund-castillo',
        'washer-barajas',
        'axel-trololol',
        'zion-aliciakeyes',
    ]

    peanutiel = ['peanutiel-duffy', 'adkins-gwiffin']

    if nameid in bigboys:
        return 'large'
    elif nameid in biggerboys:
        return 'xlarge'
    elif nameid in peanutiel:
        return 'huge'
    else:
        return 'small'


def fillinTeams(players):
    placements = EXTRADATA

    for player in players:
        try:
            # Put in current team
            team = placements.section(player['id']).field('team').required_string_value()
            player['team'] = TEAMS[team]

        except enolib.error_types.ValidationError:
            # Data not inputted (properly)
            pass

        try:
            # Put in former teams
            formerteams = placements.section(player['id']).list('former-teams').required_string_values()
            player['former-teams'] = list(map(lambda team: TEAMS[team], formerteams))

        except enolib.error_types.ValidationError:
            # Data not inputted (properly)
            pass

    return players


def rawcred_to_link(raw_credit):
    if raw_credit[0] == '@':
        # Link to twitter profile
        # e.g. @BearOverdrive
        link = "https://twitter.com/{}".format(raw_credit[1:])
        text = raw_credit 

    elif 'instagram.com' in raw_credit:
        # Link to Instagram profile
        # e.g. instagram.com/whyica
        link = "https://{}".format(raw_credit)
        text = raw_credit.split('/')[1]

    elif 'tumblr.com' in raw_credit:
        # Link to Tumblr page
        # e.g. alangdorf.tumblr.com
        link = "https://{}".format(raw_credit)
        text = raw_credit.split('.')[0]

    elif '"' in raw_credit:
        # Unlinked
        link = ""
        text = raw_credit.split('"')[1]

    else:
        link = "https://{}".format(raw_credit)
        text =  raw_credit

    return { "link": link, "text": text }


def fillinCredits(players):

    for player in players:
        # result in the JSON should be a list either way

        try:
            raw_credit = EXTRADATA.section(player['id']).field('credit').optional_string_value()
            # If there are are no elements called "credit", this will give out None
            # If "credit" is a list instead, ValidationError will occur
        
        except enolib.error_types.ValidationError:
            raw_credit = EXTRADATA.section(player['id']).list('credit').optional_string_values()


        if raw_credit == None:
            continue

        if type(raw_credit) != list:
            raw_credits = [raw_credit]
        else:
            raw_credits = raw_credit 

        credits = []

        for rawcred in raw_credits:
            credits.append(rawcred_to_link(rawcred))

        player['credits'] = credits

    return players


def get_max_id():
    """Get the largest ID / latest miniblaseballer created"""

    # Get all images with 3 digits id 
    # Since it's sorted alphabetically, the one at the end
    # Is the one with the largest ID
    max_id_sprite = glob.glob('[0-9][0-9][0-9]*.png')[-1]
    max_id = int(max_id_sprite[0:3])

    return max_id


max_id = get_max_id()
players = []

for i in range(1, max_id + 1):

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

    # Set size
    size = decidesize(name_id)

    print("Processing " + player_name)
    print("Who is deemed " + size.upper())

    # Set default sprite
    try:
        default_sprite = EXTRADATA.section(name_id).field('default').required_string_value()
    except enolib.error_types.ValidationError:
        default_sprite = 0
    finally:
        default_sprite = int(default_sprite)
        print("With a default sprite of " + str(default_sprite))

    players.append({
        "index": i,
        "id": name_id,
        "full-name": player_name,
        "size": size,
        "team": "Pending Team",
        "former-teams": [],
        "sprites": sprites,
        "default-sprite": default_sprite
    })

print("Processing team placements...")
players = fillinTeams(players)

print("Processing design credits...")
players = fillinCredits(players)

print("Dumping to file...")
with open('../../src/players.json', 'w') as file:
    json.dump(players, file, indent=4)

print("Done!")