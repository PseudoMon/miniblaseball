import glob, json, enolib
from exportteams import teams_for_py as TEAMS
# importing from exportteams should also create teams.json file

with open('extradata.eno', 'r', encoding="utf-8") as file:
    extradata_input = file.read()

EXTRADATA = enolib.parse(extradata_input)

def getname(filename, is_guest=False):
    """Get player name from the filename"""

    # Special case for our mysterious Artist
    if filename == "G032Y3hirvHafgy2738riv.png":
        return "Y3hirv Hafgy2738riv"

    name = ""

    if is_guest:
        # Get rid of the G in the beginning
        filename = filename[1:]

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

    if "Polka Dot" in name:
        name = name.replace("Polka Dot", "PolkaDot")

    # special cases
    if name == "Na N":
        name = "NaN"
    elif name == "Gunther O Brian":
        name = "Gunther O'Brian"
    elif name == "Evelton McBlase I I":
        name = "Evelton McBlase II"
    elif name == "Nagomi McDaniel":
        name = "Nagomi Mcdaniel"
    elif name == "Parker Mac Millan I I I I":
        name = "Parker MacMillan IIII"
    elif name == "Mooney Doctor I I":
        name = "Mooney Doctor II"
    elif name == "Mason M McMason":
        name = "Mason M. McMason"

    return name


def idify(fullname):
    """Transforms e.g. Wyatt Quitter to wyatt-quitter"""
    
    if fullname == "Mason M. McMason":
        return "mason-m-mcmason"
        
    return fullname.lower().replace(" ", "-").replace("'","-")


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
        'conner-haley',
        'moody-cookbook',
        'nagomi-nava',
        'antonio-wallace',
        'glabe-moon',

        'basilio-fig',
        'agan-harrison',
        'leach-herman',
        'alexander-horne',
        'dominic-marijuana',
        'sandie-turner',
        'agan-harrison',
        'freemium-seraph',
        'frasier-shmurmgle',
        'brock-watson',
        'gallup-crueller',
        'bonk-jokes',
        'jessi-wise',

        # Pandemonium Artists
        'breeze-regicide',
        'schism-thrones',
        'arbutus-bones',
        'roxetta-compass',
        'fishcake-can',
        'phoebe-blasesona',
        'angel-ivories'
    ]

    biggerboys = [
        'sigmund-castillo',
        'washer-barajas',
        'axel-trololol',
        'zion-aliciakeyes',
        'morrow-doyle',
        'zack-sanders', 
        'montgomery-bullock'
    ]

    peanutiel = [
        'peanutiel-duffy', 
        'adkins-gwiffin', 
        'lotus-mango', 
        'parker-macmillan-iiii'
    ]

    if nameid in bigboys:
        return 'large'
    elif nameid in biggerboys:
        return 'xlarge'
    elif nameid in peanutiel:
        return 'huge'
    else:
        return 'small'


def set_team(player):
    placements = EXTRADATA

    try:
        # Put in current team
        team = placements.section(player['id']).field('team').required_string_value()
        
        # Quotation marks mean it's not in the team list
        # e.g. "Danger Zone"
        if "\"" in team:
            player['team'] = team.replace("\"", "")
        else:
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


def set_credit(player):
    try:
        raw_credit = EXTRADATA.section(player['id']).field('credit').optional_string_value()
        # If there are are no elements called "credit", this will give out None
        # If "credit" is a list instead, ValidationError will occur
    
    except enolib.error_types.ValidationError:
        raw_credit = EXTRADATA.section(player['id']).list('credit').optional_string_values()


    if raw_credit == None:
        return

    if type(raw_credit) != list:
        raw_credits = [raw_credit]
    else:
        raw_credits = raw_credit 

    credits = []

    for rawcred in raw_credits:
        credits.append(rawcred_to_link(rawcred))

    player['credits'] = credits


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

def is_a_mascot(player):
    playerdata = EXTRADATA.section(player['id'])
    
    is_mascot = playerdata.field('mascot').optional_string_value()
    
    if is_mascot:
        return True
    else:
        return False 


def process_single_player(playerid, is_guest=False):
    # playerid should already be a string!

    if is_guest:
        sprites = glob.glob('G' + playerid + '[A-Za-z]*.png')
    else:
        sprites = glob.glob(playerid + '[A-Za-z]*.png')

    try:
        first_sprite = sprites[0]
    except  IndexError:
        print(playerid + " MISSING ID" )
        return

    # Get full name
    player_name = getname(first_sprite, is_guest)

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

    player = {
        "index": i,
        "id": name_id,
        "full-name": player_name,
        "size": size,
        "team": "Pending Team",
        "former-teams": [],
        "sprites": sprites,
        "default-sprite": default_sprite
    }

    # Set team and credits
    set_team(player)
    set_credit(player)

    # Is it a mascot?
    if is_a_mascot(player):
        player['mascot'] = True

    return player

def get_max_id():
    """Get the largest ID / latest miniblaseballer created"""

    # Get all images with 3 digits id 
    # Since it's sorted alphabetically, the one at the end
    # Is the one with the largest ID
    max_id_sprite = glob.glob('[0-9][0-9][0-9]*.png')[-1]
    max_id = int(max_id_sprite[0:3])

    return max_id

def get_guest_max_id():
    """Same as get_max_id() but for guest players"""
    max_id_sprite = glob.glob('G[0-9]*.png')[-1]
    max_id = int(max_id_sprite[1:4])

    return max_id

max_id = get_max_id()
players = []

guest_max_id = get_guest_max_id()
guest_players = []

for i in range(1, max_id + 1):

    if i < 10:
        playerid = "0" + str(i)
    else:
        playerid = str(i)

    player = process_single_player(playerid)    

    # Add player to the list
    if player:
        players.append(player)


print("\nNow processing guest players!")

for i in range(1, guest_max_id + 1):
    if i < 10:
        playerid = "00" + str(i)
    elif i < 100:
        playerid = "0" + str(i)
    else:
        playerid = str(i)

    player = process_single_player(playerid, True)
    
    if player:
        guest_players.append(player)


print("Dumping to file...")
with open('../../src/players.json', 'w', encoding='utf-8') as file:
    json.dump(players, file, indent=4, ensure_ascii=False)

with open('../../src/guestPlayers.json', 'w', encoding='utf-8') as file:
    json.dump(guest_players, file, indent=4, ensure_ascii=False)

print("Done!")