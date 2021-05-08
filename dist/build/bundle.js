
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const isUndefined = value => typeof value === "undefined";

    const isFunction = value => typeof value === "function";

    const isNumber = value => typeof value === "number";

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
    	return (
    		!event.defaultPrevented &&
    		event.button === 0 &&
    		!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
    	);
    }

    function createCounter() {
    	let i = 0;
    	/**
    	 * Returns an id and increments the internal state
    	 * @returns {number}
    	 */
    	return () => i++;
    }

    /**
     * Create a globally unique id
     *
     * @returns {string} An id
     */
    function createGlobalId() {
    	return Math.random().toString(36).substring(2);
    }

    const isSSR = typeof window === "undefined";

    function addListener(target, type, handler) {
    	target.addEventListener(type, handler);
    	return () => target.removeEventListener(type, handler);
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /*
     * Adapted from https://github.com/EmilTholin/svelte-routing
     *
     * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
     */

    const createKey = ctxName => `@@svnav-ctx__${ctxName}`;

    // Use strings instead of objects, so different versions of
    // svelte-navigator can potentially still work together
    const LOCATION = createKey("LOCATION");
    const ROUTER = createKey("ROUTER");
    const ROUTE = createKey("ROUTE");
    const ROUTE_PARAMS = createKey("ROUTE_PARAMS");
    const FOCUS_ELEM = createKey("FOCUS_ELEM");

    const paramRegex = /^:(.+)/;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    const startsWith = (string, search) =>
    	string.substr(0, search.length) === search;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    const isRootSegment = segment => segment === "";

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    const isDynamic = segment => paramRegex.test(segment);

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    const isSplat = segment => segment[0] === "*";

    /**
     * Strip potention splat and splatname of the end of a path
     * @param {string} str
     * @return {string}
     */
    const stripSplat = str => str.replace(/\*.*$/, "");

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    const stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri, filterFalsy = false) {
    	const segments = stripSlashes(uri).split("/");
    	return filterFalsy ? segments.filter(Boolean) : segments;
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) =>
    	pathname + (query ? `?${query}` : "");

    /**
     * Normalizes a basepath
     *
     * @param {string} path
     * @returns {string}
     *
     * @example
     * normalizePath("base/path/") // -> "/base/path"
     */
    const normalizePath = path => `/${stripSlashes(path)}`;

    /**
     * Joins and normalizes multiple path fragments
     *
     * @param {...string} pathFragments
     * @returns {string}
     */
    function join(...pathFragments) {
    	const joinFragment = fragment => segmentize(fragment, true).join("/");
    	const joinedSegments = pathFragments.map(joinFragment).join("/");
    	return normalizePath(joinedSegments);
    }

    // We start from 1 here, so we can check if an origin id has been passed
    // by using `originId || <fallback>`
    const LINK_ID = 1;
    const ROUTE_ID = 2;
    const ROUTER_ID = 3;
    const USE_FOCUS_ID = 4;
    const USE_LOCATION_ID = 5;
    const USE_MATCH_ID = 6;
    const USE_NAVIGATE_ID = 7;
    const USE_PARAMS_ID = 8;
    const USE_RESOLVABLE_ID = 9;
    const USE_RESOLVE_ID = 10;
    const NAVIGATE_ID = 11;

    const labels = {
    	[LINK_ID]: "Link",
    	[ROUTE_ID]: "Route",
    	[ROUTER_ID]: "Router",
    	[USE_FOCUS_ID]: "useFocus",
    	[USE_LOCATION_ID]: "useLocation",
    	[USE_MATCH_ID]: "useMatch",
    	[USE_NAVIGATE_ID]: "useNavigate",
    	[USE_PARAMS_ID]: "useParams",
    	[USE_RESOLVABLE_ID]: "useResolvable",
    	[USE_RESOLVE_ID]: "useResolve",
    	[NAVIGATE_ID]: "navigate",
    };

    const createLabel = labelId => labels[labelId];

    function createIdentifier(labelId, props) {
    	let attr;
    	if (labelId === ROUTE_ID) {
    		attr = props.path ? `path="${props.path}"` : "default";
    	} else if (labelId === LINK_ID) {
    		attr = `to="${props.to}"`;
    	} else if (labelId === ROUTER_ID) {
    		attr = `basepath="${props.basepath || ""}"`;
    	}
    	return `<${createLabel(labelId)} ${attr || ""} />`;
    }

    function createMessage(labelId, message, props, originId) {
    	const origin = props && createIdentifier(originId || labelId, props);
    	const originMsg = origin ? `\n\nOccurred in: ${origin}` : "";
    	const label = createLabel(labelId);
    	const msg = isFunction(message) ? message(label) : message;
    	return `<${label}> ${msg}${originMsg}`;
    }

    const createMessageHandler = handler => (...args) =>
    	handler(createMessage(...args));

    const fail = createMessageHandler(message => {
    	throw new Error(message);
    });

    // eslint-disable-next-line no-console
    const warn = createMessageHandler(console.warn);

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
    	const score = route.default
    		? 0
    		: segmentize(route.fullPath).reduce((acc, segment) => {
    				let nextScore = acc;
    				nextScore += SEGMENT_POINTS;

    				if (isRootSegment(segment)) {
    					nextScore += ROOT_POINTS;
    				} else if (isDynamic(segment)) {
    					nextScore += DYNAMIC_POINTS;
    				} else if (isSplat(segment)) {
    					nextScore -= SEGMENT_POINTS + SPLAT_PENALTY;
    				} else {
    					nextScore += STATIC_POINTS;
    				}

    				return nextScore;
    		  }, 0);

    	return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
    	return (
    		routes
    			.map(rankRoute)
    			// If two routes have the exact same score, we go by index instead
    			.sort((a, b) => {
    				if (a.score < b.score) {
    					return 1;
    				}
    				if (a.score > b.score) {
    					return -1;
    				}
    				return a.index - b.index;
    			})
    	);
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { fullPath, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
    	let bestMatch;
    	let defaultMatch;

    	const [uriPathname] = uri.split("?");
    	const uriSegments = segmentize(uriPathname);
    	const isRootUri = uriSegments[0] === "";
    	const ranked = rankRoutes(routes);

    	for (let i = 0, l = ranked.length; i < l; i++) {
    		const { route } = ranked[i];
    		let missed = false;
    		const params = {};

    		// eslint-disable-next-line no-shadow
    		const createMatch = uri => ({ ...route, params, uri });

    		if (route.default) {
    			defaultMatch = createMatch(uri);
    			continue;
    		}

    		const routeSegments = segmentize(route.fullPath);
    		const max = Math.max(uriSegments.length, routeSegments.length);
    		let index = 0;

    		for (; index < max; index++) {
    			const routeSegment = routeSegments[index];
    			const uriSegment = uriSegments[index];

    			if (!isUndefined(routeSegment) && isSplat(routeSegment)) {
    				// Hit a splat, just grab the rest, and return a match
    				// uri:   /files/documents/work
    				// route: /files/* or /files/*splatname
    				const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

    				params[splatName] = uriSegments
    					.slice(index)
    					.map(decodeURIComponent)
    					.join("/");
    				break;
    			}

    			if (isUndefined(uriSegment)) {
    				// URI is shorter than the route, no match
    				// uri:   /users
    				// route: /users/:userId
    				missed = true;
    				break;
    			}

    			const dynamicMatch = paramRegex.exec(routeSegment);

    			if (dynamicMatch && !isRootUri) {
    				const value = decodeURIComponent(uriSegment);
    				params[dynamicMatch[1]] = value;
    			} else if (routeSegment !== uriSegment) {
    				// Current segments don't match, not dynamic, not splat, so no match
    				// uri:   /users/123/settings
    				// route: /users/:id/profile
    				missed = true;
    				break;
    			}
    		}

    		if (!missed) {
    			bestMatch = createMatch(join(...uriSegments.slice(0, index)));
    			break;
    		}
    	}

    	return bestMatch || defaultMatch || null;
    }

    /**
     * Check if the `route.fullPath` matches the `uri`.
     * @param {Object} route
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
    	return pick([route], uri);
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
    	// /foo/bar, /baz/qux => /foo/bar
    	if (startsWith(to, "/")) {
    		return to;
    	}

    	const [toPathname, toQuery] = to.split("?");
    	const [basePathname] = base.split("?");
    	const toSegments = segmentize(toPathname);
    	const baseSegments = segmentize(basePathname);

    	// ?a=b, /users?b=c => /users?a=b
    	if (toSegments[0] === "") {
    		return addQuery(basePathname, toQuery);
    	}

    	// profile, /users/789 => /users/789/profile
    	if (!startsWith(toSegments[0], ".")) {
    		const pathname = baseSegments.concat(toSegments).join("/");
    		return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    	}

    	// ./       , /users/123 => /users/123
    	// ../      , /users/123 => /users
    	// ../..    , /users/123 => /
    	// ../../one, /a/b/c/d   => /a/b/one
    	// .././one , /a/b/c/d   => /a/b/c/one
    	const allSegments = baseSegments.concat(toSegments);
    	const segments = [];

    	allSegments.forEach(segment => {
    		if (segment === "..") {
    			segments.pop();
    		} else if (segment !== ".") {
    			segments.push(segment);
    		}
    	});

    	return addQuery(`/${segments.join("/")}`, toQuery);
    }

    /**
     * Normalizes a location for consumption by `Route` children and the `Router`.
     * It removes the apps basepath from the pathname
     * and sets default values for `search` and `hash` properties.
     *
     * @param {Object} location The current global location supplied by the history component
     * @param {string} basepath The applications basepath (i.e. when serving from a subdirectory)
     *
     * @returns The normalized location
     */
    function normalizeLocation(location, basepath) {
    	const { pathname, hash = "", search = "", state } = location;
    	const baseSegments = segmentize(basepath, true);
    	const pathSegments = segmentize(pathname, true);
    	while (baseSegments.length) {
    		if (baseSegments[0] !== pathSegments[0]) {
    			fail(
    				ROUTER_ID,
    				`Invalid state: All locations must begin with the basepath "${basepath}", found "${pathname}"`,
    			);
    		}
    		baseSegments.shift();
    		pathSegments.shift();
    	}
    	return {
    		pathname: join(...pathSegments),
    		hash,
    		search,
    		state,
    	};
    }

    const normalizeUrlFragment = frag => (frag.length === 1 ? "" : frag);

    /**
     * Creates a location object from an url.
     * It is used to create a location from the url prop used in SSR
     *
     * @param {string} url The url string (e.g. "/path/to/somewhere")
     *
     * @returns {{ pathname: string; search: string; hash: string }} The location
     */
    function createLocation(url) {
    	const searchIndex = url.indexOf("?");
    	const hashIndex = url.indexOf("#");
    	const hasSearchIndex = searchIndex !== -1;
    	const hasHashIndex = hashIndex !== -1;
    	const hash = hasHashIndex ? normalizeUrlFragment(url.substr(hashIndex)) : "";
    	const pathnameAndSearch = hasHashIndex ? url.substr(0, hashIndex) : url;
    	const search = hasSearchIndex
    		? normalizeUrlFragment(pathnameAndSearch.substr(searchIndex))
    		: "";
    	const pathname = hasSearchIndex
    		? pathnameAndSearch.substr(0, searchIndex)
    		: pathnameAndSearch;
    	return { pathname, search, hash };
    }

    /**
     * Resolves a link relative to the parent Route and the Routers basepath.
     *
     * @param {string} path The given path, that will be resolved
     * @param {string} routeBase The current Routes base path
     * @param {string} appBase The basepath of the app. Used, when serving from a subdirectory
     * @returns {string} The resolved path
     *
     * @example
     * resolveLink("relative", "/routeBase", "/") // -> "/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/") // -> "/absolute"
     * resolveLink("relative", "/routeBase", "/base") // -> "/base/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/base") // -> "/base/absolute"
     */
    function resolveLink(path, routeBase, appBase) {
    	return join(appBase, resolve(path, routeBase));
    }

    /**
     * Get the uri for a Route, by matching it against the current location.
     *
     * @param {string} routePath The Routes resolved path
     * @param {string} pathname The current locations pathname
     */
    function extractBaseUri(routePath, pathname) {
    	const fullPath = normalizePath(stripSplat(routePath));
    	const baseSegments = segmentize(fullPath, true);
    	const pathSegments = segmentize(pathname, true).slice(0, baseSegments.length);
    	const routeMatch = match({ fullPath }, join(...pathSegments));
    	return routeMatch && routeMatch.uri;
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const POP = "POP";
    const PUSH = "PUSH";
    const REPLACE = "REPLACE";

    function getLocation(source) {
    	return {
    		...source.location,
    		pathname: encodeURI(decodeURI(source.location.pathname)),
    		state: source.history.state,
    		_key: (source.history.state && source.history.state._key) || "initial",
    	};
    }

    function createHistory(source) {
    	let listeners = [];
    	let location = getLocation(source);
    	let action = POP;

    	const notifyListeners = (listenerFns = listeners) =>
    		listenerFns.forEach(listener => listener({ location, action }));

    	return {
    		get location() {
    			return location;
    		},
    		listen(listener) {
    			listeners.push(listener);

    			const popstateListener = () => {
    				location = getLocation(source);
    				action = POP;
    				notifyListeners([listener]);
    			};

    			// Call listener when it is registered
    			notifyListeners([listener]);

    			const unlisten = addListener(source, "popstate", popstateListener);
    			return () => {
    				unlisten();
    				listeners = listeners.filter(fn => fn !== listener);
    			};
    		},
    		/**
    		 * Navigate to a new absolute route.
    		 *
    		 * @param {string|number} to The path to navigate to.
    		 *
    		 * If `to` is a number we will navigate to the stack entry index + `to`
    		 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    		 * @param {Object} options
    		 * @param {*} [options.state] The state will be accessible through `location.state`
    		 * @param {boolean} [options.replace=false] Replace the current entry in the history
    		 * stack, instead of pushing on a new one
    		 */
    		navigate(to, options) {
    			const { state = {}, replace = false } = options || {};
    			action = replace ? REPLACE : PUSH;
    			if (isNumber(to)) {
    				if (options) {
    					warn(
    						NAVIGATE_ID,
    						"Navigation options (state or replace) are not supported, " +
    							"when passing a number as the first argument to navigate. " +
    							"They are ignored.",
    					);
    				}
    				action = POP;
    				source.history.go(to);
    			} else {
    				const keyedState = { ...state, _key: createGlobalId() };
    				// try...catch iOS Safari limits to 100 pushState calls
    				try {
    					source.history[replace ? "replaceState" : "pushState"](
    						keyedState,
    						"",
    						to,
    					);
    				} catch (e) {
    					source.location[replace ? "replace" : "assign"](to);
    				}
    			}

    			location = getLocation(source);
    			notifyListeners();
    		},
    	};
    }

    function createStackFrame(state, uri) {
    	return { ...createLocation(uri), state };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
    	let index = 0;
    	let stack = [createStackFrame(null, initialPathname)];

    	return {
    		// This is just for testing...
    		get entries() {
    			return stack;
    		},
    		get location() {
    			return stack[index];
    		},
    		addEventListener() {},
    		removeEventListener() {},
    		history: {
    			get state() {
    				return stack[index].state;
    			},
    			pushState(state, title, uri) {
    				index++;
    				// Throw away anything in the stack with an index greater than the current index.
    				// This happens, when we go back using `go(-n)`. The index is now less than `stack.length`.
    				// If we call `go(+n)` the stack entries with an index greater than the current index can
    				// be reused.
    				// However, if we navigate to a path, instead of a number, we want to create a new branch
    				// of navigation.
    				stack = stack.slice(0, index);
    				stack.push(createStackFrame(state, uri));
    			},
    			replaceState(state, title, uri) {
    				stack[index] = createStackFrame(state, uri);
    			},
    			go(to) {
    				const newIndex = index + to;
    				if (newIndex < 0 || newIndex > stack.length - 1) {
    					return;
    				}
    				index = newIndex;
    			},
    		},
    	};
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = !!(
    	!isSSR &&
    	window.document &&
    	window.document.createElement
    );
    // Use memory history in iframes (for example in Svelte REPL)
    const isEmbeddedPage = !isSSR && window.location.origin === "null";
    const globalHistory = createHistory(
    	canUseDOM && !isEmbeddedPage ? window : createMemorySource(),
    );
    const { navigate } = globalHistory;

    // We need to keep the focus candidate in a separate file, so svelte does
    // not update, when we mutate it.
    // Also, we need a single global reference, because taking focus needs to
    // work globally, even if we have multiple top level routers
    // eslint-disable-next-line import/no-mutable-exports
    let focusCandidate = null;

    // eslint-disable-next-line import/no-mutable-exports
    let initialNavigation = true;

    /**
     * Check if RouterA is above RouterB in the document
     * @param {number} routerIdA The first Routers id
     * @param {number} routerIdB The second Routers id
     */
    function isAbove(routerIdA, routerIdB) {
    	const routerMarkers = document.querySelectorAll("[data-svnav-router]");
    	for (let i = 0; i < routerMarkers.length; i++) {
    		const node = routerMarkers[i];
    		const currentId = Number(node.dataset.svnavRouter);
    		if (currentId === routerIdA) return true;
    		if (currentId === routerIdB) return false;
    	}
    	return false;
    }

    /**
     * Check if a Route candidate is the best choice to move focus to,
     * and store the best match.
     * @param {{
         level: number;
         routerId: number;
         route: {
           id: number;
           focusElement: import("svelte/store").Readable<Promise<Element>|null>;
         }
       }} item A Route candidate, that updated and is visible after a navigation
     */
    function pushFocusCandidate(item) {
    	if (
    		// Best candidate if it's the only candidate...
    		!focusCandidate ||
    		// Route is nested deeper, than previous candidate
    		// -> Route change was triggered in the deepest affected
    		// Route, so that's were focus should move to
    		item.level > focusCandidate.level ||
    		// If the level is identical, we want to focus the first Route in the document,
    		// so we pick the first Router lookin from page top to page bottom.
    		(item.level === focusCandidate.level &&
    			isAbove(item.routerId, focusCandidate.routerId))
    	) {
    		focusCandidate = item;
    	}
    }

    /**
     * Reset the focus candidate.
     */
    function clearFocusCandidate() {
    	focusCandidate = null;
    }

    function initialNavigationOccurred() {
    	initialNavigation = false;
    }

    /*
     * `focus` Adapted from https://github.com/oaf-project/oaf-side-effects/blob/master/src/index.ts
     *
     * https://github.com/oaf-project/oaf-side-effects/blob/master/LICENSE
     */
    function focus(elem) {
    	if (!elem) return false;
    	const TABINDEX = "tabindex";
    	try {
    		if (!elem.hasAttribute(TABINDEX)) {
    			elem.setAttribute(TABINDEX, "-1");
    			let unlisten;
    			// We remove tabindex after blur to avoid weird browser behavior
    			// where a mouse click can activate elements with tabindex="-1".
    			const blurListener = () => {
    				elem.removeAttribute(TABINDEX);
    				unlisten();
    			};
    			unlisten = addListener(elem, "blur", blurListener);
    		}
    		elem.focus();
    		return document.activeElement === elem;
    	} catch (e) {
    		// Apparently trying to focus a disabled element in IE can throw.
    		// See https://stackoverflow.com/a/1600194/2476884
    		return false;
    	}
    }

    function isEndMarker(elem, id) {
    	return Number(elem.dataset.svnavRouteEnd) === id;
    }

    function isHeading(elem) {
    	return /^H[1-6]$/i.test(elem.tagName);
    }

    function query(selector, parent = document) {
    	return parent.querySelector(selector);
    }

    function queryHeading(id) {
    	const marker = query(`[data-svnav-route-start="${id}"]`);
    	let current = marker.nextElementSibling;
    	while (!isEndMarker(current, id)) {
    		if (isHeading(current)) {
    			return current;
    		}
    		const heading = query("h1,h2,h3,h4,h5,h6", current);
    		if (heading) {
    			return heading;
    		}
    		current = current.nextElementSibling;
    	}
    	return null;
    }

    function handleFocus(route) {
    	Promise.resolve(get_store_value(route.focusElement)).then(elem => {
    		const focusElement = elem || queryHeading(route.id);
    		if (!focusElement) {
    			warn(
    				ROUTER_ID,
    				"Could not find an element to focus. " +
    					"You should always render a header for accessibility reasons, " +
    					'or set a custom focus element via the "useFocus" hook. ' +
    					"If you don't want this Route or Router to manage focus, " +
    					'pass "primary={false}" to it.',
    				route,
    				ROUTE_ID,
    			);
    		}
    		const headingFocused = focus(focusElement);
    		if (headingFocused) return;
    		focus(document.documentElement);
    	});
    }

    const createTriggerFocus = (a11yConfig, announcementText, location) => (
    	manageFocus,
    	announceNavigation,
    ) =>
    	// Wait until the dom is updated, so we can look for headings
    	tick().then(() => {
    		if (!focusCandidate || initialNavigation) {
    			initialNavigationOccurred();
    			return;
    		}
    		if (manageFocus) {
    			handleFocus(focusCandidate.route);
    		}
    		if (a11yConfig.announcements && announceNavigation) {
    			const { path, fullPath, meta, params, uri } = focusCandidate.route;
    			const announcementMessage = a11yConfig.createAnnouncement(
    				{ path, fullPath, meta, params, uri },
    				get_store_value(location),
    			);
    			Promise.resolve(announcementMessage).then(message => {
    				announcementText.set(message);
    			});
    		}
    		clearFocusCandidate();
    	});

    const visuallyHiddenStyle =
    	"position:fixed;" +
    	"top:-1px;" +
    	"left:0;" +
    	"width:1px;" +
    	"height:1px;" +
    	"padding:0;" +
    	"overflow:hidden;" +
    	"clip:rect(0,0,0,0);" +
    	"white-space:nowrap;" +
    	"border:0;";

    /* node_modules\.pnpm\svelte-navigator@3.1.5_svelte@3.38.2\node_modules\svelte-navigator\src\Router.svelte generated by Svelte v3.38.2 */

    const file$e = "node_modules\\.pnpm\\svelte-navigator@3.1.5_svelte@3.38.2\\node_modules\\svelte-navigator\\src\\Router.svelte";

    // (195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
    function create_if_block$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*$announcementText*/ ctx[0]);
    			attr_dev(div, "role", "status");
    			attr_dev(div, "aria-atomic", "true");
    			attr_dev(div, "aria-live", "polite");
    			attr_dev(div, "style", visuallyHiddenStyle);
    			add_location(div, file$e, 195, 1, 5906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$announcementText*/ 1) set_data_dev(t, /*$announcementText*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	let if_block = /*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_style(div, "display", "none");
    			attr_dev(div, "aria-hidden", "true");
    			attr_dev(div, "data-svnav-router", /*routerId*/ ctx[3]);
    			add_location(div, file$e, 190, 0, 5750);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			if (/*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId$1 = createCounter();
    const defaultBasepath = "/";

    function instance$e($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $prevLocation;
    	let $activeRoute;
    	let $announcementText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = defaultBasepath } = $$props;
    	let { url = null } = $$props;
    	let { history = globalHistory } = $$props;
    	let { primary = true } = $$props;
    	let { a11y = {} } = $$props;

    	const a11yConfig = {
    		createAnnouncement: route => `Navigated to ${route.uri}`,
    		announcements: true,
    		...a11y
    	};

    	// Remember the initial `basepath`, so we can fire a warning
    	// when the user changes it later
    	const initialBasepath = basepath;

    	const normalizedBasepath = normalizePath(basepath);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const isTopLevelRouter = !locationContext;
    	const routerId = createId$1();
    	const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
    	const announcementText = writable("");
    	validate_store(announcementText, "announcementText");
    	component_subscribe($$self, announcementText, value => $$invalidate(0, $announcementText = value));
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(16, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(18, $activeRoute = value));

    	// Used in SSR to synchronously set that a Route is active.
    	let hasActiveRoute = false;

    	// Nesting level of router.
    	// We will need this to identify sibling routers, when moving
    	// focus on navigation, so we can focus the first possible router
    	const level = isTopLevelRouter ? 0 : routerContext.level + 1;

    	// If we're running an SSR we force the location to the `url` prop
    	const getInitialLocation = () => normalizeLocation(isSSR ? createLocation(url) : history.location, normalizedBasepath);

    	const location = isTopLevelRouter
    	? writable(getInitialLocation())
    	: locationContext;

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const prevLocation = writable($location);
    	validate_store(prevLocation, "prevLocation");
    	component_subscribe($$self, prevLocation, value => $$invalidate(17, $prevLocation = value));
    	const triggerFocus = createTriggerFocus(a11yConfig, announcementText, location);
    	const createRouteFilter = routeId => routeList => routeList.filter(routeItem => routeItem.id !== routeId);

    	function registerRoute(route) {
    		if (isSSR) {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				hasActiveRoute = true;

    				// Return the match in SSR mode, so the matched Route can use it immediatly.
    				// Waiting for activeRoute to update does not work, because it updates
    				// after the Route is initialized
    				return matchingRoute; // eslint-disable-line consistent-return
    			}
    		} else {
    			routes.update(prevRoutes => {
    				// Remove an old version of the updated route,
    				// before pushing the new version
    				const nextRoutes = createRouteFilter(route.id)(prevRoutes);

    				nextRoutes.push(route);
    				return nextRoutes;
    			});
    		}
    	}

    	function unregisterRoute(routeId) {
    		routes.update(createRouteFilter(routeId));
    	}

    	if (!isTopLevelRouter && basepath !== defaultBasepath) {
    		warn(ROUTER_ID, "Only top-level Routers can have a \"basepath\" prop. It is ignored.", { basepath });
    	}

    	if (isTopLevelRouter) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(changedHistory => {
    				const normalizedLocation = normalizeLocation(changedHistory.location, normalizedBasepath);
    				prevLocation.set($location);
    				location.set(normalizedLocation);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		registerRoute,
    		unregisterRoute,
    		manageFocus,
    		level,
    		id: routerId,
    		history: isTopLevelRouter ? history : routerContext.history,
    		basepath: isTopLevelRouter
    		? normalizedBasepath
    		: routerContext.basepath
    	});

    	const writable_props = ["basepath", "url", "history", "primary", "a11y"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(11, url = $$props.url);
    		if ("history" in $$props) $$invalidate(12, history = $$props.history);
    		if ("primary" in $$props) $$invalidate(13, primary = $$props.primary);
    		if ("a11y" in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ("$$scope" in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId: createId$1,
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		normalizePath,
    		pick,
    		match,
    		normalizeLocation,
    		createLocation,
    		isSSR,
    		warn,
    		ROUTER_ID,
    		pushFocusCandidate,
    		visuallyHiddenStyle,
    		createTriggerFocus,
    		defaultBasepath,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		a11yConfig,
    		initialBasepath,
    		normalizedBasepath,
    		locationContext,
    		routerContext,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		level,
    		getInitialLocation,
    		location,
    		prevLocation,
    		triggerFocus,
    		createRouteFilter,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$prevLocation,
    		$activeRoute,
    		$announcementText
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(11, url = $$props.url);
    		if ("history" in $$props) $$invalidate(12, history = $$props.history);
    		if ("primary" in $$props) $$invalidate(13, primary = $$props.primary);
    		if ("a11y" in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*basepath*/ 1024) {
    			if (basepath !== initialBasepath) {
    				warn(ROUTER_ID, "You cannot change the \"basepath\" prop. It is ignored.");
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$routes, $location*/ 98304) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$location, $prevLocation*/ 163840) {
    			// Manage focus and announce navigation to screen reader users
    			{
    				if (isTopLevelRouter) {
    					const hasHash = !!$location.hash;

    					// When a hash is present in the url, we skip focus management, because
    					// focusing a different element will prevent in-page jumps (See #3)
    					const shouldManageFocus = !hasHash && manageFocus;

    					// We don't want to make an announcement, when the hash changes,
    					// but the active route stays the same
    					const announceNavigation = !hasHash || $location.pathname !== $prevLocation.pathname;

    					triggerFocus(shouldManageFocus, announceNavigation);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$activeRoute*/ 262144) {
    			// Queue matched Route, so top level Router can decide which Route to focus.
    			// Non primary Routers should just be ignored
    			if (manageFocus && $activeRoute && $activeRoute.primary) {
    				pushFocusCandidate({ level, routerId, route: $activeRoute });
    			}
    		}
    	};

    	return [
    		$announcementText,
    		a11yConfig,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		location,
    		prevLocation,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		$location,
    		$routes,
    		$prevLocation,
    		$activeRoute,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				basepath: 10,
    				url: 11,
    				history: 12,
    				primary: 13,
    				a11y: 14
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11y() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11y(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Check if a component or hook have been created outside of a
     * context providing component
     * @param {number} componentId
     * @param {*} props
     * @param {string?} ctxKey
     * @param {number?} ctxProviderId
     */
    function usePreflightCheck(
    	componentId,
    	props,
    	ctxKey = ROUTER,
    	ctxProviderId = ROUTER_ID,
    ) {
    	const ctx = getContext(ctxKey);
    	if (!ctx) {
    		fail(
    			componentId,
    			label =>
    				`You cannot use ${label} outside of a ${createLabel(ctxProviderId)}.`,
    			props,
    		);
    	}
    }

    const toReadonly = ctx => {
    	const { subscribe } = getContext(ctx);
    	return { subscribe };
    };

    /**
     * Access the current location via a readable store.
     * @returns {import("svelte/store").Readable<{
        pathname: string;
        search: string;
        hash: string;
        state: {};
      }>}
     *
     * @example
      ```html
      <script>
        import { useLocation } from "svelte-navigator";

        const location = useLocation();

        $: console.log($location);
        // {
        //   pathname: "/blog",
        //   search: "?id=123",
        //   hash: "#comments",
        //   state: {}
        // }
      </script>
      ```
     */
    function useLocation() {
    	usePreflightCheck(USE_LOCATION_ID);
    	return toReadonly(LOCATION);
    }

    /**
     * @typedef {{
        path: string;
        fullPath: string;
        uri: string;
        params: {};
      }} RouteMatch
     */

    /**
     * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
     */

    /**
     * Access the history of top level Router.
     */
    function useHistory() {
    	const { history } = getContext(ROUTER);
    	return history;
    }

    /**
     * Access the base of the parent Route.
     */
    function useRouteBase() {
    	const route = getContext(ROUTE);
    	return route ? derived(route, _route => _route.base) : writable("/");
    }

    /**
     * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
     * It is used under the hood in `Link` and `useNavigate`.
     * You can use it to manually resolve links, when using the `link` or `links` actions.
     *
     * @returns {(path: string) => string}
     *
     * @example
      ```html
      <script>
        import { link, useResolve } from "svelte-navigator";

        const resolve = useResolve();
        // `resolvedLink` will be resolved relative to its parent Route
        // and the Routers `basepath`
        const resolvedLink = resolve("relativePath");
      </script>

      <a href={resolvedLink} use:link>Relative link</a>
      ```
     */
    function useResolve() {
    	usePreflightCheck(USE_RESOLVE_ID);
    	const routeBase = useRouteBase();
    	const { basepath: appBase } = getContext(ROUTER);
    	/**
    	 * Resolves the path relative to the current route and basepath.
    	 *
    	 * @param {string} path The path to resolve
    	 * @returns {string} The resolved path
    	 */
    	const resolve = path => resolveLink(path, get_store_value(routeBase), appBase);
    	return resolve;
    }

    /**
     * A hook, that returns a context-aware version of `navigate`.
     * It will automatically resolve the given link relative to the current Route.
     * It will also resolve a link against the `basepath` of the Router.
     *
     * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router>
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /absolutePath
      </button>
      ```
      *
      * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router basepath="/base">
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /base/route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /base/absolutePath
      </button>
      ```
     */
    function useNavigate() {
    	usePreflightCheck(USE_NAVIGATE_ID);
    	const resolve = useResolve();
    	const { navigate } = useHistory();
    	/**
    	 * Navigate to a new route.
    	 * Resolves the link relative to the current route and basepath.
    	 *
    	 * @param {string|number} to The path to navigate to.
    	 *
    	 * If `to` is a number we will navigate to the stack entry index + `to`
    	 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    	 * @param {Object} options
    	 * @param {*} [options.state]
    	 * @param {boolean} [options.replace=false]
    	 */
    	const navigateRelative = (to, options) => {
    		// If to is a number, we navigate to the target stack entry via `history.go`.
    		// Otherwise resolve the link
    		const target = isNumber(to) ? to : resolve(to);
    		return navigate(target, options);
    	};
    	return navigateRelative;
    }

    /* node_modules\.pnpm\svelte-navigator@3.1.5_svelte@3.38.2\node_modules\svelte-navigator\src\Route.svelte generated by Svelte v3.38.2 */
    const file$d = "node_modules\\.pnpm\\svelte-navigator@3.1.5_svelte@3.38.2\\node_modules\\svelte-navigator\\src\\Route.svelte";

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*$params*/ 16,
    	location: dirty & /*$location*/ 4
    });

    const get_default_slot_context = ctx => ({
    	params: isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    	location: /*$location*/ ctx[2],
    	navigate: /*navigate*/ ctx[10]
    });

    // (97:0) {#if isActive}
    function create_if_block$2(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				primary: /*primary*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};
    			if (dirty & /*primary*/ 2) router_changes.primary = /*primary*/ ctx[1];

    			if (dirty & /*$$scope, component, $location, $params, $$restProps*/ 264213) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(97:0) {#if isActive}",
    		ctx
    	});

    	return block;
    }

    // (113:2) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $params, $location*/ 262164)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(113:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {#if component !== null}
    function create_if_block_1$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[2] },
    		{ navigate: /*navigate*/ ctx[10] },
    		isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    		/*$$restProps*/ ctx[11]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, navigate, isSSR, get, params, $params, $$restProps*/ 3604)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 4 && { location: /*$location*/ ctx[2] },
    					dirty & /*navigate*/ 1024 && { navigate: /*navigate*/ ctx[10] },
    					dirty & /*isSSR, get, params, $params*/ 528 && get_spread_object(isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4]),
    					dirty & /*$$restProps*/ 2048 && get_spread_object(/*$$restProps*/ ctx[11])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(105:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    // (98:1) <Router {primary}>
    function create_default_slot$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(98:1) <Router {primary}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	let if_block = /*isActive*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			set_style(div0, "display", "none");
    			attr_dev(div0, "aria-hidden", "true");
    			attr_dev(div0, "data-svnav-route-start", /*id*/ ctx[5]);
    			add_location(div0, file$d, 95, 0, 2622);
    			set_style(div1, "display", "none");
    			attr_dev(div1, "aria-hidden", "true");
    			attr_dev(div1, "data-svnav-route-end", /*id*/ ctx[5]);
    			add_location(div1, file$d, 121, 0, 3295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isActive*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isActive*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId = createCounter();

    function instance$d($$self, $$props, $$invalidate) {
    	let isActive;
    	const omit_props_names = ["path","component","meta","primary"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $parentBase;
    	let $location;
    	let $activeRoute;
    	let $params;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let { meta = {} } = $$props;
    	let { primary = true } = $$props;
    	usePreflightCheck(ROUTE_ID, $$props);
    	const id = createId();
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(16, $activeRoute = value));
    	const parentBase = useRouteBase();
    	validate_store(parentBase, "parentBase");
    	component_subscribe($$self, parentBase, value => $$invalidate(15, $parentBase = value));
    	const location = useLocation();
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(2, $location = value));
    	const focusElement = writable(null);

    	// In SSR we cannot wait for $activeRoute to update,
    	// so we use the match returned from `registerRoute` instead
    	let ssrMatch;

    	const route = writable();
    	const params = writable({});
    	validate_store(params, "params");
    	component_subscribe($$self, params, value => $$invalidate(4, $params = value));
    	setContext(ROUTE, route);
    	setContext(ROUTE_PARAMS, params);
    	setContext(FOCUS_ELEM, focusElement);

    	// We need to call useNavigate after the route is set,
    	// so we can use the routes path for link resolution
    	const navigate = useNavigate();

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway
    	if (!isSSR) {
    		onDestroy(() => unregisterRoute(id));
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("path" in $$new_props) $$invalidate(12, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("meta" in $$new_props) $$invalidate(13, meta = $$new_props.meta);
    		if ("primary" in $$new_props) $$invalidate(1, primary = $$new_props.primary);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId,
    		getContext,
    		onDestroy,
    		setContext,
    		writable,
    		get: get_store_value,
    		Router,
    		ROUTER,
    		ROUTE,
    		ROUTE_PARAMS,
    		FOCUS_ELEM,
    		useLocation,
    		useNavigate,
    		useRouteBase,
    		usePreflightCheck,
    		isSSR,
    		extractBaseUri,
    		join,
    		ROUTE_ID,
    		path,
    		component,
    		meta,
    		primary,
    		id,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		parentBase,
    		location,
    		focusElement,
    		ssrMatch,
    		route,
    		params,
    		navigate,
    		$parentBase,
    		$location,
    		isActive,
    		$activeRoute,
    		$params
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(12, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("meta" in $$props) $$invalidate(13, meta = $$new_props.meta);
    		if ("primary" in $$props) $$invalidate(1, primary = $$new_props.primary);
    		if ("ssrMatch" in $$props) $$invalidate(14, ssrMatch = $$new_props.ssrMatch);
    		if ("isActive" in $$props) $$invalidate(3, isActive = $$new_props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, $parentBase, meta, $location, primary*/ 45062) {
    			{
    				// The route store will be re-computed whenever props, location or parentBase change
    				const isDefault = path === "";

    				const rawBase = join($parentBase, path);

    				const updatedRoute = {
    					id,
    					path,
    					meta,
    					// If no path prop is given, this Route will act as the default Route
    					// that is rendered if no other Route in the Router is a match
    					default: isDefault,
    					fullPath: isDefault ? "" : rawBase,
    					base: isDefault
    					? $parentBase
    					: extractBaseUri(rawBase, $location.pathname),
    					primary,
    					focusElement
    				};

    				route.set(updatedRoute);

    				// If we're in SSR mode and the Route matches,
    				// `registerRoute` will return the match
    				$$invalidate(14, ssrMatch = registerRoute(updatedRoute));
    			}
    		}

    		if ($$self.$$.dirty & /*ssrMatch, $activeRoute*/ 81920) {
    			$$invalidate(3, isActive = !!(ssrMatch || $activeRoute && $activeRoute.id === id));
    		}

    		if ($$self.$$.dirty & /*isActive, ssrMatch, $activeRoute*/ 81928) {
    			if (isActive) {
    				const { params: activeParams } = ssrMatch || $activeRoute;
    				params.set(activeParams);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		primary,
    		$location,
    		isActive,
    		$params,
    		id,
    		activeRoute,
    		parentBase,
    		location,
    		params,
    		navigate,
    		$$restProps,
    		path,
    		meta,
    		ssrMatch,
    		$parentBase,
    		$activeRoute,
    		slots,
    		$$scope
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			path: 12,
    			component: 0,
    			meta: 13,
    			primary: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meta() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\.pnpm\svelte-navigator@3.1.5_svelte@3.38.2\node_modules\svelte-navigator\src\Link.svelte generated by Svelte v3.38.2 */
    const file$c = "node_modules\\.pnpm\\svelte-navigator@3.1.5_svelte@3.38.2\\node_modules\\svelte-navigator\\src\\Link.svelte";

    function create_fragment$c(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let a_levels = [{ href: /*href*/ ctx[0] }, /*ariaCurrent*/ ctx[1], /*props*/ ctx[2]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$c, 63, 0, 1735);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				dirty & /*ariaCurrent*/ 2 && /*ariaCurrent*/ ctx[1],
    				dirty & /*props*/ 4 && /*props*/ ctx[2]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let href;
    	let isPartiallyCurrent;
    	let isCurrent;
    	let ariaCurrent;
    	let props;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = null } = $$props;
    	usePreflightCheck(LINK_ID, $$props);
    	const location = useLocation();
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));
    	const dispatch = createEventDispatcher();
    	const resolve = useResolve();
    	const { navigate } = useHistory();

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = isCurrent || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(18, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("to" in $$new_props) $$invalidate(5, to = $$new_props.to);
    		if ("replace" in $$new_props) $$invalidate(6, replace = $$new_props.replace);
    		if ("state" in $$new_props) $$invalidate(7, state = $$new_props.state);
    		if ("getProps" in $$new_props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		useLocation,
    		useResolve,
    		useHistory,
    		usePreflightCheck,
    		shouldNavigate,
    		isFunction,
    		startsWith,
    		LINK_ID,
    		to,
    		replace,
    		state,
    		getProps,
    		location,
    		dispatch,
    		resolve,
    		navigate,
    		onClick,
    		href,
    		$location,
    		isPartiallyCurrent,
    		isCurrent,
    		ariaCurrent,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("to" in $$props) $$invalidate(5, to = $$new_props.to);
    		if ("replace" in $$props) $$invalidate(6, replace = $$new_props.replace);
    		if ("state" in $$props) $$invalidate(7, state = $$new_props.state);
    		if ("getProps" in $$props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(10, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(11, isCurrent = $$new_props.isCurrent);
    		if ("ariaCurrent" in $$props) $$invalidate(1, ariaCurrent = $$new_props.ariaCurrent);
    		if ("props" in $$props) $$invalidate(2, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $location*/ 544) {
    			// We need to pass location here to force re-resolution of the link,
    			// when the pathname changes. Otherwise we could end up with stale path params,
    			// when for example an :id changes in the parent Routes path
    			$$invalidate(0, href = resolve(to, $location));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 513) {
    			$$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 513) {
    			$$invalidate(11, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 2048) {
    			$$invalidate(1, ariaCurrent = isCurrent ? { "aria-current": "page" } : {});
    		}

    		$$invalidate(2, props = (() => {
    			if (isFunction(getProps)) {
    				const dynamicProps = getProps({
    					location: $location,
    					href,
    					isPartiallyCurrent,
    					isCurrent
    				});

    				return { ...$$restProps, ...dynamicProps };
    			}

    			return $$restProps;
    		})());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		href,
    		ariaCurrent,
    		props,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		$location,
    		isPartiallyCurrent,
    		isCurrent,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { to: 5, replace: 6, state: 7, getProps: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*to*/ ctx[5] === undefined && !("to" in props)) {
    			console.warn("<Link> was created without expected prop 'to'");
    		}
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
     * Adapted from https://github.com/EmilTholin/svelte-routing
     *
     * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
     */

    const createAction = getAnchor => (node, navigate$1 = navigate) => {
    	const handleClick = event => {
    		const anchor = getAnchor(event);
    		if (anchor && anchor.target === "" && shouldNavigate(event)) {
    			event.preventDefault();
    			const to = anchor.pathname + anchor.search + anchor.hash;
    			navigate$1(to, { replace: anchor.hasAttribute("replace") });
    		}
    	};
    	const unlisten = addListener(node, "click", handleClick);
    	return { destroy: unlisten };
    };

    // prettier-ignore
    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    const link = /*#__PURE__*/createAction(event => event.currentTarget); // eslint-disable-line spaced-comment, max-len

    /* src\components\sidebar\SiteHeader.svelte generated by Svelte v3.38.2 */

    const file$b = "src\\components\\sidebar\\SiteHeader.svelte";

    function create_fragment$b(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let h5;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "#MiniBlaseball";
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = "Blaseball players art by @HetreaSky";
    			attr_dev(h1, "class", "svelte-v1p5wh");
    			add_location(h1, file$b, 1, 4, 14);
    			attr_dev(h5, "class", "svelte-v1p5wh");
    			add_location(h5, file$b, 2, 4, 43);
    			attr_dev(header, "class", "svelte-v1p5wh");
    			add_location(header, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, h5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SiteHeader", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SiteHeader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SiteHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SiteHeader",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\sidebar\SidebarNav.svelte generated by Svelte v3.38.2 */
    const file$a = "src\\components\\sidebar\\SidebarNav.svelte";

    function create_fragment$a(ctx) {
    	let ul;
    	let li0;
    	let t0;
    	let li0_class_value;
    	let t1;
    	let li1;
    	let t2;
    	let li1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			t0 = text("Sort & Filter");
    			t1 = space();
    			li1 = element("li");
    			t2 = text("About");
    			attr_dev(li0, "class", li0_class_value = "" + (null_to_empty(/*selectedScreen*/ ctx[0] === "filter" ? "active" : "") + " svelte-1g0vcck"));
    			add_location(li0, file$a, 14, 4, 296);
    			attr_dev(li1, "class", li1_class_value = "" + (null_to_empty(/*selectedScreen*/ ctx[0] === "about" ? "active" : "") + " svelte-1g0vcck"));
    			add_location(li1, file$a, 19, 4, 457);
    			attr_dev(ul, "class", "sidebar-nav svelte-1g0vcck");
    			add_location(ul, file$a, 13, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(li1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedScreen*/ 1 && li0_class_value !== (li0_class_value = "" + (null_to_empty(/*selectedScreen*/ ctx[0] === "filter" ? "active" : "") + " svelte-1g0vcck"))) {
    				attr_dev(li0, "class", li0_class_value);
    			}

    			if (dirty & /*selectedScreen*/ 1 && li1_class_value !== (li1_class_value = "" + (null_to_empty(/*selectedScreen*/ ctx[0] === "about" ? "active" : "") + " svelte-1g0vcck"))) {
    				attr_dev(li1, "class", li1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SidebarNav", slots, []);
    	let { selectedScreen } = $$props;
    	const dispatch = createEventDispatcher();

    	function openScreen(screen) {
    		dispatch("selectscreen", { screen });
    	}

    	const writable_props = ["selectedScreen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SidebarNav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => openScreen("filter");
    	const click_handler_1 = () => openScreen("about");

    	$$self.$$set = $$props => {
    		if ("selectedScreen" in $$props) $$invalidate(0, selectedScreen = $$props.selectedScreen);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		selectedScreen,
    		dispatch,
    		openScreen
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedScreen" in $$props) $$invalidate(0, selectedScreen = $$props.selectedScreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedScreen, openScreen, click_handler, click_handler_1];
    }

    class SidebarNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { selectedScreen: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SidebarNav",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedScreen*/ ctx[0] === undefined && !("selectedScreen" in props)) {
    			console.warn("<SidebarNav> was created without expected prop 'selectedScreen'");
    		}
    	}

    	get selectedScreen() {
    		throw new Error("<SidebarNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedScreen(value) {
    		throw new Error("<SidebarNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\sidebar\Aboutbox.svelte generated by Svelte v3.38.2 */

    const file$9 = "src\\components\\sidebar\\Aboutbox.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let a0;
    	let t2;
    	let a1;
    	let t4;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t8;
    	let a2;
    	let t10;
    	let a3;
    	let t12;
    	let t13;
    	let p3;
    	let t14;
    	let a4;
    	let t16;
    	let a5;
    	let t18;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("#MiniBlaseball is a series of minis by ");
    			a0 = element("a");
    			a0.textContent = "HetreaSky";
    			t2 = text(", depicting the many players in ");
    			a1 = element("a");
    			a1.textContent = "Internet League Blaseball";
    			t4 = text(".");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "All designs are non-canon and created by the fan community. Team placements updated as of the end of Season 16.";
    			t7 = space();
    			p2 = element("p");
    			t8 = text("More players are still being added! Follow ");
    			a2 = element("a");
    			a2.textContent = "@HetreaSky";
    			t10 = text(" on Twitter or the ");
    			a3 = element("a");
    			a3.textContent = "#MiniBlaseball";
    			t12 = text(" hashtag for updates.");
    			t13 = space();
    			p3 = element("p");
    			t14 = text("This website is built by ");
    			a4 = element("a");
    			a4.textContent = "@PseudoMonious";
    			t16 = text(". You can see the source code by clicking ");
    			a5 = element("a");
    			a5.textContent = "here";
    			t18 = text(". DM her if there's anything wrong with the site!");
    			attr_dev(a0, "href", "https://twitter.com/HetreaSky");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-1jolj1q");
    			add_location(a0, file$9, 1, 46, 70);
    			attr_dev(a1, "href", "https://blaseball.com");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-1jolj1q");
    			add_location(a1, file$9, 1, 147, 171);
    			attr_dev(p0, "class", "svelte-1jolj1q");
    			add_location(p0, file$9, 1, 4, 28);
    			attr_dev(p1, "class", "svelte-1jolj1q");
    			add_location(p1, file$9, 3, 4, 270);
    			attr_dev(a2, "href", "https://twitter.com/HetreaSky");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-1jolj1q");
    			add_location(a2, file$9, 5, 50, 442);
    			attr_dev(a3, "href", "https://twitter.com/hashtag/MiniBlaseball");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "svelte-1jolj1q");
    			add_location(a3, file$9, 5, 139, 531);
    			attr_dev(p2, "class", "svelte-1jolj1q");
    			add_location(p2, file$9, 5, 4, 396);
    			attr_dev(a4, "href", "https://twitter.com/PseudoMonious");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "class", "svelte-1jolj1q");
    			add_location(a4, file$9, 7, 32, 678);
    			attr_dev(a5, "href", "https://github.com/PseudoMon/miniblaseball");
    			attr_dev(a5, "target", "_blank");
    			attr_dev(a5, "class", "svelte-1jolj1q");
    			add_location(a5, file$9, 7, 152, 798);
    			attr_dev(p3, "class", "svelte-1jolj1q");
    			add_location(p3, file$9, 7, 4, 650);
    			attr_dev(div, "class", "aboutbox svelte-1jolj1q");
    			add_location(div, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, a0);
    			append_dev(p0, t2);
    			append_dev(p0, a1);
    			append_dev(p0, t4);
    			append_dev(div, t5);
    			append_dev(div, p1);
    			append_dev(div, t7);
    			append_dev(div, p2);
    			append_dev(p2, t8);
    			append_dev(p2, a2);
    			append_dev(p2, t10);
    			append_dev(p2, a3);
    			append_dev(p2, t12);
    			append_dev(div, t13);
    			append_dev(div, p3);
    			append_dev(p3, t14);
    			append_dev(p3, a4);
    			append_dev(p3, t16);
    			append_dev(p3, a5);
    			append_dev(p3, t18);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Aboutbox", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Aboutbox> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Aboutbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aboutbox",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\sidebar\SortControl.svelte generated by Svelte v3.38.2 */
    const file$8 = "src\\components\\sidebar\\SortControl.svelte";

    function create_fragment$8(ctx) {
    	let h2;
    	let t1;
    	let form;
    	let label0;
    	let input0;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let t4;
    	let t5;
    	let label2;
    	let input2;
    	let t6;
    	let t7;
    	let label3;
    	let input3;
    	let t8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Sort by";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text("\r\n        Latest drawn");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text("\r\n        First drawn");
    			t5 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t6 = text("\r\n        Alphabetical");
    			t7 = space();
    			label3 = element("label");
    			input3 = element("input");
    			t8 = text("\r\n        Current team");
    			add_location(h2, file$8, 10, 0, 226);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "name", "sortby");
    			input0.value = "latest";
    			input0.checked = true;
    			add_location(input0, file$8, 14, 8, 323);
    			attr_dev(label0, "class", "svelte-igyoh6");
    			add_location(label0, file$8, 13, 4, 306);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "name", "sortby");
    			input1.value = "original";
    			add_location(input1, file$8, 19, 8, 442);
    			attr_dev(label1, "class", "svelte-igyoh6");
    			add_location(label1, file$8, 18, 4, 425);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "name", "sortby");
    			input2.value = "alphabetical";
    			add_location(input2, file$8, 24, 8, 553);
    			attr_dev(label2, "class", "svelte-igyoh6");
    			add_location(label2, file$8, 23, 4, 536);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "name", "sortby");
    			input3.value = "currentteam";
    			add_location(input3, file$8, 29, 8, 669);
    			attr_dev(label3, "class", "svelte-igyoh6");
    			add_location(label3, file$8, 28, 4, 652);
    			attr_dev(form, "class", "sort-control");
    			add_location(form, file$8, 12, 0, 246);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(label0, input0);
    			append_dev(label0, t2);
    			append_dev(form, t3);
    			append_dev(form, label1);
    			append_dev(label1, input1);
    			append_dev(label1, t4);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(label2, input2);
    			append_dev(label2, t6);
    			append_dev(form, t7);
    			append_dev(form, label3);
    			append_dev(label3, input3);
    			append_dev(label3, t8);

    			if (!mounted) {
    				dispose = listen_dev(form, "change", /*onChangeSort*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SortControl", slots, []);
    	const dispatch = createEventDispatcher();

    	function onChangeSort(e) {
    		dispatch("changeSort", { sortType: e.target.value });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SortControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		onChangeSort
    	});

    	return [onChangeSort];
    }

    class SortControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SortControl",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\sidebar\FilterControl.svelte generated by Svelte v3.38.2 */
    const file$7 = "src\\components\\sidebar\\FilterControl.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (155:24) {#each subleague.teams as team }
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*team*/ ctx[16] + "";
    	let t0;
    	let t1;
    	let option_selected_value;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.selected = option_selected_value = /*team*/ ctx[16] === /*teamFilter*/ ctx[3];
    			option.__value = option_value_value = /*team*/ ctx[16];
    			option.value = option.__value;
    			add_location(option, file$7, 155, 24, 4236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teams*/ 2 && t0_value !== (t0_value = /*team*/ ctx[16] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*teams, teamFilter*/ 10 && option_selected_value !== (option_selected_value = /*team*/ ctx[16] === /*teamFilter*/ ctx[3])) {
    				prop_dev(option, "selected", option_selected_value);
    			}

    			if (dirty & /*teams*/ 2 && option_value_value !== (option_value_value = /*team*/ ctx[16])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(155:24) {#each subleague.teams as team }",
    		ctx
    	});

    	return block;
    }

    // (150:16) {#each teams as subleague}
    function create_each_block$2(ctx) {
    	let optgroup;
    	let optgroup_label_value;
    	let each_value_1 = /*subleague*/ ctx[13].teams;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			optgroup = element("optgroup");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(optgroup, "label", optgroup_label_value = /*subleague*/ ctx[13].name);
    			attr_dev(optgroup, "class", "svelte-6q41jj");
    			add_location(optgroup, file$7, 151, 20, 4063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, optgroup, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(optgroup, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teams, teamFilter*/ 10) {
    				each_value_1 = /*subleague*/ ctx[13].teams;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(optgroup, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*teams*/ 2 && optgroup_label_value !== (optgroup_label_value = /*subleague*/ ctx[13].name)) {
    				attr_dev(optgroup, "label", optgroup_label_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(optgroup);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(150:16) {#each teams as subleague}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div5;
    	let div0;
    	let span0;
    	let t0;
    	let span0_class_value;
    	let t1;
    	let span1;
    	let t2;
    	let span1_class_value;
    	let t3;
    	let form;
    	let input0;
    	let t4;
    	let sortcontrol;
    	let t5;
    	let div4;
    	let h2;
    	let t7;
    	let h3;
    	let t9;
    	let div3;
    	let div1;
    	let input1;
    	let t10;
    	let label0;
    	let t12;
    	let div2;
    	let input2;
    	let t13;
    	let label1;
    	let t15;
    	let select;
    	let option;
    	let select_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	sortcontrol = new SortControl({ $$inline: true });
    	sortcontrol.$on("changeSort", /*changeSort_handler*/ ctx[11]);
    	let each_value = /*teams*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text("Main League");
    			t1 = space();
    			span1 = element("span");
    			t2 = text("Guest Teams");
    			t3 = space();
    			form = element("form");
    			input0 = element("input");
    			t4 = space();
    			create_component(sortcontrol.$$.fragment);
    			t5 = space();
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Filter";
    			t7 = space();
    			h3 = element("h3");
    			h3.textContent = "Show players who are";
    			t9 = space();
    			div3 = element("div");
    			div1 = element("div");
    			input1 = element("input");
    			t10 = space();
    			label0 = element("label");
    			label0.textContent = "Currently a member of";
    			t12 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t13 = space();
    			label1 = element("label");
    			label1.textContent = "Was a member of";
    			t15 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select a team";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span0, "class", span0_class_value = "" + (null_to_empty(/*selectedGallery*/ ctx[0] === "main" ? "active" : "") + " svelte-6q41jj"));
    			add_location(span0, file$7, 87, 8, 2025);
    			attr_dev(span1, "class", span1_class_value = "" + (null_to_empty(/*selectedGallery*/ ctx[0] === "guest" ? "active" : "") + " svelte-6q41jj"));
    			add_location(span1, file$7, 92, 8, 2207);
    			attr_dev(div0, "class", "gallery-chooser svelte-6q41jj");
    			add_location(div0, file$7, 86, 4, 1986);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "playername");
    			attr_dev(input0, "placeholder", "Search for player...");
    			input0.value = /*nameBeingSearched*/ ctx[4];
    			attr_dev(input0, "class", "svelte-6q41jj");
    			add_location(input0, file$7, 101, 8, 2485);
    			add_location(h2, file$7, 114, 12, 2814);
    			add_location(h3, file$7, 115, 12, 2843);
    			attr_dev(input1, "id", "checkismemberof");
    			attr_dev(input1, "type", "checkbox");
    			input1.value = "ismemberof";
    			attr_dev(input1, "class", "svelte-6q41jj");
    			add_location(input1, file$7, 119, 20, 2965);
    			attr_dev(label0, "for", "checkismemberof");
    			attr_dev(label0, "class", "svelte-6q41jj");
    			add_location(label0, file$7, 124, 20, 3181);
    			attr_dev(div1, "class", "svelte-6q41jj");
    			add_location(div1, file$7, 118, 16, 2938);
    			attr_dev(input2, "id", "checkwasmemberof");
    			attr_dev(input2, "type", "checkbox");
    			input2.value = "wasmemberof";
    			attr_dev(input2, "class", "svelte-6q41jj");
    			add_location(input2, file$7, 131, 20, 3383);
    			attr_dev(label1, "for", "checkwasmemberof");
    			attr_dev(label1, "class", "svelte-6q41jj");
    			add_location(label1, file$7, 136, 20, 3601);
    			attr_dev(div2, "class", "svelte-6q41jj");
    			add_location(div2, file$7, 130, 16, 3356);
    			attr_dev(div3, "class", "filter-selector svelte-6q41jj");
    			add_location(div3, file$7, 117, 12, 2888);
    			option.__value = "";
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$7, 147, 16, 3929);
    			select.disabled = select_disabled_value = !/*appliedFilters*/ ctx[2].length;
    			attr_dev(select, "class", "svelte-6q41jj");
    			add_location(select, file$7, 143, 13, 3788);
    			attr_dev(div4, "class", "svelte-6q41jj");
    			add_location(div4, file$7, 113, 8, 2795);
    			attr_dev(form, "class", "gallery-filter svelte-6q41jj");
    			add_location(form, file$7, 99, 4, 2402);
    			attr_dev(div5, "class", "filter-control svelte-6q41jj");
    			add_location(div5, file$7, 85, 0, 1952);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(div5, t3);
    			append_dev(div5, form);
    			append_dev(form, input0);
    			append_dev(form, t4);
    			mount_component(sortcontrol, form, null);
    			append_dev(form, t5);
    			append_dev(form, div4);
    			append_dev(div4, h2);
    			append_dev(div4, t7);
    			append_dev(div4, h3);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, input1);
    			append_dev(div1, t10);
    			append_dev(div1, label0);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, input2);
    			append_dev(div2, t13);
    			append_dev(div2, label1);
    			append_dev(div4, t15);
    			append_dev(div4, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(span1, "click", /*click_handler_1*/ ctx[10], false, false, false),
    					listen_dev(input0, "input", /*onInputName*/ ctx[6], false, false, false),
    					listen_dev(input1, "change", /*onChangeFilter*/ ctx[7], false, false, false),
    					listen_dev(input2, "change", /*onChangeFilter*/ ctx[7], false, false, false),
    					listen_dev(select, "change", /*onSelectTeam*/ ctx[8], false, false, false),
    					listen_dev(form, "submit", submit_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*selectedGallery*/ 1 && span0_class_value !== (span0_class_value = "" + (null_to_empty(/*selectedGallery*/ ctx[0] === "main" ? "active" : "") + " svelte-6q41jj"))) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (!current || dirty & /*selectedGallery*/ 1 && span1_class_value !== (span1_class_value = "" + (null_to_empty(/*selectedGallery*/ ctx[0] === "guest" ? "active" : "") + " svelte-6q41jj"))) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (!current || dirty & /*nameBeingSearched*/ 16 && input0.value !== /*nameBeingSearched*/ ctx[4]) {
    				prop_dev(input0, "value", /*nameBeingSearched*/ ctx[4]);
    			}

    			if (dirty & /*teams, teamFilter*/ 10) {
    				each_value = /*teams*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*appliedFilters*/ 4 && select_disabled_value !== (select_disabled_value = !/*appliedFilters*/ ctx[2].length)) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sortcontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sortcontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(sortcontrol);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const submit_handler = e => {
    	e.preventDefault();
    };

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FilterControl", slots, []);
    	let { selectedGallery } = $$props;
    	let { teams } = $$props;
    	const dispatch = createEventDispatcher();
    	let appliedFilters = [];
    	let teamFilter = "";
    	let nameBeingSearched = "";

    	function switchGallery(gallery) {
    		if (gallery === selectedGallery) {
    			// If it's the same as the current gallery
    			// don't do anything
    			return;
    		}

    		dispatch("selectGallery", { gallery });
    	} //TODO
    	// After this you'll have to clear all the sorts/filters

    	function onInputName(e) {
    		$$invalidate(4, nameBeingSearched = e.target.value);

    		// Reset other filters
    		$$invalidate(2, appliedFilters = []);

    		$$invalidate(3, teamFilter = "");
    		dispatch("filterPlayerName", { name: nameBeingSearched });
    	}

    	function onChangeFilter(e) {
    		// Add value to filter list if box is checked
    		const filter = e.target.value;

    		if (e.target.checked) {
    			$$invalidate(2, appliedFilters = appliedFilters.concat([filter]));
    		} else {
    			// Remove it if the box is unchekced
    			$$invalidate(2, appliedFilters = appliedFilters.filter(elem => elem != filter));
    		}

    		$$invalidate(4, nameBeingSearched = ""); // Reset searchbar

    		// Reset team if all filters are turned off
    		// if (!appliedFilters) {
    		//     teamFilter = ''
    		// }
    		// Wait the above might not actually work
    		dispatch("changeFilter", { appliedFilters, teamFilter });
    	}

    	function onSelectTeam(e) {
    		$$invalidate(3, teamFilter = e.target.value);
    		$$invalidate(4, nameBeingSearched = ""); // Reset searchbar
    		dispatch("changeFilter", { appliedFilters, teamFilter });
    	}

    	const writable_props = ["selectedGallery", "teams"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FilterControl> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => switchGallery("main");
    	const click_handler_1 = e => switchGallery("guest");

    	function changeSort_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("selectedGallery" in $$props) $$invalidate(0, selectedGallery = $$props.selectedGallery);
    		if ("teams" in $$props) $$invalidate(1, teams = $$props.teams);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		SortControl,
    		selectedGallery,
    		teams,
    		dispatch,
    		appliedFilters,
    		teamFilter,
    		nameBeingSearched,
    		switchGallery,
    		onInputName,
    		onChangeFilter,
    		onSelectTeam
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedGallery" in $$props) $$invalidate(0, selectedGallery = $$props.selectedGallery);
    		if ("teams" in $$props) $$invalidate(1, teams = $$props.teams);
    		if ("appliedFilters" in $$props) $$invalidate(2, appliedFilters = $$props.appliedFilters);
    		if ("teamFilter" in $$props) $$invalidate(3, teamFilter = $$props.teamFilter);
    		if ("nameBeingSearched" in $$props) $$invalidate(4, nameBeingSearched = $$props.nameBeingSearched);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedGallery,
    		teams,
    		appliedFilters,
    		teamFilter,
    		nameBeingSearched,
    		switchGallery,
    		onInputName,
    		onChangeFilter,
    		onSelectTeam,
    		click_handler,
    		click_handler_1,
    		changeSort_handler
    	];
    }

    class FilterControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { selectedGallery: 0, teams: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilterControl",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedGallery*/ ctx[0] === undefined && !("selectedGallery" in props)) {
    			console.warn("<FilterControl> was created without expected prop 'selectedGallery'");
    		}

    		if (/*teams*/ ctx[1] === undefined && !("teams" in props)) {
    			console.warn("<FilterControl> was created without expected prop 'teams'");
    		}
    	}

    	get selectedGallery() {
    		throw new Error("<FilterControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedGallery(value) {
    		throw new Error("<FilterControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get teams() {
    		throw new Error("<FilterControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set teams(value) {
    		throw new Error("<FilterControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Gallery.svelte generated by Svelte v3.38.2 */
    const file$6 = "src\\components\\Gallery.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (38:4) {#each players as player}
    function create_each_block$1(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;
    	let t;
    	let div_style_value;
    	let div_data_imagesrc_value;
    	let observeBox_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = "data:,")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-7f2ybr");
    			add_location(img, file$6, 46, 12, 1156);
    			attr_dev(a, "href", a_href_value = "/" + /*player*/ ctx[3].id);
    			attr_dev(a, "class", "svelte-7f2ybr");
    			add_location(a, file$6, 45, 8, 1108);

    			attr_dev(div, "style", div_style_value = /*player*/ ctx[3]["size"] === "huge"
    			? "overflow: visible"
    			: "");

    			attr_dev(div, "data-imagesrc", div_data_imagesrc_value = `images/${/*player*/ ctx[3].sprites[/*player*/ ctx[3]["default-sprite"]]}`);
    			attr_dev(div, "class", "svelte-7f2ybr");
    			add_location(div, file$6, 38, 4, 898);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a)),
    					action_destroyer(observeBox_action = /*observeBox*/ ctx[1].call(null, div, /*player*/ ctx[3]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*players*/ 1 && a_href_value !== (a_href_value = "/" + /*player*/ ctx[3].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*players*/ 1 && div_style_value !== (div_style_value = /*player*/ ctx[3]["size"] === "huge"
    			? "overflow: visible"
    			: "")) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty & /*players*/ 1 && div_data_imagesrc_value !== (div_data_imagesrc_value = `images/${/*player*/ ctx[3].sprites[/*player*/ ctx[3]["default-sprite"]]}`)) {
    				attr_dev(div, "data-imagesrc", div_data_imagesrc_value);
    			}

    			if (observeBox_action && is_function(observeBox_action.update) && dirty & /*players*/ 1) observeBox_action.update.call(null, /*player*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(38:4) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let each_value = /*players*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "gallery svelte-7f2ybr");
    			add_location(div, file$6, 36, 0, 840);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*players*/ 1) {
    				each_value = /*players*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onImageInView(entries, observer) {
    	entries.forEach(entry => {
    		if (entry.isIntersecting) {
    			entry.target.querySelector("img").src = entry.target.dataset.imagesrc;
    			observer.unobserve(entry.target);
    		}
    	});
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", slots, []);
    	let { players } = $$props;
    	const observer = new IntersectionObserver(onImageInView, { root: null, threshold: 0.25 });

    	function observeBox(playerbox, player) {
    		observer.observe(playerbox);

    		return {
    			update(player) {
    				observer.observe(playerbox);
    			}
    		};
    	}

    	beforeUpdate(() => {
    		observer.disconnect();
    	});

    	const writable_props = ["players"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("players" in $$props) $$invalidate(0, players = $$props.players);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		link,
    		players,
    		onImageInView,
    		observer,
    		observeBox
    	});

    	$$self.$inject_state = $$props => {
    		if ("players" in $$props) $$invalidate(0, players = $$props.players);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [players, observeBox];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { players: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[0] === undefined && !("players" in props)) {
    			console.warn("<Gallery> was created without expected prop 'players'");
    		}
    	}

    	get players() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\utils\CloseButton.svelte generated by Svelte v3.38.2 */

    const file$5 = "src\\components\\utils\\CloseButton.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z");
    			add_location(path, file$5, 2, 8, 197);
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "fill", "currentColor");
    			attr_dev(svg, "stroke-width", "0");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "height", "1em");
    			attr_dev(svg, "width", "1em");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 1, 4, 41);
    			attr_dev(div, "class", "close-button svelte-14ma1n4");
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CloseButton", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CloseButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	return [click_handler];
    }

    class CloseButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CloseButton",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\PlayerInfo.svelte generated by Svelte v3.38.2 */
    const file$4 = "src\\components\\PlayerInfo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (145:4) {#if player.sprites.length > 1}
    function create_if_block_4(ctx) {
    	let div;
    	let each_value = /*player*/ ctx[0].sprites;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "alt-images svelte-1dj22yq");
    			add_location(div, file$4, 145, 4, 4376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*player, viewSprite*/ 513) {
    				each_value = /*player*/ ctx[0].sprites;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(145:4) {#if player.sprites.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (148:8) {#each player.sprites as sprite}
    function create_each_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[11](/*sprite*/ ctx[16], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = "images/" + /*sprite*/ ctx[16])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1dj22yq");
    			add_location(img, file$4, 150, 12, 4511);
    			attr_dev(div, "class", "img-box svelte-1dj22yq");
    			add_location(div, file$4, 148, 8, 4461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*player*/ 1 && img.src !== (img_src_value = "images/" + /*sprite*/ ctx[16])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(148:8) {#each player.sprites as sprite}",
    		ctx
    	});

    	return block;
    }

    // (172:32) 
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Status currently";
    			attr_dev(div, "class", "smol-desc svelte-1dj22yq");
    			add_location(div, file$4, 172, 16, 5101);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(172:32) ",
    		ctx
    	});

    	return block;
    }

    // (165:12) {#if !isRIV && !isStars && !isUnknown }
    function create_if_block_2(ctx) {
    	let div;

    	let t_value = (/*player*/ ctx[0].mascot
    	? "Mascot of the"
    	: "Currently a member of the") + "";

    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "smol-desc svelte-1dj22yq");
    			add_location(div, file$4, 165, 16, 4861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*player*/ 1 && t_value !== (t_value = (/*player*/ ctx[0].mascot
    			? "Mascot of the"
    			: "Currently a member of the") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(165:12) {#if !isRIV && !isStars && !isUnknown }",
    		ctx
    	});

    	return block;
    }

    // (180:12) {:else}
    function create_else_block(ctx) {
    	let t_value = /*player*/ ctx[0]["team"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*player*/ 1 && t_value !== (t_value = /*player*/ ctx[0]["team"] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(180:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (178:12) {#if isRIV }
    function create_if_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Rest in Violence");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(178:12) {#if isRIV }",
    		ctx
    	});

    	return block;
    }

    // (187:8) {#if creditsText}
    function create_if_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "credits-info svelte-1dj22yq");
    			add_location(p, file$4, 187, 8, 5436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = /*creditsText*/ ctx[8];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*creditsText*/ 256) p.innerHTML = /*creditsText*/ ctx[8];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(187:8) {#if creditsText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let closebutton;
    	let t0;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let t1;
    	let t2;
    	let div0;
    	let h2;
    	let t3_value = /*player*/ ctx[0]["full-name"] + "";
    	let t3;
    	let t4;
    	let h3;
    	let t5;
    	let t6;
    	let p0;
    	let t7;
    	let t8;
    	let t9;
    	let p1;
    	let t10;
    	let a;
    	let t11_value = /*player*/ ctx[0]["full-name"] + "";
    	let t11;
    	let current;
    	closebutton = new CloseButton({ $$inline: true });
    	closebutton.$on("click", /*closeOverlay*/ ctx[10]);
    	let if_block0 = /*player*/ ctx[0].sprites.length > 1 && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*isRIV*/ ctx[3] && !/*isStars*/ ctx[4] && !/*isUnknown*/ ctx[5]) return create_if_block_2;
    		if (/*isUnknown*/ ctx[5]) return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*isRIV*/ ctx[3]) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1(ctx);
    	let if_block3 = /*creditsText*/ ctx[8] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(closebutton.$$.fragment);
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t3 = text(t3_value);
    			t4 = space();
    			h3 = element("h3");
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if_block2.c();
    			t6 = space();
    			p0 = element("p");
    			t7 = text(/*formerTeamsText*/ ctx[6]);
    			t8 = space();
    			if (if_block3) if_block3.c();
    			t9 = space();
    			p1 = element("p");
    			t10 = text("Wiki page: ");
    			a = element("a");
    			t11 = text(t11_value);

    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*player*/ ctx[0].size === "huge"
    			? "sprite peanutiel"
    			: "sprite") + " svelte-1dj22yq"));

    			if (img.src !== (img_src_value = "images/" + /*viewedSprite*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$4, 142, 4, 4230);
    			attr_dev(h2, "class", "name");
    			add_location(h2, file$4, 159, 8, 4705);
    			add_location(h3, file$4, 163, 8, 4786);
    			add_location(p0, file$4, 184, 8, 5370);
    			attr_dev(a, "href", /*wikiLink*/ ctx[7]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1dj22yq");
    			add_location(a, file$4, 193, 23, 5581);
    			attr_dev(p1, "class", "wiki-link svelte-1dj22yq");
    			add_location(p1, file$4, 192, 8, 5535);
    			attr_dev(div0, "class", "info");
    			add_location(div0, file$4, 158, 4, 4677);
    			attr_dev(div1, "class", "player-info svelte-1dj22yq");
    			add_location(div1, file$4, 135, 0, 4009);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(closebutton, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t3);
    			append_dev(div0, t4);
    			append_dev(div0, h3);
    			if (if_block1) if_block1.m(h3, null);
    			append_dev(h3, t5);
    			if_block2.m(h3, null);
    			append_dev(div0, t6);
    			append_dev(div0, p0);
    			append_dev(p0, t7);
    			append_dev(div0, t8);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t9);
    			append_dev(div0, p1);
    			append_dev(p1, t10);
    			append_dev(p1, a);
    			append_dev(a, t11);
    			/*div1_binding*/ ctx[12](div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*player*/ 1 && img_class_value !== (img_class_value = "" + (null_to_empty(/*player*/ ctx[0].size === "huge"
    			? "sprite peanutiel"
    			: "sprite") + " svelte-1dj22yq"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (!current || dirty & /*viewedSprite*/ 4 && img.src !== (img_src_value = "images/" + /*viewedSprite*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (/*player*/ ctx[0].sprites.length > 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*player*/ 1) && t3_value !== (t3_value = /*player*/ ctx[0]["full-name"] + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(h3, t5);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(h3, null);
    				}
    			}

    			if (!current || dirty & /*formerTeamsText*/ 64) set_data_dev(t7, /*formerTeamsText*/ ctx[6]);

    			if (/*creditsText*/ ctx[8]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$1(ctx);
    					if_block3.c();
    					if_block3.m(div0, t9);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if ((!current || dirty & /*player*/ 1) && t11_value !== (t11_value = /*player*/ ctx[0]["full-name"] + "")) set_data_dev(t11, t11_value);

    			if (!current || dirty & /*wikiLink*/ 128) {
    				attr_dev(a, "href", /*wikiLink*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(closebutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(closebutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(closebutton);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			if_block2.d();
    			if (if_block3) if_block3.d();
    			/*div1_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createCreditsText(creditsArray, team) {
    	if (!creditsArray) {
    		// No credit is listed
    		return;
    	}

    	let text = "Art inspired by ";

    	if (creditsArray[0]["text"] === "@hetreasky") {
    		text = "Design by ";
    	}

    	if (team === "Pandemonium Artists") {
    		text = "Blasesona of ";
    	}

    	const createLine = function (credit) {
    		if (credit["link"]) {
    			return `<a href="${credit["link"]}" target="_blank">${credit["text"]}</a>`;
    		} else {
    			return credit["text"];
    		}
    	};

    	if (creditsArray.length === 1) {
    		text += createLine(creditsArray[0]);
    	} else {
    		for (let i = 0; i < creditsArray.length - 1; i++) {
    			text += createLine(creditsArray[i]) + ", ";
    		}

    		if (creditsArray.length === 2) {
    			text = text.slice(0, -2);
    			text += " ";
    		} // remove comma when there's only two    

    		const lastCredit = creditsArray[creditsArray.length - 1];
    		text += " and " + createLine(lastCredit);
    	}

    	return text;
    }

    function createWikiLink(fullname) {
    	let urlname = fullname.replace(" ", "_");
    	return `https://www.blaseball.wiki/w/${urlname}`;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let isRIV;
    	let isStars;
    	let isUnknown;
    	let formerTeamsText;
    	let wikiLink;
    	let creditsText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayerInfo", slots, []);
    	let { player } = $$props;
    	let root; // The main player-info element
    	let viewedSprite = player.sprites[player["default-sprite"]];

    	function setPlayerSize() {
    		// Change the size variable according to assigned size
    		const playerSize = player.size;

    		root.style.setProperty("--player-size", `var(--size-${playerSize}`);

    		if (playerSize === "small") {
    			root.style.setProperty("--player-altscaling", "scale(2, 2)");
    		}

    		if (playerSize === "large") {
    			root.style.setProperty("--player-altscaling", "scale(1.5, 1.5)");
    		}
    	}

    	function createFormerTeamsText(player) {
    		const formerTeams = player["former-teams"].filter(team => team !== "RIV");

    		// Rest in Violence shouldn't be in the former team description (but should still filterable in the gallery)
    		let formerTeamsText = "";

    		if (formerTeams && formerTeams.length > 0) {
    			let teamsText = "";

    			if (formerTeams.length === 1) {
    				// Only in one team formerly? Just add it.
    				teamsText = "the " + formerTeams[0];
    			} else {
    				for (let i = 0; i < formerTeams.length - 1; i++) {
    					teamsText += "the " + formerTeams[i] + ", ";
    				}

    				if (formerTeams.length === 2) {
    					teamsText = teamsText.slice(0, -2);
    					teamsText += " ";
    				} // remove comma when there's only two    

    				teamsText += "and the " + formerTeams[formerTeams.length - 1];
    			}

    			formerTeamsText = `Formerly of ${teamsText}.`;
    		}

    		return formerTeamsText;
    	}

    	function viewSprite(sprite) {
    		$$invalidate(2, viewedSprite = sprite);
    	}

    	const navigate = useNavigate();

    	function closeOverlay(e) {
    		navigate("/");
    	}

    	onMount(() => {
    		setPlayerSize();
    	});

    	const writable_props = ["player"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerInfo> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (sprite, e) => viewSprite(sprite);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			root = $$value;
    			$$invalidate(1, root);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		useNavigate,
    		CloseButton,
    		player,
    		root,
    		viewedSprite,
    		setPlayerSize,
    		createFormerTeamsText,
    		createCreditsText,
    		createWikiLink,
    		viewSprite,
    		navigate,
    		closeOverlay,
    		isRIV,
    		isStars,
    		isUnknown,
    		formerTeamsText,
    		wikiLink,
    		creditsText
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    		if ("viewedSprite" in $$props) $$invalidate(2, viewedSprite = $$props.viewedSprite);
    		if ("isRIV" in $$props) $$invalidate(3, isRIV = $$props.isRIV);
    		if ("isStars" in $$props) $$invalidate(4, isStars = $$props.isStars);
    		if ("isUnknown" in $$props) $$invalidate(5, isUnknown = $$props.isUnknown);
    		if ("formerTeamsText" in $$props) $$invalidate(6, formerTeamsText = $$props.formerTeamsText);
    		if ("wikiLink" in $$props) $$invalidate(7, wikiLink = $$props.wikiLink);
    		if ("creditsText" in $$props) $$invalidate(8, creditsText = $$props.creditsText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*player*/ 1) {
    			$$invalidate(3, isRIV = player.team === "RIV");
    		}

    		if ($$self.$$.dirty & /*player*/ 1) {
    			$$invalidate(4, isStars = player.team === "Hall Stars");
    		}

    		if ($$self.$$.dirty & /*player*/ 1) {
    			$$invalidate(5, isUnknown = player.team === "Unknown");
    		}

    		if ($$self.$$.dirty & /*player*/ 1) {
    			$$invalidate(6, formerTeamsText = createFormerTeamsText(player));
    		}

    		if ($$self.$$.dirty & /*player*/ 1) {
    			$$invalidate(7, wikiLink = createWikiLink(player["full-name"]));
    		}

    		if ($$self.$$.dirty & /*player*/ 1) {
    			$$invalidate(8, creditsText = createCreditsText(player["credits"], player["team"]));
    		}
    	};

    	return [
    		player,
    		root,
    		viewedSprite,
    		isRIV,
    		isStars,
    		isUnknown,
    		formerTeamsText,
    		wikiLink,
    		creditsText,
    		viewSprite,
    		closeOverlay,
    		click_handler,
    		div1_binding
    	];
    }

    class PlayerInfo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { player: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerInfo",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[0] === undefined && !("player" in props)) {
    			console.warn("<PlayerInfo> was created without expected prop 'player'");
    		}
    	}

    	get player() {
    		throw new Error("<PlayerInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<PlayerInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Overlay.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$3 = "src\\components\\Overlay.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let playerinfo;
    	let current;
    	let mounted;
    	let dispose;

    	playerinfo = new PlayerInfo({
    			props: { player: /*player*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(playerinfo.$$.fragment);
    			attr_dev(div, "class", "overlay svelte-1n71et2");
    			add_location(div, file$3, 27, 0, 702);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(playerinfo, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickAnywhere*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const playerinfo_changes = {};
    			if (dirty & /*player*/ 1) playerinfo_changes.player = /*player*/ ctx[0];
    			playerinfo.$set(playerinfo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playerinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playerinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(playerinfo);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Overlay", slots, []);
    	let { player } = $$props;
    	const navigate = useNavigate();

    	function clickAnywhere(e) {
    		// Close the overlay (i.e. navigate to the main page) if the space outside the modal panel (i.e. the overlay underneath) is clicked
    		if (e.target.classList.contains("overlay")) {
    			navigate("/");
    		}
    	}

    	onMount(() => {
    		console.log(player);
    		document.body.style.overflowY = "hidden";
    	});

    	onDestroy(() => {
    		document.body.style.overflowY = "";
    	});

    	const writable_props = ["player"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		useNavigate,
    		PlayerInfo,
    		player,
    		navigate,
    		clickAnywhere
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, clickAnywhere];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { player: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[0] === undefined && !("player" in props)) {
    			console_1$1.warn("<Overlay> was created without expected prop 'player'");
    		}
    	}

    	get player() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\utils\TotopButton.svelte generated by Svelte v3.38.2 */

    const file$2 = "src\\components\\utils\\TotopButton.svelte";

    function create_fragment$2(ctx) {
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10");
    			add_location(path, file$2, 4, 4, 128);
    			attr_dev(svg, "class", "totop-button svg-icon svelte-1cvap1t");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "fill", "currentColor");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TotopButton", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TotopButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	return [click_handler];
    }

    class TotopButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TotopButton",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\utils\DarkModeToggle.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\components\\utils\\DarkModeToggle.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let input;
    	let t0;
    	let span0;
    	let t2;
    	let div0;
    	let span1;
    	let t3;
    	let span2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Light";
    			t2 = space();
    			div0 = element("div");
    			span1 = element("span");
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "Dark";
    			attr_dev(input, "id", "theme-toggle");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-1i1r3q2");
    			add_location(input, file$1, 20, 4, 436);
    			attr_dev(span0, "class", "light svelte-1i1r3q2");
    			add_location(span0, file$1, 21, 4, 505);
    			attr_dev(span1, "class", "svelte-1i1r3q2");
    			add_location(span1, file$1, 23, 8, 595);
    			attr_dev(div0, "class", "toggle svelte-1i1r3q2");
    			add_location(div0, file$1, 22, 4, 543);
    			attr_dev(span2, "class", "dark svelte-1i1r3q2");
    			add_location(span2, file$1, 25, 4, 626);
    			attr_dev(div1, "class", "theme-toggle-container svelte-1i1r3q2");
    			add_location(div1, file$1, 19, 0, 394);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[2](input);
    			append_dev(div1, t0);
    			append_dev(div1, span0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, span1);
    			append_dev(div1, t3);
    			append_dev(div1, span2);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*onToggle*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_binding*/ ctx[2](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DarkModeToggle", slots, []);
    	let toggler;
    	const dispatch = createEventDispatcher();

    	function onToggle(e) {
    		$$invalidate(0, toggler.checked = !toggler.checked, toggler);
    		dispatch("toggle");
    	}

    	onMount(() => {
    		if (window.localStorage.getItem("darkmode")) {
    			$$invalidate(0, toggler.checked = true, toggler);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DarkModeToggle> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			toggler = $$value;
    			$$invalidate(0, toggler);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		toggler,
    		dispatch,
    		onToggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggler" in $$props) $$invalidate(0, toggler = $$props.toggler);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toggler, onToggle, input_binding];
    }

    class DarkModeToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DarkModeToggle",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var PlayersData = [
    	{
    		index: 302,
    		id: "theodore-duende",
    		"full-name": "Theodore Duende",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    		],
    		sprites: [
    			"302TheodoreDuende.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 301,
    		id: "sparks-beans",
    		"full-name": "Sparks Beans",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    		],
    		sprites: [
    			"301SparksBeans.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/SharpibeesComms",
    				text: "@SharpibeesComms"
    			}
    		]
    	},
    	{
    		index: 300,
    		id: "ron-monstera",
    		"full-name": "Ron Monstera",
    		size: "large",
    		team: "RIV",
    		"former-teams": [
    			"Seattle Garages"
    		],
    		sprites: [
    			"300RonMonstera.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/beeeating",
    				text: "@beeeating"
    			}
    		]
    	},
    	{
    		index: 299,
    		id: "avila-guzman",
    		"full-name": "Avila Guzman",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    			"Seattle Garages",
    			"Miami Dale"
    		],
    		sprites: [
    			"299AvilaGuzman.png",
    			"299AvilaGuzmanALT.png",
    			"299AvilaGuzmanALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			},
    			{
    				link: "https://twitter.com/juangeedraws",
    				text: "@juangeedraws"
    			},
    			{
    				link: "https://twitter.com/_pysics",
    				text: "@_pysics"
    			}
    		]
    	},
    	{
    		index: 298,
    		id: "bevan-wise",
    		"full-name": "Bevan Wise",
    		size: "large",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    			"Yellowstone Magic"
    		],
    		sprites: [
    			"298BevanWise.png",
    			"298BevanWiseALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/graciedarts",
    				text: "@graciedarts"
    			}
    		]
    	},
    	{
    		index: 297,
    		id: "trinity-smaht",
    		"full-name": "Trinity Smaht",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    		],
    		sprites: [
    			"297TrinitySmaht.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 296,
    		id: "silvaire-semiquaver",
    		"full-name": "Silvaire Semiquaver",
    		size: "small",
    		team: "Tokyo Lift",
    		"former-teams": [
    		],
    		sprites: [
    			"296SilvaireSemiquaver.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/awhekate",
    				text: "@awhekate"
    			}
    		]
    	},
    	{
    		index: 295,
    		id: "jomgy-rolsenthal",
    		"full-name": "Jomgy Rolsenthal",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    			"Houston Spies"
    		],
    		sprites: [
    			"295JomgyRolsenthal.png",
    			"295JomgyRolsenthalALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/DedSec_Pony",
    				text: "@DedSec_Pony"
    			}
    		]
    	},
    	{
    		index: 294,
    		id: "morrow-wilson",
    		"full-name": "Morrow Wilson",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    			"Philly Pies",
    			"Houston Spies",
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"294MorrowWilson.png",
    			"294MorrowWilsonALT.png",
    			"294MorrowWilsonALT2.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://“Maluminse”",
    				text: "“Maluminse”"
    			}
    		]
    	},
    	{
    		index: 293,
    		id: "reese-clark",
    		"full-name": "Reese Clark",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    		],
    		sprites: [
    			"293ReeseClark.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "Insufferable Oracle"
    			},
    			{
    				link: "",
    				text: "Diff"
    			}
    		]
    	},
    	{
    		index: 292,
    		id: "denzel-scott",
    		"full-name": "Denzel Scott",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    		],
    		sprites: [
    			"292DenzelScott.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "Insufferable Oracle"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 291,
    		id: "uncle-plasma",
    		"full-name": "Uncle Plasma",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    			"New York Millennials"
    		],
    		sprites: [
    			"291UnclePlasma.png",
    			"291UnclePlasmaALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/andreastreeter",
    				text: "@andreastreeter"
    			}
    		]
    	},
    	{
    		index: 290,
    		id: "gabriel-griffith",
    		"full-name": "Gabriel Griffith",
    		size: "small",
    		team: "Chicago Firefighters",
    		"former-teams": [
    			"Dallas Steaks",
    			"Hawai'i Fridays",
    			"San Francisco Lovers",
    			"Hades Tigers"
    		],
    		sprites: [
    			"290GabrielGriffith.png",
    			"290GabrielGriffithALT.png",
    			"290GabrielGriffithALT2.png",
    			"290GabrielGriffithALT3.png",
    			"290GabrielGriffithALT4.png"
    		],
    		"default-sprite": 4,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 289,
    		id: "yurts-buttercup",
    		"full-name": "Yurts Buttercup",
    		size: "large",
    		team: "Atlantis Georgias",
    		"former-teams": [
    		],
    		sprites: [
    			"289YurtsButtercup.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/moliwogs",
    				text: "@moliwogs"
    			}
    		]
    	},
    	{
    		index: 288,
    		id: "simba-davis",
    		"full-name": "Simba Davis",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"288SimbaDavis.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 287,
    		id: "cedric-spliff",
    		"full-name": "Cedric Spliff",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    			"Seattle Garages"
    		],
    		sprites: [
    			"287CedricSpliff.png",
    			"287CedricSpliffALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 286,
    		id: "alston-cerveza",
    		"full-name": "Alston Cerveza",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"Philly Pies",
    			"Canada Moist Talkers",
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"286AlstonCerveza.png",
    			"286AlstonCervezaALT.png",
    			"286AlstonCervezaALT2.png",
    			"286AlstonCervezaALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/raevpet",
    				text: "@raevpet"
    			}
    		]
    	},
    	{
    		index: 285,
    		id: "ortiz-morse",
    		"full-name": "Ortiz Morse",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"285OrtizMorse.png",
    			"285OrtizMorseALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 284,
    		id: "elijah-bates",
    		"full-name": "Elijah Bates",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"284ElijahBates.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Spiral_Joe",
    				text: "@Spiral_Joe"
    			}
    		]
    	},
    	{
    		index: 283,
    		id: "bright-zimmerman",
    		"full-name": "Bright Zimmerman",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    			"Philly Pies",
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"283BrightZimmerman.png",
    			"283BrightZimmermanALT.png",
    			"283BrightZimmermanALT2.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 282,
    		id: "percival-wheeler",
    		"full-name": "Percival Wheeler",
    		size: "small",
    		team: "San Francisco Lovers",
    		"former-teams": [
    		],
    		sprites: [
    			"282PercivalWheeler.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/cari_guevara",
    				text: "@cari_guevara"
    			},
    			{
    				link: "https://twitter.com/Fancymancer",
    				text: "@Fancymancer"
    			}
    		]
    	},
    	{
    		index: 281,
    		id: "squid-galvanic",
    		"full-name": "Squid Galvanic",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    		],
    		sprites: [
    			"281SquidGalvanic.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/glassgoblin",
    				text: "@glassgoblin"
    			}
    		]
    	},
    	{
    		index: 280,
    		id: "atlas-guerra",
    		"full-name": "Atlas Guerra",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    			"Chicago Firefighters"
    		],
    		sprites: [
    			"280AtlasGuerra.png",
    			"280AtlasGuerraALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/necromngo",
    				text: "@necromngo"
    			}
    		]
    	},
    	{
    		index: 279,
    		id: "jolene-willowtree",
    		"full-name": "Jolene Willowtree",
    		size: "small",
    		team: "Core Mechanics",
    		"former-teams": [
    		],
    		sprites: [
    			"279JoleneWillowtree.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/patcat127",
    				text: "@patcat127"
    			}
    		]
    	},
    	{
    		index: 278,
    		id: "val-hitherto",
    		"full-name": "Val Hitherto",
    		size: "small",
    		team: "Tokyo Lift",
    		"former-teams": [
    		],
    		sprites: [
    			"278ValHitherto.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "livs#7310"
    			}
    		]
    	},
    	{
    		index: 277,
    		id: "dominic-woman",
    		"full-name": "Dominic Woman",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"277DominicWoman.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 276,
    		id: "matteo-triumphant",
    		"full-name": "Matteo Triumphant",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"276MatteoTriumphant.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/engulfingdream",
    				text: "@engulfingdream"
    			}
    		]
    	},
    	{
    		index: 275,
    		id: "alyssa-harrell",
    		"full-name": "Alyssa Harrell",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"Hades Tigers",
    			"New York Millennials",
    			"Yellowstone Magic",
    			"Hawai'i Fridays",
    			"Philly Pies"
    		],
    		sprites: [
    			"275AlyssaHarrell.png",
    			"275AlyssaHarrellALT.png",
    			"275AlyssaHarrellALT2.png",
    			"275AlyssaHarrellALT3.png",
    			"275AlyssaHarrellALT4.png",
    			"275AlyssaHarrellALT5.png"
    		],
    		"default-sprite": 5,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 274,
    		id: "theodore-holloway",
    		"full-name": "Theodore Holloway",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Houston Spies"
    		],
    		sprites: [
    			"274TheodoreHolloway.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/toxiclockwork",
    				text: "@toxiclockwork"
    			}
    		]
    	},
    	{
    		index: 273,
    		id: "malik-romayne",
    		"full-name": "Malik Romayne",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"273MalikRomayne.png",
    			"273MalikRomayneALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/SashaRoseHansen",
    				text: "@SashaRoseHansen"
    			}
    		]
    	},
    	{
    		index: 272,
    		id: "rhys-trombone",
    		"full-name": "Rhys Trombone",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"272RhysTrombone.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "Ephesos"
    			}
    		]
    	},
    	{
    		index: 271,
    		id: "velasquez-meadows",
    		"full-name": "Velasquez Meadows",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"271VelasquezMeadows.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/glassgoblin",
    				text: "@glassgoblin"
    			},
    			{
    				link: "https://twitter.com/_iznj",
    				text: "@_iznj"
    			}
    		]
    	},
    	{
    		index: 270,
    		id: "nora-perez",
    		"full-name": "Nora Perez",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"270NoraPerez.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/glassgoblin",
    				text: "@glassgoblin"
    			}
    		]
    	},
    	{
    		index: 269,
    		id: "pedro-davids",
    		"full-name": "Pedro Davids",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    		],
    		sprites: [
    			"269PedroDavids.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/glassgoblin",
    				text: "@glassgoblin"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 268,
    		id: "parker-parra",
    		"full-name": "Parker Parra",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"Boston Flowers"
    		],
    		sprites: [
    			"268ParkerParra.png",
    			"268ParkerParraALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Slagstorm",
    				text: "@Slagstorm"
    			},
    			{
    				link: "https://twitter.com/ratgills",
    				text: "@ratgills"
    			}
    		]
    	},
    	{
    		index: 267,
    		id: "finn-james",
    		"full-name": "Finn James",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    		],
    		sprites: [
    			"267FinnJames.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/ratgills",
    				text: "@ratgills"
    			}
    		]
    	},
    	{
    		index: 266,
    		id: "brock-forbes",
    		"full-name": "Brock Forbes",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"266BrockForbes.png",
    			"266BrockForbesALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/glassgoblin",
    				text: "@glassgoblin"
    			}
    		]
    	},
    	{
    		index: 265,
    		id: "lenny-marijuana",
    		"full-name": "Lenny Marijuana",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    			"Seattle Garages"
    		],
    		sprites: [
    			"265LennyMarijuana.png",
    			"265LennyMarijuanaALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/mermeag",
    				text: "@mermeag"
    			}
    		]
    	},
    	{
    		index: 264,
    		id: "mooney-doctor-ii",
    		"full-name": "Mooney Doctor II",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    		],
    		sprites: [
    			"264MooneyDoctorII.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/awhekate",
    				text: "@awhekate"
    			}
    		]
    	},
    	{
    		index: 263,
    		id: "jessi-wise",
    		"full-name": "Jessi Wise",
    		size: "large",
    		team: "RIV",
    		"former-teams": [
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"263JessiWise.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 262,
    		id: "karato-bean",
    		"full-name": "Karato Bean",
    		size: "small",
    		team: "San Francisco Lovers",
    		"former-teams": [
    			"Hawai'i Fridays",
    			"Houston Spies"
    		],
    		sprites: [
    			"262KaratoBean.png",
    			"262KaratoBeanALT.png",
    			"262KaratoBeanALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/qwoyle",
    				text: "@qwoyle"
    			}
    		]
    	},
    	{
    		index: 261,
    		id: "terrell-bradley",
    		"full-name": "Terrell Bradley",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Hawai'i Fridays",
    			"Yellowstone Magic"
    		],
    		sprites: [
    			"261TerrellBradley.png",
    			"261TerrellBradleyALT.png",
    			"261TerrellBradleyALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/qwoyle",
    				text: "@qwoyle"
    			}
    		]
    	},
    	{
    		index: 260,
    		id: "sam-solis",
    		"full-name": "Sam Solis",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"260SamSolis.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/qwoyle",
    				text: "@qwoyle"
    			}
    		]
    	},
    	{
    		index: 259,
    		id: "fitzgerald-massey",
    		"full-name": "Fitzgerald Massey",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"259FitzgeraldMassey.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 258,
    		id: "jenna-maldonado",
    		"full-name": "Jenna Maldonado",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Miami Dale"
    		],
    		sprites: [
    			"258JennaMaldonado.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/tywyso",
    				text: "@tywyso"
    			}
    		]
    	},
    	{
    		index: 257,
    		id: "eizabeth-elliott",
    		"full-name": "Eizabeth Elliott",
    		size: "small",
    		team: "Yellowstone Magic",
    		"former-teams": [
    		],
    		sprites: [
    			"257EizabethElliott.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/awhekate",
    				text: "@awhekate"
    			},
    			{
    				link: "https://twitter.com/hatfights_art",
    				text: "@hatfights_art"
    			}
    		]
    	},
    	{
    		index: 256,
    		id: "bonk-jokes",
    		"full-name": "Bonk Jokes",
    		size: "large",
    		team: "Yellowstone Magic",
    		"former-teams": [
    		],
    		sprites: [
    			"256BonkJokes.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hatfights_art",
    				text: "@hatfights_art"
    			}
    		]
    	},
    	{
    		index: 255,
    		id: "kevin-dudley",
    		"full-name": "Kevin Dudley",
    		size: "small",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    			"Philly Pies",
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"255KevinDudley.png",
    			"255KevinDudleyALT.png",
    			"255KevinDudleyALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/kyl_armstrong",
    				text: "@kyl_armstrong"
    			}
    		]
    	},
    	{
    		index: 254,
    		id: "fitzgerald-wanderlust",
    		"full-name": "Fitzgerald Wanderlust",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    			"LA Unlimited Tacos"
    		],
    		sprites: [
    			"254FitzgeraldWanderlust.png",
    			"254FitzgeraldWanderlustALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/annapullara",
    				text: "@annapullara"
    			}
    		]
    	},
    	{
    		index: 253,
    		id: "hobbs-cain",
    		"full-name": "Hobbs Cain",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Canada Moist Talkers",
    			"Philly Pies"
    		],
    		sprites: [
    			"253HobbsCain.png",
    			"253HobbsCainALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 252,
    		id: "jenkins-good",
    		"full-name": "Jenkins Good",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    		],
    		sprites: [
    			"252JenkinsGood.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/spiral_joe",
    				text: "@spiral_joe"
    			}
    		]
    	},
    	{
    		index: 251,
    		id: "jesús-koch",
    		"full-name": "Jesús Koch",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    		],
    		sprites: [
    			"251JesúsKoch.png",
    			"251JesúsKochALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			},
    			{
    				link: "https://twitter.com/MackinItHappen",
    				text: "@MackinItHappen"
    			}
    		]
    	},
    	{
    		index: 250,
    		id: "beans-mcblase",
    		"full-name": "Beans McBlase",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    		],
    		sprites: [
    			"250BeansMcBlase.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Spiral_Joe",
    				text: "@Spiral_Joe"
    			}
    		]
    	},
    	{
    		index: 249,
    		id: "ronan-jaylee",
    		"full-name": "Ronan Jaylee",
    		size: "small",
    		team: "Dallas Steaks",
    		"former-teams": [
    		],
    		sprites: [
    			"249RonanJaylee.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 248,
    		id: "sam-scandal",
    		"full-name": "Sam Scandal",
    		size: "small",
    		team: "Dallas Steaks",
    		"former-teams": [
    		],
    		sprites: [
    			"248SamScandal.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 247,
    		id: "kit-adamses",
    		"full-name": "Kit Adamses",
    		size: "small",
    		team: "Dallas Steaks",
    		"former-teams": [
    		],
    		sprites: [
    			"247KitAdamses.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 246,
    		id: "gallup-crueller",
    		"full-name": "Gallup Crueller",
    		size: "large",
    		team: "Dallas Steaks",
    		"former-teams": [
    		],
    		sprites: [
    			"246GallupCrueller.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/BearOverdrive",
    				text: "@BearOverdrive"
    			}
    		]
    	},
    	{
    		index: 245,
    		id: "greer-lott",
    		"full-name": "Greer Lott",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    		],
    		sprites: [
    			"245GreerLott.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Spiral_Joe",
    				text: "@Spiral_Joe"
    			}
    		]
    	},
    	{
    		index: 244,
    		id: "commissioner-vapor",
    		"full-name": "Commissioner Vapor",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    		],
    		sprites: [
    			"244CommissionerVapor.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MackinItHappen",
    				text: "@MackinItHappen"
    			}
    		]
    	},
    	{
    		index: 243,
    		id: "mooney-doctor",
    		"full-name": "Mooney Doctor",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    		],
    		sprites: [
    			"243MooneyDoctor.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 242,
    		id: "famous-owens",
    		"full-name": "Famous Owens",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"242FamousOwens.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/glassgoblin",
    				text: "@glassgoblin"
    			}
    		]
    	},
    	{
    		index: 241,
    		id: "randy-castillo",
    		"full-name": "Randy Castillo",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"241RandyCastillo.png",
    			"241RandyCastillo2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/CurseOfScots",
    				text: "@CurseOfScots"
    			},
    			{
    				link: "https://twitter.com/mnsoleart",
    				text: "@mnsoleart"
    			}
    		]
    	},
    	{
    		index: 240,
    		id: "paula-mason",
    		"full-name": "Paula Mason",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    			"Chicago Firefighters",
    			"Dallas Steaks",
    			"Seattle Garages"
    		],
    		sprites: [
    			"240PaulaMason.png",
    			"240PaulaMasonALT.png",
    			"240PaulaMasonALT2.png",
    			"240PaulaMasonALT3.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thatsushichick",
    				text: "@thatsushichick"
    			}
    		]
    	},
    	{
    		index: 239,
    		id: "alx-pineapple",
    		"full-name": "Alx Pineapple",
    		size: "small",
    		team: "Danger Zone",
    		"former-teams": [
    		],
    		sprites: [
    			"239AlxPineapple.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 238,
    		id: "declan-suzanne",
    		"full-name": "Declan Suzanne",
    		size: "small",
    		team: "Chicago Firefighters",
    		"former-teams": [
    		],
    		sprites: [
    			"238DeclanSuzanne.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 237,
    		id: "montgomery-bullock",
    		"full-name": "Montgomery Bullock",
    		size: "xlarge",
    		team: "Atlantis Georgias",
    		"former-teams": [
    			"Baltimore Crabs",
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"237MontgomeryBullock.png",
    			"237MontgomeryBullockALT.png",
    			"237MontgomeryBullockALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 236,
    		id: "zi-delacruz",
    		"full-name": "Zi Delacruz",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Dallas Steaks"
    		],
    		sprites: [
    			"236ZiDelacruz.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 235,
    		id: "bevan-underbuck",
    		"full-name": "Bevan Underbuck",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"Breckenridge Jazz Hands",
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"235BevanUnderbuck.png",
    			"235BevanUnderbuckALT.png",
    			"235BevanUnderbuckALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/ChezForShire",
    				text: "@ChezForShire"
    			}
    		]
    	},
    	{
    		index: 234,
    		id: "mclaughlin-scorpler",
    		"full-name": "McLaughlin Scorpler",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"New York Millennials",
    			"Hades Tigers"
    		],
    		sprites: [
    			"234McLaughlinScorpler.png",
    			"234McLaughlinScorplerALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/rabbit_traps",
    				text: "@rabbit_traps"
    			},
    			{
    				link: "https://twitter.com/snafubravado",
    				text: "@snafubravado"
    			}
    		]
    	},
    	{
    		index: 233,
    		id: "charlatan-seabright",
    		"full-name": "Charlatan Seabright",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    		],
    		sprites: [
    			"233CharlatanSeabright.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/BeedropsArt",
    				text: "@BeedropsArt"
    			},
    			{
    				link: "https://twitter.com/scandIeous",
    				text: "@scandIeous"
    			}
    		]
    	},
    	{
    		index: 232,
    		id: "richardson-games",
    		"full-name": "Richardson Games",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    			"New York Millennials"
    		],
    		sprites: [
    			"232RichardsonGames.png",
    			"232RichardsonGamesALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 231,
    		id: "theodore-cervantes",
    		"full-name": "Theodore Cervantes",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    		],
    		sprites: [
    			"231TheodoreCervantes.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Fancymancer",
    				text: "@Fancymancer"
    			}
    		]
    	},
    	{
    		index: 230,
    		id: "wesley-dudley",
    		"full-name": "Wesley Dudley",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"New York Millennials"
    		],
    		sprites: [
    			"230WesleyDudley.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 229,
    		id: "andrew-solis",
    		"full-name": "Andrew Solis",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    			"Houston Spies"
    		],
    		sprites: [
    			"229AndrewSolis.png",
    			"229AndrewSolisALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mermeag",
    				text: "@mermeag"
    			}
    		]
    	},
    	{
    		index: 228,
    		id: "ren-hunter",
    		"full-name": "Ren Hunter",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"228RenHunter.png",
    			"228RenHunterALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/lizzybutt",
    				text: "@lizzybutt"
    			}
    		]
    	},
    	{
    		index: 227,
    		id: "schneider-bendie",
    		"full-name": "Schneider Bendie",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    			"Boston Flowers"
    		],
    		sprites: [
    			"227SchneiderBendie.png",
    			"227SchneiderBendieALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mermeag",
    				text: "@mermeag"
    			}
    		]
    	},
    	{
    		index: 226,
    		id: "hendricks-richardson",
    		"full-name": "Hendricks Richardson",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    			"Breckenridge Jazz Hands"
    		],
    		sprites: [
    			"226HendricksRichardson.png",
    			"226HendricksRichardsonALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Krasi_Savov",
    				text: "@Krasi_Savov"
    			}
    		]
    	},
    	{
    		index: 225,
    		id: "miguel-james",
    		"full-name": "Miguel James",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"225MiguelJames.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Krasi_Savov",
    				text: "@Krasi_Savov"
    			}
    		]
    	},
    	{
    		index: 224,
    		id: "zack-sanders",
    		"full-name": "Zack Sanders",
    		size: "xlarge",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"224ZackSanders.png",
    			"224ZackSanders2.png",
    			"224ZackSandersALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/karagna_",
    				text: "@karagna_"
    			},
    			{
    				link: "https://twitter.com/voidteatime",
    				text: "@voidteatime"
    			}
    		]
    	},
    	{
    		index: 223,
    		id: "collins-melon",
    		"full-name": "Collins Melon",
    		size: "small",
    		team: "Breckenridge Jazz Hands",
    		"former-teams": [
    			"Houston Spies"
    		],
    		sprites: [
    			"223CollinsMelon.png",
    			"223CollinsMelonALT.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 222,
    		id: "beasley-day",
    		"full-name": "Beasley Day",
    		size: "small",
    		team: "Philly Pies",
    		"former-teams": [
    		],
    		sprites: [
    			"222BeasleyDay.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "Sunny"
    			}
    		]
    	},
    	{
    		index: 221,
    		id: "donia-bailey",
    		"full-name": "Donia Bailey",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    		],
    		sprites: [
    			"221DoniaBailey.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/crikadelic",
    				text: "@crikadelic"
    			}
    		]
    	},
    	{
    		index: 220,
    		id: "polkadot-patterson",
    		"full-name": "PolkaDot Patterson",
    		size: "small",
    		team: "Core Mechanics",
    		"former-teams": [
    			"Kansas City Breath Mints",
    			"Baltimore Crabs",
    			"Core Mechanics",
    			"Canada Moist Talkers",
    			"Dallas Steaks"
    		],
    		sprites: [
    			"220PolkaDotPatterson.png",
    			"220PolkaDotPattersonALT.png",
    			"220PolkaDotPattersonALT1.png",
    			"220PolkaDotPattersonALT3.png",
    			"220PolkaDotPattersonALT4.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 219,
    		id: "grollis-zephyr",
    		"full-name": "Grollis Zephyr",
    		size: "small",
    		team: "Tokyo Lift",
    		"former-teams": [
    		],
    		sprites: [
    			"219GrollisZephyr.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/alienmandy_",
    				text: "@alienmandy_"
    			},
    			{
    				link: "https://twitter.com/MaybeAMako",
    				text: "@MaybeAMako"
    			}
    		]
    	},
    	{
    		index: 218,
    		id: "lotus-mango",
    		"full-name": "Lotus Mango",
    		size: "huge",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Tokyo Lift"
    		],
    		sprites: [
    			"218LotusMango.png",
    			"218LotusMangoALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/MaybeAMako",
    				text: "@MaybeAMako"
    			}
    		]
    	},
    	{
    		index: 217,
    		id: "velasquez-alstott",
    		"full-name": "Velasquez Alstott",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"217VelasquezAlstott.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/FinelCountDan",
    				text: "@FinelCountDan"
    			}
    		]
    	},
    	{
    		index: 216,
    		id: "snyder-briggs",
    		"full-name": "Snyder Briggs",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"216SnyderBriggs.png",
    			"216SnyderBriggs2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/DomLiotti",
    				text: "@DomLiotti"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 215,
    		id: "blankenship-fischer",
    		"full-name": "Blankenship Fischer",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"215BlankenshipFischer.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 214,
    		id: "matteo-prestige",
    		"full-name": "Matteo Prestige",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"214MatteoPrestige.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/shenaniglenn",
    				text: "@shenaniglenn"
    			}
    		]
    	},
    	{
    		index: 213,
    		id: "sebastian-woodman",
    		"full-name": "Sebastian Woodman",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"213SebastianWoodman.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/starfauna",
    				text: "@starfauna"
    			}
    		]
    	},
    	{
    		index: 212,
    		id: "sebastian-townsend",
    		"full-name": "Sebastian Townsend",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"212SebastianTownsend.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/starfauna",
    				text: "@starfauna"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 211,
    		id: "stijn-strongbody",
    		"full-name": "Stijn Strongbody",
    		size: "small",
    		team: "Tokyo Lift",
    		"former-teams": [
    		],
    		sprites: [
    			"211StijnStrongbody.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 210,
    		id: "curry-aliciakeyes",
    		"full-name": "Curry Aliciakeyes",
    		size: "small",
    		team: "Yellowstone Magic",
    		"former-teams": [
    		],
    		sprites: [
    			"210CurryAliciakeyes.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/graciedarts",
    				text: "@graciedarts"
    			}
    		]
    	},
    	{
    		index: 209,
    		id: "sutton-picklestein",
    		"full-name": "Sutton Picklestein",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Yellowstone Magic",
    			"Boston Flowers",
    			"Kansas City Breath Mints"
    		],
    		sprites: [
    			"209SuttonPicklestein.png",
    			"209SuttonPicklesteinALT.png",
    			"209SuttonPicklesteinALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/justmako",
    				text: "@justmako"
    			}
    		]
    	},
    	{
    		index: 208,
    		id: "dunn-keyes",
    		"full-name": "Dunn Keyes",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    		],
    		sprites: [
    			"208DunnKeyes.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "Coblin#8694"
    			}
    		]
    	},
    	{
    		index: 207,
    		id: "nic-winkler",
    		"full-name": "Nic Winkler",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    		],
    		sprites: [
    			"207NicWinkler.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 206,
    		id: "chambers-simmons",
    		"full-name": "Chambers Simmons",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    		],
    		sprites: [
    			"206ChambersSimmons.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 205,
    		id: "glabe-moon",
    		"full-name": "Glabe Moon",
    		size: "large",
    		team: "Boston Flowers",
    		"former-teams": [
    			"New York Millennials"
    		],
    		sprites: [
    			"205GlabeMoon.png",
    			"205GlabeMoonALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fairy_calico",
    				text: "@fairy_calico"
    			}
    		]
    	},
    	{
    		index: 204,
    		id: "oliver-mueller",
    		"full-name": "Oliver Mueller",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    		],
    		sprites: [
    			"204OliverMueller.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "dead#0236"
    			}
    		]
    	},
    	{
    		index: 203,
    		id: "tot-clark",
    		"full-name": "Tot Clark",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    		],
    		sprites: [
    			"203TotClark.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/CallofDuckies",
    				text: "@CallofDuckies"
    			}
    		]
    	},
    	{
    		index: 202,
    		id: "greer-gwiffin",
    		"full-name": "Greer Gwiffin",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    			"Seattle Garages",
    			"Hawai'i Fridays",
    			"LA Unlimited Tacos"
    		],
    		sprites: [
    			"202GreerGwiffin.png",
    			"202GreerGwiffinALT.png",
    			"202GreerGwiffinALT2.png",
    			"202GreerGwiffinALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 201,
    		id: "goodwin-morin",
    		"full-name": "Goodwin Morin",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    			"Seattle Garages",
    			"Tokyo Lift"
    		],
    		sprites: [
    			"201GoodwinMorin.png",
    			"201GoodwinMorinALT.png",
    			"201GoodwinMorinALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/_Lizstar_",
    				text: "@_Lizstar_"
    			},
    			{
    				link: "https://twitter.com/electronicbeth",
    				text: "@electronicbeth"
    			}
    		]
    	},
    	{
    		index: 200,
    		id: "lachlan-shelton",
    		"full-name": "Lachlan Shelton",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"200LachlanShelton.png",
    			"200LachlanSheltonALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 199,
    		id: "antonio-wallace",
    		"full-name": "Antonio Wallace",
    		size: "large",
    		team: "RIV",
    		"former-teams": [
    			"Charleston Shoe Thieves",
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"199AntonioWallace.png",
    			"199AntonioWallaceALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/kyl_armstrong",
    				text: "@kyl_armstrong"
    			}
    		]
    	},
    	{
    		index: 198,
    		id: "eugenia-garbage",
    		"full-name": "Eugenia Garbage",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"198EugeniaGarbage.png",
    			"198EugeniaGarbageALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/AlyssaLMPenney",
    				text: "@AlyssaLMPenney"
    			}
    		]
    	},
    	{
    		index: 197,
    		id: "simon-haley",
    		"full-name": "Simon Haley",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"197SimonHaley.png",
    			"197SimonHaleyALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 196,
    		id: "ayanna-dumpington",
    		"full-name": "Ayanna Dumpington",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    			"Tokyo Lift"
    		],
    		sprites: [
    			"196AyannaDumpington.png",
    			"196AyannaDumpingtonALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 195,
    		id: "durham-spaceman",
    		"full-name": "Durham Spaceman",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    		],
    		sprites: [
    			"195DurhamSpaceman.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "cobaltkicks#4857"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 194,
    		id: "baldwin-breadwinner",
    		"full-name": "Baldwin Breadwinner",
    		size: "small",
    		team: "Hawai'i Fridays",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"Hawai'i Fridays",
    			"Baltimore Crabs",
    			"Miami Dale"
    		],
    		sprites: [
    			"194BaldwinBreadwinner.png",
    			"194BaldwinBreadwinnerALT.png",
    			"194BaldwinBreadwinnerALT2.png",
    			"194BaldwinBreadwinnerALT3.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/ConcordForge",
    				text: "@ConcordForge"
    			}
    		]
    	},
    	{
    		index: 193,
    		id: "wyatt-owens",
    		"full-name": "Wyatt Owens",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    			"LA Unlimited Tacos"
    		],
    		sprites: [
    			"193WyattOwens.png",
    			"193WyattOwensALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mito_underscore",
    				text: "@mito_underscore"
    			}
    		]
    	},
    	{
    		index: 192,
    		id: "basilio-mason",
    		"full-name": "Basilio Mason",
    		size: "small",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    		],
    		sprites: [
    			"192BasilioMason.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/snafubravado",
    				text: "@snafubravado"
    			}
    		]
    	},
    	{
    		index: 191,
    		id: "wyatt-glover",
    		"full-name": "Wyatt Glover",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"Yellowstone Magic"
    		],
    		sprites: [
    			"191WyattGlover.png",
    			"191WyattGloverALT.png",
    			"191WyattGloverALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 190,
    		id: "moses-mason",
    		"full-name": "Moses Mason",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"Boston Flowers"
    		],
    		sprites: [
    			"190MosesMason.png",
    			"190MosesMasonALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "flickerfae#1135"
    			}
    		]
    	},
    	{
    		index: 189,
    		id: "natha-kath",
    		"full-name": "Natha Kath",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"LA Unlimited Tacos"
    		],
    		sprites: [
    			"189NathaKath.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 188,
    		id: "frasier-shmurmgle",
    		"full-name": "Frasier Shmurmgle",
    		size: "large",
    		team: "RIV",
    		"former-teams": [
    			"Hades Tigers"
    		],
    		sprites: [
    			"188FrasierShmurmgle.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/juangeedraws",
    				text: "@juangeedraws"
    			}
    		]
    	},
    	{
    		index: 187,
    		id: "caleb-novak",
    		"full-name": "Caleb Novak",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    		],
    		sprites: [
    			"187CalebNovak.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 186,
    		id: "eugenia-bickle",
    		"full-name": "Eugenia Bickle",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"186EugeniaBickle.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/SashaRoseHansen",
    				text: "@SashaRoseHansen"
    			}
    		]
    	},
    	{
    		index: 185,
    		id: "henry-marshallow",
    		"full-name": "Henry Marshallow",
    		size: "small",
    		team: "Philly Pies",
    		"former-teams": [
    			"Seattle Garages"
    		],
    		sprites: [
    			"185HenryMarshallow.png",
    			"185HenryMarshallowALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/HenryMarshallow",
    				text: "@HenryMarshallow"
    			}
    		]
    	},
    	{
    		index: 184,
    		id: "kennedy-rodgers",
    		"full-name": "Kennedy Rodgers",
    		size: "small",
    		team: "Chicago Firefighters",
    		"former-teams": [
    			"Mexico City Wild Wings"
    		],
    		sprites: [
    			"184KennedyRodgers.png",
    			"184KennedyRodgersALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3addrag",
    				text: "@thr33h3addrag"
    			}
    		]
    	},
    	{
    		index: 183,
    		id: "jose-haley",
    		"full-name": "Jose Haley",
    		size: "small",
    		team: "Chicago Firefighters",
    		"former-teams": [
    			"Mexico City Wild Wings"
    		],
    		sprites: [
    			"183JoseHaley.png",
    			"183JoseHaleyALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3addrag",
    				text: "@thr33h3addrag"
    			}
    		]
    	},
    	{
    		index: 182,
    		id: "adkins-gwiffin",
    		"full-name": "Adkins Gwiffin",
    		size: "huge",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"182AdkinsGwiffin.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 181,
    		id: "case-sports",
    		"full-name": "Case Sports",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Mexico City Wild Wings"
    		],
    		sprites: [
    			"181CaseSports.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 180,
    		id: "rafael-davids",
    		"full-name": "Rafael Davids",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"180RafaelDavids.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 179,
    		id: "mullen-peterson",
    		"full-name": "Mullen Peterson",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    			"Chicago Firefighters",
    			"Mexico City Wild Wings"
    		],
    		sprites: [
    			"179MullenPeterson.png",
    			"179MullenPetersonALT.png",
    			"179MullenPetersonALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/sublimemarch",
    				text: "@sublimemarch"
    			}
    		]
    	},
    	{
    		index: 178,
    		id: "burke-gonzales",
    		"full-name": "Burke Gonzales",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"178BurkeGonzales.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 177,
    		id: "ronan-combs",
    		"full-name": "Ronan Combs",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"177RonanCombs.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3addrag",
    				text: "@thr33h3addrag"
    			}
    		]
    	},
    	{
    		index: 176,
    		id: "yong-wright",
    		"full-name": "Yong Wright",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"176YongWright.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3addrag",
    				text: "@thr33h3addrag"
    			}
    		]
    	},
    	{
    		index: 175,
    		id: "fran-beans",
    		"full-name": "Fran Beans",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"175FranBeans.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3addrag",
    				text: "@thr33h3addrag"
    			}
    		]
    	},
    	{
    		index: 174,
    		id: "lawrence-horne",
    		"full-name": "Lawrence Horne",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Mexico City Wild Wings"
    		],
    		sprites: [
    			"174LawrenceHorne.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3ad3ddrag",
    				text: "@thr33h3ad3ddrag"
    			}
    		]
    	},
    	{
    		index: 173,
    		id: "brock-watson",
    		"full-name": "Brock Watson",
    		size: "large",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"173BrockWatson.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 172,
    		id: "igneus-delacruz",
    		"full-name": "Igneus Delacruz",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"172IgneusDelacruz.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Karagna_",
    				text: "@Karagna_"
    			}
    		]
    	},
    	{
    		index: 171,
    		id: "rat-mason",
    		"full-name": "Rat Mason",
    		size: "small",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    		],
    		sprites: [
    			"171RatMason.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 170,
    		id: "vito-kravitz",
    		"full-name": "Vito Kravitz",
    		size: "small",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    			"Boston Flowers"
    		],
    		sprites: [
    			"170VitoKravitz.png",
    			"170VitoKravitzALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 169,
    		id: "freemium-seraph",
    		"full-name": "Freemium Seraph",
    		size: "large",
    		team: "Tokyo Lift",
    		"former-teams": [
    		],
    		sprites: [
    			"169FreemiumSeraph.png",
    			"169FreemiumSeraph2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/starfauna",
    				text: "@starfauna"
    			},
    			{
    				link: "https://twitter.com/MaybeAMako",
    				text: "@MaybeAMako"
    			}
    		]
    	},
    	{
    		index: 168,
    		id: "cedric-gonzalez",
    		"full-name": "Cedric Gonzalez",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Philly Pies"
    		],
    		sprites: [
    			"168CedricGonzalez.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 167,
    		id: "summers-preston",
    		"full-name": "Summers Preston",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"167SummersPreston.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 166,
    		id: "sosa-elftower",
    		"full-name": "Sosa Elftower",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Yellowstone Magic"
    		],
    		sprites: [
    			"166SosaElftower.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 165,
    		id: "scores-baserunner",
    		"full-name": "Scores Baserunner",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    		],
    		sprites: [
    			"165ScoresBaserunner.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://alangdorf.tumblr.com",
    				text: "alangdorf"
    			}
    		]
    	},
    	{
    		index: 164,
    		id: "nerd-pacheco",
    		"full-name": "Nerd Pacheco",
    		size: "small",
    		team: "Philly Pies",
    		"former-teams": [
    			"Hellmouth Sunbeams",
    			"Hades Tigers"
    		],
    		sprites: [
    			"164NerdPacheco.png",
    			"164NerdPachecoALT.png",
    			"164NerdPachecoALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/Karagna_",
    				text: "@Karagna_"
    			}
    		]
    	},
    	{
    		index: 163,
    		id: "sutton-bishop",
    		"full-name": "Sutton Bishop",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"163SuttonBishop.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/churgalax",
    				text: "@churgalax"
    			}
    		]
    	},
    	{
    		index: 162,
    		id: "sandoval-crossing",
    		"full-name": "Sandoval Crossing",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"162SandovalCrossing.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/proximart0",
    				text: "@proximart0"
    			}
    		]
    	},
    	{
    		index: 161,
    		id: "dudley-mueller",
    		"full-name": "Dudley Mueller",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"161DudleyMueller.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/larkiiiine",
    				text: "@larkiiiine"
    			},
    			{
    				link: "https://twitter.com/karagna_",
    				text: "@karagna_"
    			}
    		]
    	},
    	{
    		index: 160,
    		id: "usurper-violet",
    		"full-name": "Usurper Violet",
    		size: "large",
    		team: "Philly Pies",
    		"former-teams": [
    			"Hades Tigers"
    		],
    		sprites: [
    			"160UsurperViolet.png",
    			"160UsurperVioletALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			},
    			{
    				link: "https://twitter.com/juangeedraws",
    				text: "@juangeedraws"
    			}
    		]
    	},
    	{
    		index: 159,
    		id: "ren-morin",
    		"full-name": "Ren Morin",
    		size: "large",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"159RenMorin.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Sphr_AM",
    				text: "@Sphr_AM"
    			}
    		]
    	},
    	{
    		index: 158,
    		id: "paula-turnip",
    		"full-name": "Paula Turnip",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    			"Seattle Garages"
    		],
    		sprites: [
    			"158PaulaTurnip.png",
    			"158PaulaTurnipALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/mossbabe_",
    				text: "@mossbabe_"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 157,
    		id: "mummy-melcon",
    		"full-name": "Mummy Melcon",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"157MummyMelcon.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/juangeedraws",
    				text: "@juangeedraws"
    			}
    		]
    	},
    	{
    		index: 156,
    		id: "patel-beyonce",
    		"full-name": "Patel Beyonce",
    		size: "small",
    		team: "Dallas Steaks",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"THE SHELLED ONE'S PODS"
    		],
    		sprites: [
    			"156PatelBeyonce.png",
    			"156PatelBeyonceALT.png",
    			"156PatelBeyonceALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/annapullara",
    				text: "@annapullara"
    			}
    		]
    	},
    	{
    		index: 155,
    		id: "francisca-sasquatch",
    		"full-name": "Francisca Sasquatch",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"THE SHELLED ONE'S PODS"
    		],
    		sprites: [
    			"155FranciscaSasquatch.png",
    			"155FranciscaSasquatchALT.png",
    			"155FranciscaSasquatchALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 154,
    		id: "mcdowell-mason",
    		"full-name": "McDowell Mason",
    		size: "small",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    		],
    		sprites: [
    			"154McDowellMason.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 153,
    		id: "aldon-cashmoney",
    		"full-name": "Aldon Cashmoney",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    			"Breckenridge Jazz Hands",
    			"Hawai'i Fridays",
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"153AldonCashmoney.png",
    			"153AldonCashmoneyALT.png",
    			"153AldonCashmoneyALT2.png",
    			"153AldonCashmoneyALT3.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/skelebells",
    				text: "@skelebells"
    			}
    		]
    	},
    	{
    		index: 152,
    		id: "scrap-murphy",
    		"full-name": "Scrap Murphy",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"New York Millennials"
    		],
    		sprites: [
    			"152ScrapMurphy.png",
    			"152ScrapMurphyALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "wormtongue"
    			}
    		]
    	},
    	{
    		index: 151,
    		id: "sebastian-sunshine",
    		"full-name": "Sebastian Sunshine",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"151SebastianSunshine.png",
    			"151SebastianSunshineALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/CocacolaGarlic",
    				text: "@CocacolaGarlic"
    			}
    		]
    	},
    	{
    		index: 150,
    		id: "morrow-doyle",
    		"full-name": "Morrow Doyle",
    		size: "xlarge",
    		team: "Hall Stars",
    		"former-teams": [
    			"Charleston Shoe Thieves",
    			"Boston Flowers"
    		],
    		sprites: [
    			"150MorrowDoyle.png",
    			"150MorrowDoyleALT.png",
    			"150MorrowDoyleALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 149,
    		id: "tyreek-olive",
    		"full-name": "Tyreek Olive",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Chicago Firefighters"
    		],
    		sprites: [
    			"149TyreekOlive.png",
    			"149TyreekOliveALT.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 148,
    		id: "dunlap-figueroa",
    		"full-name": "Dunlap Figueroa",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    			"Chicago Firefighters"
    		],
    		sprites: [
    			"148DunlapFigueroa.png",
    			"148DunlapFigueroaALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Gatrdile",
    				text: "@Gatrdile"
    			}
    		]
    	},
    	{
    		index: 147,
    		id: "hiroto-wilcox",
    		"full-name": "Hiroto Wilcox",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Hades Tigers"
    		],
    		sprites: [
    			"147HirotoWilcox.png",
    			"147HirotoWilcoxALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/crikadelic",
    				text: "@crikadelic"
    			}
    		]
    	},
    	{
    		index: 146,
    		id: "nagomi-meng",
    		"full-name": "Nagomi Meng",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"146NagomiMeng.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/RedBirdRabbit",
    				text: "@RedBirdRabbit"
    			}
    		]
    	},
    	{
    		index: 145,
    		id: "moody-cookbook",
    		"full-name": "Moody Cookbook",
    		size: "large",
    		team: "RIV",
    		"former-teams": [
    			"Hades Tigers"
    		],
    		sprites: [
    			"145MoodyCookbook.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 144,
    		id: "combs-duende",
    		"full-name": "Combs Duende",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"144CombsDuende.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Shiraffetopus",
    				text: "@Shiraffetopus"
    			}
    		]
    	},
    	{
    		index: 143,
    		id: "silvaire-roadhouse",
    		"full-name": "Silvaire Roadhouse",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"143SilvaireRoadhouse.png",
    			"143SilvaireRoadhouseALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/toasthaste",
    				text: "@toasthaste"
    			}
    		]
    	},
    	{
    		index: 142,
    		id: "kennedy-loser",
    		"full-name": "Kennedy Loser",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    		],
    		sprites: [
    			"142KennedyLoser.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 141,
    		id: "sutton-dreamy",
    		"full-name": "Sutton Dreamy",
    		size: "small",
    		team: "Hawai'i Fridays",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"141SuttonDreamy.png",
    			"141SuttonDreamyALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/kayleerowena",
    				text: "@kayleerowena"
    			}
    		]
    	},
    	{
    		index: 140,
    		id: "grey-alvarado",
    		"full-name": "Grey Alvarado",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    		],
    		sprites: [
    			"140GreyAlvarado.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 139,
    		id: "forrest-bookbaby",
    		"full-name": "Forrest Bookbaby",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Charleston Shoe Thieves",
    			"Philly Pies"
    		],
    		sprites: [
    			"139ForrestBookbaby.png",
    			"139ForrestBookbabyALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/raevpet",
    				text: "@raevpet"
    			}
    		]
    	},
    	{
    		index: 138,
    		id: "kennedy-meh",
    		"full-name": "Kennedy Meh",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"138KennedyMeh.png",
    			"138KennedyMehALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Lucacrafts",
    				text: "@Lucacrafts"
    			}
    		]
    	},
    	{
    		index: 137,
    		id: "socks-maybe",
    		"full-name": "Socks Maybe",
    		size: "small",
    		team: "Chicago Firefighters",
    		"former-teams": [
    		],
    		sprites: [
    			"137SocksMaybe.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 136,
    		id: "oscar-dollie",
    		"full-name": "Oscar Dollie",
    		size: "large",
    		team: "Yellowstone Magic",
    		"former-teams": [
    		],
    		sprites: [
    			"136OscarDollie.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 135,
    		id: "nandy-fantastic",
    		"full-name": "Nandy Fantastic",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    		],
    		sprites: [
    			"135NandyFantastic.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 134,
    		id: "betsy-trombone",
    		"full-name": "Betsy Trombone",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Philly Pies"
    		],
    		sprites: [
    			"134BetsyTrombone.png",
    			"134BetsyTromboneALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "cassiterine"
    			}
    		]
    	},
    	{
    		index: 133,
    		id: "valentine-games",
    		"full-name": "Valentine Games",
    		size: "small",
    		team: "Hawai'i Fridays",
    		"former-teams": [
    			"Baltimore Crabs",
    			"Breckenridge Jazz Hands",
    			"New York Millennials",
    			"Houston Spies",
    			"LA Unlimited Tacos"
    		],
    		sprites: [
    			"133ValentineGames.png",
    			"133ValentineGamesALT.png",
    			"133ValentineGamesALT2.png",
    			"133ValentineGamesALT3.png",
    			"133ValentineGamesALT4.png",
    			"133ValentineGamesALT5.png"
    		],
    		"default-sprite": 5,
    		credits: [
    			{
    				link: "https://twitter.com/deerstained",
    				text: "@deerstained"
    			}
    		]
    	},
    	{
    		index: 132,
    		id: "emmett-internet",
    		"full-name": "Emmett Internet",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"132EmmettInternet.png",
    			"132EmmettInternetALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/churgalax",
    				text: "@churgalax"
    			}
    		]
    	},
    	{
    		index: 131,
    		id: "walton-sports",
    		"full-name": "Walton Sports",
    		size: "small",
    		team: "Breckenridge Jazz Hands",
    		"former-teams": [
    		],
    		sprites: [
    			"131WaltonSports.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "rocketknife"
    			}
    		]
    	},
    	{
    		index: 130,
    		id: "paul-barnes",
    		"full-name": "Paul Barnes",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"130PaulBarnes.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 129,
    		id: "miguel-javier",
    		"full-name": "Miguel Javier",
    		size: "large",
    		team: "RIV",
    		"former-teams": [
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"129MiguelJavier.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 128,
    		id: "hiroto-cerna",
    		"full-name": "Hiroto Cerna",
    		size: "large",
    		team: "Boston Flowers",
    		"former-teams": [
    		],
    		sprites: [
    			"128HirotoCerna.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/anarcourier",
    				text: "@anarcourier"
    			},
    			{
    				link: "https://twitter.com/annapullara",
    				text: "@annapullara"
    			}
    		]
    	},
    	{
    		index: 127,
    		id: "lenny-spruce",
    		"full-name": "Lenny Spruce",
    		size: "large",
    		team: "Boston Flowers",
    		"former-teams": [
    			"Kansas City Breath Mints"
    		],
    		sprites: [
    			"127LennySpruce.png",
    			"127LennySpruceALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "",
    				text: "RealHaman"
    			}
    		]
    	},
    	{
    		index: 126,
    		id: "evelton-mcblase-ii",
    		"full-name": "Evelton McBlase II",
    		size: "small",
    		team: "Core Mechanics",
    		"former-teams": [
    			"Houston Spies",
    			"Hawai'i Fridays",
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"126EveltonMcBlaseII.png",
    			"126EveltonMcBlaseIIALT.png",
    			"126EveltonMcBlaseIIALT2.png",
    			"126EveltonMcBlaseIIALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/shenaniglenn",
    				text: "@shenaniglenn"
    			}
    		]
    	},
    	{
    		index: 125,
    		id: "evelton-mcblase",
    		"full-name": "Evelton McBlase",
    		size: "small",
    		team: "Hawai'i Fridays",
    		"former-teams": [
    		],
    		sprites: [
    			"125EveltonMcBlase.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/shenaniglenn",
    				text: "@shenaniglenn"
    			}
    		]
    	},
    	{
    		index: 124,
    		id: "summers-pony",
    		"full-name": "Summers Pony",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Dallas Steaks",
    			"Philly Pies"
    		],
    		sprites: [
    			"124SummersPony.png",
    			"124SummersPonyALT.png",
    			"124SummersPonyALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "snerkus"
    			},
    			{
    				link: "https://twitter.com/_GreyWhite",
    				text: "@_GreyWhite"
    			}
    		]
    	},
    	{
    		index: 123,
    		id: "quack-enjoyable",
    		"full-name": "Quack Enjoyable",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"123QuackEnjoyable.png",
    			"123QuackEnjoyableALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 122,
    		id: "basilio-fig",
    		"full-name": "Basilio Fig",
    		size: "large",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"122BasilioFig.png",
    			"122BasilioFigALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 121,
    		id: "wyatt-dovenpart",
    		"full-name": "Wyatt Dovenpart",
    		size: "small",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    		],
    		sprites: [
    			"121WyattDovenpart.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 120,
    		id: "esme-ramsey",
    		"full-name": "Esme Ramsey",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"120EsmeRamsey.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "grr"
    			}
    		]
    	},
    	{
    		index: 119,
    		id: "beasley-gloom",
    		"full-name": "Beasley Gloom",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"119BeasleyGloom.png",
    			"119BeasleyGloomALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/shenaniglenn",
    				text: "@shenaniglenn"
    			}
    		]
    	},
    	{
    		index: 118,
    		id: "workman-gloom",
    		"full-name": "Workman Gloom",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Charleston Shoe Thieves",
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"118WorkmanGloom.png",
    			"118WorkmanGloomALT.png",
    			"118WorkmanGloomALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/shenaniglenn",
    				text: "@shenaniglenn"
    			}
    		]
    	},
    	{
    		index: 117,
    		id: "howell-franklin",
    		"full-name": "Howell Franklin",
    		size: "large",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Houston Spies",
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"117HowellFranklin.png",
    			"117HowellFranklinALT.png",
    			"117HowellFranklinALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/kyl_armstrong",
    				text: "@kyl_armstrong"
    			}
    		]
    	},
    	{
    		index: 116,
    		id: "hotbox-sato",
    		"full-name": "Hotbox Sato",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Boston Flowers",
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"116HotboxSato.png",
    			"116HotboxSatoALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "big Opus"
    			},
    			{
    				link: "",
    				text: "Faevolf"
    			}
    		]
    	},
    	{
    		index: 115,
    		id: "peanut-bong",
    		"full-name": "Peanut Bong",
    		size: "small",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    			"Miami Dale",
    			"THE SHELLED ONE'S PODS"
    		],
    		sprites: [
    			"115PeanutBong.png",
    			"115PeanutBongALT.png",
    			"115PeanutBongALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/CHURGALAX",
    				text: "@CHURGALAX"
    			}
    		]
    	},
    	{
    		index: 114,
    		id: "peanut-holloway",
    		"full-name": "Peanut Holloway",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    			"Philly Pies",
    			"THE SHELLED ONE'S PODS",
    			"Chicago Firefighters"
    		],
    		sprites: [
    			"114PeanutHolloway.png",
    			"114PeanutHollowayALT.png",
    			"114PeanutHollowayALT2.png",
    			"114PeanutHollowayALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/this_is_onjit",
    				text: "@this_is_onjit"
    			}
    		]
    	},
    	{
    		index: 113,
    		id: "peanutiel-duffy",
    		"full-name": "Peanutiel Duffy",
    		size: "huge",
    		team: "Chicago Firefighters",
    		"former-teams": [
    			"Hades Tigers",
    			"THE SHELLED ONE'S PODS"
    		],
    		sprites: [
    			"113PeanutielDuffy.png",
    			"113PeanutielDuffyALT.png",
    			"113PeanutielDuffyALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/tombofnull",
    				text: "@tombofnull"
    			}
    		]
    	},
    	{
    		index: 112,
    		id: "logan-horseman",
    		"full-name": "Logan Horseman",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"112LoganHorseman.png",
    			"112LoganHorsemanALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/CHURGALAX",
    				text: "@CHURGALAX"
    			}
    		]
    	},
    	{
    		index: 111,
    		id: "chorby-short",
    		"full-name": "Chorby Short",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    			"Yellowstone Magic"
    		],
    		sprites: [
    			"111ChorbyShort.png",
    			"111ChorbyShortALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/graciedarts",
    				text: "@graciedarts"
    			}
    		]
    	},
    	{
    		index: 110,
    		id: "thomas-kirby",
    		"full-name": "Thomas Kirby",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Dallas Steaks",
    			"Chicago Firefighters"
    		],
    		sprites: [
    			"110ThomasKirby.png",
    			"110ThomasKirbyALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 109,
    		id: "fynn-doyle",
    		"full-name": "Fynn Doyle",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    		],
    		sprites: [
    			"109FynnDoyle.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 108,
    		id: "luis-acevedo",
    		"full-name": "Luis Acevedo",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"Seattle Garages",
    			"Baltimore Crabs",
    			"Ohio Worms"
    		],
    		sprites: [
    			"108LuisAcevedo.png",
    			"108LuisAcevedoALT.png",
    			"108LuisAcevedoALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/corpserevivers",
    				text: "@corpserevivers"
    			}
    		]
    	},
    	{
    		index: 107,
    		id: "alejandro-leaf",
    		"full-name": "Alejandro Leaf",
    		size: "small",
    		team: "Tokyo Lift",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"THE SHELLED ONE'S PODS",
    			"New York Millennials"
    		],
    		sprites: [
    			"107AlejandroLeaf.png",
    			"107AlejandroLeafALT.png",
    			"107AlejandroLeafALT2.png",
    			"107AlejandroLeafALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/ElevenQuietSeas",
    				text: "@ElevenQuietSeas"
    			}
    		]
    	},
    	{
    		index: 106,
    		id: "elijah-valenzuela",
    		"full-name": "Elijah Valenzuela",
    		size: "small",
    		team: "Breckenridge Jazz Hands",
    		"former-teams": [
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"106ElijahValenzuela.png",
    			"106ElijahValenzuelaALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mermeag",
    				text: "@mermeag"
    			}
    		]
    	},
    	{
    		index: 105,
    		id: "pudge-nakamoto",
    		"full-name": "Pudge Nakamoto",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    			"Kansas City Breath Mints"
    		],
    		sprites: [
    			"105PudgeNakamoto.png",
    			"105PudgeNakatamoALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 104,
    		id: "alexander-horne",
    		"full-name": "Alexander Horne",
    		size: "large",
    		team: "San Francisco Lovers",
    		"former-teams": [
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"104AlexanderHorne.png",
    			"104AlexanderHorneALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/karanga_",
    				text: "@karanga_"
    			},
    			{
    				link: "https://twitter.com/cryptmilk",
    				text: "@cryptmilk"
    			}
    		]
    	},
    	{
    		index: 103,
    		id: "inez-owens",
    		"full-name": "Inez Owens",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    		],
    		sprites: [
    			"103InezOwens.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://instagram.com/whyica",
    				text: "whyica"
    			}
    		]
    	},
    	{
    		index: 102,
    		id: "jasmine-washington",
    		"full-name": "Jasmine Washington",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    		],
    		sprites: [
    			"102JasmineWashington.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MiamiD_Jasmine",
    				text: "@MiamiD_Jasmine"
    			}
    		]
    	},
    	{
    		index: 101,
    		id: "juice-collins",
    		"full-name": "Juice Collins",
    		size: "small",
    		team: "Hawai'i Fridays",
    		"former-teams": [
    		],
    		sprites: [
    			"101JuiceCollins.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/jellibeaver",
    				text: "@jellibeaver"
    			}
    		]
    	},
    	{
    		index: 100,
    		id: "yazmin-mason",
    		"full-name": "Yazmin Mason",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Hades Tigers",
    			"Philly Pies"
    		],
    		sprites: [
    			"100YazminMason.png",
    			"100YazminMasonALT.png",
    			"100YazminMasonALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/juangeedraws",
    				text: "@juangeedraws"
    			}
    		]
    	},
    	{
    		index: 99,
    		id: "leach-herman",
    		"full-name": "Leach Herman",
    		size: "large",
    		team: "Dallas Steaks",
    		"former-teams": [
    		],
    		sprites: [
    			"99LeachHerman.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/BearOverdrive",
    				text: "@BearOverdrive"
    			}
    		]
    	},
    	{
    		index: 98,
    		id: "joshua-watson",
    		"full-name": "Joshua Watson",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    			"Baltimore Crabs",
    			"Chicago Firefighters",
    			"Kansas City Breath Mints"
    		],
    		sprites: [
    			"98JoshuaWatson.png",
    			"98JoshuaWatsonALT.png",
    			"98JoshuaWatsonALT2.png",
    			"98JoshuaWatsonALT3.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 97,
    		id: "tyler-violet",
    		"full-name": "Tyler Violet",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"97TylerViolet.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			},
    			{
    				link: "https://twitter.com/telekeys",
    				text: "@telekeys"
    			}
    		]
    	},
    	{
    		index: 96,
    		id: "agan-harrison",
    		"full-name": "Agan Harrison",
    		size: "large",
    		team: "Chicago Firefighters",
    		"former-teams": [
    			"Breckenridge Jazz Hands"
    		],
    		sprites: [
    			"96AganHarrison.png",
    			"96AganHarrisonALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 95,
    		id: "marquez-clark",
    		"full-name": "Marquez Clark",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    		],
    		sprites: [
    			"95MarquezClark.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 94,
    		id: "stu-trololol",
    		"full-name": "Stu Trololol",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"94StuTrololol.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/stutrololol",
    				text: "@stutrololol"
    			}
    		]
    	},
    	{
    		index: 93,
    		id: "miki-santana",
    		"full-name": "Miki Santana",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Houston Spies"
    		],
    		sprites: [
    			"93MikiSantana.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mimimicee",
    				text: "@mimimicee"
    			}
    		]
    	},
    	{
    		index: 92,
    		id: "halexandrey-walton",
    		"full-name": "Halexandrey Walton",
    		size: "small",
    		team: "Tokyo Lift",
    		"former-teams": [
    			"Yellowstone Magic",
    			"LA Unlimited Tacos",
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"92HalexandreyWalton.png",
    			"92HalexandreyWaltonALT.png",
    			"92HalexandryWaltonALT2.png",
    			"92HalexandryWaltonALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 91,
    		id: "ortiz-lopez",
    		"full-name": "Ortiz Lopez",
    		size: "small",
    		team: "Atlantis Georgias",
    		"former-teams": [
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"91OrtizLopez.png",
    			"91OrtizLopezALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/cari_guevara",
    				text: "@cari_guevara"
    			}
    		]
    	},
    	{
    		index: 90,
    		id: "penelope-mathews",
    		"full-name": "Penelope Mathews",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Yellowstone Magic",
    			"New York Millennials"
    		],
    		sprites: [
    			"90PenelopeMathews.png",
    			"90PenelopeMathewsALT.png",
    			"90PenelopeMathewsALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/freddeye",
    				text: "@freddeye"
    			}
    		]
    	},
    	{
    		index: 89,
    		id: "joshua-butt",
    		"full-name": "Joshua Butt",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Chicago Firefighters"
    		],
    		sprites: [
    			"89JoshuaButt.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 88,
    		id: "alaynabella-hollywood",
    		"full-name": "Alaynabella Hollywood",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Hellmouth Sunbeams",
    			"Boston Flowers"
    		],
    		sprites: [
    			"88AlaynabellaHollywood.png",
    			"88AlaynabellaHollywoodALT.png",
    			"88AlaynabellaHollywoodALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 87,
    		id: "fletcher-yamamoto",
    		"full-name": "Fletcher Yamamoto",
    		size: "small",
    		team: "San Francisco Lovers",
    		"former-teams": [
    			"Hawai'i Fridays"
    		],
    		sprites: [
    			"87FletcherYamamoto.png",
    			"87FletcherYamamotoALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/phrenicquake",
    				text: "@phrenicquake"
    			}
    		]
    	},
    	{
    		index: 86,
    		id: "farrell-seagull",
    		"full-name": "Farrell Seagull",
    		size: "small",
    		team: "Ohio Worms",
    		"former-teams": [
    			"Miami Dale",
    			"Seattle Garages",
    			"Philly Pies"
    		],
    		sprites: [
    			"86FarrellSeagull.png",
    			"86FarrellSeagullALT.png",
    			"86FarrellSeagullALT2.png",
    			"86FarrellSeagullALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 85,
    		id: "malik-destiny",
    		"full-name": "Malik Destiny",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    		],
    		sprites: [
    			"85MalikDestiny.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 84,
    		id: "august-sky",
    		"full-name": "August Sky",
    		size: "small",
    		team: "Breckenridge Jazz Hands",
    		"former-teams": [
    			"Dallas Steaks"
    		],
    		sprites: [
    			"84AugustSky.png",
    			"84AugustSkyALT.png"
    		],
    		"default-sprite": 1
    	},
    	{
    		index: 83,
    		id: "cell-barajas",
    		"full-name": "Cell Barajas",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"83CellBarajas.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3ad3ddrag",
    				text: "@thr33h3ad3ddrag"
    			}
    		]
    	},
    	{
    		index: 82,
    		id: "winnie-hess",
    		"full-name": "Winnie Hess",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"82WinnieHess.png",
    			"82WinnieHessALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/ghostwriterish",
    				text: "@ghostwriterish"
    			}
    		]
    	},
    	{
    		index: 81,
    		id: "washer-barajas",
    		"full-name": "Washer Barajas",
    		size: "xlarge",
    		team: "Yellowstone Magic",
    		"former-teams": [
    		],
    		sprites: [
    			"81WasherBarajas.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 80,
    		id: "atlas-jonbois",
    		"full-name": "Atlas Jonbois",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"80AtlasJonbois.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 79,
    		id: "son-scotch",
    		"full-name": "Son Scotch",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Houston Spies"
    		],
    		sprites: [
    			"79SonScotch.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 78,
    		id: "sexton-wheerer",
    		"full-name": "Sexton Wheerer",
    		size: "large",
    		team: "LA Unlimited Tacos",
    		"former-teams": [
    		],
    		sprites: [
    			"78SextonWheerer.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 77,
    		id: "carmelo-plums",
    		"full-name": "Carmelo Plums",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    			"Hades Tigers",
    			"Seattle Garages"
    		],
    		sprites: [
    			"77CarmeloPlums.png",
    			"77CarmeloPlums2.png",
    			"77CarmeloPlums2ALT.png",
    			"77CarmeloPlums2ALT2.png",
    			"77CarmeloPlumsALT.png",
    			"77CarmeloPlumsALT2.png"
    		],
    		"default-sprite": 5,
    		credits: [
    			{
    				link: "https://twitter.com/Sovenas_Ark",
    				text: "@Sovenas_Ark"
    			},
    			{
    				link: "https://twitter.com/untunasandwich",
    				text: "@untunasandwich"
    			}
    		]
    	},
    	{
    		index: 76,
    		id: "chorby-soul",
    		"full-name": "Chorby Soul",
    		size: "huge",
    		team: "New York Millennials",
    		"former-teams": [
    			"New York Millennials",
    			"RIV",
    			"Seattle Garages",
    			"Boston Flowers",
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"76ChorbySoul.png",
    			"76ChorbySoulALT.png",
    			"76ChorbySoulALT2.png",
    			"76ChorbySoulALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/apolante_art",
    				text: "@apolante_art"
    			}
    		]
    	},
    	{
    		index: 75,
    		id: "sigmund-castillo",
    		"full-name": "Sigmund Castillo",
    		size: "xlarge",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"75SigmundCastillo.png",
    			"75SigmundCastilloALT.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 74,
    		id: "lou-roseheart",
    		"full-name": "Lou Roseheart",
    		size: "small",
    		team: "Chicago Firefighters",
    		"former-teams": [
    		],
    		sprites: [
    			"74LouRoseheart.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/kayleerowena",
    				text: "@kayleerowena"
    			}
    		]
    	},
    	{
    		index: 73,
    		id: "beck-whitney",
    		"full-name": "Beck Whitney",
    		size: "small",
    		team: "Hawai'i Fridays",
    		"former-teams": [
    			"Boston Flowers",
    			"Miami Dale"
    		],
    		sprites: [
    			"73BeckWhitney.png",
    			"73BeckWhitneyALT.png",
    			"73BeckWhitneyALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/pewterbee",
    				text: "@pewterbee"
    			}
    		]
    	},
    	{
    		index: 72,
    		id: "spears-taylor",
    		"full-name": "Spears Taylor",
    		size: "large",
    		team: "Hawai'i Fridays",
    		"former-teams": [
    			"Philly Pies",
    			"Hades Tigers"
    		],
    		sprites: [
    			"72SpearsTaylor.png",
    			"72SpearsTaylorALT.png",
    			"72SpearsTaylorALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/wrendorphin",
    				text: "@wrendorphin"
    			}
    		]
    	},
    	{
    		index: 71,
    		id: "francisco-preston",
    		"full-name": "Francisco Preston",
    		size: "small",
    		team: "Yellowstone Magic",
    		"former-teams": [
    		],
    		sprites: [
    			"71FranciscoPreston.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 70,
    		id: "leach-ingram",
    		"full-name": "Leach Ingram",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    		],
    		sprites: [
    			"70LeachIngram.png",
    			"70LeachIngram2.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "",
    				text: "RealHaman"
    			}
    		]
    	},
    	{
    		index: 69,
    		id: "blood-hamburger",
    		"full-name": "Blood Hamburger",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"69BloodHamburger.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/shenaniglenn",
    				text: "@shenaniglenn"
    			}
    		]
    	},
    	{
    		index: 68,
    		id: "adalberto-tosser",
    		"full-name": "Adalberto Tosser",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    		],
    		sprites: [
    			"68AdalbertoTosser.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 67,
    		id: "oliver-notarobot",
    		"full-name": "Oliver Notarobot",
    		size: "large",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Canada Moist Talkers",
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"67OliverNotarobot.png",
    			"67OliverNotarobotALT.png",
    			"67OliverNotarobotALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/CDPNhyphenK",
    				text: "@CDPNhyphenK"
    			}
    		]
    	},
    	{
    		index: 66,
    		id: "tillman-henderson",
    		"full-name": "Tillman Henderson",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Baltimore Crabs",
    			"Charleston Shoe Thieves"
    		],
    		sprites: [
    			"66TillmanHenderson.png",
    			"66TillmanHendersonALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/corpserevivers",
    				text: "@corpserevivers"
    			}
    		]
    	},
    	{
    		index: 65,
    		id: "tot-fox",
    		"full-name": "Tot Fox",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"Breckenridge Jazz Hands"
    		],
    		sprites: [
    			"65TotFox.png",
    			"65TotFoxALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://instagram.com/snortcrab",
    				text: "snortcrab"
    			}
    		]
    	},
    	{
    		index: 64,
    		id: "fitzgerald-blackburn",
    		"full-name": "Fitzgerald Blackburn",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"64FitzgeraldBlackburn.png",
    			"64FitzgeraldBlackburnALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/tsawac",
    				text: "@tsawac"
    			}
    		]
    	},
    	{
    		index: 63,
    		id: "elvis-figueroa",
    		"full-name": "Elvis Figueroa",
    		size: "small",
    		team: "Philly Pies",
    		"former-teams": [
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"63ElvisFigueroa.png",
    			"63ElvisFigueroaALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/this_is_onjit",
    				text: "@this_is_onjit"
    			}
    		]
    	},
    	{
    		index: 62,
    		id: "cannonball-sports",
    		"full-name": "Cannonball Sports",
    		size: "small",
    		team: "San Francisco Lovers",
    		"former-teams": [
    			"Miami Dale"
    		],
    		sprites: [
    			"62CannonballSports.png",
    			"62CannonballSportsALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/CHURGALAX",
    				text: "@CHURGALAX"
    			}
    		]
    	},
    	{
    		index: 61,
    		id: "wyatt-pothos",
    		"full-name": "Wyatt Pothos",
    		size: "small",
    		team: "Breckenridge Jazz Hands",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"THE SHELLED ONE'S PODS"
    		],
    		sprites: [
    			"61WyattPothos.png",
    			"61WyattPothosALT.png",
    			"61WyattPothosALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 60,
    		id: "patty-fox",
    		"full-name": "Patty Fox",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    		],
    		sprites: [
    			"60PattyFox.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mimimicee",
    				text: "@mimimicee"
    			}
    		]
    	},
    	{
    		index: 59,
    		id: "kichiro-guerra",
    		"full-name": "Kichiro Guerra",
    		size: "small",
    		team: "Ohio Worms",
    		"former-teams": [
    			"San Francisco Lovers"
    		],
    		sprites: [
    			"59KichiroGuerra.png",
    			"59KichiroGuerra2.png",
    			"59KichiroGuerra2ALT.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/cari_guevara",
    				text: "@cari_guevara"
    			}
    		]
    	},
    	{
    		index: 58,
    		id: "tamara-crankit",
    		"full-name": "Tamara Crankit",
    		size: "small",
    		team: "Breckenridge Jazz Hands",
    		"former-teams": [
    		],
    		sprites: [
    			"58TamaraCrankit.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/tamara_crankit",
    				text: "@tamara_crankit"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 57,
    		id: "sandie-turner",
    		"full-name": "Sandie Turner",
    		size: "large",
    		team: "New York Millennials",
    		"former-teams": [
    		],
    		sprites: [
    			"57SandieTurner.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/XtraJewrestrial",
    				text: "@XtraJewrestrial"
    			}
    		]
    	},
    	{
    		index: 56,
    		id: "inky-rutledge",
    		"full-name": "Inky Rutledge",
    		size: "small",
    		team: "Yellowstone Magic",
    		"former-teams": [
    		],
    		sprites: [
    			"56InkyRutledge.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/graciedarts",
    				text: "@graciedarts"
    			}
    		]
    	},
    	{
    		index: 55,
    		id: "axel-trololol",
    		"full-name": "Axel Trololol",
    		size: "xlarge",
    		team: "Hall Stars",
    		"former-teams": [
    			"Kansas City Breath Mints",
    			"Chicago Firefighters",
    			"Baltimore Crabs",
    			"THE SHELLED ONE'S PODS"
    		],
    		sprites: [
    			"55AxelTrololol.png",
    			"55AxelTrolololALT.png",
    			"55AxelTrolololALT2.png",
    			"55AxelTrolololALT3.png",
    			"55AxelTrolololALT4.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 54,
    		id: "allison-abbott",
    		"full-name": "Allison Abbott",
    		size: "small",
    		team: "Dallas Steaks",
    		"former-teams": [
    			"Seattle Garages"
    		],
    		sprites: [
    			"54AllisonAbbott.png",
    			"54AllisonAbbottALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 53,
    		id: "knight-triumphant",
    		"full-name": "Knight Triumphant",
    		size: "small",
    		team: "Atlantis Georgias",
    		"former-teams": [
    			"San Francisco Lovers",
    			"Houston Spies"
    		],
    		sprites: [
    			"53KnightTriumphant.png",
    			"53KnightTriumphantALT.png",
    			"53KnightTriumphantALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 52,
    		id: "joe-voorhees",
    		"full-name": "Joe Voorhees",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    			"Canada Moist Talkers",
    			"Charleston Shoe Thieves",
    			"Houston Spies"
    		],
    		sprites: [
    			"52JoeVoorhees.png",
    			"52JoeVoorheesALT.png",
    			"52JoeVoorheesALT2.png",
    			"52JoeVoorheesALT3.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Spiral_Joe",
    				text: "@Spiral_Joe"
    			}
    		]
    	},
    	{
    		index: 51,
    		id: "goobie-ballson",
    		"full-name": "Goobie Ballson",
    		size: "large",
    		team: "Chicago Firefighters",
    		"former-teams": [
    		],
    		sprites: [
    			"51GoobieBallson.png",
    			"51GoobieBallson1.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 50,
    		id: "nicholas-mora",
    		"full-name": "Nicholas Mora",
    		size: "small",
    		team: "Hades Tigers",
    		"former-teams": [
    			"Philly Pies"
    		],
    		sprites: [
    			"50NicholasMora.png",
    			"50NicholasMoraALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/isitsernik",
    				text: "@isitsernik"
    			}
    		]
    	},
    	{
    		index: 49,
    		id: "isaac-rubberman",
    		"full-name": "Isaac Rubberman",
    		size: "large",
    		team: "RIV",
    		"former-teams": [
    			"Boston Flowers"
    		],
    		sprites: [
    			"49IsaacRubberman.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 48,
    		id: "pitching-machine",
    		"full-name": "Pitching Machine",
    		size: "small",
    		team: "San Francisco Lovers",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"THE SHELLED ONE'S PODS",
    			"Seattle Garages",
    			"Ohio Worms"
    		],
    		sprites: [
    			"48PitchingMachine.png",
    			"48PitchingMachineALT.png",
    			"48PitchingMachineALT2.png",
    			"48PitchingMachineALT3.png",
    			"48PitchingMachineALT4.png"
    		],
    		"default-sprite": 4,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 47,
    		id: "thomas-dracaena",
    		"full-name": "Thomas Dracaena",
    		size: "small",
    		team: "New York Millennials",
    		"former-teams": [
    		],
    		sprites: [
    			"47ThomasDracaena.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mermeag",
    				text: "@mermeag"
    			}
    		]
    	},
    	{
    		index: 46,
    		id: "cornelius-games",
    		"full-name": "Cornelius Games",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"46CorneliusGames.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/kyl_armstrong",
    				text: "@kyl_armstrong"
    			}
    		]
    	},
    	{
    		index: 45,
    		id: "rodriguez-internet",
    		"full-name": "Rodriguez Internet",
    		size: "small",
    		team: "Kansas City Breath Mints",
    		"former-teams": [
    		],
    		sprites: [
    			"45RodriguezInternet.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 44,
    		id: "qais-dogwalker",
    		"full-name": "Qais Dogwalker",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    		],
    		sprites: [
    			"44QaisDogwalker.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			},
    			{
    				link: "https://twitter.com/aflightybroad",
    				text: "@aflightybroad"
    			}
    		]
    	},
    	{
    		index: 43,
    		id: "hahn-fox",
    		"full-name": "Hahn Fox",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    			"Miami Dale",
    			"Boston Flowers"
    		],
    		sprites: [
    			"43HahnFox.png",
    			"43HahnFoxALT.png",
    			"43HahnFoxALT2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/artplebe",
    				text: "@artplebe"
    			}
    		]
    	},
    	{
    		index: 42,
    		id: "sosa-hayes",
    		"full-name": "Sosa Hayes",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    			"Mexico City Wild Wings"
    		],
    		sprites: [
    			"42SosaHayes.png",
    			"42SosaHayesALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3ad3ddrag",
    				text: "@thr33h3ad3ddrag"
    			}
    		]
    	},
    	{
    		index: 41,
    		id: "silvia-rugrat",
    		"full-name": "Silvia Rugrat",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"41SilviaRugrat.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3ad3ddrag",
    				text: "@thr33h3ad3ddrag"
    			}
    		]
    	},
    	{
    		index: 40,
    		id: "miguel-wheeler",
    		"full-name": "Miguel Wheeler",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Mexico City Wild Wings"
    		],
    		sprites: [
    			"40MiguelWheeler.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3ad3ddrag",
    				text: "@thr33h3ad3ddrag"
    			}
    		]
    	},
    	{
    		index: 39,
    		id: "axel-cardenas",
    		"full-name": "Axel Cardenas",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"39AxelCardenas.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3ad3ddrag",
    				text: "@thr33h3ad3ddrag"
    			}
    		]
    	},
    	{
    		index: 38,
    		id: "sebastian-telephone",
    		"full-name": "Sebastian Telephone",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Dallas Steaks",
    			"Hall Stars"
    		],
    		sprites: [
    			"38SebastianTelephone.png",
    			"38SebastianTelephoneALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fairchart",
    				text: "@fairchart"
    			}
    		]
    	},
    	{
    		index: 37,
    		id: "margarito-nava",
    		"full-name": "Margarito Nava",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    		],
    		sprites: [
    			"37MargaritoNava.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 36,
    		id: "annie-roland",
    		"full-name": "Annie Roland",
    		size: "small",
    		team: "RIV",
    		"former-teams": [
    			"Yellowstone Magic"
    		],
    		sprites: [
    			"36AnnieRoland.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 35,
    		id: "lars-taylor",
    		"full-name": "Lars Taylor",
    		size: "small",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"35LarsTaylor.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mimimicee",
    				text: "@mimimicee"
    			}
    		]
    	},
    	{
    		index: 34,
    		id: "ziwa-mueller",
    		"full-name": "Ziwa Mueller",
    		size: "small",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    		],
    		sprites: [
    			"34ZiwaMueller.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 33,
    		id: "nolanestophia-patterson",
    		"full-name": "Nolanestophia Patterson",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Hawai'i Fridays",
    			"Hades Tigers",
    			"Philly Pies"
    		],
    		sprites: [
    			"33NolanestophiaPatterson.png",
    			"33NolanestophiaPattersonALT.png",
    			"33NolanestophiaPattersonALT2.png",
    			"33NolanestophiaPattersonALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/ouhhoh",
    				text: "@ouhhoh"
    			}
    		]
    	},
    	{
    		index: 32,
    		id: "kline-greenlemon",
    		"full-name": "Kline Greenlemon",
    		size: "small",
    		team: "Dallas Steaks",
    		"former-teams": [
    		],
    		sprites: [
    			"32KlineGreenlemon.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/alienmandy_",
    				text: "@alienmandy_"
    			}
    		]
    	},
    	{
    		index: 31,
    		id: "nagomi-mcdaniel",
    		"full-name": "Nagomi Mcdaniel",
    		size: "small",
    		team: "Unknown",
    		"former-teams": [
    			"Hades Tigers",
    			"Baltimore Crabs",
    			"Breckenridge Jazz Hands",
    			"Hawai'i Fridays",
    			"Seattle Garages",
    			"Boston Flowers",
    			"Miami Dale"
    		],
    		sprites: [
    			"31NagomiMcDaniel.png",
    			"31NagomiMcDanielALT.png",
    			"31NagomiMcDanielALT2.png",
    			"31NagomiMcDanielALT3.png",
    			"31NagomiMcDanielALT4.png",
    			"31NagomiMcDanielALT5.png",
    			"31NagomiMcDanielALT6.png"
    		],
    		"default-sprite": 6,
    		credits: [
    			{
    				link: "https://twitter.com/kayleerowena",
    				text: "@kayleerowena"
    			},
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 30,
    		id: "math-velazquez",
    		"full-name": "Math Velazquez",
    		size: "large",
    		team: "Houston Spies",
    		"former-teams": [
    		],
    		sprites: [
    			"30MathVelazquez.png"
    		],
    		"default-sprite": 0
    	},
    	{
    		index: 29,
    		id: "rivers-rosa",
    		"full-name": "Rivers Rosa",
    		size: "small",
    		team: "Ohio Worms",
    		"former-teams": [
    			"Chicago Firefighters"
    		],
    		sprites: [
    			"29RiversRosa.png",
    			"29RiversRosaALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/crikadelic",
    				text: "@crikadelic"
    			}
    		]
    	},
    	{
    		index: 28,
    		id: "nan",
    		"full-name": "NaN",
    		size: "small",
    		team: "San Francisco Lovers",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"Houston Spies",
    			"Mexico City Wild Wings",
    			"San Francisco Lovers",
    			"Hawai'i Fridays",
    			"New York Millennials",
    			"Chicago Firefighters",
    			"Ohio Worms",
    			"Hades Tigers"
    		],
    		sprites: [
    			"28NaN.png",
    			"28NaN2.png",
    			"28NaNALT.png",
    			"28NaNALT2.png",
    			"28NaNALT3.png",
    			"28NaNALT4.png",
    			"28NaNALT5.png",
    			"28NaNALT6.png",
    			"28NaNALT7.png",
    			"28NaNALT8.png"
    		],
    		"default-sprite": 4,
    		credits: [
    			{
    				link: "https://twitter.com/Fancymancer",
    				text: "@Fancymancer"
    			}
    		]
    	},
    	{
    		index: 27,
    		id: "york-silk",
    		"full-name": "York Silk",
    		size: "small",
    		team: "Unknown",
    		"former-teams": [
    			"Hawai'i Fridays",
    			"THE SHELLED ONE'S PODS",
    			"Canada Moist Talkers",
    			"RIV",
    			"Baltimore Crabs",
    			"Seattle Garages"
    		],
    		sprites: [
    			"27YorkSilk.png",
    			"27YorkSilkALT.png",
    			"27YorkSilkALT2.png",
    			"27YorkSilkALT3.png",
    			"27YorkSilkALT4.png"
    		],
    		"default-sprite": 4,
    		credits: [
    			{
    				link: "https://twitter.com/fairchart",
    				text: "@fairchart"
    			},
    			{
    				link: "https://twitter.com/skelebells",
    				text: "@skelebells"
    			}
    		]
    	},
    	{
    		index: 26,
    		id: "parker-meng",
    		"full-name": "Parker Meng",
    		size: "small",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"San Francisco Lovers",
    			"Miami Dale"
    		],
    		sprites: [
    			"26ParkerMeng.png",
    			"26ParkerMengALT.png",
    			"26ParkerMengALT2.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/cari_guevara",
    				text: "@cari_guevara"
    			}
    		]
    	},
    	{
    		index: 25,
    		id: "jaylen-hotdogfingers",
    		"full-name": "Jaylen Hotdogfingers",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    			"Seattle Garages",
    			"Charleston Shoe Thieves",
    			"Hall Stars",
    			"THE SHELLED ONE'S PODS",
    			"RIV",
    			"San Francisco Lovers",
    			"Yellowstone Magic",
    			"Hawai'i Fridays",
    			"Core Mechanics"
    		],
    		sprites: [
    			"25JaylenHotdogfingers.png",
    			"25JaylenHotdogfingersALT.png",
    			"25JaylenHotdogfingersALT2.png",
    			"25JaylenHotdogfingersALT3.png",
    			"25JaylenHotdogfingersALT4.png",
    			"25JaylenHotdogfingersALT5.png",
    			"25JaylenHotdogfingersALT6.png",
    			"25JaylenHotdogfingersALT7.png",
    			"25JaylenHotdogfingersALT8.png",
    			"25JaylenHotdogfingersALT9.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MLeeLunsford",
    				text: "@MLeeLunsford"
    			}
    		]
    	},
    	{
    		index: 24,
    		id: "zion-aliciakeyes",
    		"full-name": "Zion Aliciakeyes",
    		size: "xlarge",
    		team: "Hades Tigers",
    		"former-teams": [
    		],
    		sprites: [
    			"24ZionAliciakeyes.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/juangeedraws",
    				text: "@juangeedraws"
    			}
    		]
    	},
    	{
    		index: 23,
    		id: "fish-summer",
    		"full-name": "Fish Summer",
    		size: "large",
    		team: "Baltimore Crabs",
    		"former-teams": [
    			"Hades Tigers",
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"23FishSummer.png",
    			"23FishSummer2.png",
    			"23FishSummer2ALT.png",
    			"23FishSummer2ALT2.png",
    			"23FishSummerALT.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://instagram.com/lote_lake",
    				text: "lote_lake"
    			},
    			{
    				link: "https://twitter.com/AlyssaLMPenney",
    				text: "@AlyssaLMPenney"
    			}
    		]
    	},
    	{
    		index: 22,
    		id: "gunther-o-brian",
    		"full-name": "Gunther O'Brian",
    		size: "small",
    		team: "Charleston Shoe Thieves",
    		"former-teams": [
    		],
    		sprites: [
    			"22GuntherOBrian.png",
    			"22GuntherOBrian2.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/desmodusrotunds",
    				text: "@desmodusrotunds"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 21,
    		id: "boyfriend-monreal",
    		"full-name": "Boyfriend Monreal",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"Kansas City Breath Mints"
    		],
    		sprites: [
    			"21BoyfriendMonreal.png",
    			"21BoyfriendMonrealALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/dancynrew",
    				text: "@dancynrew"
    			}
    		]
    	},
    	{
    		index: 20,
    		id: "don-elliott",
    		"full-name": "Don Elliott",
    		size: "small",
    		team: "Miami Dale",
    		"former-teams": [
    		],
    		sprites: [
    			"20DonElliott.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 19,
    		id: "randall-marijuana",
    		"full-name": "Randall Marijuana",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Hellmouth Sunbeams",
    			"Breckenridge Jazz Hands"
    		],
    		sprites: [
    			"19RandallMarijuana.png",
    			"19RandallMarijuanaALT.png",
    			"19RandallMarijuanaALT2.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/alienmandy_",
    				text: "@alienmandy_"
    			}
    		]
    	},
    	{
    		index: 18,
    		id: "dominic-marijuana",
    		"full-name": "Dominic Marijuana",
    		size: "large",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"New York Millennials"
    		],
    		sprites: [
    			"18DominicMarijuana.png",
    			"18DominicMarijuanaALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mermeag",
    				text: "@mermeag"
    			}
    		]
    	},
    	{
    		index: 17,
    		id: "sixpack-dogwalker",
    		"full-name": "Sixpack Dogwalker",
    		size: "large",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    			"Hawai'i Fridays",
    			"Dallas Steaks"
    		],
    		sprites: [
    			"17SixpackDogwalker.png",
    			"17SixpackDogwalkerALT.png",
    			"17SixpackDogwalkerALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 16,
    		id: "lowe-forbes",
    		"full-name": "Lowe Forbes",
    		size: "small",
    		team: "Breckenridge Jazz Hands",
    		"former-teams": [
    		],
    		sprites: [
    			"16LoweForbes.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 15,
    		id: "alexandria-rosales",
    		"full-name": "Alexandria Rosales",
    		size: "small",
    		team: "Houston Spies",
    		"former-teams": [
    		],
    		sprites: [
    			"15AlexandriaRosales.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/crikadelic",
    				text: "@crikadelic"
    			}
    		]
    	},
    	{
    		index: 14,
    		id: "baby-triumphant",
    		"full-name": "Baby Triumphant",
    		size: "small",
    		team: "Chicago Firefighters",
    		"former-teams": [
    		],
    		sprites: [
    			"14BabyTriumphant.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 13,
    		id: "don-mitchell",
    		"full-name": "Don Mitchell",
    		size: "small",
    		team: "San Francisco Lovers",
    		"former-teams": [
    		],
    		sprites: [
    			"13DonMitchell.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/gfclass",
    				text: "@gfclass"
    			}
    		]
    	},
    	{
    		index: 12,
    		id: "jessica-telephone",
    		"full-name": "Jessica Telephone",
    		size: "small",
    		team: "Tokyo Lift",
    		"former-teams": [
    			"Dallas Steaks",
    			"Philly Pies",
    			"Hades Tigers",
    			"THE SHELLED ONE'S PODS",
    			"Mexico City Wild Wings",
    			"Kansas City Breath Mints"
    		],
    		sprites: [
    			"12JessicaTelephone.png",
    			"12JessicaTelephoneALT.png",
    			"12JessicaTelephoneALT2.png",
    			"12JessicaTelephoneALT3.png",
    			"12JessicaTelephoneALT4.png",
    			"12JessicaTelephoneALT5.png",
    			"12JessicaTelephoneALT6.png"
    		],
    		"default-sprite": 6,
    		credits: [
    			{
    				link: "https://twitter.com/telekeys",
    				text: "@telekeys"
    			}
    		]
    	},
    	{
    		index: 11,
    		id: "forrest-best",
    		"full-name": "Forrest Best",
    		size: "small",
    		team: "Dallas Steaks",
    		"former-teams": [
    			"Baltimore Crabs"
    		],
    		sprites: [
    			"11ForrestBest.png",
    			"11ForrestBestALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/okaybutwhy9",
    				text: "@okaybutwhy9"
    			}
    		]
    	},
    	{
    		index: 10,
    		id: "nagomi-nava",
    		"full-name": "Nagomi Nava",
    		size: "large",
    		team: "Hellmouth Sunbeams",
    		"former-teams": [
    		],
    		sprites: [
    			"10NagomiNava.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/proximart0",
    				text: "@proximart0"
    			},
    			{
    				link: "https://twitter.com/alienmandy_",
    				text: "@alienmandy_"
    			}
    		]
    	},
    	{
    		index: 9,
    		id: "kiki-familia",
    		"full-name": "Kiki Familia",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Canada Moist Talkers"
    		],
    		sprites: [
    			"09KikiFamilia.png",
    			"09KikiFamiliaALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	},
    	{
    		index: 8,
    		id: "caligula-lotus",
    		"full-name": "Caligula Lotus",
    		size: "large",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Boston Flowers"
    		],
    		sprites: [
    			"08CaligulaLotus.png",
    			"08CaligulaLotusALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/freyquinn",
    				text: "@freyquinn"
    			}
    		]
    	},
    	{
    		index: 7,
    		id: "landry-violence",
    		"full-name": "Landry Violence",
    		size: "small",
    		team: "Hall Stars",
    		"former-teams": [
    			"RIV",
    			"Hades Tigers"
    		],
    		sprites: [
    			"07LandryViolence.png",
    			"07LandryViolenceALT.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Sphr_AM",
    				text: "@Sphr_AM"
    			},
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 6,
    		id: "stephanie-winters",
    		"full-name": "Stephanie Winters",
    		size: "small",
    		team: "Mexico City Wild Wings",
    		"former-teams": [
    		],
    		sprites: [
    			"06StephanieWinters.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/thr33h3ad3ddrag",
    				text: "@thr33h3ad3ddrag"
    			}
    		]
    	},
    	{
    		index: 5,
    		id: "cory-twelve",
    		"full-name": "Cory Twelve",
    		size: "small",
    		team: "Boston Flowers",
    		"former-teams": [
    			"Yellowstone Magic"
    		],
    		sprites: [
    			"05CoryTwelve.png",
    			"05CoryTwelveALT.png"
    		],
    		"default-sprite": 1,
    		credits: [
    			{
    				link: "https://twitter.com/graciedarts",
    				text: "@graciedarts"
    			}
    		]
    	},
    	{
    		index: 4,
    		id: "conner-haley",
    		"full-name": "Conner Haley",
    		size: "large",
    		team: "Dallas Steaks",
    		"former-teams": [
    		],
    		sprites: [
    			"04ConnerHaley.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 3,
    		id: "wyatt-quitter",
    		"full-name": "Wyatt Quitter",
    		size: "small",
    		team: "Unknown",
    		"former-teams": [
    			"LA Unlimited Tacos",
    			"THE SHELLED ONE'S PODS"
    		],
    		sprites: [
    			"03WyattQuitter.png",
    			"03WyattQuitterALT.png",
    			"03WyattQuitterALT2.png"
    		],
    		"default-sprite": 2,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 2,
    		id: "mike-townsend",
    		"full-name": "Mike Townsend",
    		size: "small",
    		team: "Seattle Garages",
    		"former-teams": [
    		],
    		sprites: [
    			"02MikeTownsend.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://averybee.tumblr.com",
    				text: "averybee"
    			}
    		]
    	},
    	{
    		index: 1,
    		id: "richmond-harrison",
    		"full-name": "Richmond Harrison",
    		size: "large",
    		team: "Canada Moist Talkers",
    		"former-teams": [
    			"Canada Moist Talkers",
    			"Hades Tigers",
    			"Hellmouth Sunbeams"
    		],
    		sprites: [
    			"01RichmondHarrison.png",
    			"01RichmondHarrisonALT.png",
    			"01RichmondHarrisonALT2.png",
    			"01RichmondHarrisonALT3.png"
    		],
    		"default-sprite": 3,
    		credits: [
    			{
    				link: "https://twitter.com/avery_helm",
    				text: "@avery_helm"
    			}
    		]
    	}
    ];

    var GuestPlayersData = [
    	{
    		index: 42,
    		id: "polkadot-matrix",
    		"full-name": "Polkadot Matrix",
    		size: "small",
    		team: "Society Data Witches",
    		"former-teams": [
    		],
    		sprites: [
    			"G042PolkadotMatrix.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/maddycha",
    				text: "@maddycha"
    			}
    		]
    	},
    	{
    		index: 41,
    		id: "espresso-machine",
    		"full-name": "Espresso Machine",
    		size: "small",
    		team: "Society Data Witches",
    		"former-teams": [
    		],
    		sprites: [
    			"G041EspressoMachine.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 40,
    		id: "boxplot-jones",
    		"full-name": "Boxplot Jones",
    		size: "small",
    		team: "Society Data Witches",
    		"former-teams": [
    		],
    		sprites: [
    			"G040BoxplotJones.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/BeedropsArt",
    				text: "@BeedropsArt"
    			}
    		]
    	},
    	{
    		index: 39,
    		id: "batista-oatmilk",
    		"full-name": "Batista Oatmilk",
    		size: "small",
    		team: "Society Data Witches",
    		"former-teams": [
    		],
    		sprites: [
    			"G039BatistaOatmilk.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 38,
    		id: "mason-m-mcmason",
    		"full-name": "Mason M. McMason",
    		size: "small",
    		team: "Society Data Witches",
    		"former-teams": [
    		],
    		sprites: [
    			"G038MasonMMcMason.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/tywyso",
    				text: "@tywyso"
    			}
    		]
    	},
    	{
    		index: 37,
    		id: "parker-macmillan-iiii",
    		"full-name": "Parker MacMillan IIII",
    		size: "huge",
    		team: "Real Game Band",
    		"former-teams": [
    		],
    		sprites: [
    			"G037ParkerMacMillanIIII.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	},
    	{
    		index: 36,
    		id: "slam-rosenthal",
    		"full-name": "Slam Rosenthal",
    		size: "small",
    		team: "Real Game Band",
    		"former-teams": [
    		],
    		sprites: [
    			"G036SlamRosenthal.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/chrisbratt",
    				text: "@chrisbratt"
    			}
    		]
    	},
    	{
    		index: 35,
    		id: "stephen-shelled",
    		"full-name": "Stephen Shelled",
    		size: "small",
    		team: "Real Game Band",
    		"former-teams": [
    		],
    		sprites: [
    			"G035StephenShelled.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/chrisbratt",
    				text: "@chrisbratt"
    			}
    		]
    	},
    	{
    		index: 34,
    		id: "ball-clark",
    		"full-name": "Ball Clark",
    		size: "small",
    		team: "Real Game Band",
    		"former-teams": [
    		],
    		sprites: [
    			"G034BallClark.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/chrisbratt",
    				text: "@chrisbratt"
    			}
    		]
    	},
    	{
    		index: 33,
    		id: "bing-flatters",
    		"full-name": "Bing Flatters",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G033BingFlatters.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/longhairQ",
    				text: "@longhairQ"
    			}
    		],
    		mascot: true
    	},
    	{
    		index: 32,
    		id: "y3hirv-hafgy2738riv",
    		"full-name": "Y3hirv Hafgy2738riv",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G032Y3hirvHafgy2738riv.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "",
    				text: "Shen"
    			}
    		]
    	},
    	{
    		index: 31,
    		id: "phoebe-blasesona",
    		"full-name": "Phoebe Blasesona",
    		size: "large",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G031PhoebeBlasesona.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/ArachnidArt",
    				text: "@ArachnidArt"
    			}
    		]
    	},
    	{
    		index: 30,
    		id: "haunt-wednesday",
    		"full-name": "Haunt Wednesday",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G030HauntWednesday.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/kayleerowena",
    				text: "@kayleerowena"
    			}
    		]
    	},
    	{
    		index: 29,
    		id: "angel-ivories",
    		"full-name": "Angel Ivories",
    		size: "large",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G029AngelIvories.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/luins_",
    				text: "@luins_"
    			}
    		]
    	},
    	{
    		index: 28,
    		id: "dunbar-mcloud",
    		"full-name": "Dunbar McLoud",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G028DunbarMcLoud.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/justmako",
    				text: "@justmako"
    			}
    		]
    	},
    	{
    		index: 27,
    		id: "jonah-mosaic",
    		"full-name": "Jonah Mosaic",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G027JonahMosaic.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/shenaniglenn",
    				text: "@shenaniglenn"
    			}
    		]
    	},
    	{
    		index: 26,
    		id: "fishcake-can",
    		"full-name": "Fishcake Can",
    		size: "large",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G026FishcakeCan.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/Karagna_",
    				text: "@Karagna_"
    			}
    		]
    	},
    	{
    		index: 25,
    		id: "ikea-jellofin",
    		"full-name": "Ikea Jellofin",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G025IkeaJellofin.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/starfauna",
    				text: "@starfauna"
    			}
    		]
    	},
    	{
    		index: 24,
    		id: "cousin-spike",
    		"full-name": "Cousin Spike",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G024CousinSpike.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/_waalkr",
    				text: "@_waalkr"
    			}
    		]
    	},
    	{
    		index: 23,
    		id: "buck-rattler",
    		"full-name": "Buck Rattler",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G023BuckRattler.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/crikadelic",
    				text: "@crikadelic"
    			}
    		]
    	},
    	{
    		index: 22,
    		id: "quebrada-stone",
    		"full-name": "Quebrada Stone",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G022QuebradaStone.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/mnsoleart",
    				text: "@mnsoleart"
    			}
    		]
    	},
    	{
    		index: 21,
    		id: "teeth-bandana",
    		"full-name": "Teeth Bandana",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G021TeethBandana.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/greetomatic",
    				text: "@greetomatic"
    			}
    		]
    	},
    	{
    		index: 20,
    		id: "swords-magpie",
    		"full-name": "Swords Magpie",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G020SwordsMagpie.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/alienmandy_",
    				text: "@alienmandy_"
    			}
    		]
    	},
    	{
    		index: 19,
    		id: "happy-yoinky",
    		"full-name": "Happy Yoinky",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G019HappyYoinky.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/peony_vibes",
    				text: "@peony_vibes"
    			}
    		]
    	},
    	{
    		index: 18,
    		id: "cinna-toast",
    		"full-name": "Cinna Toast",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G018CinnaToast.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/alyssalmpenney",
    				text: "@alyssalmpenney"
    			}
    		]
    	},
    	{
    		index: 17,
    		id: "roxetta-compass",
    		"full-name": "Roxetta Compass",
    		size: "large",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G017RoxettaCompass.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/chezforshire",
    				text: "@chezforshire"
    			}
    		]
    	},
    	{
    		index: 16,
    		id: "watson-ward",
    		"full-name": "Watson Ward",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G016WatsonWard.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fancymancer",
    				text: "@fancymancer"
    			}
    		]
    	},
    	{
    		index: 15,
    		id: "jay-grayscale",
    		"full-name": "Jay Grayscale",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G015JayGrayscale.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/juangeedraws",
    				text: "@juangeedraws"
    			}
    		]
    	},
    	{
    		index: 14,
    		id: "entropy-handcramp",
    		"full-name": "Entropy Handcramp",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G014EntropyHandcramp.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/koloquials",
    				text: "@koloquials"
    			}
    		]
    	},
    	{
    		index: 13,
    		id: "road-kill",
    		"full-name": "Road Kill",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G013RoadKill.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/glassgoblin",
    				text: "@glassgoblin"
    			}
    		]
    	},
    	{
    		index: 12,
    		id: "aura-irving",
    		"full-name": "Aura Irving",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G012AuraIrving.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/redbirdrabbit",
    				text: "@redbirdrabbit"
    			}
    		]
    	},
    	{
    		index: 11,
    		id: "manda-moth",
    		"full-name": "Manda Moth",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G011MandaMoth.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/cocacolapanda1",
    				text: "@cocacolapanda1"
    			}
    		]
    	},
    	{
    		index: 10,
    		id: "jenny-quicksilver",
    		"full-name": "Jenny Quicksilver",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G010JennyQuicksilver.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/jololion",
    				text: "@jololion"
    			}
    		]
    	},
    	{
    		index: 9,
    		id: "arbutus-bones",
    		"full-name": "Arbutus Bones",
    		size: "large",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G009ArbutusBones.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/skelebells",
    				text: "@skelebells"
    			}
    		]
    	},
    	{
    		index: 8,
    		id: "maddong-candy",
    		"full-name": "Maddong Candy",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G008MaddongCandy.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/maddycha",
    				text: "@maddycha"
    			}
    		]
    	},
    	{
    		index: 7,
    		id: "handsome-scarf",
    		"full-name": "Handsome Scarf",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G007HandsomeScarf.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/ndlbxbrd",
    				text: "@ndlbxbrd"
    			}
    		]
    	},
    	{
    		index: 6,
    		id: "chromatic-jump",
    		"full-name": "Chromatic Jump",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G006ChromaticJump.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/fairchart",
    				text: "@fairchart"
    			}
    		]
    	},
    	{
    		index: 5,
    		id: "backwoods-broker",
    		"full-name": "Backwoods Broker",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G005BackwoodsBroker.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/horseizontal",
    				text: "@horseizontal"
    			}
    		]
    	},
    	{
    		index: 4,
    		id: "schism-thrones",
    		"full-name": "Schism Thrones",
    		size: "large",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G004SchismThrones.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/occultclassic",
    				text: "@occultclassic"
    			}
    		]
    	},
    	{
    		index: 3,
    		id: "friend-void",
    		"full-name": "Friend Void",
    		size: "small",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G003FriendVoid.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/cryptmilk",
    				text: "@cryptmilk"
    			}
    		]
    	},
    	{
    		index: 2,
    		id: "pompom-pomodoro",
    		"full-name": "Pompom Pomodoro",
    		size: "small",
    		team: "Pending Team",
    		"former-teams": [
    		],
    		sprites: [
    			"G002PompomPomodoro.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/MimimiCee",
    				text: "@MimimiCee"
    			}
    		]
    	},
    	{
    		index: 1,
    		id: "breeze-regicide",
    		"full-name": "Breeze Regicide",
    		size: "large",
    		team: "Pandemonium Artists",
    		"former-teams": [
    		],
    		sprites: [
    			"G001BreezeRegicide.png"
    		],
    		"default-sprite": 0,
    		credits: [
    			{
    				link: "https://twitter.com/hetreasky",
    				text: "@hetreasky"
    			}
    		]
    	}
    ];

    var TeamsData = [
    	{
    		name: "Wild High",
    		teams: [
    			"Hades Tigers",
    			"Chicago Firefighters",
    			"Breckenridge Jazz Hands",
    			"Mexico City Wild Wings",
    			"Tokyo Lift",
    			"Atlantis Georgias"
    		]
    	},
    	{
    		name: "Wild Low",
    		teams: [
    			"Hellmouth Sunbeams",
    			"LA Unlimited Tacos",
    			"Houston Spies",
    			"Miami Dale",
    			"Boston Flowers",
    			"Ohio Worms"
    		]
    	},
    	{
    		name: "Mild High",
    		teams: [
    			"Seattle Garages",
    			"Dallas Steaks",
    			"San Francisco Lovers",
    			"New York Millennials",
    			"Philly Pies",
    			"Core Mechanics"
    		]
    	},
    	{
    		name: "Mild Low",
    		teams: [
    			"Charleston Shoe Thieves",
    			"Canada Moist Talkers",
    			"Hawai'i Fridays",
    			"Kansas City Breath Mints",
    			"Yellowstone Magic",
    			"Baltimore Crabs"
    		]
    	},
    	{
    		name: "Others",
    		teams: [
    			"THE SHELLED ONE'S PODS",
    			"Hall Stars",
    			"RIV",
    			"Unknown"
    		]
    	}
    ];

    var GuestTeamsData = [
    	{
    		name: "Guests",
    		teams: [
    			"Society Data Witches",
    			"Pandemonium Artists",
    			"Real Game Band"
    		]
    	}
    ];

    const allTeams = TeamsData.concat(GuestTeamsData);

    const teamsList = allTeams.map(subleague => {
        return subleague.teams
    }).flat();

    let teamsReverseId = {};

    teamsList.forEach((teamname, index) => {
        teamsReverseId[teamname] = index;
    });

    /* src\app.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src\\app.svelte";

    // (212:12) {#if sidebarScreen === 'filter'}
    function create_if_block_1(ctx) {
    	let filtercontrol;
    	let current;

    	filtercontrol = new FilterControl({
    			props: {
    				selectedGallery: /*galleryScreen*/ ctx[3],
    				teams: /*shownTeamsData*/ ctx[1]
    			},
    			$$inline: true
    		});

    	filtercontrol.$on("selectGallery", /*switchGallery*/ ctx[6]);
    	filtercontrol.$on("filterPlayerName", /*filterPlayerName*/ ctx[7]);
    	filtercontrol.$on("changeFilter", /*applyFilter*/ ctx[8]);
    	filtercontrol.$on("changeSort", /*changeSort*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(filtercontrol.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filtercontrol, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const filtercontrol_changes = {};
    			if (dirty & /*galleryScreen*/ 8) filtercontrol_changes.selectedGallery = /*galleryScreen*/ ctx[3];
    			if (dirty & /*shownTeamsData*/ 2) filtercontrol_changes.teams = /*shownTeamsData*/ ctx[1];
    			filtercontrol.$set(filtercontrol_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filtercontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filtercontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filtercontrol, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(212:12) {#if sidebarScreen === 'filter'}",
    		ctx
    	});

    	return block;
    }

    // (222:12) {#if sidebarScreen === 'about'}
    function create_if_block(ctx) {
    	let aboutbox;
    	let current;
    	aboutbox = new Aboutbox({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(aboutbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aboutbox, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aboutbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aboutbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aboutbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(222:12) {#if sidebarScreen === 'about'}",
    		ctx
    	});

    	return block;
    }

    // (237:4) <Route path="/:id" let:params>
    function create_default_slot_1(ctx) {
    	let overlay;
    	let current;

    	overlay = new Overlay({
    			props: {
    				player: /*getPlayerData*/ ctx[5](/*params*/ ctx[13].id)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(overlay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(overlay, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const overlay_changes = {};
    			if (dirty & /*params*/ 8192) overlay_changes.player = /*getPlayerData*/ ctx[5](/*params*/ ctx[13].id);
    			overlay.$set(overlay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overlay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(overlay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(237:4) <Route path=\\\"/:id\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (201:0) <Router>
    function create_default_slot(ctx) {
    	let div2;
    	let div0;
    	let darkmodetoggle;
    	let t0;
    	let siteheader;
    	let t1;
    	let sidebarnav;
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let gallery;
    	let t5;
    	let totopbutton;
    	let t6;
    	let route;
    	let current;
    	darkmodetoggle = new DarkModeToggle({ $$inline: true });
    	darkmodetoggle.$on("toggle", toggleDarkMode);
    	siteheader = new SiteHeader({ $$inline: true });

    	sidebarnav = new SidebarNav({
    			props: { selectedScreen: /*sidebarScreen*/ ctx[2] },
    			$$inline: true
    		});

    	sidebarnav.$on("selectscreen", /*switchSidebarScreen*/ ctx[4]);
    	let if_block0 = /*sidebarScreen*/ ctx[2] === "filter" && create_if_block_1(ctx);
    	let if_block1 = /*sidebarScreen*/ ctx[2] === "about" && create_if_block(ctx);

    	gallery = new Gallery({
    			props: { players: /*playersShown*/ ctx[0] },
    			$$inline: true
    		});

    	totopbutton = new TotopButton({ $$inline: true });
    	totopbutton.$on("click", scrollToTop);

    	route = new Route({
    			props: {
    				path: "/:id",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ params }) => ({ 13: params }),
    						({ params }) => params ? 8192 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(darkmodetoggle.$$.fragment);
    			t0 = space();
    			create_component(siteheader.$$.fragment);
    			t1 = space();
    			create_component(sidebarnav.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			div1 = element("div");
    			create_component(gallery.$$.fragment);
    			t5 = space();
    			create_component(totopbutton.$$.fragment);
    			t6 = space();
    			create_component(route.$$.fragment);
    			attr_dev(div0, "class", "sidebar svelte-bwnerk");
    			add_location(div0, file, 202, 8, 5545);
    			attr_dev(div1, "class", "main-content svelte-bwnerk");
    			add_location(div1, file, 227, 8, 6341);
    			attr_dev(div2, "class", "main-container svelte-bwnerk");
    			add_location(div2, file, 201, 4, 5507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(darkmodetoggle, div0, null);
    			append_dev(div0, t0);
    			mount_component(siteheader, div0, null);
    			append_dev(div0, t1);
    			mount_component(sidebarnav, div0, null);
    			append_dev(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			mount_component(gallery, div1, null);
    			insert_dev(target, t5, anchor);
    			mount_component(totopbutton, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sidebarnav_changes = {};
    			if (dirty & /*sidebarScreen*/ 4) sidebarnav_changes.selectedScreen = /*sidebarScreen*/ ctx[2];
    			sidebarnav.$set(sidebarnav_changes);

    			if (/*sidebarScreen*/ ctx[2] === "filter") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*sidebarScreen*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*sidebarScreen*/ ctx[2] === "about") {
    				if (if_block1) {
    					if (dirty & /*sidebarScreen*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const gallery_changes = {};
    			if (dirty & /*playersShown*/ 1) gallery_changes.players = /*playersShown*/ ctx[0];
    			gallery.$set(gallery_changes);
    			const route_changes = {};

    			if (dirty & /*$$scope, params*/ 24576) {
    				route_changes.$$scope = { dirty, ctx };
    			}

    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(darkmodetoggle.$$.fragment, local);
    			transition_in(siteheader.$$.fragment, local);
    			transition_in(sidebarnav.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(gallery.$$.fragment, local);
    			transition_in(totopbutton.$$.fragment, local);
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(darkmodetoggle.$$.fragment, local);
    			transition_out(siteheader.$$.fragment, local);
    			transition_out(sidebarnav.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(gallery.$$.fragment, local);
    			transition_out(totopbutton.$$.fragment, local);
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(darkmodetoggle);
    			destroy_component(siteheader);
    			destroy_component(sidebarnav);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(gallery);
    			if (detaching) detach_dev(t5);
    			destroy_component(totopbutton, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(201:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope, playersShown, sidebarScreen, galleryScreen, shownTeamsData*/ 16399) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scrollToTop(e) {
    	window.scrollTo(0, 0);
    }

    function toggleDarkMode(e) {
    	//TODO
    	const body = document.body;

    	body.classList.toggle("darkmode");

    	if (body.classList.contains("darkmode")) window.localStorage.setItem("darkmode", "true"); else {
    		window.localStorage.removeItem("darkmode");
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let unfilteredPlayers = PlayersData;
    	let playersShown = unfilteredPlayers;
    	let shownTeamsData = TeamsData;
    	let sidebarScreen = "filter";
    	let galleryScreen = "main";
    	let currentSortType = "";

    	function switchSidebarScreen(e) {
    		$$invalidate(2, sidebarScreen = e.detail.screen);
    	}

    	function getPlayerData(id) {
    		id = decodeURI(id);
    		const allPlayers = PlayersData.concat(GuestPlayersData);
    		return allPlayers.find(player => player.id === id);
    	}

    	function switchGallery(e) {
    		const chosenGallery = e.detail.gallery;
    		$$invalidate(3, galleryScreen = chosenGallery);

    		if (chosenGallery === "main") {
    			unfilteredPlayers = PlayersData;
    			$$invalidate(1, shownTeamsData = TeamsData);
    		}

    		if (chosenGallery === "guest") {
    			unfilteredPlayers = GuestPlayersData;
    			$$invalidate(1, shownTeamsData = GuestTeamsData);
    		}

    		$$invalidate(0, playersShown = unfilteredPlayers);
    	}

    	function filterPlayerName(e) {
    		const nameToSearch = e.detail.name;

    		$$invalidate(0, playersShown = unfilteredPlayers.filter(player => {
    			return player["full-name"].toLowerCase().includes(nameToSearch.toLowerCase());
    		}));

    		// Re-apply sorting
    		applySort();
    	}

    	function applyFilter(e) {
    		console.log("lmao");
    		const filters = e.detail.appliedFilters;
    		const team = e.detail.teamFilter;

    		if (!filters.length || !team) {
    			// This means no filter checkbox is checked
    			// or no team to filter to is chosen
    			// In which case, return to unfiltered
    			$$invalidate(0, playersShown = unfilteredPlayers);

    			// Re-apply sorting
    			applySort();

    			return;
    		}

    		// Only show players who fit the filter criteria(s)
    		$$invalidate(0, playersShown = unfilteredPlayers.filter(player => {
    			if (filters.includes("wasmemberof")) {
    				if (player["former-teams"].includes(team)) {
    					return true;
    				}
    			}

    			if (filters.includes("ismemberof")) {
    				if (player["team"] === team) {
    					return true;
    				}
    			}

    			return false;
    		}));
    	}

    	function applySort() {
    		const sortType = currentSortType;

    		if (!sortType) {
    			// If no sortType is set (e.g. it's empty string)
    			// don't sort anything
    			return;
    		}

    		if (sortType === "original") {
    			// Slice() so we don't modify the original
    			// Not that it matters much in Svelte, but just in case
    			$$invalidate(0, playersShown = playersShown.slice().sort((playera, playerb) => {
    				return playera.index - playerb.index;
    			}));
    		}

    		if (sortType === "latest") {
    			$$invalidate(0, playersShown = playersShown.slice().sort((playera, playerb) => {
    				return playerb.index - playera.index;
    			}));
    		} else if (sortType === "alphabetical") {
    			$$invalidate(0, playersShown = playersShown.slice().sort((playera, playerb) => {
    				if (playera["full-name"] < playerb["full-name"]) {
    					return -1;
    				}

    				if (playera["full-name"] > playerb["full-name"]) {
    					return 1;
    				}

    				return 0;
    			}));
    		} else if (sortType === "currentteam") {
    			$$invalidate(0, playersShown = playersShown.slice().sort((playera, playerb) => {
    				if (teamsReverseId[playera["team"]] < teamsReverseId[playerb["team"]]) {
    					return -1;
    				}

    				if (teamsReverseId[playera["team"]] > teamsReverseId[playerb["team"]]) {
    					return 1;
    				}

    				return 0;
    			}));
    		}
    	}

    	function changeSort(e) {
    		currentSortType = e.detail.sortType;
    		applySort();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		SiteHeader,
    		SidebarNav,
    		Aboutbox,
    		FilterControl,
    		Gallery,
    		Overlay,
    		TotopButton,
    		DarkModeToggle,
    		PlayersData,
    		GuestPlayersData,
    		TeamsData,
    		GuestTeamsData,
    		TeamsList: teamsReverseId,
    		unfilteredPlayers,
    		playersShown,
    		shownTeamsData,
    		sidebarScreen,
    		galleryScreen,
    		currentSortType,
    		switchSidebarScreen,
    		getPlayerData,
    		switchGallery,
    		filterPlayerName,
    		applyFilter,
    		applySort,
    		changeSort,
    		scrollToTop,
    		toggleDarkMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("unfilteredPlayers" in $$props) unfilteredPlayers = $$props.unfilteredPlayers;
    		if ("playersShown" in $$props) $$invalidate(0, playersShown = $$props.playersShown);
    		if ("shownTeamsData" in $$props) $$invalidate(1, shownTeamsData = $$props.shownTeamsData);
    		if ("sidebarScreen" in $$props) $$invalidate(2, sidebarScreen = $$props.sidebarScreen);
    		if ("galleryScreen" in $$props) $$invalidate(3, galleryScreen = $$props.galleryScreen);
    		if ("currentSortType" in $$props) currentSortType = $$props.currentSortType;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		playersShown,
    		shownTeamsData,
    		sidebarScreen,
    		galleryScreen,
    		switchSidebarScreen,
    		getPlayerData,
    		switchGallery,
    		filterPlayerName,
    		applyFilter,
    		changeSort
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import * as riot from 'riot'

    var app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
