<script>
    import { onMount, onDestroy } from 'svelte'
    import { useNavigate } from 'svelte-navigator'

    import CloseButton from './utils/CloseButton.svelte'
    export let player
    
    let root // The main player-info element

    $: isRIV = player.team === "RIV"
    $: isStars = player.team === "Hall Stars"
    $: isUnknown = player.team === "Unknown"
    $: wikiLink = createWikiLink(player['full-name'])
    $: creditsText = createCreditsText(player['credits'], player['team'])
    $: teamsText = createAllTeamsText(player)

    let viewedSprite = player.sprites[ player['default-sprite'] ]

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    function randomizeDefaultSprite() {
        let maxSpriteId = player.sprites.length - 1
        viewedSprite = player.sprites[getRandomInt(maxSpriteId)]
    }

    function setPlayerSize() {
        // Change the size variable according to assigned size
        const playerSize = player.size
        
        root.style.setProperty("--player-size", `var(--size-${playerSize}`)

        if (playerSize === "small") {
            root.style.setProperty("--player-altscaling", "scale(2, 2)")
        }

        if (playerSize === "large") {
            root.style.setProperty("--player-altscaling", "scale(1.5, 1.5)")
        }
    }

    function createAllTeamsText(player) {
        let teamsText = ""

        player['teams'].filter(team => team !== "RIV").forEach(team => {
            teamsText += team
            teamsText += ", "
        })

        return teamsText.slice(0, -2)
    }

    

    function createCreditsText(creditsArray, team) {
        if (!creditsArray) {
            // No credit is listed
            return
        }

        let text = "Art inspired by "

        if (creditsArray[0]['text'] === '@hetreasky') {
            text = "Design by "
        }

        if (team === "Pandemonium Artists") {
            text = "Blasesona of "
        }

        const createLine = function(credit) {
            if (credit['link']) {
                return `<a href="${ credit['link'] }" target="_blank">${ credit['text'] }</a>`
            }

            else {
                return credit['text']
            }
        } 

        if (creditsArray.length === 1) {
            text += createLine(creditsArray[0])
        }

        else {
            for(let i = 0; i < creditsArray.length - 1; i++) {
                    text += createLine(creditsArray[i]) + ', '
            }   

            if (creditsArray.length === 2) {
                text = text.slice(0, -2) 
                text += " "
                // remove comma when there's only two    
            }

            const lastCredit = creditsArray[creditsArray.length - 1]
            text += " and " + createLine(lastCredit)
        }

        return text
    }

    function createWikiLink(fullname) {        
        let urlname = fullname.replace(" ", "_")
        return `https://www.blaseball.wiki/w/${urlname}`
    }

    function viewSprite(sprite) {
        viewedSprite = sprite
    }

    const navigate = useNavigate()
    
    function closeOverlay(e) {
        navigate('/')
    }

    onMount(() => {
        setPlayerSize()
        randomizeDefaultSprite()
    })
</script>

<div class="player-info" bind:this={root}>
    <!--TODO <close-button 
        onclick={ props.onClose }
        class="close-button">    
    </close-button> -->
    <CloseButton on:click={ closeOverlay } />

    <img class="{ player.size === 'huge' ? 'sprite peanutiel' : 'sprite'}" src="images/{ viewedSprite }">

    {#if player.sprites.length > 1}
    <div
        class="alt-images">
        {#each player.sprites as sprite}
        <div  
            class="img-box">
            <img
                on:click={ (e) => viewSprite(sprite) }
                src="images/{ sprite }">
        </div>
        {/each}
    </div>
    {/if}

    <div class="info">
        <h2 class="name">
            { player["full-name"] }
        </h2>

        <h3>
            { @html teamsText }
        </h3>

        {#if creditsText}
        <p class="credits-info">
            {@html creditsText }
        </p>
        {/if}

        <p class="wiki-link">
            Wiki page: <a href="{ wikiLink }" target="_blank">
                { player["full-name"] }
            </a>
        </p>
    </div>
</div>

<style>
.player-info {
    --size-small: 200px;
    --size-large: 300px;
    --size-xlarge: 320px;
    --size-huge: 500px;
    --player-size: var(--size-small);

    --player-altscaling: scale(1,1);

    width: 600px;
    max-width: 95%;
    box-sizing: border-box;
    margin: 10px auto;
    border: solid 3px #fff;
    padding: 2em;

    background-color: var(--color-modalbg);
    color: var(--color-modaltext);
    text-align: center;

    position: relative;
}

.sprite {
    width: var(--size-huge);
    max-width: 100%;
    height: var(--player-size);
    object-fit: none;
}

.sprite.peanutiel {
    /* Will allow huge sprite to go over the limit */
    max-width: initial;
    margin-left: 50%;
    transform: translateX(-50%);
}

.smol-desc {
    font-weight: 400;
}

.alt-images {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.alt-images .img-box {
    width: 120px;
    overflow: hidden;
}

.alt-images img {
    width: 120px;
    transform: var(--player-altscaling);
    cursor: pointer;
}

.alt-images img:hover {
    background-color: rgba(255,255,255,0.1);
}

.player-info :global(.close-button) {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
}

.player-info :global(.close-button:hover) {
    border: solid 2px;
    border-radius: 1em;
}

.smol-desc {
    font-size: 0.7em;
}

.credits-info, .wiki-link {
    font-size: 0.9em;
}

a {
    color: inherit;
}

h3 {
    line-height:  1.5em;
}
</style>