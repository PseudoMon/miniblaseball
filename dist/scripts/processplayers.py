import glob, json, enolib, os
from PIL import Image
from exportteams import teams_for_py as TEAMS
# importing from exportteams should also create teams.json file

with open('dist/scripts/extradata.eno', 'r', encoding="utf-8") as file:
    extradata_input = file.read()

EXTRADATA = enolib.parse(extradata_input)
PATH_TO_IMAGES = "dist/images/"
PATH_TO_OUTPUT = "src/"

def camelCase_to_normal(inputtext):
    outputtext = ""

    for char in inputtext:
        if char.isupper():
            if outputtext == "":
                outputtext += char
            else:
                outputtext += " " + char
        else:
            outputtext += char

    return outputtext

def getname(filename, is_guest=False):
    """Get player name from the filename"""
    # Filename format:
    # e.g. 0007LandryViolence_Tigers.png

    # Special case for our mysterious Artist
    # if filename == "G032Y3hirvHafgy2738riv.png":
    #     return "Y3hirv Hafgy2738riv"

    # Remove file extension and take out the ID
    # Regular players have 4-digit id
    # Guest players have 3-digit id prefaced by G
    filename = filename[4:-4]

    # Split to remove team name
    rawname = filename.split("_")[0]

    fullname = camelCase_to_normal(rawname)

    # turn e.g. Evelton Mc Blase into Evelton McBlase
    if "Mc " in fullname:
        fullname = fullname.replace("Mc ", "Mc")

    if "Polka Dot" in fullname:
        fullname = fullname.replace("Polka Dot", "PolkaDot")

    # turn e.g. McBlase I I to McBlase II 
    while "I I" in fullname:
        fullname = fullname.replace("I I", "II")

    if "Mac Millan" in fullname:
        fullname = fullname.replace("Mac Millan", "MacMillan")

    # special cases
    if fullname == "Na N":
        fullname = "NaN"
    # elif fullname == "Gunther O Brian":
    #     fullname = "Gunther O'Brian"
    # elif fullname == "Evelton McBlase I I":
    #     fullname = "Evelton McBlase II"
    elif fullname == "Nagomi McDaniel":
        fullname = "Nagomi Mcdaniel"
    # elif fullname == "Mooney Doctor I I":
    #     fullname = "Mooney Doctor II"
    elif fullname == "Mason M McMason":
        fullname = "Mason M. McMason"

    return fullname


def idify(fullname):
    """Transforms e.g. Wyatt Quitter to wyatt-quitter"""
    
    # For e.g. Mason M. McMason
    fullname = fullname.replace(".", "") 

    return fullname.lower().replace(" ", "-").replace("'","-")

def thing_is_within_box(thing, bounder):
    # thing and box should be a tuple with the format
    # (left, top, right, bottom)
    # Coordinate 0 in the top-left

    conditions = [
        thing[0] > bounder[0],
        thing[1] > bounder[1],
        thing[2] < bounder [2],
        thing[3] < bounder[3]
    ]

    return all(conditions)

def decidesize(sprites):
    """Decide where the cutoff point for the sprite will be
    Based on sizing in the CSS
        --size-small: 200px;
        --size-large: 300px;
        --size-xlarge: 320px;
        --size-huge: 500px;"""

    # Special considerations 
    if sprites[0][0:4] == "0150":
        # Morrow Doyle
        return 'xlarge'

    if sprites[0][0:4] == "0182":
        # Adkins Gwiffin
        return 'huge'

    # Coordinates starts at top left, according to PIL
    # 4-way tuples are always (left, top, right, bottom)

    # Bounding box coordinates
    # large has slightly higher width tolerance
    # xlarge has maximum width tolerance
    small = (150, 150, 500-150, 500-150)
    large = (80, 100, 500-80, 500-100)
    xlarge = (0, 90, 500, 500-90)

    # All set at the middle
    minleft = 250
    mintop = 250
    maxright = 250
    maxbottom = 250 

    for sprite in sprites:
        spritepath = PATH_TO_IMAGES + sprite

        with Image.open(spritepath) as sprite_image:
            (left, top, right, bottom) = sprite_image.getbbox()

        height = bottom - top
        width = right - left

        if left < minleft:
            minleft = left
        if top < mintop:
            mintop = top
        if right > maxright:
            maxright = maxright
        if bottom > maxbottom:
            maxbottom = bottom

    sprite_box = (minleft, mintop, maxright, maxbottom)

    if thing_is_within_box(sprite_box, small):
        return 'small'
    elif thing_is_within_box(sprite_box, large):
        return 'large'
    elif thing_is_within_box(sprite_box, xlarge):
        return 'xlarge'
    else:
        return 'huge'

