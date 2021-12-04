<script>
    import { Router, Link, Route } from 'svelte-navigator'

    import SiteHeader from './components/sidebar/SiteHeader.svelte'
    import SidebarNav from './components/sidebar/SidebarNav.svelte'
    import Aboutbox from './components/sidebar/Aboutbox.svelte'
    import FilterControl from './components/sidebar/FilterControl.svelte'
    import Gallery from './components/Gallery.svelte'
    import Overlay from './components/Overlay.svelte'
    import TotopButton from './components/utils/TotopButton.svelte'
    import DarkModeToggle from './components/utils/DarkModeToggle.svelte'
    
    import PlayersData from './players.json'
    import GuestPlayersData from './guestPlayers.json'
    import TeamsData from './teams.json'
    import GuestTeamsData from './guestTeams.json'
    import MascotPlayersData from './mascotPlayers.json'

    import TeamsList from './teamsReverseId.js'
    // This list contains teams in {teamname: index} format
    // For sorting by teams
    // Includes both the main league and guest teams


    let unfilteredPlayers = PlayersData
    let playersShown = unfilteredPlayers
    let shownTeamsData = TeamsData

    let sidebarScreen = 'filter'
    let galleryScreen = 'main'

    let currentSortType = ''
    let currentSortOrder = 'ascending'
    let currentTeamFilter = ''

    function switchSidebarScreen(e) {
        sidebarScreen = e.detail.screen
    }

    function getPlayerData(id) {
        id = decodeURI(id)

        const allPlayers = PlayersData.concat(GuestPlayersData).concat(MascotPlayersData)

        return allPlayers.find(player => player.id === id)
    }

    function switchGallery(e) {
        const chosenGallery = e.detail.gallery
        galleryScreen = chosenGallery

        if (chosenGallery === 'main') {
            unfilteredPlayers = PlayersData
            shownTeamsData = TeamsData
        } 

        else if (chosenGallery === 'guest') {
            unfilteredPlayers = GuestPlayersData
            shownTeamsData = GuestTeamsData
        }

        else if (chosenGallery === 'misc') {
            unfilteredPlayers = MascotPlayersData
            shownTeamsData = TeamsData
        }

        playersShown = unfilteredPlayers
        applySort()
    }

    function filterPlayerName(nameToSearch, players) {
        return players.filter(player => {
            return player['full-name'].toLowerCase().includes( nameToSearch.toLowerCase())
        })
    }

    function applyFilter(e) {
        const teamFilter = e.detail.teamFilter
        const sizeFilter = e.detail.sizeFilter
        const nameFilter = e.detail.nameBeingSearched

        let players = unfilteredPlayers
        players = applyTeamFilter(teamFilter, players)
        players = applySizeFilter(sizeFilter, players)
        players = filterPlayerName(nameFilter, players)

        playersShown = players
        currentTeamFilter = teamFilter

        applySort()
    }

    function applyTeamFilter(team, players) {

        if (!team) {
            // This means no team to filter to is chosen
            // In which case, return to unfiltered

            return players
        }

        return players.filter(player => {

            if (player['teams'].includes(team)) {
                return true
            }

            return false
        })
    }

    function applySizeFilter(sizeFilter, players) {
        return players.filter(player => {
            if (sizeFilter.normal && player.size === 'small') {
                return true
            }
            
            if (sizeFilter.larger && (player.size === 'large' || player.size === 'xlarge')) {
                return true
            }

            if (sizeFilter.huge && player.size === 'huge') {
                return true
            }
        })
    }

    function applySort() {
        const order = currentSortOrder
        const sortType = currentSortType

        if (!sortType) {
            // If no sortType is set (e.g. it's empty string)
            // don't sort anything
            return
        }

        if (sortType === 'original') {
            // Slice() so we don't modify the original
            // Not that it matters much in Svelte, but just in case
            playersShown = playersShown.slice().sort((playera, playerb) => {

                return playera.index - playerb.index

            })
        }

        if (sortType === 'latest') {
            playersShown = playersShown.slice().sort((playera, playerb) => {

                return playerb.index - playera.index

            })
        }

        else if (sortType === 'alphabetical') {
            playersShown = playersShown.slice().sort((playera, playerb) => {

                if (playera['full-name'] < playerb['full-name']) {
                    return -1
                }

                if (playera['full-name'] > playerb['full-name']) {
                    return 1
                }

                return 0

            })
        }

        else if (sortType === 'size') {
            playersShown = playersShown.slice().sort((playera, playerb) => {

                if (playera['sizepixels'] < playerb['sizepixels']) {
                    return -1
                }


                if (playera['sizepixels'] > playerb['sizepixels']) {
                    return 1
                }

                return 0
            })
        }

        if (order === "descending") {
            playersShown = playersShown.slice().reverse()
        }
    }

    function changeSort(e) {
        currentSortType = e.detail.sortType
        currentSortOrder = e.detail.order
        console.log(e.detail.order)

        // Sort is often reapplied after filtering,
        // so we move it to its own function
        applySort()
    }

    function scrollToTop(e) {
        window.scrollTo(0,0)
    }

    function toggleDarkMode(e) {
        //TODO
        const body = document.body

        body.classList.toggle('darkmode')

        if (body.classList.contains('darkmode'))
            window.localStorage.setItem('darkmode', 'true')

        else {
            window.localStorage.removeItem('darkmode')
        }
    }

