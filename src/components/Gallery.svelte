<script>
    import { beforeUpdate } from 'svelte'
    import { link } from 'svelte-navigator'
    export let players, team

    function onImageInView(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                fillInSprite(entry.target)

                entry.target.querySelector('img').src = entry.target.dataset.imagesrc
                observer.unobserve(entry.target)
            }
        })

    }

    function fillInSprite(div) {
        if (!team) {
            // No team is chosen in filter
            // Pick random sprite
            fillInRandomImage(div)
        }

        else {
            let playerindex = div.dataset.playerindex 
            const player = players[playerindex]

            const teamIndex = player['teams'].indexOf(team)
            
            div.dataset.imagesrc = `images/${player.sprites[teamIndex]}`
        }
    }

    function fillInRandomImage(div) {
        // Replace the "default" sprite with a random sprite
        // as shown in this gallery

        let playerindex = div.dataset.playerindex 
        const player = players[playerindex]
        
        const chosenImgIndex = getRandomInt(player['sprites'].length)

        div.dataset.imagesrc = `images/${player.sprites[chosenImgIndex]}`

    }

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }


    const observer = new IntersectionObserver(
        onImageInView, 
        { root: null, threshold: 0.25}
    )

    function observeBox(playerbox, player) {
        observer.observe(playerbox)

        return {
            update(player) {
                observer.observe(playerbox)
            }
        }
    }

    beforeUpdate(() => {
        observer.disconnect()
    })

</script>

<div class="gallery">
    {#each players as player, i}
    <div
        style="{ player['size'] === 'huge' ? 'overflow: visible' : '' }"

        data-playerindex={ i }
        data-imagesrc={ `images/${player.sprites[ player['default-sprite'] ]}` }
        data-spriteindex={ player['default-sprite'] }

        use:observeBox={player}>

        <a href="/{ player.id }" use:link>
            <img src="data:," alt>
        </a>

    </div>
    {/each}
    
</div>

<style>
    .gallery {
        --hover-color: var(--color-soft);
        --grid-width: 150px;

        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--grid-width), 1fr));

        opacity: 1;
        transition: opacity 300ms;
    }

    .gallery img {
        width: 100%;
        transition: background-color 0.5s;
        background-color: rgba(0,0,0,0);
        transform: scale(1.4, 1.4);
    }

    .gallery > div {
        overflow: hidden;
        transition: background-color 1s;
        min-height: 100px;
    }

    .gallery a:hover {
        background-color: var(--hover-color);
    }

    .gallery a {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>