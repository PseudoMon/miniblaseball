(function () {
  'use strict';

  /* Riot v4.14.0, @license MIT */
  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */
  function camelToDashCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */

  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */

  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      acc[dashToCamelCase(attribute.name)] = attribute.value;
      return acc;
    }, {});
  }
  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  // Ignore this helper because it's needed only for svg tags

  function moveChildren(source, target) {
    if (source.firstChild) {
      target.appendChild(source.firstChild);
      moveChildren(source, target);
    }
  }
  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */

  function cleanNode(node) {
    clearChildren(node.childNodes);
  }
  /**
   * Clear multiple children in a node
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */

  function clearChildren(children) {
    Array.from(children).forEach(removeNode);
  }
  /**
   * Remove a node from the DOM
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */

  function removeNode(node) {
    const {
      parentNode
    } = node;
    if (node.remove) node.remove();
    /* istanbul ignore else */
    else if (parentNode) parentNode.removeChild(node);
  }

  const EACH = 0;
  const IF = 1;
  const SIMPLE = 2;
  const TAG = 3;
  const SLOT = 4;
  var bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG,
    SLOT
  };

  const ATTRIBUTE = 0;
  const EVENT = 1;
  const TEXT = 2;
  const VALUE = 3;
  var expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT,
    VALUE
  };

  /**
   * Create the template meta object in case of <template> fragments
   * @param   {TemplateChunk} componentTemplate - template chunk object
   * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
   */
  function createTemplateMeta(componentTemplate) {
    const fragment = componentTemplate.dom.cloneNode(true);
    return {
      avoidDOMInjection: true,
      fragment,
      children: Array.from(fragment.childNodes)
    };
  }

  const {
    indexOf,
    slice
  } = [];

  const append = (get, parent, children, start, end, before) => {
    const isSelect = ('selectedIndex' in parent);
    let noSelection = isSelect;

    while (start < end) {
      const child = get(children[start], 1);
      parent.insertBefore(child, before);

      if (isSelect && noSelection && child.selected) {
        noSelection = !noSelection;
        let {
          selectedIndex
        } = parent;
        parent.selectedIndex = selectedIndex < 0 ? start : indexOf.call(parent.querySelectorAll('option'), child);
      }

      start++;
    }
  };
  const eqeq = (a, b) => a == b;
  const identity = O => O;
  const indexOf$1 = (moreNodes, moreStart, moreEnd, lessNodes, lessStart, lessEnd, compare) => {
    const length = lessEnd - lessStart;
    /* istanbul ignore if */

    if (length < 1) return -1;

    while (moreEnd - moreStart >= length) {
      let m = moreStart;
      let l = lessStart;

      while (m < moreEnd && l < lessEnd && compare(moreNodes[m], lessNodes[l])) {
        m++;
        l++;
      }

      if (l === lessEnd) return moreStart;
      moreStart = m + 1;
    }

    return -1;
  };
  const isReversed = (futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare) => {
    while (currentStart < currentEnd && compare(currentNodes[currentStart], futureNodes[futureEnd - 1])) {
      currentStart++;
      futureEnd--;
    }
    return futureEnd === 0;
  };
  const next = (get, list, i, length, before) => i < length ? get(list[i], 0) : 0 < i ? get(list[i - 1], -0).nextSibling : before;
  const remove = (get, children, start, end) => {
    while (start < end) drop(get(children[start++], -1));
  }; // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -

  const DELETION = -1;
  const INSERTION = 1;
  const SKIP = 0;
  const SKIP_OND = 50;

  const HS = (futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges) => {
    let k = 0;
    /* istanbul ignore next */

    let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
    const link = Array(minLen++);
    const tresh = Array(minLen);
    tresh[0] = -1;

    for (let i = 1; i < minLen; i++) tresh[i] = currentEnd;

    const nodes = currentNodes.slice(currentStart, currentEnd);

    for (let i = futureStart; i < futureEnd; i++) {
      const index = nodes.indexOf(futureNodes[i]);

      if (-1 < index) {
        const idxInOld = index + currentStart;
        k = findK(tresh, minLen, idxInOld);
        /* istanbul ignore else */

        if (-1 < k) {
          tresh[k] = idxInOld;
          link[k] = {
            newi: i,
            oldi: idxInOld,
            prev: link[k - 1]
          };
        }
      }
    }

    k = --minLen;
    --currentEnd;

    while (tresh[k] > currentEnd) --k;

    minLen = currentChanges + futureChanges - k;
    const diff = Array(minLen);
    let ptr = link[k];
    --futureEnd;

    while (ptr) {
      const {
        newi,
        oldi
      } = ptr;

      while (futureEnd > newi) {
        diff[--minLen] = INSERTION;
        --futureEnd;
      }

      while (currentEnd > oldi) {
        diff[--minLen] = DELETION;
        --currentEnd;
      }

      diff[--minLen] = SKIP;
      --futureEnd;
      --currentEnd;
      ptr = ptr.prev;
    }

    while (futureEnd >= futureStart) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }

    while (currentEnd >= currentStart) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }

    return diff;
  }; // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561


  const OND = (futureNodes, futureStart, rows, currentNodes, currentStart, cols, compare) => {
    const length = rows + cols;
    const v = [];
    let d, k, r, c, pv, cv, pd;

    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND) return null;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      cv = v[d] = [];

      for (k = -d; k <= d; k += 2) {
        if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
          c = pv[pd + k + 1];
        } else {
          c = pv[pd + k - 1] + 1;
        }

        r = c - k;

        while (c < cols && r < rows && compare(currentNodes[currentStart + c], futureNodes[futureStart + r])) {
          c++;
          r++;
        }

        if (c === cols && r === rows) {
          break outer;
        }

        cv[d + k] = c;
      }
    }

    const diff = Array(d / 2 + length / 2);
    let diffIdx = diff.length - 1;

    for (d = v.length - 1; d >= 0; d--) {
      while (c > 0 && r > 0 && compare(currentNodes[currentStart + c - 1], futureNodes[futureStart + r - 1])) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP;
        c--;
        r--;
      }

      if (!d) break;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      k = c - r;

      if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
        // vertical edge = insertion
        r--;
        diff[diffIdx--] = INSERTION;
      } else {
        // horizontal edge = deletion
        c--;
        diff[diffIdx--] = DELETION;
      }
    }

    return diff;
  };

  const applyDiff = (diff, get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before) => {
    const live = [];
    const length = diff.length;
    let currentIndex = currentStart;
    let i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          futureStart++;
          currentIndex++;
          break;

        case INSERTION:
          // TODO: bulk appends for sequential nodes
          live.push(futureNodes[futureStart]);
          append(get, parentNode, futureNodes, futureStart++, futureStart, currentIndex < currentLength ? get(currentNodes[currentIndex], 0) : before);
          break;

        case DELETION:
          currentIndex++;
          break;
      }
    }

    i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          currentStart++;
          break;

        case DELETION:
          // TODO: bulk removes for sequential nodes
          if (-1 < live.indexOf(currentNodes[currentStart])) currentStart++;else remove(get, currentNodes, currentStart++, currentStart);
          break;
      }
    }
  };

  const findK = (ktr, length, j) => {
    let lo = 1;
    let hi = length;

    while (lo < hi) {
      const mid = (lo + hi) / 2 >>> 0;
      if (j < ktr[mid]) hi = mid;else lo = mid + 1;
    }

    return lo;
  };

  const smartDiff = (get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before) => {
    applyDiff(OND(futureNodes, futureStart, futureChanges, currentNodes, currentStart, currentChanges, compare) || HS(futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges), get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before);
  };

  const drop = node => (node.remove || dropChild).call(node);

  function dropChild() {
    const {
      parentNode
    } = this;
    /* istanbul ignore else */

    if (parentNode) parentNode.removeChild(this);
  }

  /*! (c) 2018 Andrea Giammarchi (ISC) */

  const domdiff = (parentNode, // where changes happen
  currentNodes, // Array of current items/nodes
  futureNodes, // Array of future items/nodes
  options // optional object with one of the following properties
  //  before: domNode
  //  compare(generic, generic) => true if same generic
  //  node(generic) => Node
  ) => {
    if (!options) options = {};
    const compare = options.compare || eqeq;
    const get = options.node || identity;
    const before = options.before == null ? null : get(options.before, 0);
    const currentLength = currentNodes.length;
    let currentEnd = currentLength;
    let currentStart = 0;
    let futureEnd = futureNodes.length;
    let futureStart = 0; // common prefix

    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentStart], futureNodes[futureStart])) {
      currentStart++;
      futureStart++;
    } // common suffix


    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])) {
      currentEnd--;
      futureEnd--;
    }

    const currentSame = currentStart === currentEnd;
    const futureSame = futureStart === futureEnd; // same list

    if (currentSame && futureSame) return futureNodes; // only stuff to add

    if (currentSame && futureStart < futureEnd) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentStart, currentLength, before));
      return futureNodes;
    } // only stuff to remove


    if (futureSame && currentStart < currentEnd) {
      remove(get, currentNodes, currentStart, currentEnd);
      return futureNodes;
    }

    const currentChanges = currentEnd - currentStart;
    const futureChanges = futureEnd - futureStart;
    let i = -1; // 2 simple indels: the shortest sequence is a subsequence of the longest

    if (currentChanges < futureChanges) {
      i = indexOf$1(futureNodes, futureStart, futureEnd, currentNodes, currentStart, currentEnd, compare); // inner diff

      if (-1 < i) {
        append(get, parentNode, futureNodes, futureStart, i, get(currentNodes[currentStart], 0));
        append(get, parentNode, futureNodes, i + currentChanges, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
        return futureNodes;
      }
    }
    /* istanbul ignore else */
    else if (futureChanges < currentChanges) {
        i = indexOf$1(currentNodes, currentStart, currentEnd, futureNodes, futureStart, futureEnd, compare); // outer diff

        if (-1 < i) {
          remove(get, currentNodes, currentStart, i);
          remove(get, currentNodes, i + futureChanges, currentEnd);
          return futureNodes;
        }
      } // common case with one replacement for many nodes
    // or many nodes replaced for a single one

    /* istanbul ignore else */


    if (currentChanges < 2 || futureChanges < 2) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, get(currentNodes[currentStart], 0));
      remove(get, currentNodes, currentStart, currentEnd);
      return futureNodes;
    } // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too
    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.


    if (currentChanges === futureChanges && isReversed(futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare)) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
      return futureNodes;
    } // last resort through a smart diff


    smartDiff(get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before);
    return futureNodes;
  };

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    return typeof element === type;
  }
  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */

  function isSvg(el) {
    const owner = el.ownerSVGElement;
    return !!owner || owner === null;
  }
  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */

  function isTemplate(el) {
    return !isNil(el.content);
  }
  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */

  function isFunction(value) {
    return checkType(value, 'function');
  }
  /**
   * Check if a value is a Boolean
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is a boolean
   */

  function isBoolean(value) {
    return checkType(value, 'boolean');
  }
  /**
   * Check if a value is an Object
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is an object
   */

  function isObject(value) {
    return !isNil(value) && checkType(value, 'object');
  }
  /**
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */

  function isNil(value) {
    return value === null || value === undefined;
  }

  const UNMOUNT_SCOPE = Symbol('unmount');
  const EachBinding = Object.seal({
    // dynamic binding properties
    // childrenMap: null,
    // node: null,
    // root: null,
    // condition: null,
    // evaluate: null,
    // template: null,
    // isTemplateTag: false,
    nodes: [],

    // getKey: null,
    // indexName: null,
    // itemName: null,
    // afterPlaceholder: null,
    // placeholder: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const {
        placeholder,
        nodes,
        childrenMap
      } = this;
      const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope);
      const items = collection ? Array.from(collection) : [];
      const parent = placeholder.parentNode; // prepare the diffing

      const {
        newChildrenMap,
        batches,
        futureNodes
      } = createPatch(items, scope, parentScope, this); // patch the DOM only if there are new nodes

      domdiff(parent, nodes, futureNodes, {
        before: placeholder,
        node: patch(Array.from(childrenMap.values()), parentScope)
      }); // trigger the mounts and the updates

      batches.forEach(fn => fn()); // update the children map

      this.childrenMap = newChildrenMap;
      this.nodes = futureNodes;
      return this;
    },

    unmount(scope, parentScope) {
      this.update(UNMOUNT_SCOPE, parentScope);
      return this;
    }

  });
  /**
   * Patch the DOM while diffing
   * @param   {TemplateChunk[]} redundant - redundant tepmplate chunks
   * @param   {*} parentScope - scope of the parent template
   * @returns {Function} patch function used by domdiff
   */

  function patch(redundant, parentScope) {
    return (item, info) => {
      if (info < 0) {
        const element = redundant.pop();

        if (element) {
          const {
            template,
            context
          } = element; // notice that we pass null as last argument because
          // the root node and its children will be removed by domdiff

          template.unmount(context, parentScope, null);
        }
      }

      return item;
    };
  }
  /**
   * Check whether a template must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */


  function mustFilterItem(condition, context) {
    return condition ? Boolean(condition(context)) === false : false;
  }
  /**
   * Extend the scope of the looped template
   * @param   {Object} scope - current template scope
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @returns {Object} enhanced scope object
   */


  function extendScope(scope, _ref) {
    let {
      itemName,
      indexName,
      index,
      item
    } = _ref;
    scope[itemName] = item;
    if (indexName) scope[indexName] = index;
    return scope;
  }
  /**
   * Loop the current template items
   * @param   {Array} items - expression collection value
   * @param   {*} scope - template scope
   * @param   {*} parentScope - scope of the parent template
   * @param   {EeachBinding} binding - each binding object instance
   * @returns {Object} data
   * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
   * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
   * @returns {Array} data.futureNodes - array containing the nodes we need to diff
   */


  function createPatch(items, scope, parentScope, binding) {
    const {
      condition,
      template,
      childrenMap,
      itemName,
      getKey,
      indexName,
      root,
      isTemplateTag
    } = binding;
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];
    items.forEach((item, index) => {
      const context = extendScope(Object.create(scope), {
        itemName,
        indexName,
        index,
        item
      });
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);

      if (mustFilterItem(condition, context)) {
        return;
      }

      const componentTemplate = oldItem ? oldItem.template : template.clone();
      const el = oldItem ? componentTemplate.el : root.cloneNode();
      const mustMount = !oldItem;
      const meta = isTemplateTag && mustMount ? createTemplateMeta(componentTemplate) : {};

      if (mustMount) {
        batches.push(() => componentTemplate.mount(el, context, parentScope, meta));
      } else {
        batches.push(() => componentTemplate.update(context, parentScope));
      } // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes


      if (isTemplateTag) {
        const children = meta.children || componentTemplate.children;
        futureNodes.push(...children);
      } else {
        futureNodes.push(el);
      } // delete the old item from the children map


      childrenMap.delete(key); // update the children map

      newChildrenMap.set(key, {
        template: componentTemplate,
        context,
        index
      });
    });
    return {
      newChildrenMap,
      batches,
      futureNodes
    };
  }

  function create(node, _ref2) {
    let {
      evaluate,
      condition,
      itemName,
      indexName,
      getKey,
      template
    } = _ref2;
    const placeholder = document.createTextNode('');
    const parent = node.parentNode;
    const root = node.cloneNode();
    parent.insertBefore(placeholder, node);
    removeNode(node);
    return Object.assign({}, EachBinding, {
      childrenMap: new Map(),
      node,
      root,
      condition,
      evaluate,
      isTemplateTag: isTemplate(root),
      template: template.createDOM(node),
      getKey,
      indexName,
      itemName,
      placeholder
    });
  }

  /**
   * Binding responsible for the `if` directive
   */

  const IfBinding = Object.seal({
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // isTemplateTag: false,
    // placeholder: null,
    // template: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;

      const mount = () => {
        const pristine = this.node.cloneNode();
        this.placeholder.parentNode.insertBefore(pristine, this.placeholder);
        this.template = this.template.clone();
        this.template.mount(pristine, scope, parentScope);
      };

      switch (true) {
        case mustMount:
          mount();
          break;

        case mustUnmount:
          this.unmount(scope);
          break;

        default:
          if (value) this.template.update(scope, parentScope);
      }

      this.value = value;
      return this;
    },

    unmount(scope, parentScope) {
      this.template.unmount(scope, parentScope, true);
      return this;
    }

  });
  function create$1(node, _ref) {
    let {
      evaluate,
      template
    } = _ref;
    const parent = node.parentNode;
    const placeholder = document.createTextNode('');
    parent.insertBefore(placeholder, node);
    removeNode(node);
    return Object.assign({}, IfBinding, {
      node,
      evaluate,
      placeholder,
      template: template.createDOM(node)
    });
  }

  /**
   * Throw an error with a descriptive message
   * @param   { string } message - error message
   * @returns { undefined } hoppla.. at this point the program should stop working
   */

  function panic(message) {
    throw new Error(message);
  }
  /**
   * Returns the memoized (cached) function.
   * // borrowed from https://www.30secondsofcode.org/js/s/memoize
   * @param {Function} fn - function to memoize
   * @returns {Function} memoize function
   */

  function memoize(fn) {
    const cache = new Map();

    const cached = val => {
      return cache.has(val) ? cache.get(val) : cache.set(val, fn.call(this, val)) && cache.get(val);
    };

    cached.cache = cache;
    return cached;
  }
  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @returns {Object} key value pairs with the result of the computation
   */

  function evaluateAttributeExpressions(attributes) {
    return attributes.reduce((acc, attribute) => {
      const {
        value,
        type
      } = attribute;

      switch (true) {
        // spread attribute
        case !attribute.name && type === ATTRIBUTE:
          return Object.assign({}, acc, value);
        // value attribute

        case type === VALUE:
          acc.value = attribute.value;
          break;
        // normal attributes

        default:
          acc[dashToCamelCase(attribute.name)] = attribute.value;
      }

      return acc;
    }, {});
  }

  const REMOVE_ATTRIBUTE = 'removeAttribute';
  const SET_ATTIBUTE = 'setAttribute';
  const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype;
  const isNativeHtmlProperty = memoize(name => ElementProto.hasOwnProperty(name)); // eslint-disable-line

  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */

  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach((_ref) => {
      let [name, value] = _ref;
      return attributeExpression(node, {
        name
      }, value);
    });
  }
  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} newAttributes - object containing all the new attribute names
   * @param   {Object} oldAttributes - object containing all the old attribute names
   * @returns {undefined} sorry it's a void function :(
   */


  function removeAllAttributes(node, newAttributes, oldAttributes) {
    const newKeys = newAttributes ? Object.keys(newAttributes) : [];
    Object.keys(oldAttributes).filter(name => !newKeys.includes(name)).forEach(attribute => node.removeAttribute(attribute));
  }
  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - attribute name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - the old expression cached value
   * @returns {undefined}
   */


  function attributeExpression(node, _ref2, value, oldValue) {
    let {
      name
    } = _ref2;

    // is it a spread operator? {...attributes}
    if (!name) {
      if (oldValue) {
        // remove all the old attributes
        removeAllAttributes(node, value, oldValue);
      } // is the value still truthy?


      if (value) {
        setAllAttributes(node, value);
      }

      return;
    } // handle boolean attributes


    if (!isNativeHtmlProperty(name) && (isBoolean(value) || isObject(value) || isFunction(value))) {
      node[name] = value;
    }

    node[getMethod(value)](name, normalizeValue(name, value));
  }
  /**
   * Get the attribute modifier method
   * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
   * @returns {string} the node attribute modifier method name
   */

  function getMethod(value) {
    return isNil(value) || value === false || value === '' || isObject(value) || isFunction(value) ? REMOVE_ATTRIBUTE : SET_ATTIBUTE;
  }
  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @returns {string} input value as string
   */


  function normalizeValue(name, value) {
    // be sure that expressions like selected={ true } will be always rendered as selected='selected'
    if (value === true) return name;
    return value;
  }

  const RE_EVENTS_PREFIX = /^on/;

  const getCallbackAndOptions = value => Array.isArray(value) ? value : [value, false]; // see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38


  const EventListener = {
    handleEvent(event) {
      this[event.type](event);
    }

  };
  const ListenersWeakMap = new WeakMap();

  const createListener = node => {
    const listener = Object.create(EventListener);
    ListenersWeakMap.set(node, listener);
    return listener;
  };
  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {value} the callback just received
   */


  function eventExpression(node, _ref, value) {
    let {
      name
    } = _ref;
    const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '');
    const eventListener = ListenersWeakMap.get(node) || createListener(node);
    const [callback, options] = getCallbackAndOptions(value);
    const handler = eventListener[normalizedEventName];
    const mustRemoveEvent = handler && !callback;
    const mustAddEvent = callback && !handler;

    if (mustRemoveEvent) {
      node.removeEventListener(normalizedEventName, eventListener);
    }

    if (mustAddEvent) {
      node.addEventListener(normalizedEventName, eventListener, options);
    }

    eventListener[normalizedEventName] = callback;
  }

  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */

  function normalizeStringValue(value) {
    return isNil(value) ? '' : value;
  }

  /**
   * Get the the target text node to update or create one from of a comment node
   * @param   {HTMLElement} node - any html element containing childNodes
   * @param   {number} childNodeIndex - index of the text node in the childNodes list
   * @returns {HTMLTextNode} the text node to update
   */

  const getTextNode = (node, childNodeIndex) => {
    const target = node.childNodes[childNodeIndex];

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode('');
      node.replaceChild(textNode, target);
      return textNode;
    }

    return target;
  };
  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} data - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */

  function textExpression(node, data, value) {
    node.data = normalizeStringValue(value);
  }

  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */

  function valueExpression(node, expression, value) {
    node.value = normalizeStringValue(value);
  }

  var expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression
  };

  const Expression = Object.seal({
    // Static props
    // node: null,
    // value: null,
    // API methods

    /**
     * Mount the expression evaluating its initial value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      this.value = this.evaluate(scope); // IO() DOM updates

      apply(this, this.value);
      return this;
    },

    /**
     * Update the expression if its value changed
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    update(scope) {
      // pure function
      const value = this.evaluate(scope);

      if (this.value !== value) {
        // IO() DOM updates
        apply(this, value);
        this.value = value;
      }

      return this;
    },

    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      // unmount only the event handling expressions
      if (this.type === EVENT) apply(this, null);
      return this;
    }

  });
  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */

  function apply(expression, value) {
    return expressions[expression.type](expression.node, expression, value, expression.value);
  }

  function create$2(node, data) {
    return Object.assign({}, Expression, data, {
      node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node
    });
  }

  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   {Array} collection - collection to iterate
   * @param   {Array<string>} methods - methods to execute on each item of the collection
   * @param   {*} context - context returned by the new methods created
   * @returns {Object} a new object to simplify the the nested methods dispatching
   */
  function flattenCollectionMethods(collection, methods, context) {
    return methods.reduce((acc, method) => {
      return Object.assign({}, acc, {
        [method]: scope => {
          return collection.map(item => item[method](scope)) && context;
        }
      });
    }, {});
  }

  function create$3(node, _ref) {
    let {
      expressions
    } = _ref;
    return Object.assign({}, flattenCollectionMethods(expressions.map(expression => create$2(node, expression)), ['mount', 'update', 'unmount']));
  }

  // Riot.js constants that can be used accross more modules
  const COMPONENTS_IMPLEMENTATION_MAP = new Map(),
        DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
        PLUGINS_SET = new Set(),
        IS_DIRECTIVE = 'is',
        VALUE_ATTRIBUTE = 'value',
        MOUNT_METHOD_KEY = 'mount',
        UPDATE_METHOD_KEY = 'update',
        UNMOUNT_METHOD_KEY = 'unmount',
        SHOULD_UPDATE_KEY = 'shouldUpdate',
        ON_BEFORE_MOUNT_KEY = 'onBeforeMount',
        ON_MOUNTED_KEY = 'onMounted',
        ON_BEFORE_UPDATE_KEY = 'onBeforeUpdate',
        ON_UPDATED_KEY = 'onUpdated',
        ON_BEFORE_UNMOUNT_KEY = 'onBeforeUnmount',
        ON_UNMOUNTED_KEY = 'onUnmounted',
        PROPS_KEY = 'props',
        STATE_KEY = 'state',
        SLOTS_KEY = 'slots',
        ROOT_KEY = 'root',
        IS_PURE_SYMBOL = Symbol.for('pure'),
        PARENT_KEY_SYMBOL = Symbol('parent'),
        ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
        TEMPLATE_KEY_SYMBOL = Symbol('template');

  var globals = /*#__PURE__*/Object.freeze({
    __proto__: null,
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP,
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY,
    PLUGINS_SET: PLUGINS_SET,
    IS_DIRECTIVE: IS_DIRECTIVE,
    VALUE_ATTRIBUTE: VALUE_ATTRIBUTE,
    MOUNT_METHOD_KEY: MOUNT_METHOD_KEY,
    UPDATE_METHOD_KEY: UPDATE_METHOD_KEY,
    UNMOUNT_METHOD_KEY: UNMOUNT_METHOD_KEY,
    SHOULD_UPDATE_KEY: SHOULD_UPDATE_KEY,
    ON_BEFORE_MOUNT_KEY: ON_BEFORE_MOUNT_KEY,
    ON_MOUNTED_KEY: ON_MOUNTED_KEY,
    ON_BEFORE_UPDATE_KEY: ON_BEFORE_UPDATE_KEY,
    ON_UPDATED_KEY: ON_UPDATED_KEY,
    ON_BEFORE_UNMOUNT_KEY: ON_BEFORE_UNMOUNT_KEY,
    ON_UNMOUNTED_KEY: ON_UNMOUNTED_KEY,
    PROPS_KEY: PROPS_KEY,
    STATE_KEY: STATE_KEY,
    SLOTS_KEY: SLOTS_KEY,
    ROOT_KEY: ROOT_KEY,
    IS_PURE_SYMBOL: IS_PURE_SYMBOL,
    PARENT_KEY_SYMBOL: PARENT_KEY_SYMBOL,
    ATTRIBUTES_KEY_SYMBOL: ATTRIBUTES_KEY_SYMBOL,
    TEMPLATE_KEY_SYMBOL: TEMPLATE_KEY_SYMBOL
  });

  function extendParentScope(attributes, scope, parentScope) {
    if (!attributes || !attributes.length) return parentScope;
    const expressions = attributes.map(attr => Object.assign({}, attr, {
      value: attr.evaluate(scope)
    }));
    return Object.assign(Object.create(parentScope || null), evaluateAttributeExpressions(expressions));
  } // this function is only meant to fix an edge case
  // https://github.com/riot/riot/issues/2842


  const getRealParent = (scope, parentScope) => scope[PARENT_KEY_SYMBOL] || parentScope;

  const SlotBinding = Object.seal({
    // dynamic binding properties
    // node: null,
    // name: null,
    attributes: [],

    // template: null,
    getTemplateScope(scope, parentScope) {
      return extendParentScope(this.attributes, scope, parentScope);
    },

    // API methods
    mount(scope, parentScope) {
      const templateData = scope.slots ? scope.slots.find((_ref) => {
        let {
          id
        } = _ref;
        return id === this.name;
      }) : false;
      const {
        parentNode
      } = this.node;
      const realParent = getRealParent(scope, parentScope);
      this.template = templateData && create$6(templateData.html, templateData.bindings).createDOM(parentNode);

      if (this.template) {
        this.template.mount(this.node, this.getTemplateScope(scope, realParent), realParent);
        this.template.children = moveSlotInnerContent(this.node);
      }

      removeNode(this.node);
      return this;
    },

    update(scope, parentScope) {
      if (this.template) {
        const realParent = getRealParent(scope, parentScope);
        this.template.update(this.getTemplateScope(scope, realParent), realParent);
      }

      return this;
    },

    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.template) {
        this.template.unmount(this.getTemplateScope(scope, parentScope), null, mustRemoveRoot);
      }

      return this;
    }

  });
  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLNode} slot - slot node
   * @param   {HTMLElement} children - array to fill with the child nodes detected
   * @returns {HTMLElement[]} list of the node moved
   */

  function moveSlotInnerContent(slot, children) {
    if (children === void 0) {
      children = [];
    }

    const child = slot.firstChild;

    if (child) {
      slot.parentNode.insertBefore(child, slot);
      return [child, ...moveSlotInnerContent(slot)];
    }

    return children;
  }
  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {string} options.name - slot id
   * @returns {Object} Slot binding object
   */


  function createSlot(node, _ref2) {
    let {
      name,
      attributes
    } = _ref2;
    return Object.assign({}, SlotBinding, {
      attributes,
      node,
      name
    });
  }

  /**
   * Create a new tag object if it was registered before, otherwise fallback to the simple
   * template chunk
   * @param   {Function} component - component factory function
   * @param   {Array<Object>} slots - array containing the slots markup
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */

  function getTag(component, slots, attributes) {
    if (slots === void 0) {
      slots = [];
    }

    if (attributes === void 0) {
      attributes = [];
    }

    // if this tag was registered before we will return its implementation
    if (component) {
      return component({
        slots,
        attributes
      });
    } // otherwise we return a template chunk


    return create$6(slotsToMarkup(slots), [...slotBindings(slots), {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map(attr => {
        return Object.assign({
          type: ATTRIBUTE
        }, attr);
      })
    }]);
  }
  /**
   * Merge all the slots bindings into a single array
   * @param   {Array<Object>} slots - slots collection
   * @returns {Array<Bindings>} flatten bindings array
   */


  function slotBindings(slots) {
    return slots.reduce((acc, _ref) => {
      let {
        bindings
      } = _ref;
      return acc.concat(bindings);
    }, []);
  }
  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<Object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */


  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html;
    }, '');
  }

  const TagBinding = Object.seal({
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // name: null,
    // slots: null,
    // tag: null,
    // attributes: null,
    // getComponent: null,
    mount(scope) {
      return this.update(scope);
    },

    update(scope, parentScope) {
      const name = this.evaluate(scope); // simple update

      if (name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        this.unmount(scope, parentScope, true); // mount the new tag

        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this;
    },

    unmount(scope, parentScope, keepRootTag) {
      if (this.tag) {
        // keep the root tag
        this.tag.unmount(keepRootTag);
      }

      return this;
    }

  });
  function create$4(node, _ref2) {
    let {
      evaluate,
      getComponent,
      slots,
      attributes
    } = _ref2;
    return Object.assign({}, TagBinding, {
      node,
      evaluate,
      slots,
      attributes,
      getComponent
    });
  }

  var bindings = {
    [IF]: create$1,
    [SIMPLE]: create$3,
    [EACH]: create,
    [TAG]: create$4,
    [SLOT]: createSlot
  };

  /**
   * Text expressions in a template tag will get childNodeIndex value normalized
   * depending on the position of the <template> tag offset
   * @param   {Expression[]} expressions - riot expressions array
   * @param   {number} textExpressionsOffset - offset of the <template> tag
   * @returns {Expression[]} expressions containing the text expressions normalized
   */

  function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
    return expressions.map(e => e.type === TEXT ? Object.assign({}, e, {
      childNodeIndex: e.childNodeIndex + textExpressionsOffset
    }) : e);
  }
  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {Object} binding - binding data
   * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
   * @returns {Binding} Binding object
   */


  function create$5(root, binding, templateTagOffset) {
    const {
      selector,
      type,
      redundantAttribute,
      expressions
    } = binding; // find the node to apply the bindings

    const node = selector ? root.querySelector(selector) : root; // remove eventually additional attributes created only to select this node

    if (redundantAttribute) node.removeAttribute(redundantAttribute);
    const bindingExpressions = expressions || []; // init the binding

    return (bindings[type] || bindings[SIMPLE])(node, Object.assign({}, binding, {
      expressions: templateTagOffset && !selector ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset) : bindingExpressions
    }));
  }

  function createHTMLTree(html, root) {
    const template = isTemplate(root) ? root : document.createElement('template');
    template.innerHTML = html;
    return template.content;
  } // for svg nodes we need a bit more work


  function createSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(new window.DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`, 'application/xml').documentElement, true);
    return svgNode;
  }
  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */


  function createDOMTree(root, html) {
    if (isSvg(root)) return createSVGTree(html, root);
    return createHTMLTree(html, root);
  }

  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
   * @returns {undefined}
   */

  function injectDOM(el, dom) {
    switch (true) {
      case isSvg(el):
        moveChildren(dom, el);
        break;

      case isTemplate(el):
        el.parentNode.replaceChild(dom, el);
        break;

      default:
        el.appendChild(dom);
    }
  }

  /**
   * Create the Template DOM skeleton
   * @param   {HTMLElement} el - root node where the DOM will be injected
   * @param   {string} html - markup that will be injected into the root node
   * @returns {HTMLFragment} fragment that will be injected into the root node
   */

  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html);
  }
  /**
   * Template Chunk model
   * @type {Object}
   */


  const TemplateChunk = Object.freeze({
    // Static props
    // bindings: null,
    // bindingsData: null,
    // html: null,
    // isTemplateTag: false,
    // fragment: null,
    // children: null,
    // dom: null,
    // el: null,

    /**
     * Create the template DOM structure that will be cloned on each mount
     * @param   {HTMLElement} el - the root node
     * @returns {TemplateChunk} self
     */
    createDOM(el) {
      // make sure that the DOM gets created before cloning the template
      this.dom = this.dom || createTemplateDOM(el, this.html);
      return this;
    },

    // API methods

    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
     * @returns {TemplateChunk} self
     */
    mount(el, scope, parentScope, meta) {
      if (meta === void 0) {
        meta = {};
      }

      if (!el) throw new Error('Please provide DOM node to mount properly your template');
      if (this.el) this.unmount(scope); // <template> tags require a bit more work
      // the template fragment might be already created via meta outside of this call

      const {
        fragment,
        children,
        avoidDOMInjection
      } = meta; // <template> bindings of course can not have a root element
      // so we check the parent node to set the query selector bindings

      const {
        parentNode
      } = children ? children[0] : el;
      const isTemplateTag = isTemplate(el);
      const templateTagOffset = isTemplateTag ? Math.max(Array.from(parentNode.childNodes).indexOf(el), 0) : null;
      this.isTemplateTag = isTemplateTag; // create the DOM if it wasn't created before

      this.createDOM(el);

      if (this.dom) {
        // create the new template dom fragment if it want already passed in via meta
        this.fragment = fragment || this.dom.cloneNode(true);
      } // store root node
      // notice that for template tags the root note will be the parent tag


      this.el = this.isTemplateTag ? parentNode : el; // create the children array only for the <template> fragments

      this.children = this.isTemplateTag ? children || Array.from(this.fragment.childNodes) : null; // inject the DOM into the el only if a fragment is available

      if (!avoidDOMInjection && this.fragment) injectDOM(el, this.fragment); // create the bindings

      this.bindings = this.bindingsData.map(binding => create$5(this.el, binding, templateTagOffset));
      this.bindings.forEach(b => b.mount(scope, parentScope));
      return this;
    },

    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @returns {TemplateChunk} self
     */
    update(scope, parentScope) {
      this.bindings.forEach(b => b.update(scope, parentScope));
      return this;
    },

    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
     * if false or undefined clean the root tag content, if null don't touch the DOM
     * @returns {TemplateChunk} self
     */
    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.el) {
        this.bindings.forEach(b => b.unmount(scope, parentScope, mustRemoveRoot));

        switch (true) {
          // <template> tags should be treated a bit differently
          // we need to clear their children only if it's explicitly required by the caller
          // via mustRemoveRoot !== null
          case this.children && mustRemoveRoot !== null:
            clearChildren(this.children);
            break;
          // remove the root node only if the mustRemoveRoot === true

          case mustRemoveRoot === true:
            removeNode(this.el);
            break;
          // otherwise we clean the node children

          case mustRemoveRoot !== null:
            cleanNode(this.el);
            break;
        }

        this.el = null;
      }

      return this;
    },

    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return Object.assign({}, this, {
        el: null
      });
    }

  });
  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {Array} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */

  function create$6(html, bindings) {
    if (bindings === void 0) {
      bindings = [];
    }

    return Object.assign({}, TemplateChunk, {
      html,
      bindingsData: bindings
    });
  }

  /**
   * Method used to bind expressions to a DOM node
   * @param   {string|HTMLElement} html - your static template html structure
   * @param   {Array} bindings - list of the expressions to bind to update the markup
   * @returns {TemplateChunk} a new TemplateChunk object having the `update`,`mount`, `unmount` and `clone` methods
   *
   * @example
   *
   * riotDOMBindings
   *  .template(
   *   `<div expr0><!----></div><div><p expr1><!----><section expr2></section></p>`,
   *   [
   *     {
   *       selector: '[expr0]',
   *       redundantAttribute: 'expr0',
   *       expressions: [
   *         {
   *           type: expressionTypes.TEXT,
   *           childNodeIndex: 0,
   *           evaluate(scope) {
   *             return scope.time;
   *           },
   *         },
   *       ],
   *     },
   *     {
   *       selector: '[expr1]',
   *       redundantAttribute: 'expr1',
   *       expressions: [
   *         {
   *           type: expressionTypes.TEXT,
   *           childNodeIndex: 0,
   *           evaluate(scope) {
   *             return scope.name;
   *           },
   *         },
   *         {
   *           type: 'attribute',
   *           name: 'style',
   *           evaluate(scope) {
   *             return scope.style;
   *           },
   *         },
   *       ],
   *     },
   *     {
   *       selector: '[expr2]',
   *       redundantAttribute: 'expr2',
   *       type: bindingTypes.IF,
   *       evaluate(scope) {
   *         return scope.isVisible;
   *       },
   *       template: riotDOMBindings.template('hello there'),
   *     },
   *   ]
   * )
   */

  var DOMBindings = /*#__PURE__*/Object.freeze({
    __proto__: null,
    template: create$6,
    createBinding: create$5,
    createExpression: create$2,
    bindingTypes: bindingTypes,
    expressionTypes: expressionTypes
  });

  function noop() {
    return this;
  }
  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */

  function autobindMethods(source, methods) {
    methods.forEach(method => {
      source[method] = source[method].bind(source);
    });
    return source;
  }
  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */

  function callOrAssign(source) {
    return isFunction(source) ? source.prototype && source.prototype.constructor ? new source() : source() : source;
  }

  /**
   * Helper function to set an immutable property
   * @param   {Object} source - object where the new property will be set
   * @param   {string} key - object key where the new property will be stored
   * @param   {*} value - value of the new property
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} - the original object modified
   */
  function defineProperty(source, key, value, options) {
    if (options === void 0) {
      options = {};
    }

    /* eslint-disable fp/no-mutating-methods */
    Object.defineProperty(source, key, Object.assign({
      value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
    /* eslint-enable fp/no-mutating-methods */

    return source;
  }
  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} the original object modified
   */

  function defineProperties(source, properties, options) {
    Object.entries(properties).forEach((_ref) => {
      let [key, value] = _ref;
      defineProperty(source, key, value, options);
    });
    return source;
  }
  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */

  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach((_ref2) => {
      let [key, value] = _ref2;
      if (!source[key]) source[key] = value;
    });
    return source;
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
        // it will be returned as "array" with one single entry
        return [els];
    } // this object could be looped out of the box


    return els;
  }

  /**
   * Simple helper to find DOM nodes returning them as array like loopable object
   * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
   * @param   { HTMLElement }        ctx      - context defining where the query will search for the DOM nodes
   * @returns { Array } DOM nodes found as array
   */

  function $(selector, ctx) {
    return domToArray(typeof selector === 'string' ? (ctx || document).querySelectorAll(selector) : selector);
  }

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */

  const normalize = values => values.length === 1 ? values[0] : values;
  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */


  function parseNodes(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize(domToArray(els).map(el => {
      return normalize(names.map(n => el[method](n)));
    }));
  }
  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Object }              name  - either the name of the attribute to set
   *                                                 or a list of properties as object key - value
   * @param   { string }                     value - the new value of the attribute (optional)
   * @returns { HTMLElement|NodeList|Array } the original array of elements passed to this function
   *
   * @example
   *
   * import { set } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * set(img, 'width', 100)
   *
   * // or also
   * set(img, {
   *   width: 300,
   *   height: 300
   * })
   *
   */


  function set(els, name, value) {
    const attrs = typeof name === 'object' ? name : {
      [name]: value
    };
    const props = Object.keys(attrs);
    domToArray(els).forEach(el => {
      props.forEach(prop => el.setAttribute(prop, attrs[prop]));
    });
    return els;
  }
  /**
   * Get any attribute from a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to get
   * @returns { Array|string } list of the attributes found
   *
   * @example
   *
   * import { get } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * get(img, 'width') // => '200'
   *
   * // or also
   * get(img, ['width', 'height']) // => ['200', '300']
   *
   * // or also
   * get([img1, img2], ['width', 'height']) // => [['200', '300'], ['500', '200']]
   */

  function get(els, name) {
    return parseNodes(els, name, 'getAttribute');
  }

  const CSS_BY_NAME = new Map();
  const STYLE_NODE_SELECTOR = 'style[riot]'; // memoized curried function

  const getStyleNode = (style => {
    return () => {
      // lazy evaluation:
      // if this function was already called before
      // we return its cached result
      if (style) return style; // create a new style element or use an existing one
      // and cache it internally

      style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
      set(style, 'type', 'text/css');
      /* istanbul ignore next */

      if (!style.parentNode) document.head.appendChild(style);
      return style;
    };
  })();
  /**
   * Object that will be used to inject and manage the css of every tag instance
   */


  var cssManager = {
    CSS_BY_NAME,

    /**
     * Save a tag style to be later injected into DOM
     * @param { string } name - if it's passed we will map the css to a tagname
     * @param { string } css - css string
     * @returns {Object} self
     */
    add(name, css) {
      if (!CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.set(name, css);
        this.inject();
      }

      return this;
    },

    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {Object} self
     */
    inject() {
      getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
      return this;
    },

    /**
     * Remove a tag style from the DOM
     * @param {string} name a registered tagname
     * @returns {Object} self
     */
    remove(name) {
      if (CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.delete(name);
        this.inject();
      }

      return this;
    }

  };

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn) {
    for (var _len = arguments.length, acc = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      acc[_key - 1] = arguments[_key];
    }

    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args = [...acc, ...args];
      return args.length < fn.length ? curry(fn, ...args) : fn(...args);
    };
  }

  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */

  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase();
  }

  const COMPONENT_CORE_HELPERS = Object.freeze({
    // component helpers
    $(selector) {
      return $(selector, this.root)[0];
    },

    $$(selector) {
      return $(selector, this.root);
    }

  });
  const PURE_COMPONENT_API = Object.freeze({
    [MOUNT_METHOD_KEY]: noop,
    [UPDATE_METHOD_KEY]: noop,
    [UNMOUNT_METHOD_KEY]: noop
  });
  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    [SHOULD_UPDATE_KEY]: noop,
    [ON_BEFORE_MOUNT_KEY]: noop,
    [ON_MOUNTED_KEY]: noop,
    [ON_BEFORE_UPDATE_KEY]: noop,
    [ON_UPDATED_KEY]: noop,
    [ON_BEFORE_UNMOUNT_KEY]: noop,
    [ON_UNMOUNTED_KEY]: noop
  });
  const MOCKED_TEMPLATE_INTERFACE = Object.assign({}, PURE_COMPONENT_API, {
    clone: noop,
    createDOM: noop
  });
  /**
   * Evaluate the component properties either from its real attributes or from its initial user properties
   * @param   {HTMLElement} element - component root
   * @param   {Object}  initialProps - initial props
   * @returns {Object} component props key value pairs
   */

  function evaluateInitialProps(element, initialProps) {
    if (initialProps === void 0) {
      initialProps = {};
    }

    return Object.assign({}, DOMattributesToObject(element), callOrAssign(initialProps));
  }
  /**
   * Bind a DOM node to its component object
   * @param   {HTMLElement} node - html node mounted
   * @param   {Object} component - Riot.js component object
   * @returns {Object} the component object received as second argument
   */


  const bindDOMNodeToComponentObject = (node, component) => node[DOM_COMPONENT_INSTANCE_PROPERTY] = component;
  /**
   * Wrap the Riot.js core API methods using a mapping function
   * @param   {Function} mapFunction - lifting function
   * @returns {Object} an object having the { mount, update, unmount } functions
   */


  function createCoreAPIMethods(mapFunction) {
    return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce((acc, method) => {
      acc[method] = mapFunction(method);
      return acc;
    }, {});
  }
  /**
   * Factory function to create the component templates only once
   * @param   {Function} template - component template creation function
   * @param   {Object} components - object containing the nested components
   * @returns {TemplateChunk} template chunk object
   */


  function componentTemplateFactory(template, components) {
    return template(create$6, expressionTypes, bindingTypes, name => {
      return components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name);
    });
  }
  /**
   * Create a pure component
   * @param   {Function} pureFactoryFunction - pure component factory function
   * @param   {Array} options.slots - component slots
   * @param   {Array} options.attributes - component attributes
   * @param   {Array} options.template - template factory function
   * @param   {Array} options.template - template factory function
   * @param   {any} options.props - initial component properties
   * @returns {Object} pure component object
   */


  function createPureComponent(pureFactoryFunction, _ref) {
    let {
      slots,
      attributes,
      props,
      css,
      template
    } = _ref;
    if (template) panic('Pure components can not have html');
    if (css) panic('Pure components do not have css');
    const component = defineDefaults(pureFactoryFunction({
      slots,
      attributes,
      props
    }), PURE_COMPONENT_API);
    return createCoreAPIMethods(method => function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // intercept the mount calls to bind the DOM node to the pure object created
      // see also https://github.com/riot/riot/issues/2806
      if (method === MOUNT_METHOD_KEY) {
        const [el] = args;
        bindDOMNodeToComponentObject(el, component);
      }

      component[method](...args);
      return component;
    });
  }
  /**
   * Create the component interface needed for the @riotjs/dom-bindings tag bindings
   * @param   {string} options.css - component css
   * @param   {Function} options.template - functon that will return the dom-bindings template function
   * @param   {Object} options.exports - component interface
   * @param   {string} options.name - component name
   * @returns {Object} component like interface
   */


  function createComponent(_ref2) {
    let {
      css,
      template,
      exports,
      name
    } = _ref2;
    const templateFn = template ? componentTemplateFactory(template, exports ? createSubcomponents(exports.components) : {}) : MOCKED_TEMPLATE_INTERFACE;
    return (_ref3) => {
      let {
        slots,
        attributes,
        props
      } = _ref3;
      // pure components rendering will be managed by the end user
      if (exports && exports[IS_PURE_SYMBOL]) return createPureComponent(exports, {
        slots,
        attributes,
        props,
        css,
        template
      });
      const componentAPI = callOrAssign(exports) || {};
      const component = defineComponent({
        css,
        template: templateFn,
        componentAPI,
        name
      })({
        slots,
        attributes,
        props
      }); // notice that for the components create via tag binding
      // we need to invert the mount (state/parentScope) arguments
      // the template bindings will only forward the parentScope updates
      // and never deal with the component state

      return {
        mount(element, parentScope, state) {
          return component.mount(element, state, parentScope);
        },

        update(parentScope, state) {
          return component.update(state, parentScope);
        },

        unmount(preserveRoot) {
          return component.unmount(preserveRoot);
        }

      };
    };
  }
  /**
   * Component definition function
   * @param   {Object} implementation - the componen implementation will be generated via compiler
   * @param   {Object} component - the component initial properties
   * @returns {Object} a new component implementation object
   */

  function defineComponent(_ref4) {
    let {
      css,
      template,
      componentAPI,
      name
    } = _ref4;
    // add the component css into the DOM
    if (css && name) cssManager.add(name, css);
    return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, Object.assign({}, COMPONENT_LIFECYCLE_METHODS, {
      [STATE_KEY]: {}
    })), Object.assign({
      // defined during the component creation
      [SLOTS_KEY]: null,
      [ROOT_KEY]: null
    }, COMPONENT_CORE_HELPERS, {
      name,
      css,
      template
    })));
  }
  /**
   * Create the bindings to update the component attributes
   * @param   {HTMLElement} node - node where we will bind the expressions
   * @param   {Array} attributes - list of attribute bindings
   * @returns {TemplateChunk} - template bindings object
   */

  function createAttributeBindings(node, attributes) {
    if (attributes === void 0) {
      attributes = [];
    }

    const expressions = attributes.map(a => create$2(node, a));
    const binding = {};
    return Object.assign(binding, Object.assign({
      expressions
    }, createCoreAPIMethods(method => scope => {
      expressions.forEach(e => e[method](scope));
      return binding;
    })));
  }
  /**
   * Create the subcomponents that can be included inside a tag in runtime
   * @param   {Object} components - components imported in runtime
   * @returns {Object} all the components transformed into Riot.Component factory functions
   */


  function createSubcomponents(components) {
    if (components === void 0) {
      components = {};
    }

    return Object.entries(callOrAssign(components)).reduce((acc, _ref5) => {
      let [key, value] = _ref5;
      acc[camelToDashCase(key)] = createComponent(value);
      return acc;
    }, {});
  }
  /**
   * Run the component instance through all the plugins set by the user
   * @param   {Object} component - component instance
   * @returns {Object} the component enhanced by the plugins
   */


  function runPlugins(component) {
    return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component);
  }
  /**
   * Compute the component current state merging it with its previous state
   * @param   {Object} oldState - previous state object
   * @param   {Object} newState - new state givent to the `update` call
   * @returns {Object} new object state
   */


  function computeState(oldState, newState) {
    return Object.assign({}, oldState, callOrAssign(newState));
  }
  /**
   * Add eventually the "is" attribute to link this DOM node to its css
   * @param {HTMLElement} element - target root node
   * @param {string} name - name of the component mounted
   * @returns {undefined} it's a void function
   */


  function addCssHook(element, name) {
    if (getName(element) !== name) {
      set(element, IS_DIRECTIVE, name);
    }
  }
  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */


  function enhanceComponentAPI(component, _ref6) {
    let {
      slots,
      attributes,
      props
    } = _ref6;
    return autobindMethods(runPlugins(defineProperties(Object.create(component), {
      mount(element, state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope);
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, evaluateInitialProps(element, props), evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions))));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone(); // link this object to the DOM node

        bindDOMNodeToComponentObject(element, this); // add eventually the 'is' attribute

        component.name && addCssHook(element, component.name); // define the root element

        defineProperty(this, ROOT_KEY, element); // define the slots array

        defineProperty(this, SLOTS_KEY, slots); // before mount lifecycle event

        this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[PARENT_KEY_SYMBOL] = parentScope; // mount the template

        this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
        this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      },

      update(state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        if (parentScope) {
          this[PARENT_KEY_SYMBOL] = parentScope;
          this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
        }

        const newProps = evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions);
        if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false) return;
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, this[PROPS_KEY], newProps)));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL]);
        this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      },

      unmount(preserveRoot) {
        this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[ATTRIBUTES_KEY_SYMBOL].unmount(); // if the preserveRoot is null the template html will be left untouched
        // in that case the DOM cleanup will happen differently from a parent node

        this[TEMPLATE_KEY_SYMBOL].unmount(this, this[PARENT_KEY_SYMBOL], preserveRoot === null ? null : !preserveRoot);
        this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      }

    })), Object.keys(component).filter(prop => isFunction(component[prop])));
  }

  /**
   * Similar to compose but performs from left-to-right function composition.<br/>
   * {@link https://30secondsofcode.org/function#composeright see also}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */
  /**
   * Performs right-to-left function composition.<br/>
   * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
   * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
   * {@link https://30secondsofcode.org/function#compose original source code}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */

  function compose() {
    for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      fns[_key2] = arguments[_key2];
    }

    return fns.reduce((f, g) => function () {
      return f(g(...arguments));
    });
  }
  /**
   * Helper method to create component without relying on the registered ones
   * @param   {Object} implementation - component implementation
   * @returns {Function} function that will allow you to mount a riot component on a DOM node
   */

  function component(implementation) {
    return function (el, props, _temp) {
      let {
        slots,
        attributes,
        parentScope
      } = _temp === void 0 ? {} : _temp;
      return compose(c => c.mount(el, parentScope), c => c({
        props,
        slots,
        attributes
      }), createComponent)(implementation);
    };
  }
  /**
   * Lift a riot component Interface into a pure riot object
   * @param   {Function} func - RiotPureComponent factory function
   * @returns {Function} the lifted original function received as argument
   */

  function pure(func) {
    if (!isFunction(func)) panic('riot.pure accepts only arguments of type "function"');
    func[IS_PURE_SYMBOL] = true;
    return func;
  }

  const __ = {
    cssManager,
    DOMBindings,
    createComponent,
    defineComponent,
    globals
  };

  /**
   * Tokenize input string.
   */
  function lexer(str) {
    var tokens = [];
    var i = 0;

    while (i < str.length) {
      var char = str[i];

      if (char === "*" || char === "+" || char === "?") {
        tokens.push({
          type: "MODIFIER",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === "\\") {
        tokens.push({
          type: "ESCAPED_CHAR",
          index: i++,
          value: str[i++]
        });
        continue;
      }

      if (char === "{") {
        tokens.push({
          type: "OPEN",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === "}") {
        tokens.push({
          type: "CLOSE",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === ":") {
        var name = "";
        var j = i + 1;

        while (j < str.length) {
          var code = str.charCodeAt(j);

          if ( // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95) {
            name += str[j++];
            continue;
          }

          break;
        }

        if (!name) throw new TypeError("Missing parameter name at " + i);
        tokens.push({
          type: "NAME",
          index: i,
          value: name
        });
        i = j;
        continue;
      }

      if (char === "(") {
        var count = 1;
        var pattern = "";
        var j = i + 1;

        if (str[j] === "?") {
          throw new TypeError("Pattern cannot start with \"?\" at " + j);
        }

        while (j < str.length) {
          if (str[j] === "\\") {
            pattern += str[j++] + str[j++];
            continue;
          }

          if (str[j] === ")") {
            count--;

            if (count === 0) {
              j++;
              break;
            }
          } else if (str[j] === "(") {
            count++;

            if (str[j + 1] !== "?") {
              throw new TypeError("Capturing groups are not allowed at " + j);
            }
          }

          pattern += str[j++];
        }

        if (count) throw new TypeError("Unbalanced pattern at " + i);
        if (!pattern) throw new TypeError("Missing pattern at " + i);
        tokens.push({
          type: "PATTERN",
          index: i,
          value: pattern
        });
        i = j;
        continue;
      }

      tokens.push({
        type: "CHAR",
        index: i,
        value: str[i++]
      });
    }

    tokens.push({
      type: "END",
      index: i,
      value: ""
    });
    return tokens;
  }
  /**
   * Parse a string for the raw tokens.
   */


  function parse(str, options) {
    if (options === void 0) {
      options = {};
    }

    var tokens = lexer(str);
    var _a = options.prefixes,
        prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";

    var tryConsume = function tryConsume(type) {
      if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    };

    var mustConsume = function mustConsume(type) {
      var value = tryConsume(type);
      if (value !== undefined) return value;
      var _a = tokens[i],
          nextType = _a.type,
          index = _a.index;
      throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
    };

    var consumeText = function consumeText() {
      var result = "";
      var value; // tslint:disable-next-line

      while (value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
        result += value;
      }

      return result;
    };

    while (i < tokens.length) {
      var char = tryConsume("CHAR");
      var name = tryConsume("NAME");
      var pattern = tryConsume("PATTERN");

      if (name || pattern) {
        var prefix = char || "";

        if (prefixes.indexOf(prefix) === -1) {
          path += prefix;
          prefix = "";
        }

        if (path) {
          result.push(path);
          path = "";
        }

        result.push({
          name: name || key++,
          prefix: prefix,
          suffix: "",
          pattern: pattern || defaultPattern,
          modifier: tryConsume("MODIFIER") || ""
        });
        continue;
      }

      var value = char || tryConsume("ESCAPED_CHAR");

      if (value) {
        path += value;
        continue;
      }

      if (path) {
        result.push(path);
        path = "";
      }

      var open = tryConsume("OPEN");

      if (open) {
        var prefix = consumeText();
        var name_1 = tryConsume("NAME") || "";
        var pattern_1 = tryConsume("PATTERN") || "";
        var suffix = consumeText();
        mustConsume("CLOSE");
        result.push({
          name: name_1 || (pattern_1 ? key++ : ""),
          pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
          prefix: prefix,
          suffix: suffix,
          modifier: tryConsume("MODIFIER") || ""
        });
        continue;
      }

      mustConsume("END");
    }

    return result;
  }
  /**
   * Escape a regular expression string.
   */

  function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  /**
   * Get the flags for a regexp from the options.
   */


  function flags(options) {
    return options && options.sensitive ? "" : "i";
  }
  /**
   * Pull out keys from a regexp.
   */


  function regexpToRegexp(path, keys) {
    if (!keys) return path; // Use a negative lookahead to match only capturing groups.

    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: "",
          suffix: "",
          modifier: "",
          pattern: ""
        });
      }
    }

    return path;
  }
  /**
   * Transform an array into a regexp.
   */


  function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) {
      return pathToRegexp(path, keys, options).source;
    });
    return new RegExp("(?:" + parts.join("|") + ")", flags(options));
  }
  /**
   * Create a path regexp from string input.
   */


  function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
  }
  /**
   * Expose a function for taking tokens and returning a RegExp.
   */


  function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) {
      options = {};
    }

    var _a = options.strict,
        strict = _a === void 0 ? false : _a,
        _b = options.start,
        start = _b === void 0 ? true : _b,
        _c = options.end,
        end = _c === void 0 ? true : _c,
        _d = options.encode,
        encode = _d === void 0 ? function (x) {
      return x;
    } : _d;
    var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
    var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
    var route = start ? "^" : ""; // Iterate over the tokens and create our regexp string.

    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
      var token = tokens_1[_i];

      if (typeof token === "string") {
        route += escapeString(encode(token));
      } else {
        var prefix = escapeString(encode(token.prefix));
        var suffix = escapeString(encode(token.suffix));

        if (token.pattern) {
          if (keys) keys.push(token);

          if (prefix || suffix) {
            if (token.modifier === "+" || token.modifier === "*") {
              var mod = token.modifier === "*" ? "?" : "";
              route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
            } else {
              route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
            }
          } else {
            route += "(" + token.pattern + ")" + token.modifier;
          }
        } else {
          route += "(?:" + prefix + suffix + ")" + token.modifier;
        }
      }
    }

    if (end) {
      if (!strict) route += delimiter + "?";
      route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
    } else {
      var endToken = tokens[tokens.length - 1];
      var isEndDelimited = typeof endToken === "string" ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : // tslint:disable-next-line
      endToken === undefined;

      if (!strict) {
        route += "(?:" + delimiter + "(?=" + endsWith + "))?";
      }

      if (!isEndDelimited) {
        route += "(?=" + delimiter + "|" + endsWith + ")";
      }
    }

    return new RegExp(route, flags(options));
  }
  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   */

  function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp) return regexpToRegexp(path, keys);
    if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
  }

  /**
   * Cancel token
   * @private
   * @type { Symbol }
   */
  const CANCEL = Symbol();
  /**
   * Helper that can be returned by ruit function to cancel the tasks chain
   * @returns { Symbol } internal private constant
   * @example
   *
   * ruit(
   *   100,
   *   num => Math.random() * num
   *   num => num > 50 ? ruit.cancel() : num
   *   num => num - 2
   * ).then(result => {
   *   console.log(result) // here we will get only number lower than 50
   * })
   *
   */

  ruit.cancel = () => CANCEL;
  /**
   * The same as ruit() but with the arguments inverted from right to left
   * @param   { * } tasks - list of tasks to process sequentially
   * @returns { Promise } a promise containing the result of the whole chain
   * @example
   *
   * const curry = f => a => b => f(a, b)
   * const add = (a, b) => a + b
   *
   * const addOne = curry(add)(1)
   *
   * const squareAsync = (num) => {
   *   return new Promise(r => {
   *     setTimeout(r, 500, num * 2)
   *   })
   * }
   *
   * // a -> a + a -> a * 2
   * // basically from right to left: 1 => 1 + 1 => 2 * 2
   * ruit.compose(squareAsync, addOne, 1).then(result => console.log(result)) // 4
   */


  ruit.compose = function () {
    for (var _len = arguments.length, tasks = new Array(_len), _key = 0; _key < _len; _key++) {
      tasks[_key] = arguments[_key];
    }

    return ruit(...tasks.reverse());
  };
  /**
   * Serialize a list of sync and async tasks from left to right
   * @param   { * } tasks - list of tasks to process sequentially
   * @returns { Promise } a promise containing the result of the whole chain
   * @example
   *
   * const curry = f => a => b => f(a, b)
   * const add = (a, b) => a + b
   *
   * const addOne = curry(add)(1)
   *
   * const squareAsync = (num) => {
   *   return new Promise(r => {
   *     setTimeout(r, 500, num * 2)
   *   })
   * }
   *
   * // a -> a + a -> a * 2
   * // basically from left to right: 1 => 1 + 1 => 2 * 2
   * ruit(1, addOne, squareAsync).then(result => console.log(result)) // 4
   */


  function ruit() {
    for (var _len2 = arguments.length, tasks = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      tasks[_key2] = arguments[_key2];
    }

    return new Promise((resolve, reject) => {
      return function run(queue, result) {
        if (!queue.length) return resolve(result);
        const [task, ...rest] = queue;
        const value = typeof task === 'function' ? task(result) : task;

        const done = v => run(rest, v); // check against nil values


        if (value != null) {
          if (value === CANCEL) return;
          if (value.then) return value.then(done, reject);
        }

        return Promise.resolve(done(value));
      }(tasks);
    });
  }

  const API_METHODS = new Set();
  const UNSUBSCRIBE_SYMBOL = Symbol();
  const UNSUBSCRIBE_METHOD = 'off';
  const CANCEL_METHOD = 'cancel';
  /**
   * Factory function to create the stream generator
   * @private
   * @param {Set} modifiers - stream input modifiers
   * @returns {Generator} the stream generator
   */

  function createStream(modifiers) {
    const stream = function* stream() {
      while (true) {
        // get the initial stream value
        const input = yield; // run the input sequence

        yield ruit(input, ...modifiers);
      }
    }(); // start the stream


    stream.next();
    return stream;
  }
  /**
   * Dispatch a value to several listeners
   * @private
   * @param   {Set} callbacks - callbacks collection
   * @param   {*} value - anything
   * @returns {Set} the callbacks received
   */


  function dispatch(callbacks, value) {
    callbacks.forEach(f => {
      // unsubscribe the callback if erre.unsubscribe() will be returned
      if (f(value) === UNSUBSCRIBE_SYMBOL) callbacks.delete(f);
    });
    return callbacks;
  }
  /**
   * Throw a panic error
   * @param {string} message - error message
   * @returns {Error} an error object
   */


  function panic$1(message) {
    throw new Error(message);
  }
  /**
   * Install an erre plugin adding it to the API
   * @param   {string} name - plugin name
   * @param   {Function} fn - new erre API method
   * @returns {Function} return the erre function
   */


  erre.install = function (name, fn) {
    if (!name || typeof name !== 'string') panic$1('Please provide a name (as string) for your erre plugin');
    if (!fn || typeof fn !== 'function') panic$1('Please provide a function for your erre plugin');

    if (API_METHODS.has(name)) {
      panic$1(`The ${name} is already part of the erre API, please provide a different name`);
    } else {
      erre[name] = fn;
      API_METHODS.add(name);
    }

    return erre;
  }; // alias for ruit canel to stop a stream chain


  erre.install(CANCEL_METHOD, ruit.cancel); // unsubscribe helper

  erre.install(UNSUBSCRIBE_METHOD, () => UNSUBSCRIBE_SYMBOL);
  /**
   * Stream constuction function
   * @param   {...Function} fns - stream modifiers
   * @returns {Object} erre instance
   */

  function erre() {
    for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    const [success, error, end, modifiers] = [new Set(), new Set(), new Set(), new Set(fns)],
          generator = createStream(modifiers),
          stream = Object.create(generator),
          addToCollection = collection => fn => collection.add(fn) && stream,
          deleteFromCollection = collection => fn => collection.delete(fn) ? stream : panic$1('Couldn\'t remove handler passed by reference');

    return Object.assign(stream, {
      on: Object.freeze({
        value: addToCollection(success),
        error: addToCollection(error),
        end: addToCollection(end)
      }),
      off: Object.freeze({
        value: deleteFromCollection(success),
        error: deleteFromCollection(error),
        end: deleteFromCollection(end)
      }),
      connect: addToCollection(modifiers),

      push(input) {
        const {
          value,
          done
        } = stream.next(input); // dispatch the stream events

        if (!done) {
          value.then(res => dispatch(success, res), err => dispatch(error, err));
        }

        return stream;
      },

      end() {
        // kill the stream
        generator.return(); // dispatch the end event

        dispatch(end) // clean up all the collections
        ;
        [success, error, end, modifiers].forEach(el => el.clear());
        return stream;
      },

      fork() {
        return erre(...modifiers);
      },

      next(input) {
        // get the input and run eventually the promise
        const result = generator.next(input); // pause to the next iteration

        generator.next();
        return result;
      }

    });
  }

  const isNode = typeof process !== 'undefined';

  const isString = str => typeof str === 'string'; // the url parsing function depends on the platform, on node we rely on the 'url' module

  /* istanbul ignore next */


  const parseURL = function parseURL() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return isNode ? require('url').parse(...args) : new URL(...args);
  };
  /**
   * Replace the base path from a path
   * @param   {string} path - router path string
   * @returns {string} path cleaned up without the base
   */


  const replaceBase = path => path.replace(defaults.base, '');
  /**
   * Try to match the current path or skip it
   * @param   {RegEx} pathRegExp - target path transformed by pathToRegexp
   * @returns {string|Symbol} if the path match we return it otherwise we cancel the stream
   */


  const matchOrSkip = pathRegExp => path => match(path, pathRegExp) ? path : erre.cancel();
  /**
   * Combine 2 streams connecting the events of dispatcherStream to the receiverStream
   * @param   {Stream} dispatcherStream - main stream dispatching events
   * @param   {Stream} receiverStream - sub stream receiving events from the dispatcher
   * @returns {Stream} receiverStream
   */


  const joinStreams = (dispatcherStream, receiverStream) => {
    dispatcherStream.on.value(receiverStream.push);
    receiverStream.on.end(() => {
      dispatcherStream.off.value(receiverStream.push);
    });
    return receiverStream;
  };
  /**
   * Error handling function
   * @param   {Error} error - error to catch
   * @returns {void}
   */


  const panic$1$1 = error => {
    if (defaults.silentErrors) return;
    throw new Error(error);
  }; // make sure that the router will always receive strings params


  const filterStrings = str => isString(str) ? str : erre.cancel(); // create the streaming router

  const router = erre(filterStrings).on.error(panic$1$1); // cast the values of this stream always to string

  /* @type {object} general configuration object */

  const defaults = {
    // custom option
    base: '',
    silentErrors: false,
    // pathToRegexp options
    sensitive: false,
    strict: false,
    end: true,
    start: true,
    delimiter: '/#?',
    encode: undefined,
    endsWith: undefined,
    prefixes: './'
  };
  /**
   * Merge the user options with the defaults
   * @param   {Object} options - custom user options
   * @returns {Object} options object merged with defaults
   */

  const mergeOptions = options => Object.assign({}, defaults, options);
  /* {@link https://github.com/pillarjs/path-to-regexp#usage} */

  const toRegexp = (path, keys, options) => pathToRegexp(path, keys, mergeOptions(options));
  /**
   * Parse a string path generating an object containing
   * @param   {string} path - target path
   * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
   * @param   {Object} options - object containing the base path
   * @returns {URL} url object enhanced with the `match` attribute
   */

  const toURL = function toURL(path, pathRegExp, options) {
    if (options === void 0) {
      options = {};
    }

    const {
      base
    } = mergeOptions(options);
    const [, ...params] = pathRegExp.exec(path);
    const url = parseURL(path, base); // extend the url object adding the matched params

    url.params = params.reduce((acc, param, index) => {
      const key = options.keys && options.keys[index];
      if (key) acc[key.name] = param;
      return acc;
    }, {});
    return url;
  };
  /**
   * Return true if a path will be matched
   * @param   {string} path - target path
   * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
   * @returns {boolean} true if the path matches the regexp
   */

  const match = (path, pathRegExp) => pathRegExp.test(path);
  /**
   * Factory function to create an sequence of functions to pass to erre.js
   * This function will be used in the erre stream
   * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
   * @param   {Object} options - pathToRegexp options object
   * @returns {Array} a functions array that will be used as stream pipe for erre.js
   */

  const createURLStreamPipe = (pathRegExp, options) => [replaceBase, matchOrSkip(pathRegExp), path => toURL(path, pathRegExp, options)];
  /**
   * Create a fork of the main router stream
   * @param   {string} path - route to match
   * @param   {Object} options - pathToRegexp options object
   * @returns {Stream} new route stream
   */

  function createRoute(path, options) {
    const keys = [];
    const pathRegExp = pathToRegexp(path, keys, options);
    const URLStream = erre(...createURLStreamPipe(pathRegExp, Object.assign({}, options, {
      keys
    })));
    return joinStreams(router, URLStream).on.error(panic$1$1);
  }

  const getCurrentRoute = (currentRoute => {
    // listen the route changes events to store the current route
    router.on.value(r => currentRoute = r);
    return () => {
      return currentRoute;
    };
  })(null);

  /**
   * Similar to compose but performs from left-to-right function composition.<br/>
   * {@link https://30secondsofcode.org/function#composeright see also}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */
  /**
   * Performs right-to-left function composition.<br/>
   * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
   * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
   * {@link https://30secondsofcode.org/function#compose original source code}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */

  function compose$1() {
    for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      fns[_key2] = arguments[_key2];
    }

    return fns.reduce((f, g) => function () {
      return f(g(...arguments));
    });
  }

  const getInitialRouteValue = (pathToRegexp, path, options) => {
    const route = compose$1(
      ...createURLStreamPipe(pathToRegexp, options).reverse()
    )(path);

    return route.params ? route : null
  };

  var routeHoc = {
    'css': null,

    'exports': {
      onBeforeMount(props) {
        const currentRoute = getCurrentRoute();
        const pathToRegexp = toRegexp(props.path, [], props);

        this.state = {
          pathToRegexp,
          route: currentRoute && match(currentRoute, pathToRegexp) ?
            getInitialRouteValue(pathToRegexp, currentRoute, props) :
            null
        };

        router.on.value(this.onBeforeRoute);
        this.stream = createRoute(props.path, props).on.value(this.onRoute);
      },

      onBeforeRoute(path, pathToRegexp) {
        if (this.state.route && !match(path, this.state.pathToRegexp)) {
          this.callLifecycleProperty('onBeforeUnmount', createRoute);
          this.update({
            route: null
          });
          this.callLifecycleProperty('onUnmounted', createRoute);
        }
      },

      onRoute(route) {
        this.callLifecycleProperty('onBeforeMount', route);
        this.update({route});
        this.callLifecycleProperty('onMounted', route);
      },

      callLifecycleProperty(method, ...params) {
        if (this.props[method]) this.props[method](...params);
      },

      onUnmounted() {
        router.off.value(this.onBeforeRoute);
        this.stream.end();
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template('<template expr0="expr0"></template>', [{
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.route;
        },

        'redundantAttribute': 'expr0',
        'selector': '[expr0]',

        'template': template('<slot expr1="expr1"></slot>', [{
          'type': bindingTypes.SLOT,

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'route',

            'evaluate': function(scope) {
              return scope.state.route;
            }
          }],

          'name': 'default',
          'redundantAttribute': 'expr1',
          'selector': '[expr1]'
        }])
      }]);
    },

    'name': 'route-hoc'
  };

  const WINDOW_EVENTS = 'popstate';
  const CLICK_EVENT = 'click';
  const DOWNLOAD_LINK_ATTRIBUTE = 'download';
  const HREF_LINK_ATTRIBUTE = 'href';
  const TARGET_SELF_LINK_ATTRIBUTE = '_self';
  const LINK_TAG_NAME = 'A';
  const HASH = '#';
  const SLASH = '/';
  const RE_ORIGIN = /^.+?\/\/+[^/]+/;

  const getWindow = () => typeof window === 'undefined' ? null : window;
  const getDocument = () => typeof document === 'undefined' ? null : document;
  const getHistory = () => typeof history === 'undefined' ? null : history;
  const getLocation = () => {
    const win = getWindow();
    return win ? win.location : {};
  };

  const normalizeInitialSlash = str => str[0] === SLASH ? str : `${SLASH}${str}`;
  const removeTrailingSlash = str => str[str.length - 1] === SLASH ? str.substr(0, str.length - 1) : str;
  const normalizeBase = base => {
    const win = getWindow();
    const loc = win.location;
    const root = loc ? `${loc.protocol}//${loc.host}` : '';
    const {
      pathname
    } = loc ? loc : {};

    switch (true) {
      // pure root url + pathname
      case Boolean(base) === false:
        return removeTrailingSlash(`${root}${pathname || ''}`);
      // full path base

      case /(www|http(s)?:)/.test(base):
        return base;
      // hash navigation

      case base[0] === HASH:
        return `${root}${pathname && pathname !== SLASH ? pathname : ''}${base}`;
      // root url with trailing slash

      case base === SLASH:
        return removeTrailingSlash(root);
      // custom pathname

      default:
        return removeTrailingSlash(`${root}${normalizeInitialSlash(base)}`);
    }
  };
  function setBase(base) {
    defaults.base = normalizeBase(base);
  }

  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */
  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */

  function dashToCamelCase$1(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Throw an error with a descriptive message
   * @param   { string } message - error message
   * @returns { undefined } hoppla.. at this point the program should stop working
   */

  function panic$2(message) {
    throw new Error(message);
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray$1(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
        // it will be returned as "array" with one single entry
        return [els];
    } // this object could be looped out of the box


    return els;
  }

  /**
   * Split a string into several items separed by spaces
   * @param   { string } l - events list
   * @returns { Array } all the events detected
   * @private
   */

  const split = l => l.split(/\s/);
  /**
   * Set a listener for all the events received separated by spaces
   * @param   { HTMLElement|NodeList|Array } els     - DOM node/s where the listeners will be bound
   * @param   { string }                     evList  - list of events we want to bind or unbind space separated
   * @param   { Function }                   cb      - listeners callback
   * @param   { string }                     method  - either 'addEventListener' or 'removeEventListener'
   * @param   { Object }                     options - event options (capture, once and passive)
   * @returns { undefined }
   * @private
   */


  function manageEvents(els, evList, cb, method, options) {
    els = domToArray$1(els);
    split(evList).forEach(e => {
      els.forEach(el => el[method](e, cb, options || false));
    });
  }
  /**
   * Set a listener for all the events received separated by spaces
   * @param   { HTMLElement|Array } els    - DOM node/s where the listeners will be bound
   * @param   { string }            evList - list of events we want to bind space separated
   * @param   { Function }          cb     - listeners callback
   * @param   { Object }            options - event options (capture, once and passive)
   * @returns { HTMLElement|NodeList|Array } DOM node/s and first argument of the function
   */


  function add(els, evList, cb, options) {
    manageEvents(els, evList, cb, 'addEventListener', options);
    return els;
  }
  /**
   * Remove all the listeners for the events received separated by spaces
   * @param   { HTMLElement|Array } els     - DOM node/s where the events will be unbind
   * @param   { string }            evList  - list of events we want unbind space separated
   * @param   { Function }          cb      - listeners callback
   * @param   { Object }             options - event options (capture, once and passive)
   * @returns { HTMLElement|NodeList|Array }  DOM node/s and first argument of the function
   */

  function remove$1(els, evList, cb, options) {
    manageEvents(els, evList, cb, 'removeEventListener', options);
    return els;
  }

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */

  const normalize$1 = values => values.length === 1 ? values[0] : values;
  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */


  function parseNodes$1(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize$1(domToArray$1(els).map(el => {
      return normalize$1(names.map(n => el[method](n)));
    }));
  }
  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to detect
   * @returns { boolean|Array } true or false or an array of boolean values
   * @example
   *
   * import { has } from 'bianco.attr'
   *
   * has(img, 'width') // false
   *
   * // or also
   * has(img, ['width', 'height']) // => [false, false]
   *
   * // or also
   * has([img1, img2], ['width', 'height']) // => [[false, false], [false, false]]
   */

  function has(els, name) {
    return parseNodes$1(els, name, 'hasAttribute');
  }

  const onWindowEvent = () => router.push(normalizePath(String(getLocation().href)));

  const onRouterPush = path => {
    const url = path.includes(defaults.base) ? path : defaults.base + path;
    const loc = getLocation();
    const hist = getHistory();
    const doc = getDocument(); // update the browser history only if it's necessary

    if (hist && url !== loc.href) {
      hist.pushState(null, doc.title, url);
    }
  };

  const getLinkElement = node => node && !isLinkNode(node) ? getLinkElement(node.parentNode) : node;

  const isLinkNode = node => node.nodeName === LINK_TAG_NAME;

  const isCrossOriginLink = path => path.indexOf(getLocation().href.match(RE_ORIGIN)[0]) === -1;

  const isTargetSelfLink = el => el.target && el.target !== TARGET_SELF_LINK_ATTRIBUTE;

  const isEventForbidden = event => event.which && event.which !== 1 || // not left click
  event.metaKey || event.ctrlKey || event.shiftKey // or meta keys
  || event.defaultPrevented; // or default prevented


  const isForbiddenLink = el => !el || !isLinkNode(el) // not A tag
  || has(el, DOWNLOAD_LINK_ATTRIBUTE) // has download attr
  || !has(el, HREF_LINK_ATTRIBUTE) // has no href attr
  || isTargetSelfLink(el) || isCrossOriginLink(el.href);

  const isHashLink = path => path.split(HASH).length > 1;

  const normalizePath = path => path.replace(defaults.base, '');

  const isInBase = path => !defaults.base || path.includes(defaults.base);
  /**
   * Callback called anytime something will be clicked on the page
   * @param   {HTMLEvent} event - click event
   * @returns {undefined} void method
   */


  const onClick = event => {
    if (isEventForbidden(event)) return;
    const el = getLinkElement(event.target);
    if (isForbiddenLink(el) || isHashLink(el.href) || !isInBase(el.href)) return;
    const path = normalizePath(el.href);
    router.push(path);
    event.preventDefault();
  };
  /**
   * Link the rawth router to the DOM events
   * @param { HTMLElement } container - DOM node where the links are located
   * @returns {Function} teardown function
   */


  function initDomListeners(container) {
    const win = getWindow();
    const root = container || getDocument();

    if (win) {
      add(win, WINDOW_EVENTS, onWindowEvent);
      add(root, CLICK_EVENT, onClick);
    }

    router.on.value(onRouterPush);
    return () => {
      if (win) {
        remove$1(win, WINDOW_EVENTS, onWindowEvent);
        remove$1(root, CLICK_EVENT, onClick);
      }

      router.off.value(onRouterPush);
    };
  }

  const BASE_ATTRIBUTE_NAME = 'base';
  const INITIAL_ROUTE = 'initialRoute';
  const ON_STARTED_ATTRIBUTE_NAME = 'onStarted';
  const {template, bindingTypes: bindingTypes$1} = __.DOMBindings;
  const defer = window.requestAnimationFrame || window.setTimeout;
  const cancelDefer = window.cancelAnimationFrame || window.clearTimeout;


  let wasInitialized = false;

  var routerHoc = {
    'css': null,

    'exports': pure(({slots, attributes, props}) => {
      if (wasInitialized) panic$2('Multiple <router> components are not supported');

      const getAttribute = name => attributes && attributes.find(a => dashToCamelCase$1(a.name) === name);

      return {
        slot: null,
        el: null,
        teardown: null,
        mount(el, context) {
          const initialRouteAttr = getAttribute(INITIAL_ROUTE);
          const initialRoute = initialRouteAttr ? initialRouteAttr.evaluate(context) : null;
          const currentRoute =  getCurrentRoute();
          const onFirstRoute = () => {
            this.createSlot(context);
            router.off.value(onFirstRoute);
          };
          wasInitialized = true;

          this.el = el;
          this.teardown = initDomListeners(this.root);

          this.setBase(context);

          // mount the slots only if the current route was defined
          if (currentRoute && !initialRoute) {
            this.createSlot(context);
          } else {
            router.on.value(onFirstRoute);
            router.push(initialRoute || window.location.href);
          }
        },
        createSlot(context) {
          if (!slots || !slots.length) return
          const onStartedAttr = getAttribute(ON_STARTED_ATTRIBUTE_NAME);

          this.slot = template(null, [{
            type: bindingTypes$1.SLOT,
            name: 'default'
          }]);

          this.slot.mount(this.el, {
            slots
          }, context);

          if (onStartedAttr) {
            onStartedAttr.evaluate(context)(getCurrentRoute());
          }
        },
        update(context) {
          this.setBase(context);

          // defer the updates to avoid internal recoursive update calls
          // see https://github.com/riot/route/issues/148
          if (this.slot) {
            cancelDefer(this.deferred);

            this.deferred = defer(() => {
              this.slot.update({}, context);
            });
          }
        },
        unmount(...args) {
          this.teardown();
          wasInitialized = false;

          if (this.slot) {
            this.slot.unmount(...args);
          }
        },
        getBase(context) {
          const baseAttr = getAttribute(BASE_ATTRIBUTE_NAME);

          return baseAttr ? baseAttr.evaluate(context) : '/'
        },
        setBase(context) {
          setBase(props ? props.base : this.getBase(context));
        }
      }
    }),

    'template': null,
    'name': 'router-hoc'
  };

  var Gallery = {
    'css': `gallery .gallery,[is="gallery"] .gallery{ --hover-color: var(--color-soft); --grid-width: 150px; display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--grid-width), 1fr)) } gallery .gallery img,[is="gallery"] .gallery img{ width: 100%; transition: background-color 0.5s; background-color: rgba(0,0,0,0); transform: scale(1.4, 1.4); } gallery .gallery > div,[is="gallery"] .gallery > div{ overflow: hidden; } gallery .gallery a:hover,[is="gallery"] .gallery a:hover{ background-color: var(--hover-color); } gallery .gallery a,[is="gallery"] .gallery a{ display: block; width: 100%; height: 100%; }`,

    'exports': {
      onBeforeMount() {
          this.state = {
              imagesLoaded: 0,
              fullyLoaded: false
          };
      },

      onImageLoaded() {
          const imagesLoaded = this.state.imagesLoaded + 1;

          console.log('Total image loaded: ' + imagesLoaded);

          this.update({
              imagesLoaded
          });
      },

      onGalleryLoaded() {
          alert("FULLY LOADED");
          console.log("DEEP BREATH");
          this.update({ fullyLoaded: true});
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<div expr96="expr96" class="gallery"><div expr97="expr97"></div></div>',
        [{
          'redundantAttribute': 'expr96',
          'selector': '[expr96]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onload',

            'evaluate': function(scope) {
              return scope.onGalleryLoaded;
            }
          }]
        }, {
          'type': bindingTypes.EACH,
          'getKey': null,
          'condition': null,

          'template': template('<a expr98="expr98"><img expr99="expr99"/></a>', [{
            'expressions': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'style',

              'evaluate': function(scope) {
                return scope.player.id === 'peanutiel-duffy' ? 'overflow: visible' : '';
              }
            }]
          }, {
            'redundantAttribute': 'expr98',
            'selector': '[expr98]',

            'expressions': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'href',

              'evaluate': function(scope) {
                return ['#', scope.player.id].join('');
              }
            }]
          }, {
            'redundantAttribute': 'expr99',
            'selector': '[expr99]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onload',

              'evaluate': function(scope) {
                return scope.onImageLoaded;
              }
            }, {
              'type': expressionTypes.ATTRIBUTE,
              'name': 'src',

              'evaluate': function(scope) {
                return `images/${scope.player.sprites[ scope.player['default-sprite'] ]}`;
              }
            }]
          }]),

          'redundantAttribute': 'expr97',
          'selector': '[expr97]',
          'itemName': 'player',
          'indexName': null,

          'evaluate': function(scope) {
            return scope.props.players;
          }
        }]
      );
    },

    'name': 'gallery'
  };

  var CloseButton = {
    'css': `close-button,[is="close-button"]{ background: none; border: none; font-size: 2em; }`,
    'exports': null,

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"/></svg>',
        []
      );
    },

    'name': 'close-button'
  };

  var Raw = {
    'css': null,

    'exports': {
      setInnerHTML() {
        this.root.innerHTML = this.props.html;
      },

      onMounted() {
        this.setInnerHTML();
      },

      onUpdated() {
        this.setInnerHTML();
      }
    },

    'template': null,
    'name': 'raw'
  };

  var PlayerInfo = {
    'css': `player-info,[is="player-info"]{ --size-small: 200px; --size-large: 300px; --size-xlarge: 320px; --size-huge: 500px; --player-size: var(--size-small); --player-altscaling: scale(1,1); } player-info .sprite,[is="player-info"] .sprite{ width: var(--player-size); max-width: 100%; height: var(--player-size); object-fit: none; } player-info .sprite.peanutiel,[is="player-info"] .sprite.peanutiel{ max-width: initial; margin-left: 50%; transform: translateX(-50%); } player-info .player-info,[is="player-info"] .player-info{ width: 600px; max-width: 95%; box-sizing: border-box; margin: 10px auto; border: solid 3px #fff; padding: 2em; background-color: var(--color-modalbg); color: var(--color-modaltext); text-align: center; position: relative; } player-info .smol-desc,[is="player-info"] .smol-desc{ font-weight: 400; } player-info .alt-images,[is="player-info"] .alt-images{ display: flex; flex-wrap: wrap; justify-content: center; } player-info .alt-images .img-box,[is="player-info"] .alt-images .img-box{ width: 120px; overflow: hidden; } player-info .alt-images img,[is="player-info"] .alt-images img{ width: 120px; transform: var(--player-altscaling); } player-info .close-button,[is="player-info"] .close-button{ position: absolute; right: 10px; top: 10px; cursor: pointer; } player-info .close-button:hover,[is="player-info"] .close-button:hover{ border: solid 2px; border-radius: 1em; } player-info .smol-desc,[is="player-info"] .smol-desc{ font-size: 0.7em; } player-info .credits-info,[is="player-info"] .credits-info{ font-size: 0.85em; } player-info .credits-info a,[is="player-info"] .credits-info a{ color: inherit; }`,

    'exports': {
      components: { CloseButton, Raw },

      onBeforeMount(props, state) {
          const player = props.player;

          this.state = {
              viewedSprite: player.sprites[ player['default-sprite'] ],
              credits: this.createCreditsText(player['credits'])
          };
      },

      onMounted() {
          console.log(this.props.player);

          // Set sizing
          const playerSize = this.props.player.size;

          this.root.style.setProperty("--player-size", `var(--size-${playerSize}`);

          if (playerSize === "small") {
              this.root.style.setProperty("--player-altscaling", "scale(2, 2)");
          }

          if (playerSize === "large" || playerSize === "xlarge") {
              this.root.style.setProperty("--player-altscaling", "scale(1.5, 1.5)");
          }

          // Set description
          const formerTeams = this.props.player['former-teams'];
          let formerTeamsText = '';

          if (formerTeams && formerTeams.length > 0) {
              let teamsText = '';

              if (formerTeams.length === 1) {
                  // Only in one team formerly? Just add it.
                  teamsText = "the " + formerTeams[0];
              }

              else {

                  for(let i = 0; i < formerTeams.length - 1; i++) {
                      teamsText += "the " + formerTeams[i] + ', ';
                  }

                  if (formerTeams.length === 2) {
                      teamsText = teamsText.slice(0, -2); 
                      teamsText += " ";
                      // remove comma when there's only two    
                  }
              
                  teamsText += "and the " + formerTeams[formerTeams.length - 1];
              }

              formerTeamsText = `Formerly of ${teamsText}.`;
          }

          this.update({
              isRIV: this.props.player.team === "RIV" ? true : false,
              isStars: this.props.player.team === "Hall Stars" ? true : false,
              formerTeamsText
          }); 
      },

      viewSprite(sprite) {
          this.update({
              viewedSprite: sprite
          });
      },

      createCreditsText(creditsArray) {
          if (!creditsArray) {
              // No credit is listed
              return
          }

          let text = "Art inspired by ";

          const createLine = function(credit) {
              if (credit['link']) {
                  return `<a href="${ credit['link'] }" target="_blank">${ credit['text'] }</a>`
              }

              else {
                  return credit['text']
              }
          }; 

          if (creditsArray.length === 1) {
              text += createLine(creditsArray[0]);
          }

          else {
              for(let i = 0; i < creditsArray.length - 1; i++) {
                      text += createLine(creditsArray[i]) + ', ';
              }   

              if (creditsArray.length === 2) {
                  text = text.slice(0, -2); 
                  text += " ";
                  // remove comma when there's only two    
              }

              const lastCredit = creditsArray[creditsArray.length - 1];
              text += " and " + createLine(lastCredit);
          }

          return text
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<div class="player-info"><close-button expr63="expr63" class="close-button"></close-button><img expr64="expr64"/><div expr65="expr65" class="alt-images"></div><div class="info"><h2 expr68="expr68" class="name"> </h2><h3 expr69="expr69" class="team"></h3><h3 expr71="expr71" class="team"></h3><p expr72="expr72"> </p><p expr73="expr73" class="credits-info"></p></div></div>',
        [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'close-button';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.props.onClose;
            }
          }],

          'redundantAttribute': 'expr63',
          'selector': '[expr63]'
        }, {
          'redundantAttribute': 'expr64',
          'selector': '[expr64]',

          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return scope.props.player.size === 'huge' ? 'sprite peanutiel' : 'sprite';
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'src',

            'evaluate': function(scope) {
              return ['images/', scope.state.viewedSprite].join('');
            }
          }]
        }, {
          'type': bindingTypes.IF,

          'evaluate': function(scope) {
            return scope.props.player.sprites.length > 1;
          },

          'redundantAttribute': 'expr65',
          'selector': '[expr65]',

          'template': template('<div expr66="expr66" class="img-box"></div>', [{
            'type': bindingTypes.EACH,
            'getKey': null,
            'condition': null,

            'template': template('<img expr67="expr67"/>', [{
              'redundantAttribute': 'expr67',
              'selector': '[expr67]',

              'expressions': [{
                'type': expressionTypes.EVENT,
                'name': 'onclick',

                'evaluate': function(scope) {
                  return (e) => scope.viewSprite(scope.sprite);
                }
              }, {
                'type': expressionTypes.ATTRIBUTE,
                'name': 'src',

                'evaluate': function(scope) {
                  return ['images/', scope.sprite].join('');
                }
              }]
            }]),

            'redundantAttribute': 'expr66',
            'selector': '[expr66]',
            'itemName': 'sprite',
            'indexName': null,

            'evaluate': function(scope) {
              return scope.props.player.sprites;
            }
          }])
        }, {
          'redundantAttribute': 'expr68',
          'selector': '[expr68]',

          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,

            'evaluate': function(scope) {
              return [scope.props.player["full-name"]].join('');
            }
          }]
        }, {
          'type': bindingTypes.IF,

          'evaluate': function(scope) {
            return !scope.state.isRIV;
          },

          'redundantAttribute': 'expr69',
          'selector': '[expr69]',

          'template': template('<div expr70="expr70" class="smol-desc"></div> ', [{
            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 1,

              'evaluate': function(scope) {
                return [scope.props.player["team"]].join('');
              }
            }]
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return !scope.state.isStars;
            },

            'redundantAttribute': 'expr70',
            'selector': '[expr70]',

            'template': template(
              '\r\n                    Currently playing for the\r\n                ',
              []
            )
          }])
        }, {
          'type': bindingTypes.IF,

          'evaluate': function(scope) {
            return scope.state.isRIV;
          },

          'redundantAttribute': 'expr71',
          'selector': '[expr71]',
          'template': template('\r\n                Rest in Violence\r\n            ', [])
        }, {
          'redundantAttribute': 'expr72',
          'selector': '[expr72]',

          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,

            'evaluate': function(scope) {
              return scope.state.formerTeamsText;
            }
          }]
        }, {
          'type': bindingTypes.IF,

          'evaluate': function(scope) {
            return scope.state.credits;
          },

          'redundantAttribute': 'expr73',
          'selector': '[expr73]',

          'template': template('<raw expr74="expr74"></raw>', [{
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'raw';
            },

            'slots': [],

            'attributes': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'html',

              'evaluate': function(scope) {
                return scope.state.credits;
              }
            }],

            'redundantAttribute': 'expr74',
            'selector': '[expr74]'
          }])
        }]
      );
    },

    'name': 'player-info'
  };

  var Overlay = {
    'css': `overlay,[is="overlay"]{ display: block; line-height: 1.4em; font-size: 18px; text-align: left; position: fixed; z-index: 20; top: 0; left: 0; right: 0; bottom: 0; overflow-y: auto; background-color: rgba(0,0,0,0.6); }`,

    'exports': {
      components: { PlayerInfo },

      onMounted() {
          document.body.style.overflowY = 'hidden';
      },

      onUnmounted() {
          document.body.style.overflowY = '';
      },

      clickAnywhere(e) {

          // Close the overlay if outside the modal panel is clicked
          if (e.target.tagName === 'OVERLAY' || e.target.tagName === "PLAYER-INFO") {
              this.closePanel();
          }                
      },

      closePanel() {
          router.push('/');
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template('<player-info expr50="expr50"></player-info>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.clickAnywhere;
          }
        }]
      }, {
        'type': bindingTypes.TAG,
        'getComponent': getComponent,

        'evaluate': function(scope) {
          return 'player-info';
        },

        'slots': [],

        'attributes': [{
          'type': expressionTypes.EVENT,
          'name': 'on-close',

          'evaluate': function(scope) {
            return scope.closePanel;
          }
        }, {
          'type': expressionTypes.ATTRIBUTE,
          'name': 'player',

          'evaluate': function(scope) {
            return scope.props.player;
          }
        }],

        'redundantAttribute': 'expr50',
        'selector': '[expr50]'
      }]);
    },

    'name': 'overlay'
  };

  var SortControl = {
    'css': `sort-control label,[is="sort-control"] label{ display: block; margin: 0.2em 0; }`,
    'exports': null,

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<h2>Sort by</h2><form expr75="expr75" class="sort-control"><label><input type="radio" name="sortby" value="original" checked/>\r\n                First drawn\r\n            </label><label><input type="radio" name="sortby" value="alphabetical"/>\r\n                Alphabetical\r\n            </label><label><input type="radio" name="sortby" value="currentteam"/>\r\n                Current team\r\n            </label></form>',
        [{
          'redundantAttribute': 'expr75',
          'selector': '[expr75]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onchange',

            'evaluate': function(scope) {
              return scope.props.onChangeSort;
            }
          }]
        }]
      );
    },

    'name': 'sort-control'
  };

  var FilterControl = {
    'css': `filter-control,[is="filter-control"]{ display: block; } filter-control .gallery-filter,[is="filter-control"] .gallery-filter{ text-align: left; } filter-control .gallery-filter > div,[is="filter-control"] .gallery-filter > div{ margin: 1em 0; } filter-control input[type="text"],[is="filter-control"] input[type="text"]{ border: none; background: var(--color-soft); color: var(--color-text); border-radius: .25rem; padding: .75rem 1rem; } filter-control .filter-selector,[is="filter-control"] .filter-selector{ } filter-control .filter-selector > div,[is="filter-control"] .filter-selector > div{ margin-top: 0.5em; cursor: pointer; display: flex; } filter-control .filter-selector label,[is="filter-control"] .filter-selector label{ display: block; flex: 10; padding-left: 0.5em; } filter-control .filter-selector input[type="checkbox"],[is="filter-control"] .filter-selector input[type="checkbox"]{ width: 1em; } filter-control .filter-selector input:checked + label,[is="filter-control"] .filter-selector input:checked + label{ } filter-control select,[is="filter-control"] select{ margin-top: 0.5em; }`,

    'exports': {
      components: { SortControl },

      onBeforeMount() {
          this.state = {
              appliedFilters: [],
              teamFilter: '',
              nameBeingSearched: ''
          };
      },

      onInputName(e) {
          // Reset all filters when name is inputted
          this.update({
              appliedFilters: [],
              teamFilter: '',
              nameBeingSearched: e.target.value
          });

          this.props.onFilterPlayerName(e.target.value);
      },

      onChangeFilter(e) {
          // Add value to filter list if box is checked
          const filter = e.target.value;
          const currentFilters = this.state.appliedFilters;
          let appliedFilters;

          if (e.target.checked) {
              
              appliedFilters = currentFilters.concat([filter]);
              
          }

          else {
              // Remove it if the box is unchecked                
              appliedFilters = currentFilters.filter(elem => elem != filter); 
              
          }

          let updatedStates = {
              appliedFilters,
              nameBeingSearched: '' // Reset searchbar
          };

          // Reset team if all filters are turned off
          if (!appliedFilters) {
              updatedStates['teamFilter'] = '';
          }

          
          this.update(updatedStates);

          this.props.onChangeFilter(this.state);
      },

      onSelectTeam(e) {

          // Reset searchbar
          this.update({
              teamFilter: e.target.value,
              nameBeingSearched: ''
          });

          this.props.onChangeFilter(this.state);
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<form expr54="expr54" class="gallery-filter"><input expr55="expr55" type="text" name="playername" placeholder="Search for player..."/><div><sort-control expr56="expr56"></sort-control></div><div><h2>Filter</h2><h3>Show players who are</h3><div class="filter-selector"><div><input expr57="expr57" id="checkismemberof" type="checkbox" value="ismemberof"/><label for="checkismemberof">\r\n                        Currently a member of\r\n                    </label></div><div><input expr58="expr58" id="checkwasmemberof" type="checkbox" value="wasmemberof"/><label for="checkwasmemberof">\r\n                        Was a member of\r\n                    </label></div></div><select expr59="expr59"><option value selected>Select a team</option><optgroup expr60="expr60"></optgroup></select></div></form>',
        [{
          'redundantAttribute': 'expr54',
          'selector': '[expr54]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onsubmit',

            'evaluate': function(scope) {
              return (e) => {e.preventDefault();};
            }
          }]
        }, {
          'redundantAttribute': 'expr55',
          'selector': '[expr55]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'oninput',

            'evaluate': function(scope) {
              return scope.onInputName;
            }
          }, {
            'type': expressionTypes.VALUE,

            'evaluate': function(scope) {
              return scope.state.nameBeingSearched;
            }
          }]
        }, {
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'sort-control';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.EVENT,
            'name': 'on-change-sort',

            'evaluate': function(scope) {
              return scope.props.onChangeSort;
            }
          }],

          'redundantAttribute': 'expr56',
          'selector': '[expr56]'
        }, {
          'redundantAttribute': 'expr57',
          'selector': '[expr57]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onchange',

            'evaluate': function(scope) {
              return scope.onChangeFilter;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'checked',

            'evaluate': function(scope) {
              return scope.state.appliedFilters.includes('ismemberof');
            }
          }]
        }, {
          'redundantAttribute': 'expr58',
          'selector': '[expr58]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onchange',

            'evaluate': function(scope) {
              return scope.onChangeFilter;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'checked',

            'evaluate': function(scope) {
              return scope.state.appliedFilters.includes('wasmemberof');
            }
          }]
        }, {
          'redundantAttribute': 'expr59',
          'selector': '[expr59]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onchange',

            'evaluate': function(scope) {
              return scope.onSelectTeam;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'disabled',

            'evaluate': function(scope) {
              return !scope.state.appliedFilters.length;
            }
          }]
        }, {
          'type': bindingTypes.EACH,
          'getKey': null,
          'condition': null,

          'template': template('<option expr61="expr61"></option>', [{
            'expressions': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'label',

              'evaluate': function(scope) {
                return scope.subleague.name;
              }
            }]
          }, {
            'type': bindingTypes.EACH,
            'getKey': null,
            'condition': null,

            'template': template(' ', [{
              'expressions': [{
                'type': expressionTypes.TEXT,
                'childNodeIndex': 0,

                'evaluate': function(scope) {
                  return [scope.team].join('');
                }
              }, {
                'type': expressionTypes.ATTRIBUTE,
                'name': 'selected',

                'evaluate': function(scope) {
                  return scope.team === scope.state.teamFilter;
                }
              }]
            }]),

            'redundantAttribute': 'expr61',
            'selector': '[expr61]',
            'itemName': 'team',
            'indexName': null,

            'evaluate': function(scope) {
              return scope.subleague.teams;
            }
          }]),

          'redundantAttribute': 'expr60',
          'selector': '[expr60]',
          'itemName': 'subleague',
          'indexName': null,

          'evaluate': function(scope) {
            return scope.props.teams;
          }
        }]
      );
    },

    'name': 'filter-control'
  };

  var Aboutbox = {
    'css': `aboutbox,[is="aboutbox"]{ display: block; padding-right: 1em; } aboutbox p,[is="aboutbox"] p{ line-height: 1.2; letter-spacing: -0.016em; } aboutbox a,[is="aboutbox"] a{ color: var(--color-link); text-decoration: none; font-weight: 600; } aboutbox a:hover,[is="aboutbox"] a:hover{ color: var(--color-text); text-decoration: underline; }`,
    'exports': null,

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<p>#MiniBlaseball is a series of minis by <a href="https://twitter.com/HetreaSky" target="_blank">HetreaSky</a>, depicting the many players in <a href="https://blaseball.com" target="_blank">Internet League Blaseball</a>.</p><p>More players are still being added! Follow <a href="https://twitter.com/HetreaSky" target="_blank">@HetreaSky</a> on Twitter or the <a href="https://twitter.com/hashtag/MiniBlaseball" target="_blank">#MiniBlaseball</a> hashtag for updates!</p><p>This website is built by <a href="https://twitter.com/PseudoMonious" target="_blank">@PseudoMonious</a>. You can see the source code <a href="https://github.com/PseudoMon/miniblaseball" target="_blank">here</a>. DM her if there\'s anything wrong with the site!</p>',
        []
      );
    },

    'name': 'aboutbox'
  };

  var SidebarNav = {
    'css': `sidebar-nav .sidebar-nav,[is="sidebar-nav"] .sidebar-nav{ list-style-type: none; padding-left: 0; display: flex; justify-content: center; } sidebar-nav .sidebar-nav li,[is="sidebar-nav"] .sidebar-nav li{ display: block; text-align: center; padding: 0.4em; margin: 0 0.5em; text-transform: uppercase; flex-grow: 1; border-radius: 0.5em; font-weight: 600; cursor: pointer; } sidebar-nav .sidebar-nav li:hover,[is="sidebar-nav"] .sidebar-nav li:hover{ background-color: var(--color-soft); } sidebar-nav .sidebar-nav li.active,[is="sidebar-nav"] .sidebar-nav li.active{ border: solid var(--color-text); background-color: var(--color-text); color: var(--color-bg); }`,
    'exports': null,

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<ul class="sidebar-nav"><li expr51="expr51">\r\n            Sort & Filter\r\n        </li><li expr52="expr52">\r\n            About\r\n        </li></ul>',
        [{
          'redundantAttribute': 'expr51',
          'selector': '[expr51]',

          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return scope.props.selectedScreen === 'filter' ? 'active' : '';
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return () => scope.props.openScreen('filter');
            }
          }]
        }, {
          'redundantAttribute': 'expr52',
          'selector': '[expr52]',

          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return scope.props.selectedScreen === 'about' ? 'active' : '';
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return () => scope.props.openScreen('about');
            }
          }]
        }]
      );
    },

    'name': 'sidebar-nav'
  };

  var SiteHeader = {
    'css': `site-header header h1,[is="site-header"] header h1{ margin-bottom: 0.2em; } site-header header h5,[is="site-header"] header h5{ margin-top: 0; font-weight: 600; font-size: 1em; }`,
    'exports': null,

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<header><h1>#MiniBlaseball</h1><h5>Blaseball players art by @HetreaSky</h5></header>',
        []
      );
    },

    'name': 'site-header'
  };

  var TotopButton = {
    'css': `totop-button svg,[is="totop-button"] svg{ position: fixed; bottom: 10px; width: 50px; right: 10px; color: var(--color-link); cursor: pointer; }`,

    'exports': {
      scrollToTop(e) {
          console.log('we');
          window.scrollTo(0, 0);
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<svg expr62="expr62" stroke="currentColor" fill="currentColor" class="svg-icon" viewBox="0 0 20 20"><path d="M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10"/></svg>',
        [{
          'redundantAttribute': 'expr62',
          'selector': '[expr62]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.props.onClick;
            }
          }]
        }]
      );
    },

    'name': 'totop-button'
  };

  var DarkModeToggle = {
    'css': `dark-mode-toggle,[is="dark-mode-toggle"]{ display: flex; justify-content: center; align-items: center; font-size: 0.8em; font-weight: 600; } dark-mode-toggle input[type="checkbox"],[is="dark-mode-toggle"] input[type="checkbox"]{ position: absolute; display: none; } dark-mode-toggle .toggle,[is="dark-mode-toggle"] .toggle{ display: inline-block; font-size: 20px; height: 1em; width: 2em; border-radius: 1em; margin: 0 0.5em; background-color: var(--color-text); transition: all 300ms; cursor: pointer; } dark-mode-toggle .toggle span,[is="dark-mode-toggle"] .toggle span{ display: block; height: 1em; width: 1em; border-radius: 1em; margin-left: -2px; background-color: #fff; box-shadow: 0 0.1em 0.1em rgba(0,0,0,0.3); transition: all 300ms; } dark-mode-toggle input:checked ~ .toggle span,[is="dark-mode-toggle"] input:checked ~ .toggle span{ transform: translateX(1.2em); } dark-mode-toggle .light,[is="dark-mode-toggle"] .light{ opacity: 0.6; } dark-mode-toggle input:checked ~ .light,[is="dark-mode-toggle"] input:checked ~ .light{ opacity: 1; } dark-mode-toggle .dark,[is="dark-mode-toggle"] .dark{ opacity: 1; } dark-mode-toggle input:checked ~ .dark,[is="dark-mode-toggle"] input:checked ~ .dark{ opacity: 0.6; }`,

    'exports': {
      onToggle(e) {
          this.$('#theme-toggle').checked = !this.$('#theme-toggle').checked;

          this.props.onToggle();
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template(
        '<input id="theme-toggle" type="checkbox"/><span class="light">Light</span><div expr53="expr53" class="toggle"><span></span></div><span class="dark">Dark</span>',
        [{
          'redundantAttribute': 'expr53',
          'selector': '[expr53]',

          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.onToggle;
            }
          }]
        }]
      );
    },

    'name': 'dark-mode-toggle'
  };

  var PlayersData = [
  	{
  		index: 1,
  		id: "richmond-harrison",
  		"full-name": "Richmond Harrison",
  		size: "small",
  		team: "Hades Tigers",
  		"former-teams": [
  			"Canada Moist Talkers"
  		],
  		sprites: [
  			"01RichmondHarrison.png",
  			"01RichmondHarrisonALT.png"
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
  		index: 3,
  		id: "wyatt-quitter",
  		"full-name": "Wyatt Quitter",
  		size: "small",
  		team: "Tokyo Lift",
  		"former-teams": [
  			"Unlimited Tacos",
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
  		index: 5,
  		id: "cory-twelve",
  		"full-name": "Cory Twelve",
  		size: "small",
  		team: "Yellowstone Magic",
  		"former-teams": [
  		],
  		sprites: [
  			"05CoryTwelve.png"
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
  		index: 7,
  		id: "landry-violence",
  		"full-name": "Landry Violence",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
  			"Hades Tigers"
  		],
  		sprites: [
  			"07LandryViolence.png",
  			"07LandryViolenceALT.png"
  		],
  		"default-sprite": 0
  	},
  	{
  		index: 8,
  		id: "caligula-lotus",
  		"full-name": "Caligula Lotus",
  		size: "large",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 9,
  		id: "kiki-familia",
  		"full-name": "Kiki Familia",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 11,
  		id: "forrest-best",
  		"full-name": "Forrest Best",
  		size: "small",
  		team: "Baltimore Crabs",
  		"former-teams": [
  		],
  		sprites: [
  			"11ForrestBest.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/okaybutwhy9",
  				text: "@okaybutwhy9"
  			}
  		]
  	},
  	{
  		index: 12,
  		id: "jessica-telephone",
  		"full-name": "Jessica Telephone",
  		size: "small",
  		team: "Kansas City Breath Mints",
  		"former-teams": [
  			"Dallas Steaks",
  			"Philly Pies",
  			"Hades Tigers",
  			"THE SHELLED ONE'S PODS"
  		],
  		sprites: [
  			"12JessicaTelephone.png",
  			"12JessicaTelephoneALT.png",
  			"12JessicaTelephoneALT2.png",
  			"12JessicaTelephoneALT3.png",
  			"12JessicaTelephoneALT4.png"
  		],
  		"default-sprite": 4,
  		credits: [
  			{
  				link: "https://twitter.com/telekeys",
  				text: "@telekeys"
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
  		index: 17,
  		id: "sixpack-dogwalker",
  		"full-name": "Sixpack Dogwalker",
  		size: "large",
  		team: "Dallas Steaks",
  		"former-teams": [
  			"Hawai'i Fridays"
  		],
  		sprites: [
  			"17SixpackDogwalker.png",
  			"17SixpackDogwalkerALT.png"
  		],
  		"default-sprite": 1
  	},
  	{
  		index: 18,
  		id: "dominic-marijuana",
  		"full-name": "Dominic Marijuana",
  		size: "large",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 19,
  		id: "randall-marijuana",
  		"full-name": "Randall Marijuana",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
  			"Hellmouth Sunbeams",
  			"Breckenridge Jazz Hands"
  		],
  		sprites: [
  			"19RandallMarijuana.png",
  			"19RandallMarijuanaALT.png",
  			"19RandallMarijuanaALT2.png"
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
  		index: 22,
  		id: "gunther-o-brian",
  		"full-name": "Gunther O Brian",
  		size: "small",
  		team: "Charleston Shoe Thieves",
  		"former-teams": [
  		],
  		sprites: [
  			"22GuntherOBrian.png"
  		],
  		"default-sprite": 0
  	},
  	{
  		index: 23,
  		id: "fish-summer",
  		"full-name": "Fish Summer",
  		size: "large",
  		team: "Canada Moist Talkers",
  		"former-teams": [
  			"Hades Tigers"
  		],
  		sprites: [
  			"23FishSummer.png",
  			"23FishSummerALT.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://instagram.com/lote_lake",
  				text: "lote_lake"
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
  		index: 25,
  		id: "jaylen-hotdogfingers",
  		"full-name": "Jaylen Hotdogfingers",
  		size: "small",
  		team: "San Francisco Lovers",
  		"former-teams": [
  			"Seattle Garages",
  			"Charleston Shoe Thieves",
  			"Hall Stars",
  			"THE SHELLED ONE'S PODS"
  		],
  		sprites: [
  			"25JaylenHotdogfingers.png",
  			"25JaylenHotdogfingersALT.png",
  			"25JaylenHotdogfingersALT2.png",
  			"25JaylenHotdogfingersALT3.png",
  			"25JaylenHotdogfingersALT4.png",
  			"25JaylenHotdogfingersALT5.png",
  			"25JaylenHotdogfingersALT6.png"
  		],
  		"default-sprite": 6,
  		credits: [
  			{
  				link: "https://twitter.com/MLeeLunsford",
  				text: "@MLeeLunsford"
  			}
  		]
  	},
  	{
  		index: 26,
  		id: "parker-meng",
  		"full-name": "Parker Meng",
  		size: "small",
  		team: "San Francisco Lovers",
  		"former-teams": [
  		],
  		sprites: [
  			"26ParkerMeng.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/cari_guevara",
  				text: "@cari_guevara"
  			}
  		]
  	},
  	{
  		index: 27,
  		id: "york-silk",
  		"full-name": "York Silk",
  		size: "small",
  		team: "Canada Moist Talkers",
  		"former-teams": [
  			"Hawai'i Fridays",
  			"THE SHELLED ONE'S PODS"
  		],
  		sprites: [
  			"27YorkSilk.png",
  			"27YorkSilkALT.png",
  			"27YorkSilkALT2.png"
  		],
  		"default-sprite": 2,
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
  		index: 28,
  		id: "nan",
  		"full-name": "NaN",
  		size: "small",
  		team: "San Francisco Lovers",
  		"former-teams": [
  			"Unlimited Tacos",
  			"Houston Spies",
  			"Mexico City Wild Wings"
  		],
  		sprites: [
  			"28NaN.png",
  			"28NaNALT.png",
  			"28NaNALT2.png",
  			"28NaNALT3.png"
  		],
  		"default-sprite": 3,
  		credits: [
  			{
  				link: "https://twitter.com/Fancymancer",
  				text: "@Fancymancer"
  			}
  		]
  	},
  	{
  		index: 29,
  		id: "rivers-rosa",
  		"full-name": "Rivers Rosa",
  		size: "small",
  		team: "Chicago Firefighters",
  		"former-teams": [
  		],
  		sprites: [
  			"29RiversRosa.png"
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
  		index: 31,
  		id: "nagomi-mcdaniel",
  		"full-name": "Nagomi McDaniel",
  		size: "small",
  		team: "Hawai'i Fridays",
  		"former-teams": [
  			"Hades Tigers",
  			"Baltimore Crabs",
  			"Breckenridge Jazz Hands"
  		],
  		sprites: [
  			"31NagomiMcDaniel.png",
  			"31NagomiMcDanielALT.png",
  			"31NagomiMcDanielALT2.png",
  			"31NagomiMcDanielALT3.png"
  		],
  		"default-sprite": 2,
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
  		"default-sprite": 0
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
  		"default-sprite": 0
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
  		"default-sprite": 0
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
  		index: 48,
  		id: "pitching-machine",
  		"full-name": "Pitching Machine",
  		size: "small",
  		team: "Seattle Garages",
  		"former-teams": [
  			"Unlimited Tacos",
  			"THE SHELLED ONE'S PODS"
  		],
  		sprites: [
  			"48PitchingMachine.png",
  			"48PitchingMachineALT.png",
  			"48PitchingMachineALT2.png"
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
  		index: 50,
  		id: "nicholas-mora",
  		"full-name": "Nicholas Mora",
  		size: "small",
  		team: "Philly Pies",
  		"former-teams": [
  			"Hades Tigers"
  		],
  		sprites: [
  			"50NicholasMora.png",
  			"50NicholasMoraALT.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/isitsernik",
  				text: "@isitsernik"
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
  		index: 53,
  		id: "knight-triumphant",
  		"full-name": "Knight Triumphant",
  		size: "small",
  		team: "San Francisco Lovers",
  		"former-teams": [
  		],
  		sprites: [
  			"53KnightTriumphant.png"
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
  		"default-sprite": 0
  	},
  	{
  		index: 59,
  		id: "kichiro-guerra",
  		"full-name": "Kichiro Guerra",
  		size: "small",
  		team: "San Francisco Lovers",
  		"former-teams": [
  		],
  		sprites: [
  			"59KichiroGuerra.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/cari_guevara",
  				text: "@cari_guevara"
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
  		index: 61,
  		id: "wyatt-pothos",
  		"full-name": "Wyatt Pothos",
  		size: "small",
  		team: "Breckenridge Jazz Hands",
  		"former-teams": [
  			"Unlimited Tacos",
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
  		index: 62,
  		id: "cannonball-sports",
  		"full-name": "Cannonball Sports",
  		size: "small",
  		team: "Miami Dale",
  		"former-teams": [
  		],
  		sprites: [
  			"62CannonballSports.png"
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
  		index: 63,
  		id: "elvis-figueroa",
  		"full-name": "Elvis Figueroa",
  		size: "small",
  		team: "Philly Pies",
  		"former-teams": [
  		],
  		sprites: [
  			"63ElvisFigueroa.png"
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
  		index: 64,
  		id: "fitzgerald-blackburn",
  		"full-name": "Fitzgerald Blackburn",
  		size: "small",
  		team: "Houston Spies",
  		"former-teams": [
  		],
  		sprites: [
  			"64FitzgeraldBlackburn.png"
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
  		index: 66,
  		id: "tillman-henderson",
  		"full-name": "Tillman Henderson",
  		size: "small",
  		team: "Charleston Shoe Thieves",
  		"former-teams": [
  			"Baltimore Crabs"
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
  		index: 70,
  		id: "leach-ingram",
  		"full-name": "Leach Ingram",
  		size: "small",
  		team: "Kansas City Breath Mints",
  		"former-teams": [
  		],
  		sprites: [
  			"70LeachIngram.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "",
  				text: "RealHaman"
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
  		index: 73,
  		id: "beck-whitney",
  		"full-name": "Beck Whitney",
  		size: "small",
  		team: "Miami Dale",
  		"former-teams": [
  			"Boston Flowers"
  		],
  		sprites: [
  			"73BeckWhitney.png",
  			"73BeckWhitneyALT.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/pewterbee",
  				text: "@pewterbee"
  			}
  		]
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
  		index: 76,
  		id: "chorby-soul",
  		"full-name": "Chorby Soul",
  		size: "small",
  		team: "RIV",
  		"former-teams": [
  			"New York Millennials"
  		],
  		sprites: [
  			"76ChorbySoul.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/apolante_art",
  				text: "@apolante_art"
  			}
  		]
  	},
  	{
  		index: 77,
  		id: "carmelo-plums",
  		"full-name": "Carmelo Plums",
  		size: "small",
  		team: "Hades Tigers",
  		"former-teams": [
  		],
  		sprites: [
  			"77CarmeloPlums.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/Sovenas_Ark",
  				text: "@Sovenas_Ark"
  			}
  		]
  	},
  	{
  		index: 78,
  		id: "sexton-wheerer",
  		"full-name": "Sexton Wheerer",
  		size: "large",
  		team: "Unlimited Tacos",
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
  		index: 79,
  		id: "son-scotch",
  		"full-name": "Son Scotch",
  		size: "small",
  		team: "Houston Spies",
  		"former-teams": [
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
  		index: 84,
  		id: "august-sky",
  		"full-name": "August Sky",
  		size: "small",
  		team: "Dallas Steaks",
  		"former-teams": [
  			"Breckenridge Jazz Hands"
  		],
  		sprites: [
  			"84AugustSky.png",
  			"84AugustSkyALT.png"
  		],
  		"default-sprite": 0
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
  		index: 86,
  		id: "farrell-seagull",
  		"full-name": "Farrell Seagull",
  		size: "small",
  		team: "Philly Pies",
  		"former-teams": [
  			"Miami Dale",
  			"Seattle Garages"
  		],
  		sprites: [
  			"86FarrellSeagull.png",
  			"86FarrellSeagullALT.png",
  			"86FarrellSeagullALT2.png"
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
  		index: 87,
  		id: "fletcher-yamamoto",
  		"full-name": "Fletcher Yamamoto",
  		size: "small",
  		team: "Hawai'i Fridays",
  		"former-teams": [
  		],
  		sprites: [
  			"87FletcherYamamoto.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/phrenicquake",
  				text: "@phrenicquake"
  			}
  		]
  	},
  	{
  		index: 88,
  		id: "alaynabella-hollywood",
  		"full-name": "Alaynabella Hollywood",
  		size: "small",
  		team: "Boston Flowers",
  		"former-teams": [
  			"Hellmouth Sunbeams"
  		],
  		sprites: [
  			"88AlaynabellaHollywood.png",
  			"88AlaynabellaHollywoodALT.png"
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
  		index: 89,
  		id: "joshua-butt",
  		"full-name": "Joshua Butt",
  		size: "small",
  		team: "Chicago Firefighters",
  		"former-teams": [
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
  		index: 90,
  		id: "penelope-mathews",
  		"full-name": "Penelope Mathews",
  		size: "small",
  		team: "New York Millennials",
  		"former-teams": [
  			"Yellowstone Magic"
  		],
  		sprites: [
  			"90PenelopeMathews.png",
  			"90PenelopeMathewsALT.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/freddeye",
  				text: "@freddeye"
  			}
  		]
  	},
  	{
  		index: 91,
  		id: "ortiz-lopez",
  		"full-name": "Ortiz Lopez",
  		size: "small",
  		team: "San Francisco Lovers",
  		"former-teams": [
  		],
  		sprites: [
  			"91OrtizLopez.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/cari_guevara",
  				text: "@cari_guevara"
  			}
  		]
  	},
  	{
  		index: 92,
  		id: "halexandrey-walton",
  		"full-name": "Halexandrey Walton",
  		size: "small",
  		team: "Unlimited Tacos",
  		"former-teams": [
  			"Yellowstone Magic"
  		],
  		sprites: [
  			"92HalexandreyWalton.png",
  			"92HalexandreyWaltonALT.png"
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
  		index: 96,
  		id: "agan-harrison",
  		"full-name": "Agan Harrison",
  		size: "large",
  		team: "Breckenridge Jazz Hands",
  		"former-teams": [
  		],
  		sprites: [
  			"96AganHarrison.png"
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
  		index: 98,
  		id: "joshua-watson",
  		"full-name": "Joshua Watson",
  		size: "small",
  		team: "Mexico City Wild Wings",
  		"former-teams": [
  			"Baltimore Crabs",
  			"Chicago Firefighters"
  		],
  		sprites: [
  			"98JoshuaWatson.png",
  			"98JoshuaWatsonALT.png",
  			"98JoshuaWatsonALT2.png"
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
  		index: 100,
  		id: "yazmin-mason",
  		"full-name": "Yazmin Mason",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 105,
  		id: "pudge-nakamoto",
  		"full-name": "Pudge Nakamoto",
  		size: "small",
  		team: "Kansas City Breath Mints",
  		"former-teams": [
  		],
  		sprites: [
  			"105PudgeNakamoto.png"
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
  		index: 107,
  		id: "alejandro-leaf",
  		"full-name": "Alejandro Leaf",
  		size: "small",
  		team: "New York Millennials",
  		"former-teams": [
  			"Unlimited Tacos",
  			"THE SHELLED ONE'S PODS"
  		],
  		sprites: [
  			"107AlejandroLeaf.png",
  			"107AlejandroLeafALT.png",
  			"107AlejandroLeafALT2.png"
  		],
  		"default-sprite": 2,
  		credits: [
  			{
  				link: "https://twitter.com/ElevenQuietSeas",
  				text: "@ElevenQuietSeas"
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
  			"Seattle Garages"
  		],
  		sprites: [
  			"108LuisAcevedo.png",
  			"108LuisAcevedoALT.png"
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
  		index: 111,
  		id: "chorby-short",
  		"full-name": "Chorby Short",
  		size: "small",
  		team: "Yellowstone Magic",
  		"former-teams": [
  		],
  		sprites: [
  			"111ChorbyShort.png"
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
  		index: 112,
  		id: "logan-horseman",
  		"full-name": "Logan Horseman",
  		size: "small",
  		team: "Miami Dale",
  		"former-teams": [
  		],
  		sprites: [
  			"112LoganHorseman.png"
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
  		index: 114,
  		id: "peanut-holloway",
  		"full-name": "Peanut Holloway",
  		size: "small",
  		team: "Chicago Firefighters",
  		"former-teams": [
  			"Philly Pies",
  			"THE SHELLED ONE'S PODS"
  		],
  		sprites: [
  			"114PeanutHolloway.png",
  			"114PeanutHollowayALT.png",
  			"114PeanutHollowayALT2.png"
  		],
  		"default-sprite": 2,
  		credits: [
  			{
  				link: "https://twitter.com/this_is_onjit",
  				text: "@this_is_onjit"
  			}
  		]
  	},
  	{
  		index: 115,
  		id: "peanut-bong",
  		"full-name": "Peanut Bong",
  		size: "small",
  		team: "Unlimited Tacos",
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
  		index: 116,
  		id: "hotbox-sato",
  		"full-name": "Hotbox Sato",
  		size: "small",
  		team: "Charleston Shoe Thieves",
  		"former-teams": [
  			"Boston Flowers"
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
  		index: 117,
  		id: "howell-franklin",
  		"full-name": "Howell Franklin",
  		size: "large",
  		team: "Charleston Shoe Thieves",
  		"former-teams": [
  			"Houston Spies"
  		],
  		sprites: [
  			"117HowellFranklin.png",
  			"117HowellFranklinALT.png"
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
  		index: 118,
  		id: "workman-gloom",
  		"full-name": "Workman Gloom",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 121,
  		id: "wyatt-dovenpart",
  		"full-name": "Wyatt Dovenpart",
  		size: "small",
  		team: "Unlimited Tacos",
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
  		index: 122,
  		id: "basilio-fig",
  		"full-name": "Basilio Fig",
  		size: "large",
  		team: "Unlimited Tacos",
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
  		index: 126,
  		id: "evelton-mcblase-ii",
  		"full-name": "Evelton McBlase II",
  		size: "small",
  		team: "Baltimore Crabs",
  		"former-teams": [
  			"Houston Spies",
  			"Hawai'i Fridays"
  		],
  		sprites: [
  			"126EveltonMcBlaseII.png",
  			"126EveltonMcBlaseIIALT.png",
  			"126EveltonMcBlaseIIALT2.png"
  		],
  		"default-sprite": 2,
  		credits: [
  			{
  				link: "https://twitter.com/shenaniglenn",
  				text: "@shenaniglenn"
  			}
  		]
  	},
  	{
  		index: 127,
  		id: "lenny-spruce",
  		"full-name": "Lenny Spruce",
  		size: "large",
  		team: "Kansas City Breath Mints",
  		"former-teams": [
  		],
  		sprites: [
  			"127LennySpruce.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "",
  				text: "RealHaman"
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
  		index: 132,
  		id: "emmett-internet",
  		"full-name": "Emmett Internet",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 133,
  		id: "valentine-games",
  		"full-name": "Valentine Games",
  		size: "small",
  		team: "Unlimited Tacos",
  		"former-teams": [
  			"Baltimore Crabs",
  			"Breckenridge Jazz Hands",
  			"New York Millennials",
  			"Houston Spies"
  		],
  		sprites: [
  			"133ValentineGames.png",
  			"133ValentineGamesALT.png",
  			"133ValentineGamesALT2.png",
  			"133ValentineGamesALT3.png",
  			"133ValentineGamesALT4.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/deerstained",
  				text: "@deerstained"
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
  		index: 143,
  		id: "silvaire-roadhouse",
  		"full-name": "Silvaire Roadhouse",
  		size: "small",
  		team: "Baltimore Crabs",
  		"former-teams": [
  		],
  		sprites: [
  			"143SilvaireRoadhouse.png"
  		],
  		"default-sprite": 0,
  		credits: [
  			{
  				link: "https://twitter.com/toasthaste",
  				text: "@toasthaste"
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
  		index: 147,
  		id: "hiroto-wilcox",
  		"full-name": "Hiroto Wilcox",
  		size: "small",
  		team: "Hades Tigers",
  		"former-teams": [
  		],
  		sprites: [
  			"147HirotoWilcox.png"
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
  		index: 148,
  		id: "dunlap-figueroa",
  		"full-name": "Dunlap Figueroa",
  		size: "small",
  		team: "Hades Tigers",
  		"former-teams": [
  		],
  		sprites: [
  			"148DunlapFigueroa.png"
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
  		index: 149,
  		id: "tyreek-olive",
  		"full-name": "Tyreek Olive",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
  			"Chicago Firefighters"
  		],
  		sprites: [
  			"149TyreekOlive.png",
  			"149TyreekOliveALT.png"
  		],
  		"default-sprite": 0
  	},
  	{
  		index: 150,
  		id: "morrow-doyle",
  		"full-name": "Morrow Doyle",
  		size: "large",
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
  		index: 151,
  		id: "sebastian-sunshine",
  		"full-name": "Sebastian Sunshine",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 152,
  		id: "scrap-murphy",
  		"full-name": "Scrap Murphy",
  		size: "small",
  		team: "Hall Stars",
  		"former-teams": [
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
  		index: 153,
  		id: "aldon-cashmoney",
  		"full-name": "Aldon Cashmoney",
  		size: "small",
  		team: "Hades Tigers",
  		"former-teams": [
  			"Breckenridge Jazz Hands",
  			"Hawai'i Fridays"
  		],
  		sprites: [
  			"153AldonCashmoney.png",
  			"153AldonCashmoneyALT.png",
  			"153AldonCashmoneyALT2.png"
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
  		index: 154,
  		id: "mcdowell-mason",
  		"full-name": "McDowell Mason",
  		size: "small",
  		team: "Unlimited Tacos",
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
  		index: 155,
  		id: "francisca-sasquatch",
  		"full-name": "Francisca Sasquatch",
  		size: "small",
  		team: "Miami Dale",
  		"former-teams": [
  			"Unlimited Tacos",
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
  		index: 156,
  		id: "patel-beyonce",
  		"full-name": "Patel Beyonce",
  		size: "small",
  		team: "Dallas Steaks",
  		"former-teams": [
  			"Unlimited Tacos",
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
  		index: 158,
  		id: "paula-turnip",
  		"full-name": "Paula Turnip",
  		size: "small",
  		team: "Seattle Garages",
  		"former-teams": [
  			"Hades Tigers"
  		],
  		sprites: [
  			"158PaulaTurnip.png",
  			"158PaulaTurnipALT.png"
  		],
  		"default-sprite": 0,
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
  		index: 160,
  		id: "usurper-violet",
  		"full-name": "Usurper Violet",
  		size: "large",
  		team: "Hades Tigers",
  		"former-teams": [
  		],
  		sprites: [
  			"160UsurperViolet.png"
  		],
  		"default-sprite": 0,
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
  		index: 163,
  		id: "sutton-bishop",
  		"full-name": "Sutton Bishop",
  		size: "small",
  		team: "Hellmouth Sunbeams",
  		"former-teams": [
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
  		index: 164,
  		id: "nerd-pacheco",
  		"full-name": "Nerd Pacheco",
  		size: "small",
  		team: "Hellmouth Sunbeams",
  		"former-teams": [
  		],
  		sprites: [
  			"164NerdPacheco.png"
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
  		index: 169,
  		id: "freemium-seraph",
  		"full-name": "Freemium Seraph",
  		size: "large",
  		team: "Tokyo Lift",
  		"former-teams": [
  		],
  		sprites: [
  			"169FreemiumSeraph.png"
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
  		index: 170,
  		id: "vito-kravitz",
  		"full-name": "Vito Kravitz",
  		size: "small",
  		team: "Unlimited Tacos",
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
  		index: 171,
  		id: "rat-mason",
  		"full-name": "Rat Mason",
  		size: "small",
  		team: "Unlimited Tacos",
  		"former-teams": [
  		],
  		sprites: [
  			"171RatMason.png"
  		],
  		"default-sprite": 0
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
  			"Tokyo Lift"
  		]
  	},
  	{
  		name: "Wild Low",
  		teams: [
  			"Hellmouth Sunbeams",
  			"Unlimited Tacos",
  			"Houston Spies",
  			"Miami Dale",
  			"Boston Flowers"
  		]
  	},
  	{
  		name: "Mild High",
  		teams: [
  			"Seattle Garages",
  			"Dallas Steaks",
  			"San Francisco Lovers",
  			"New York Millennials",
  			"Philly Pies"
  		]
  	},
  	{
  		name: "Mild Low",
  		teams: [
  			"Charleston Shoe Thieves",
  			"Canada Moist Talkers",
  			"Hawai'i Fridays",
  			"Kansas City Breath Mints",
  			"Yellowstone Magic"
  		]
  	},
  	{
  		name: "Ascended",
  		teams: [
  			"Baltimore Crabs"
  		]
  	},
  	{
  		name: "Others",
  		teams: [
  			"THE SHELLED ONE'S PODS",
  			"Hall Stars",
  			"RIV"
  		]
  	}
  ];

  const teamsList = TeamsData.map(subleague => {
      return subleague.teams
  }).flat();

  let teamsReverseId = {};

  teamsList.forEach((teamname, index) => {
      teamsReverseId[teamname] = index;
  });

  var App = {
    'css': `app,[is="app"]{ font-family: "Lora", sans-serif; --color-bg: #fff; --color-text: #000; --color-soft: #eee; --color-link: #5c5c5c; --color-modalbg: #494a46; --color-overlaybg: rgba(0,0,0,0.6); --color-modaltext: #fff; background-color: var(--color-bg); } app.darkmode,[is="app"].darkmode{ --color-bg: #1c1d1b; --color-text: #fff; --color-soft: #2d2f32; --color-link: #848484; --color-modalbg: #1c1d1b; } app .main-container,[is="app"] .main-container{ width: 98%; max-width: 1000px; margin: 0 auto; padding-top: 20px; height: calc(100vh - 20px); display: grid; grid-template-columns: 1fr; overflow-x: hidden; color: var(--color-text); } @media (min-width: 900px) { app .main-container,[is="app"] .main-container{ overflow-x: hidden; grid-template-columns: 290px 1fr; } app .sidebar,[is="app"] .sidebar,app .main-content,[is="app"] .main-content{ overflow-y: auto; } } @media (min-width: 1400px) { app .main-container,[is="app"] .main-container{ max-width: 80%; } } app .sidebar,[is="app"] .sidebar{ padding: 0 1em; max-width: 500px; width: calc(100% - 2em); margin: 0 auto; box-sizing: border-box; } @media (min-width: 900px) { app .sidebar,[is="app"] .sidebar{ padding: 0 0.2em; width: 100%; border-right: solid 3px var(--color-soft); } app .totop-button,[is="app"] .totop-button{ display: none; } }`,

    'exports': {
      components: { Gallery, Overlay, Router: routerHoc, Route: routeHoc, FilterControl, Aboutbox, SidebarNav, SiteHeader, TotopButton, DarkModeToggle },
      playersData: PlayersData,
      teamsData: TeamsData,
      teamsList: teamsReverseId,

      // This list contains teams in {teamname: index} format
      // For sorting by teams

      onBeforeMount() {
          this.state = {
              playersShown: this.playersData,
              currentSortType: '',
              sidebarScreen: 'filter'
          };
      },

      onMounted() {
          // this.root.classList.add('darkmode')

          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            this.root.classList.toggle('darkmode');
          }
      },

      getPlayerData(id) {
          return this.playersData.find(player => player.id === id)
      },

      filterPlayerName(nameToSearch) {
          const playersShown = this.playersData.filter(player => {
                  return player['full-name'].toLowerCase().includes( nameToSearch.toLowerCase())
          });

          this.update({
              playersShown
          });

          this.applySort();
      },

      applyFilter(filterState) {
          const filters = filterState.appliedFilters;
          const team = filterState.teamFilter;


          if (!filters.length || !team) {
              // No filter checkbox is checked
              // Or no team to filter to is checked
              // Return to default

              this.update({
                  playersShown: this.playersData
              });

              this.applySort();

              return
          }

          const playersShown = this.playersData.filter(player => {
              if (filters.includes("wasmemberof")) {

                  if (player['former-teams'].includes(team)) {
                      return true
                  }

              }

              if (filters.includes("ismemberof")) {

                  if (player['team'] === team) {
                      return true
                  }
          
              }

              return false
          });

          this.update({
              playersShown
          });

          this.applySort();

      },

      changeSort(e) {
          const sortType = e.target.value;

          this.update({
              currentSortType: sortType
          });

          this.applySort();
      },

      applySort() {
          const sortType = this.state.currentSortType;

          if (!sortType) {
              // If no sortType is set (so it's still default)
              // don't sort anything
              return
          }

          console.log(sortType);

          let playersShown = this.state.playersShown;

          if (sortType === 'original') {
              // Slice so we don't modify the original
              playersShown = playersShown.slice().sort((playera, playerb) => {

                  return playera.index - playerb.index

              });
          }

          else if (sortType === 'alphabetical') {
              // Slice so we don't modify the original
              playersShown = playersShown.slice().sort((playera, playerb) => {

                  if (playera['full-name'] < playerb['full-name']) {
                      return -1
                  }

                  if (playera['full-name'] > playerb['full-name']) {
                      return 1
                  }

                  return 0

              });
          }

          else if (sortType === 'currentteam') {

              // Slice so we don't modify the original
              const teamsList = this.teamsList;

              playersShown = playersShown.slice().sort((playera, playerb) => {

                  if (teamsList[playera['team']] < teamsList[playerb['team']]) {
                      return -1
                  }

                  if (teamsList[playera['team']] > teamsList[playerb['team']]) {
                      return 1
                  }

                  return 0

              });
          }

          this.update({
              playersShown,
          });
      },

      selectSidebarScreen(screen) {
          this.update({
              sidebarScreen: screen
          });
      },

      setScreenDisplay(screen) {
          if (screen === this.state.sidebarScreen) {
              return 'display: block'
          }

          else {
              return 'display: none'
          }
      },

      scrollToTop() {
          this.$('.main-container').scrollTo(0,0);
      },

      toggleDarkmode() {
          this.root.classList.toggle('darkmode');
      }
    },

    'template': function(template, expressionTypes, bindingTypes, getComponent) {
      return template('<router expr36="expr36" base="/home"></router>', [{
        'type': bindingTypes.TAG,
        'getComponent': getComponent,

        'evaluate': function(scope) {
          return 'router';
        },

        'slots': [{
          'id': 'default',
          'html': '<div class="main-container"><div class="sidebar"><dark-mode-toggle expr37="expr37"></dark-mode-toggle><site-header expr38="expr38"></site-header><sidebar-nav expr39="expr39"></sidebar-nav><filter-control expr40="expr40"></filter-control><aboutbox expr41="expr41"></aboutbox></div><div class="main-content"><gallery expr42="expr42"></gallery></div></div><totop-button expr43="expr43" class="totop-button"></totop-button><route expr44="expr44" path="/#:player"></route>',

          'bindings': [{
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'dark-mode-toggle';
            },

            'slots': [],

            'attributes': [{
              'type': expressionTypes.EVENT,
              'name': 'on-toggle',

              'evaluate': function(scope) {
                return scope.toggleDarkmode;
              }
            }],

            'redundantAttribute': 'expr37',
            'selector': '[expr37]'
          }, {
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'site-header';
            },

            'slots': [],
            'attributes': [],
            'redundantAttribute': 'expr38',
            'selector': '[expr38]'
          }, {
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'sidebar-nav';
            },

            'slots': [],

            'attributes': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'selected-screen',

              'evaluate': function(scope) {
                return scope.state.sidebarScreen;
              }
            }, {
              'type': expressionTypes.ATTRIBUTE,
              'name': 'open-screen',

              'evaluate': function(scope) {
                return scope.selectSidebarScreen;
              }
            }],

            'redundantAttribute': 'expr39',
            'selector': '[expr39]'
          }, {
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'filter-control';
            },

            'slots': [],

            'attributes': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'style',

              'evaluate': function(scope) {
                return scope.setScreenDisplay('filter');
              }
            }, {
              'type': expressionTypes.ATTRIBUTE,
              'name': 'teams',

              'evaluate': function(scope) {
                return scope.teamsData;
              }
            }, {
              'type': expressionTypes.EVENT,
              'name': 'on-filter-player-name',

              'evaluate': function(scope) {
                return scope.filterPlayerName;
              }
            }, {
              'type': expressionTypes.EVENT,
              'name': 'on-change-filter',

              'evaluate': function(scope) {
                return scope.applyFilter;
              }
            }, {
              'type': expressionTypes.EVENT,
              'name': 'on-change-sort',

              'evaluate': function(scope) {
                return scope.changeSort;
              }
            }],

            'redundantAttribute': 'expr40',
            'selector': '[expr40]'
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return scope.state.sidebarScreen === 'about';
            },

            'redundantAttribute': 'expr41',
            'selector': '[expr41]',

            'template': template(null, [{
              'type': bindingTypes.TAG,
              'getComponent': getComponent,

              'evaluate': function(scope) {
                return 'aboutbox';
              },

              'slots': [],
              'attributes': []
            }])
          }, {
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'gallery';
            },

            'slots': [],

            'attributes': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'players',

              'evaluate': function(scope) {
                return scope.state.playersShown;
              }
            }, {
              'type': expressionTypes.ATTRIBUTE,
              'name': 'players-map',

              'evaluate': function(scope) {
                return scope.playersIdMap;
              }
            }],

            'redundantAttribute': 'expr42',
            'selector': '[expr42]'
          }, {
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'totop-button';
            },

            'slots': [],

            'attributes': [{
              'type': expressionTypes.EVENT,
              'name': 'onClick',

              'evaluate': function(scope) {
                return scope.scrollToTop;
              }
            }],

            'redundantAttribute': 'expr43',
            'selector': '[expr43]'
          }, {
            'type': bindingTypes.TAG,
            'getComponent': getComponent,

            'evaluate': function(scope) {
              return 'route';
            },

            'slots': [{
              'id': 'default',
              'html': '<overlay expr45="expr45"></overlay>',

              'bindings': [{
                'type': bindingTypes.TAG,
                'getComponent': getComponent,

                'evaluate': function(scope) {
                  return 'overlay';
                },

                'slots': [],

                'attributes': [{
                  'type': expressionTypes.ATTRIBUTE,
                  'name': 'player',

                  'evaluate': function(scope) {
                    return scope.getPlayerData(scope.route.params.player);
                  }
                }],

                'redundantAttribute': 'expr45',
                'selector': '[expr45]'
              }]
            }],

            'attributes': [],
            'redundantAttribute': 'expr44',
            'selector': '[expr44]'
          }]
        }],

        'attributes': [],
        'redundantAttribute': 'expr36',
        'selector': '[expr36]'
      }]);
    },

    'name': 'app'
  };

  const mountApp = component(App);

  const app = mountApp(
    document.getElementById('root'),
    { message: 'Hello World' }
  );

}());
