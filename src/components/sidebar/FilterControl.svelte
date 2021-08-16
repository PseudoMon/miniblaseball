<script>
    import { createEventDispatcher, tick } from 'svelte'
    import SortControl from './SortControl.svelte'
    
    export let selectedGallery
    export let teams

    const dispatch = createEventDispatcher()

    let appliedFilters = []
    let teamFilter = ''
    let nameBeingSearched = ''
    let sizeFilter = { normal: true, larger: true, huge: true }

    function switchGallery(gallery) {

        if (gallery === selectedGallery) {
            // If it's the same as the current gallery
            // don't do anything
            return
        }
        
        dispatch('selectGallery', {
            gallery
        })

        //TODO
        // After this you'll have to clear all the sorts/filters
    }

    function onInputName(e) {
        nameBeingSearched = e.target.value

        // Reset other filters
        appliedFilters = []
        teamFilter = ''
        sizeFilter = { normal: true, larger: true, huge: true }

        dispatch('filterPlayerName', {
            name: nameBeingSearched
        })

    }

    function onSelectTeam(e) {
        teamFilter = e.target.value
        nameBeingSearched = '' // Reset searchbar
    }

    function applyFilter() {
        nameBeingSearched = '' // Reset searchbar
    }

    // Filter will be reset to default when searching
    // Don't dispatch the change when this is happening
    $: if (nameBeingSearched == '') {
        dispatch('changeFilter', {
            appliedFilters,
            teamFilter,
            sizeFilter
        })
    }


</script>

<div class="filter-control">
    <div class="gallery-chooser">
        <span
            class="{ selectedGallery === 'main' ? 'active' : '' }" 
            on:click={ (e) => switchGallery('main') }>
            Main League
        </span>
        <span
            class="{ selectedGallery === 'guest' ? 'active' : '' }"  
            on:click={ (e) => switchGallery('guest') }>
            Guest Teams
        </span>
    </div>

    <form class="gallery-filter" on:submit={ (e) => {e.preventDefault()} }>

        <input 
            type="text" 
            name="playername" 
            placeholder="Search for player..." 
            on:input={ onInputName }
            value={ nameBeingSearched }>


        <SortControl 
            on:changeSort/>
        <!-- changeSort event is forwarded -->

        <div>
            <h2>Filter</h2>
            <h3 style="margin-bottom: 0">Show players depicted as member of</h3>

             <select
                on:change={ onSelectTeam }>
                
                <option value="" selected>Any team</option>
                
                {#each teams as subleague}

                    <optgroup 
                        label="{ subleague.name }">
                        
                        {#each subleague.teams as team }
                        {#if team !== "RIV" && team !== "Unknown"}
                        <option 
                            selected={ team === teamFilter }
                            value={ team }>
                            { team }
                        </option>
                        {/if}
                        {/each}

                    </optgroup>
                {/each}
            </select>

            <h3>Size</h3>
            <div class="size-filter">
                <label><input type="checkbox"
                    on:change={ applyFilter }
                    bind:checked={ sizeFilter.normal }>
                    Normal
                </label>
                <label><input type="checkbox"
                    on:change={ applyFilter }
                    bind:checked={ sizeFilter.larger }>
                    Larger
                </label>
                <label><input type="checkbox" 
                    on:change={ applyFilter }
                    bind:checked={ sizeFilter.huge }>
                    Huge
                </label>
            </div>
        </div>
    </form> 
</div>

<style>
    .filter-control {
        display: block;
    }
    
    .gallery-filter {
        text-align: left;
    }

    .gallery-filter > div {
        margin: 1em 0;
    }

    input[type="text"] {
        border: none;
        background: var(--color-soft);
        color: var(--color-text);
        border-radius: .25rem;
        padding: .75rem 1rem;
    }

    .filter-selector > div {
        margin-top: 0.5em;
        cursor: pointer;

        display: flex;
    }

    .filter-selector label {
        display: block;
        flex: 10;
        padding-left: 0.5em;
    }

    .filter-selector input[type="checkbox"] {
        width: 1em;
    }

    .filter-selector input:checked + label {
    }

    select {
        margin-top: 0.5em;
        padding: 0.2em 0.4em;

        color: var(--color-text);
        background-color: var(--color-bg);

        border: solid 2px var(--color-selectbg);
        border-radius: 0.2em;
        
    }

    select:disabled {
        opacity: 0.5;
    }

    optgroup {
        background-color: var(--color-soft);
        color: var(--color-text);
    }

    .gallery-chooser {
        display: flex;
        justify-content: center;
        margin-bottom: 1em;
    }

    .gallery-chooser > span {
        display: block;
        cursor: pointer;

        padding: 0.4em 0.8em;
        margin: 0 5px;
        border-radius: 0.5em;
    }

    .gallery-chooser > span:hover {
        background-color: var(--color-soft);
    }

    .gallery-chooser > span.active {
        background-color: var(--color-text);
        color: var(--color-bg);
    }

    h3 {
        margin-bottom:  0;
    }

    .size-filter {
        display:  flex;
        justify-content: space-around;
    }

    .size-filter input {
        margin-top:  0.5em;
        margin-right: 0.2em;
    }
</style>