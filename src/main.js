// import * as riot from 'riot'
// import App from './app.riot'

// const mountApp = riot.component(App)

// const app = mountApp(
//   document.getElementById('root'),
//   { message: 'Hello World' }
// )


import App from './app.svelte';

var app = new App({
    target: document.body
});

export default app;