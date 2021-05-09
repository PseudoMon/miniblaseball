<script>
    import { beforeUpdate } from 'svelte'
    import { link } from 'svelte-navigator'
    export let players

    function onImageInView(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelector('img').src = entry.target.dataset.imagesrc
                observer.unobserve(entry.target)
            }
        })

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
    {#each players as player}
    <div
        style="{ player['size'] === 'huge' ? 'overflow: visible' : '' }"

        data-imagesrc={ `images/${player.sprites[ player['default-sprite'] ]}` }

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