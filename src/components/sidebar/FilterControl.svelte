<script>
    import { createEventDispatcher } from 'svelte'
    import SortControl from './SortControl.svelte'
    
    export let selectedGallery
    export let teams

    const dispatch = createEventDispatcher()

    let appliedFilters = []
    let teamFilter = ''
    let nameBeingSearched = ''


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

        dispatch('filterPlayerName', {
            name: nameBeingSearched
        })

    }

    function onChangeFilter(e) {
        // Add value to filter list if box is checked
        const filter = e.target.value

        if (e.target.checked) {
            appliedFilters = appliedFilters.concat([filter])
        }

        else {
            // Remove it if the box is unchekced
            appliedFilters = appliedFilters.filter(elem => elem != filter)
        }

        nameBeingSearched = '' // Reset searchbar

        // Reset team if all filters are turned off
        // if (!appliedFilters) {
        //     teamFilter = ''
        // }
        // Wait the above might not actually work

        dispatch('changeFilter', {
            appliedFilters,
            teamFilter
        })
    }


    function onSelectTeam(e) {

        teamFilter = e.target.value
        nameBeingSearched = '' // Reset searchbar

        dispatch('changeFilter', {
            appliedFilters,
            teamFilter
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
            <h3>Show players who are</h3>

            <div class="filter-selector">   
                <div>
                    <input 
                        id="checkismemberof"
                        type="checkbox" 
                        on:change={ onChangeFilter }
                        value="ismemberof">
                    <label
                        for="checkismemberof">
                        Currently a member of
                    </label>
                </div>

                <div>
                    <input 
                        id="checkwasmemberof"
                        type="checkbox" 
                        on:change={ onChangeFilter }
                        value="wasmemberof">
                    <label
                        for="checkwasmemberof">
                        Was a member of
                    </label>
                </div>
            </div>

             <select
                on:change={ onSelectTeam }
                disabled={ !appliedFilters.length }>
                
                <option value="" selected>Select a team</option>
                
                {#each teams as subleague}

                    <optgroup 
                        label="{ subleague.name }">
                        
                        {#each subleague.teams as team }
                        <option 
                            selected={ team === teamFilter }
                            value={ team }>
                            { team }
                        </option>
                        {/each}

                    </optgroup>
                {/each}
            </select>
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

    .filter-selector {
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
</style>