</script>

<Router>
    <div class="main-container">
        <div class="sidebar">
            <DarkModeToggle on:toggle={ toggleDarkMode }/>

            <SiteHeader/>

            <SidebarNav
                selectedScreen={ sidebarScreen } 
                on:selectscreen={ switchSidebarScreen }/>

            {#if sidebarScreen === 'filter'}
                <FilterControl 
                    selectedGallery={ galleryScreen }
                    teams={ shownTeamsData }
                    on:selectGallery={ switchGallery }
                    on:changeFilter={ applyFilter }
                    on:changeSort={ changeSort }/>
            {/if}

            {#if sidebarScreen === 'about'}
                <Aboutbox/>
            {/if}

        </div>

        <div class="main-content">
            <Gallery 
                players={ playersShown }
                team={ currentTeamFilter } />
        </div>

    </div>

    <TotopButton
        on:click={ scrollToTop }/>

    <Route path="/:id" let:params>
        <Overlay
            player="{ getPlayerData(params.id) }"
        />
    </Route>

</Router>


<style>
    :global(body) {
        font-family: "Lora", sans-serif;
        --color-bg: #fff;
        --color-text: #000;
        --color-soft: #eee;
        --color-link: #5c5c5c;

        --color-modalbg: #494a46;
        --color-overlaybg: rgba(0,0,0,0.6);
        --color-modaltext: #fff;

        --color-selectbg: #b3b3b3;

        background-color: var(--color-bg);
        min-width: 100vw;
        min-height: 100vh;
    }

    :global(body.darkmode) {
        --color-bg: #1c1d1b;
        --color-text: #fff;
        --color-soft: #2d2f32;
        --color-link: #848484;

        --color-modalbg: #1c1d1b;

        --color-selectbg: var(--color-soft);
    }

    :global(a) {
        color: inherit;
    }

    .main-container {
        width: 98%;
        max-width: 1000px;
        margin: 0 auto;

        display: grid;
        grid-template-columns: 1fr;

        color: var(--color-text);
    }

    @media (min-width: 760px) {
        .main-container {
            height: 100vh;

            grid-template-columns: 290px 1fr;
        }

        .sidebar, .main-content {
            overflow-y: auto;
        }
    }

    @media (min-width: 1400px) {
        .main-container {
            max-width: 80%;
        }
    }

    .main-content {
        padding-top: 20px;
        /* Prevents huge players from overflowing the gallery */
        overflow-x: hidden;
    }

    .sidebar {
        
        padding: 0 1em;
        max-width: 500px;
        width: calc(100% - 2em);
        margin: 20px auto 0 auto;

        box-sizing: border-box;
    }

    @media (min-width: 760px) {
        .sidebar {
            padding: 0 0.2em;
            width: 100%;
            border-right: solid 3px var(--color-soft);
        }

        :global(.totop-button) {
            display: none;
        }
    }
</style>