def set_extradata_teams(player):
    # For players who gets team from the extradata file
    teams = EXTRADATA.section(player['id']).list('teams').required_string_values()
    fullname_teams = [ TEAMS[team] for team in teams ]

    current_team = EXTRADATA.section(player['id']).field('team').optional_string_value()
    
    if current_team != None:
        fullname_teams.append(TEAMS[current_team])

    player['teams'] = fullname_teams

def get_teams(sprites, is_guest=False):
    """Get the player's teams, according to the team name in the sprites"""
    
    if is_guest:
        # Guest players don't use the new convention yet
        return []

    teams = []

    for sprite in sprites:
        spriteteam = camelCase_to_normal(sprite[0:-4].split("_")[1])
        spriteteam = spriteteam.lower()

        try: 
            full_team_name = TEAMS[spriteteam]
        except KeyError:
            full_team_name = spriteteam

        if full_team_name not in teams:
            teams.append(full_team_name)

    return teams


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

def rearrange_alts(sprites):
    """Rearrange sprites so alternate design will be placed later."""
    # Alt designs have numbers after the
    # original name prior to team description
    # e.g. 0111ChorbyShort2_Magic.png
    
    alt_sprites = []

    for sprite in sprites:
        raw_name = sprite.split("_")[0]

        try:
            int(raw_name[-1])
        except ValueError:
            # This is not an alt design
            continue

        # print("Found alt " + raw_name)
        alt_sprites.append(sprite)

    for alt_sprite in alt_sprites:
        sprites.remove(alt_sprite)
        sprites.append(alt_sprite) # Add to end of list
        

def process_single_player(playerid, is_guest=False):
    # playerid should already be a string!

    if is_guest:
        glob_path = PATH_TO_IMAGES + 'G' + playerid + '[A-Za-z]*.png'
    else:
        glob_path = PATH_TO_IMAGES + playerid + '[A-Za-z]*.png'

    sprite_paths = glob.glob(glob_path)

    sprites = [os.path.basename(x) for x in sprite_paths]

    rearrange_alts(sprites)

    try:
        first_sprite = sprites[0]
    except  IndexError:
        print(playerid + " MISSING PLAYER" )
        return

    # Get full name
    player_name = getname(first_sprite, is_guest)

    # Get a nice SIBR-compatible id name
    name_id = idify(player_name)

    # Set size
    # size = decidesize(name_id)
    size = decidesize(sprites)

    # Set teams
    teams = get_teams(sprites, is_guest)

    player = {
        "index": i,
        "id": name_id,
        "full-name": player_name,
        "size": size,
        "teams": teams,
        "sprites": sprites
        # "default-sprite": default_sprite
    }

    set_credit(player)

    if is_guest:
        # Guest teams use the old naming convention
        # Still get team name from the extradata
        set_extradata_teams(player)

    if is_a_mascot(player):
        player['mascot'] = True

    # Rearrange so alternate design is placed later
    #rearrange_alts(player)

    return player

def get_max_id(is_guest=False):
    """Get the largest ID / latest miniblaseballer created"""

    if is_guest:
        glob_path = PATH_TO_IMAGES + 'G[0-9]*.png'
    else:
        glob_path = PATH_TO_IMAGES + '[0-9][0-9][0-9][0-9]*.png'

    # Since glob sorts alphabetically, the one at the end
    # is the one with the largest ID
    max_id_path = glob.glob(glob_path)[-1]
    
    # Get just the filename
    max_id_sprite = os.path.basename(max_id_path)    
    
    if is_guest:
        max_id = int(max_id_sprite[1:4])
    else:
        max_id = int(max_id_sprite[0:4])

    return max_id


max_id = get_max_id()
players = []

guest_max_id = get_max_id(is_guest = True)
guest_players = []

print("\nProcessing {} main league players.".format(max_id))

for i in range(1, max_id + 1):
    playerid = str(i)

    while len(playerid) < 4:
        playerid = "0" + playerid

    player = process_single_player(playerid)    

    # Add player to the list
    if player:
        players.append(player)

print("Main league players done")
print("Now processing guest players")

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

# Reverse data (so latest at the top)
players.reverse()
guest_players.reverse()

print("Dumping to file...")
with open(PATH_TO_OUTPUT + 'players.json', 'w', encoding='utf-8') as file:
    json.dump(players, file, indent=4, ensure_ascii=False)

with open(PATH_TO_OUTPUT + 'guestPlayers.json', 'w', encoding='utf-8') as file:
    json.dump(guest_players, file, indent=4, ensure_ascii=False)

print("Done!")