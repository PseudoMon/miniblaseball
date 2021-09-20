<script>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()
    
    let descending = false
    let sortType = ''
    // if this this false, that means we're sorting ascending

    function onChangeSort(e) {
        sortType = e.target.value
    }

    $: dispatch('changeSort', { sortType, order: descending ? 'descending' : 'ascending' })
</script>

<h2>Sort by</h2>

<form class="ascend-descend">
    <input type="checkbox" id="ascenddescend" bind:checked={ descending } > 
    <label for="ascenddescend" tabindex="0">
        { descending ? "Going up" : "Going down" }
    </label>
</form>

<form class="sort-control" on:change={ onChangeSort }>
    <label>
        <input type="radio" name="sortby" value="latest" checked>
        { descending ? "Oldest first" : "Latest first" }
    </label>

 <!--    <label>
        <input type="radio" name="sortby" value="original">
        First drawn
    </label> -->

    <label>
        <input type="radio" name="sortby" value="alphabetical">
        { descending ? "Z to A" : "A to Z" }
    </label>

    <label>
        <input type="radio" name="sortby" value="size">
        { descending ? "Biggest to smallest" : "Smallest to biggest" }
    </label>

</form>

<style>
    label {
        display: block;
        margin: 0.2em 0;
    }

    h2 {
        margin-bottom:  0.2em;
    }

    .ascend-descend {
        display:  grid;
        grid-template-columns: 1fr 1fr;
        margin-bottom:  0.5em;
    }

    .ascend-descend label {
        box-sizing:  border-box;
        border-radius: 0.5em;
        cursor:  pointer;
        border: none;
        font-weight:  600;

    }

    .ascend-descend label::before {
        content: "▼";
    }

    .ascend-descend input:checked ~ label::before {
        content: "▲";
    }
    

    .ascend-descend input {
        display:  none;
    }
</style>