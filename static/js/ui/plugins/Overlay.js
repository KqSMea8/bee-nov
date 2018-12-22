/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-14 上午9:56
 */
LBF.define('util.zIndexGenerator', function(){
    var zIndex;

    /**
     * Generate legal z-index(a css attribute) value. Later generated is bigger than previous ones.
     * @class zIndexGenerator
     * @namespace util
     * @module util
     * @constructor
     * @return {Number} Legal z-index
     * @example
     *      LBF.use(['lib.jQuery', 'util.zIndexGenerator'], function($, zIndexGenerator){
     *          $('#selector').click(function(){
     *              $('#rs').html('z-index:' + zIndexGenerator());
     *          });
     *      })
     */
    return function () {
        if (!zIndex) {
            zIndex = 0;
        }
        var _zIndex = Math.round(new Date().getTime() % 1e8 / 1000);
        zIndex = Math.max(_zIndex, zIndex + 1);
        return zIndex;
    };
});
/**
 * @fileOverview
 * @author rainszhang
 * @version
 * Created: 13-11-1 下午6:56
 */
LBF.define('util.Shortcuts', function(){
    /*global define:false */
    /**
     * Copyright 2013 Craig Campbell
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * Mousetrap is a simple keyboard shortcut library for Javascript with
     * no external dependencies
     *
     * @version 1.4.5
     * @url craig.is/killing/mice
     */

    var Shortcuts = {};

    (function(window, document, undefined) {

        /**
         * mapping of special keycodes to their corresponding keys
         *
         * everything in this dictionary cannot use keypress events
         * so it has to be here to map to the correct keycodes for
         * keyup/keydown events
         *
         * @type {Object}
         */
        var _MAP = {
                8: 'backspace',
                9: 'tab',
                13: 'enter',
                16: 'shift',
                17: 'ctrl',
                18: 'alt',
                20: 'capslock',
                27: 'esc',
                32: 'space',
                33: 'pageup',
                34: 'pagedown',
                35: 'end',
                36: 'home',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down',
                45: 'ins',
                46: 'del',
                91: 'meta',
                93: 'meta',
                224: 'meta'
            },

            /**
             * mapping for special characters so they can support
             *
             * this dictionary is only used incase you want to bind a
             * keyup or keydown event to one of these keys
             *
             * @type {Object}
             */
            _KEYCODE_MAP = {
                106: '*',
                107: '+',
                109: '-',
                110: '.',
                111 : '/',
                186: ';',
                187: '=',
                188: ',',
                189: '-',
                190: '.',
                191: '/',
                192: '`',
                219: '[',
                220: '\\',
                221: ']',
                222: '\''
            },

            /**
             * this is a mapping of keys that require shift on a US keypad
             * back to the non shift equivelents
             *
             * this is so you can use keyup events with these keys
             *
             * note that this will only work reliably on US keyboards
             *
             * @type {Object}
             */
            _SHIFT_MAP = {
                '~': '`',
                '!': '1',
                '@': '2',
                '#': '3',
                '$': '4',
                '%': '5',
                '^': '6',
                '&': '7',
                '*': '8',
                '(': '9',
                ')': '0',
                '_': '-',
                '+': '=',
                ':': ';',
                '\"': '\'',
                '<': ',',
                '>': '.',
                '?': '/',
                '|': '\\'
            },

            /**
             * this is a list of special strings you can use to map
             * to modifier keys when you specify your keyboard shortcuts
             *
             * @type {Object}
             */
            _SPECIAL_ALIASES = {
                'option': 'alt',
                'command': 'meta',
                'return': 'enter',
                'escape': 'esc',
                'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
            },

            /**
             * variable to store the flipped version of _MAP from above
             * needed to check if we should use keypress or not when no action
             * is specified
             *
             * @type {Object|undefined}
             */
            _REVERSE_MAP,

            /**
             * a list of all the callbacks setup via Mousetrap.bind()
             *
             * @type {Object}
             */
            _callbacks = {},

            /**
             * direct map of string combinations to callbacks used for trigger()
             *
             * @type {Object}
             */
            _directMap = {},

            /**
             * keeps track of what level each sequence is at since multiple
             * sequences can start out with the same sequence
             *
             * @type {Object}
             */
            _sequenceLevels = {},

            /**
             * variable to store the setTimeout call
             *
             * @type {null|number}
             */
            _resetTimer,

            /**
             * temporary state where we will ignore the next keyup
             *
             * @type {boolean|string}
             */
            _ignoreNextKeyup = false,

            /**
             * temporary state where we will ignore the next keypress
             *
             * @type {boolean}
             */
            _ignoreNextKeypress = false,

            /**
             * are we currently inside of a sequence?
             * type of action ("keyup" or "keydown" or "keypress") or false
             *
             * @type {boolean|string}
             */
            _nextExpectedAction = false;

        /**
         * loop through the f keys, f1 to f19 and add them to the map
         * programatically
         */
        for (var i = 1; i < 20; ++i) {
            _MAP[111 + i] = 'f' + i;
        }

        /**
         * loop through to map numbers on the numeric keypad
         */
        for (i = 0; i <= 9; ++i) {
            _MAP[i + 96] = i;
        }

        /**
         * cross browser add event method
         *
         * @param {Element|HTMLDocument} object
         * @param {string} type
         * @param {Function} callback
         * @returns void
         */
        function _addEvent(object, type, callback) {
            if (object.addEventListener) {
                object.addEventListener(type, callback, false);
                return;
            }

            object.attachEvent('on' + type, callback);
        }

        /**
         * takes the event and returns the key character
         *
         * @param {Event} e
         * @return {string}
         */
        function _characterFromEvent(e) {

            // for keypress events we should return the character as is
            if (e.type == 'keypress') {
                var character = String.fromCharCode(e.which);

                // if the shift key is not pressed then it is safe to assume
                // that we want the character to be lowercase.  this means if
                // you accidentally have caps lock on then your key bindings
                // will continue to work
                //
                // the only side effect that might not be desired is if you
                // bind something like 'A' cause you want to trigger an
                // event when capital A is pressed caps lock will no longer
                // trigger the event.  shift+a will though.
                if (!e.shiftKey) {
                    character = character.toLowerCase();
                }

                return character;
            }

            // for non keypress events the special maps are needed
            if (_MAP[e.which]) {
                return _MAP[e.which];
            }

            if (_KEYCODE_MAP[e.which]) {
                return _KEYCODE_MAP[e.which];
            }

            // if it is not in the special map

            // with keydown and keyup events the character seems to always
            // come in as an uppercase character whether you are pressing shift
            // or not.  we should make sure it is always lowercase for comparisons
            return String.fromCharCode(e.which).toLowerCase();
        }

        /**
         * checks if two arrays are equal
         *
         * @param {Array} modifiers1
         * @param {Array} modifiers2
         * @returns {boolean}
         */
        function _modifiersMatch(modifiers1, modifiers2) {
            return modifiers1.sort().join(',') === modifiers2.sort().join(',');
        }

        /**
         * resets all sequence counters except for the ones passed in
         *
         * @param {Object} doNotReset
         * @returns void
         */
        function _resetSequences(doNotReset) {
            doNotReset = doNotReset || {};

            var activeSequences = false,
                key;

            for (key in _sequenceLevels) {
                if (doNotReset[key]) {
                    activeSequences = true;
                    continue;
                }
                _sequenceLevels[key] = 0;
            }

            if (!activeSequences) {
                _nextExpectedAction = false;
            }
        }

        /**
         * finds all callbacks that match based on the keycode, modifiers,
         * and action
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event|Object} e
         * @param {string=} sequenceName - name of the sequence we are looking for
         * @param {string=} combination
         * @param {number=} level
         * @returns {Array}
         */
        function _getMatches(character, modifiers, e, sequenceName, combination, level) {
            var i,
                callback,
                matches = [],
                action = e.type;

            // if there are no events related to this keycode
            if (!_callbacks[character]) {
                return [];
            }

            // if a modifier key is coming up on its own we should allow it
            if (action == 'keyup' && _isModifier(character)) {
                modifiers = [character];
            }

            // loop through all callbacks for the key that was pressed
            // and see if any of them match
            for (i = 0; i < _callbacks[character].length; ++i) {
                callback = _callbacks[character][i];

                // if a sequence name is not specified, but this is a sequence at
                // the wrong level then move onto the next match
                if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                    continue;
                }

                // if the action we are looking for doesn't match the action we got
                // then we should keep going
                if (action != callback.action) {
                    continue;
                }

                // if this is a keypress event and the meta key and control key
                // are not pressed that means that we need to only look at the
                // character, otherwise check the modifiers as well
                //
                // chrome will not fire a keypress if meta or control is down
                // safari will fire a keypress if meta or meta+shift is down
                // firefox will fire a keypress if meta or control is down
                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

                    // when you bind a combination or sequence a second time it
                    // should overwrite the first one.  if a sequenceName or
                    // combination is specified in this call it does just that
                    //
                    // @todo make deleting its own method?
                    var deleteCombo = !sequenceName && callback.combo == combination;
                    var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                    if (deleteCombo || deleteSequence) {
                        _callbacks[character].splice(i, 1);
                    }

                    matches.push(callback);
                }
            }

            return matches;
        }

        /**
         * takes a key event and figures out what the modifiers are
         *
         * @param {Event} e
         * @returns {Array}
         */
        function _eventModifiers(e) {
            var modifiers = [];

            if (e.shiftKey) {
                modifiers.push('shift');
            }

            if (e.altKey) {
                modifiers.push('alt');
            }

            if (e.ctrlKey) {
                modifiers.push('ctrl');
            }

            if (e.metaKey) {
                modifiers.push('meta');
            }

            return modifiers;
        }

        /**
         * actually calls the callback function
         *
         * if your callback function returns false this will use the jquery
         * convention - prevent default and stop propogation on the event
         *
         * @param {Function} callback
         * @param {Event} e
         * @returns void
         */
        function _fireCallback(callback, e, combo, sequence) {

            // if this event should not happen stop here
            if (Mousetrap.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
                return;
            }

            if (callback(e, combo) === false) {
                if (e.preventDefault) {
                    e.preventDefault();
                }

                if (e.stopPropagation) {
                    e.stopPropagation();
                }

                e.returnValue = false;
                e.cancelBubble = true;
            }
        }

        /**
         * handles a character key event
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event} e
         * @returns void
         */
        function _handleKey(character, modifiers, e) {
            var callbacks = _getMatches(character, modifiers, e),
                i,
                doNotReset = {},
                maxLevel = 0,
                processedSequenceCallback = false;

            // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
            for (i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].seq) {
                    maxLevel = Math.max(maxLevel, callbacks[i].level);
                }
            }

            // loop through matching callbacks for this key event
            for (i = 0; i < callbacks.length; ++i) {

                // fire for all sequence callbacks
                // this is because if for example you have multiple sequences
                // bound such as "g i" and "g t" they both need to fire the
                // callback for matching g cause otherwise you can only ever
                // match the first one
                if (callbacks[i].seq) {

                    // only fire callbacks for the maxLevel to prevent
                    // subsequences from also firing
                    //
                    // for example 'a option b' should not cause 'option b' to fire
                    // even though 'option b' is part of the other sequence
                    //
                    // any sequences that do not match here will be discarded
                    // below by the _resetSequences call
                    if (callbacks[i].level != maxLevel) {
                        continue;
                    }

                    processedSequenceCallback = true;

                    // keep a list of which sequences were matches for later
                    doNotReset[callbacks[i].seq] = 1;
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                    continue;
                }

                // if there were no sequence matches but we are still here
                // that means this is a regular match so we should fire that
                if (!processedSequenceCallback) {
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                }
            }

            // if the key you pressed matches the type of sequence without
            // being a modifier (ie "keyup" or "keypress") then we should
            // reset all sequences that were not matched by this event
            //
            // this is so, for example, if you have the sequence "h a t" and you
            // type "h e a r t" it does not match.  in this case the "e" will
            // cause the sequence to reset
            //
            // modifier keys are ignored because you can have a sequence
            // that contains modifiers such as "enter ctrl+space" and in most
            // cases the modifier key will be pressed before the next key
            //
            // also if you have a sequence such as "ctrl+b a" then pressing the
            // "b" key will trigger a "keypress" and a "keydown"
            //
            // the "keydown" is expected when there is a modifier, but the
            // "keypress" ends up matching the _nextExpectedAction since it occurs
            // after and that causes the sequence to reset
            //
            // we ignore keypresses in a sequence that directly follow a keydown
            // for the same character
            var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
            if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
                _resetSequences(doNotReset);
            }

            _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
        }

        /**
         * handles a keydown event
         *
         * @param {Event} e
         * @returns void
         */
        function _handleKeyEvent(e) {

            // normalize e.which for key events
            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
            if (typeof e.which !== 'number') {
                e.which = e.keyCode;
            }

            var character = _characterFromEvent(e);

            // no character found then stop
            if (!character) {
                return;
            }

            // need to use === for the character check because the character can be 0
            if (e.type == 'keyup' && _ignoreNextKeyup === character) {
                _ignoreNextKeyup = false;
                return;
            }

            Mousetrap.handleKey(character, _eventModifiers(e), e);
        }

        /**
         * determines if the keycode specified is a modifier key or not
         *
         * @param {string} key
         * @returns {boolean}
         */
        function _isModifier(key) {
            return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
        }

        /**
         * called to set a 1 second timeout on the specified sequence
         *
         * this is so after each key press in the sequence you have 1 second
         * to press the next key before you have to start over
         *
         * @returns void
         */
        function _resetSequenceTimer() {
            clearTimeout(_resetTimer);
            _resetTimer = setTimeout(_resetSequences, 1000);
        }

        /**
         * reverses the map lookup so that we can look for specific keys
         * to see what can and can't use keypress
         *
         * @return {Object}
         */
        function _getReverseMap() {
            if (!_REVERSE_MAP) {
                _REVERSE_MAP = {};
                for (var key in _MAP) {

                    // pull out the numeric keypad from here cause keypress should
                    // be able to detect the keys from the character
                    if (key > 95 && key < 112) {
                        continue;
                    }

                    if (_MAP.hasOwnProperty(key)) {
                        _REVERSE_MAP[_MAP[key]] = key;
                    }
                }
            }
            return _REVERSE_MAP;
        }

        /**
         * picks the best action based on the key combination
         *
         * @param {string} key - character for key
         * @param {Array} modifiers
         * @param {string=} action passed in
         */
        function _pickBestAction(key, modifiers, action) {

            // if no action was picked in we should try to pick the one
            // that we think would work best for this key
            if (!action) {
                action = _getReverseMap()[key] ? 'keydown' : 'keypress';
            }

            // modifier keys don't work as expected with keypress,
            // switch to keydown
            if (action == 'keypress' && modifiers.length) {
                action = 'keydown';
            }

            return action;
        }

        /**
         * binds a key sequence to an event
         *
         * @param {string} combo - combo specified in bind call
         * @param {Array} keys
         * @param {Function} callback
         * @param {string=} action
         * @returns void
         */
        function _bindSequence(combo, keys, callback, action) {

            // start off by adding a sequence level record for this combination
            // and setting the level to 0
            _sequenceLevels[combo] = 0;

            /**
             * callback to increase the sequence level for this sequence and reset
             * all other sequences that were active
             *
             * @param {string} nextAction
             * @returns {Function}
             */
            function _increaseSequence(nextAction) {
                return function() {
                    _nextExpectedAction = nextAction;
                    ++_sequenceLevels[combo];
                    _resetSequenceTimer();
                };
            }

            /**
             * wraps the specified callback inside of another function in order
             * to reset all sequence counters as soon as this sequence is done
             *
             * @param {Event} e
             * @returns void
             */
            function _callbackAndReset(e) {
                _fireCallback(callback, e, combo);

                // we should ignore the next key up if the action is key down
                // or keypress.  this is so if you finish a sequence and
                // release the key the final key will not trigger a keyup
                if (action !== 'keyup') {
                    _ignoreNextKeyup = _characterFromEvent(e);
                }

                // weird race condition if a sequence ends with the key
                // another sequence begins with
                setTimeout(_resetSequences, 10);
            }

            // loop through keys one at a time and bind the appropriate callback
            // function.  for any key leading up to the final one it should
            // increase the sequence. after the final, it should reset all sequences
            //
            // if an action is specified in the original bind call then that will
            // be used throughout.  otherwise we will pass the action that the
            // next key in the sequence should match.  this allows a sequence
            // to mix and match keypress and keydown events depending on which
            // ones are better suited to the key provided
            for (var i = 0; i < keys.length; ++i) {
                var isFinal = i + 1 === keys.length;
                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
                _bindSingle(keys[i], wrappedCallback, action, combo, i);
            }
        }

        /**
         * Converts from a string key combination to an array
         *
         * @param  {string} combination like "command+shift+l"
         * @return {Array}
         */
        function _keysFromString(combination) {
            if (combination === '+') {
                return ['+'];
            }

            return combination.split('+');
        }

        /**
         * Gets info for a specific key combination
         *
         * @param  {string} combination key combination ("command+s" or "a" or "*")
         * @param  {string=} action
         * @returns {Object}
         */
        function _getKeyInfo(combination, action) {
            var keys,
                key,
                i,
                modifiers = [];

            // take the keys from this pattern and figure out what the actual
            // pattern is all about
            keys = _keysFromString(combination);

            for (i = 0; i < keys.length; ++i) {
                key = keys[i];

                // normalize key names
                if (_SPECIAL_ALIASES[key]) {
                    key = _SPECIAL_ALIASES[key];
                }

                // if this is not a keypress event then we should
                // be smart about using shift keys
                // this will only work for US keyboards however
                if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                    key = _SHIFT_MAP[key];
                    modifiers.push('shift');
                }

                // if this key is a modifier then add it to the list of modifiers
                if (_isModifier(key)) {
                    modifiers.push(key);
                }
            }

            // depending on what the key combination is
            // we will try to pick the best event for it
            action = _pickBestAction(key, modifiers, action);

            return {
                key: key,
                modifiers: modifiers,
                action: action
            };
        }

        /**
         * binds a single keyboard combination
         *
         * @param {string} combination
         * @param {Function} callback
         * @param {string=} action
         * @param {string=} sequenceName - name of sequence if part of sequence
         * @param {number=} level - what part of the sequence the command is
         * @returns void
         */
        function _bindSingle(combination, callback, action, sequenceName, level) {

            // store a direct mapped reference for use with Mousetrap.trigger
            _directMap[combination + ':' + action] = callback;

            // make sure multiple spaces in a row become a single space
            combination = combination.replace(/\s+/g, ' ');

            var sequence = combination.split(' '),
                info;

            // if this pattern is a sequence of keys then run through this method
            // to reprocess each pattern one key at a time
            if (sequence.length > 1) {
                _bindSequence(combination, sequence, callback, action);
                return;
            }

            info = _getKeyInfo(combination, action);

            // make sure to initialize array if this is the first time
            // a callback is added for this key
            _callbacks[info.key] = _callbacks[info.key] || [];

            // remove an existing match if there is one
            _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

            // add this call back to the array
            // if it is a sequence put it at the beginning
            // if not put it at the end
            //
            // this is important because the way these are processed expects
            // the sequence ones to come first
            _callbacks[info.key][sequenceName ? 'unshift' : 'push']({
                callback: callback,
                modifiers: info.modifiers,
                action: info.action,
                seq: sequenceName,
                level: level,
                combo: combination
            });
        }

        /**
         * binds multiple combinations to the same callback
         *
         * @param {Array} combinations
         * @param {Function} callback
         * @param {string|undefined} action
         * @returns void
         */
        function _bindMultiple(combinations, callback, action) {
            for (var i = 0; i < combinations.length; ++i) {
                _bindSingle(combinations[i], callback, action);
            }
        }

        // start!
        _addEvent(document, 'keypress', _handleKeyEvent);
        _addEvent(document, 'keydown', _handleKeyEvent);
        _addEvent(document, 'keyup', _handleKeyEvent);

        var Mousetrap = {

            /**
             * binds an event to mousetrap
             *
             * can be a single key, a combination of keys separated with +,
             * an array of keys, or a sequence of keys separated by spaces
             *
             * be sure to list the modifier keys first to make sure that the
             * correct key ends up getting bound (the last key in the pattern)
             *
             * @param {string|Array} keys
             * @param {Function} callback
             * @param {string=} action - 'keypress', 'keydown', or 'keyup'
             * @returns void
             */
            bind: function(keys, callback, action) {
                keys = keys instanceof Array ? keys : [keys];
                _bindMultiple(keys, callback, action);
                return this;
            },

            /**
             * unbinds an event to mousetrap
             *
             * the unbinding sets the callback function of the specified key combo
             * to an empty function and deletes the corresponding key in the
             * _directMap dict.
             *
             * TODO: actually remove this from the _callbacks dictionary instead
             * of binding an empty function
             *
             * the keycombo+action has to be exactly the same as
             * it was defined in the bind method
             *
             * @param {string|Array} keys
             * @param {string} action
             * @returns void
             */
            unbind: function(keys, action) {
                return Mousetrap.bind(keys, function() {}, action);
            },

            /**
             * triggers an event that has already been bound
             *
             * @param {string} keys
             * @param {string=} action
             * @returns void
             */
            trigger: function(keys, action) {
                if (_directMap[keys + ':' + action]) {
                    _directMap[keys + ':' + action]({}, keys);
                }
                return this;
            },

            /**
             * resets the library back to its initial state.  this is useful
             * if you want to clear out the current keyboard shortcuts and bind
             * new ones - for example if you switch to another page
             *
             * @returns void
             */
            reset: function() {
                _callbacks = {};
                _directMap = {};
                return this;
            },

           /**
            * should we stop this event before firing off callbacks
            *
            * @param {Event} e
            * @param {Element} element
            * @return {boolean}
            */
            stopCallback: function(e, element) {

                // if the element has the class "mousetrap" then no need to stop
                if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                    return false;
                }

                // stop for input, select, and textarea
                return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
            },

            /**
             * exposes _handleKey publicly so it can be overwritten by extensions
             */
            handleKey: _handleKey
        };

        // expose mousetrap to the global object
        Shortcuts = Mousetrap;

        // expose mousetrap as an AMD module
        if (typeof define === 'function' && define.amd) {
            define(Mousetrap);
        }
    }) (window, document);


    return Shortcuts;
});
/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-28 上午9:52
 */
LBF.define('ui.Nodes.Popup', function(require){
    var Style = require('util.Style'),
        $ = require('lib.jQuery'),
		browser = require('lang.browser'),
        Node = require('ui.Nodes.Node'),
        zIndexGenerator = require('util.zIndexGenerator');

    require('{theme}/lbfUI/css/Popup.css');

    var body = document.getElementsByTagName('body')[0];

    /**
     * Base popup component
     * @class Popup
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Object} [opts.events] Node's events
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes
     * @param {Boolean} [opts.centered=false] If set node to be centered to it's container
     * @example
     *      new Popup({
     *          container: 'someContainerSelector',
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *
     *              mouseover: function(){
     *                  alert('over me');
     *              }
     *          }
     *      });
     *
     * @example
     *      new Popup({
     *          selector: 'someButtonSelector',
     *          centered: true,
     *          events: {
     *              click: function(){
     *                  alert('click');
     *              }
     *          }
     *      });
     */
    var Popup = Node.inherit({
        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var wrapTemplate = this.template(this.get('wrapTemplate')),
                $el = this.$(wrapTemplate( this.attributes() )),
                container = this.get('container'),
                $container = this.$container = $(container.$el || container);

            this.setElement($el);

            $container.append($el);

            // element should be in the DOM when set to center, otherwise will cause wrong position
            this.get('centered') && this.setToCenter();

            return this;
        },

        /**
         * Set node to be centered to it's container
         * @method setToCenter
         * @chainable
         * @example
         *      node.setToCenter();
         */
        setToCenter: function(){
            var $container = this.$container,
                offset = /(?:static|auto)/.test($container.css('position')) ? $container.outerPosition() : { top: 0, left: 0},
                containerHeight = $container.outerHeight(),
                containerWidth = $container.outerWidth(),
                popup = this,
                top, left;

            // when container is body, take window into consideration to make sure center position
            if($container.get(0) === body){
				//$container.scrollTop()在IE下为0，请使用$(document)
				top = $(document).scrollTop() + $(window).height()/2 - this.outerHeight()/2;
				left = $container.scrollLeft() + $(window).width()/2 - this.outerWidth()/2;
				
				this.$el.css({
					top: top,
					left: left
				});

                /*
                $(window).bind('scroll', function(){
                    top = $(document).scrollTop() + $(window).height() / 2 - popup.height()/2;

                    popup.$el.css({
                        top: top
                    });
                })
                */
            }else{
				top = offset.top + Math.max(0, (containerHeight - this.outerHeight()) / 2);
                left = offset.left + Math.max(0, (containerWidth - this.outerWidth()) / 2);

				this.css({
					top: top,
					left: left
				});
			}

            return this;
        },

        updateZIndex: function(){
            this.css('zIndex', zIndexGenerator());
        }
    });

    Popup.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            width: 'auto',
            height: 'auto',
            container: 'body',
            wrapTemplate: '<div class="lbf-popup"><%== content %></div>',
            content: ''
        }
    });

    return Popup;
});/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-23 上午10:35
 */

LBF.define('ui.Nodes.Button', function(require){
    var browser = require('lang.browser'),
        Node = require('ui.Nodes.Node');

    var TEXT = '按钮';

    /**
     * Base button component
     * @class Button
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Array} [opts.templates] Array of templates for normal, stress and weak type of button
     * @param {String} [opts.name] Form name
     * @param {String} [opts.id] Form id
     * @param {String} [opts.className] Button style
     * @param {String} [opts.content] Button text
     * @param {String} [opts.sort] Button sort (default|primary|info|success|warning|danger|link)
     * @param {String} [opts.size] Button size (mini|small|normal|large|huge)
     * @param {String} [opts.disabled] Button disabled
     * @param {Object} [opts.events] Button events to be bound
     * @example
     *      new Button({
     *          container: 'someContainerSelector',
     *          content: 'i\'m a button',
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *
     *              mouseover: function(){
     *                  alert('over me');
     *              }
     *          }
     *      });
     *
     * @example
     *      new Button({
     *          selector: 'someButtonSelector',
     *          events: {
     *              click: function(){
     *                  alert('click');
     *              }
     *          }
     *      });
     */
    var Button = Node.inherit({
        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var selector = this.get('selector'),
                wrapTemplate = this.wrapTemplate = this.template(this.get('wrapTemplate')),
                $selector = this.$(selector);

            if(selector){
                !$selector.is('.lbf-button') && $selector.addClass('lbf-button');

                // 无抖动
                this.setElement(selector);
            } else {

                // container渲染模式
                this.setElement(wrapTemplate(this.attributes()));

                // 设置ID
                this.get('id') && this.prop(this.get('id'));

                this.$el.appendTo(this.get('container'));
            }

            // set name
            this.get('name') && this.prop(this.get('name'));

            // set sort
            this.addClass('lbf-button-' + this.get('sort'));

            // set size
            this.addClass('lbf-button-' + this.get('size'));

            // set block
            this.get('block') && this.addClass('lbf-button-block');

            // disabled property
            this.get('disabled') && this.disable();

            return this;
        },

        /**
         * Show button.
         * Button is div and original show will set display to block and cause style bug
         * @method show
         * @chainable
         */
        show: function(){
            var that = this;

            if(browser.msie && parseInt(browser.version, 10) < 8){
                if(that.prop('disabled')){
                    this._clone.css('display', 'inline');
                    return this;
                }

                this.$el.css('display', 'inline');

                return this;
            }else{
                if(that.prop('disabled')){
                    this._clone.css('display', 'inline-block');
                   return this;
                }

                this.$el.css('display', 'inline-block');

                return this;
            }
        },

        /**
        * Hide button.
        * @method Hide
        * @chainable
        */
        hide: function(){
            if(this.prop('disabled')){
                this._clone.css('display', 'none');
                return this;
            }

            this.$el.css('display', 'none');

            return this;
        },

        /**
         * Disable the button
         * @method disable
         * @chainable
         */
        disable: function(){
            this.trigger('disable', [this]);

            if(!this._clone){
                var clone = this._clone = this.clone();
                this.$el.after(clone);
            }

            this._clone
                .prop('disabled', 'disabled')
                .css('display', '')
                .addClass('lbf-button-disabled');

            this
                .prop('disabled', 'disabled')
                .addClass('lbf-button-disabled')
                .css('display', 'none');

            return this;
        },

        /**
         * Enable the button
         * @method enable
         * @chainable
         */
        enable: function(){
            this.trigger('enable', [this]);

            if(this._clone){
                this._clone
                    .hide()
                    .prop('disabled', '')
                    .removeClass('lbf-button-disabled');
            }

            this
                .prop('disabled', '')
                .removeClass('lbf-button-disabled')
                .$el.show();

            return this;
        }
    });

    Button.include({
        /**
         * @method renderAll
         * @static
         * @param {String|documentElement|jQuery|Node} [selector='input[type=button],input[type=submit],button'] Selector of nodes to be rendered
         * @param {Object} [opts] Options for node
         * @return {Array} Array of nodes that is rendered
         * @example
         *      var nodeArray = Button.renderAll();
         *
         * @example
         *      var nodeArray = Button.renderAll('.button');
         *
         * @example
         *      var nodeArray = Button.renderAll({
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         *
         * @example
         *      var nodeArray = Button.renderAll('.button', {
         *          //options
         *          events: {
         *              error: function(){
         *                  alert('hello');
         *              }
         *          }
         *      });
         */
        renderAll: function(selector, opts){
            var SELECTOR = 'input[type=button], input[type=submit], button';

            var nodes = [],
                Class = this,
                $ = this.prototype.$;

            if(selector.nodeType || typeof selector.length !== 'undefined' || typeof selector === 'string'){
                opts = opts || {};
            } else if(selector.$el){
                selector = selector.$el;
                opts = opts || {};
            } else {
                opts = selector || {};
                selector = SELECTOR;
            }

            opts._SELECTOR = opts.selector;

            $(selector).each(function(){
                if(!$(this).is(SELECTOR)){
                    return;
                }
                opts.selector = this;
                nodes.push(new Class(opts));
            });

            opts.selector = opts._SELECTOR;
            opts._SELECTOR = null;

            return nodes;
        },

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

			//按钮结构模板
            wrapTemplate: '<a href="javascript:;" class="lbf-button"><%== content %></a>',

            //按钮文案
            content: TEXT,

            //按钮种类
            sort: 'default', //default|primary|info|success|warning|danger|link

            //按钮尺寸
            size: 'normal' //mini|small|default|large|huge
        }
    });

    return Button;
});
/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-28 下午5:58
 */
LBF.define('ui.Plugins.Drag', function(require){
    var Style = require('util.Style'),
        Plugin = require('ui.Plugins.Plugin'),
        zIndexGenerator = require('util.zIndexGenerator');

    require('{theme}/lbfUI/css/Drag.css');

    /**
     * Make a node draggable.
     * @class Drag
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {ui.Nodes.Node} node Node instance of classes extended from ui.Nodes.Node
     * @param {Object} [opts] Options of node
     * @param {Boolean} [opts.proxy=false] Whether to Use proxy layer instead of node itself. Turn this on when host node is complex will benefits a lot in performance.
     * @param {String} [opts.delegate] The selector of elements to be delegated to node of draggable feature. When delegate is set, use delegate mode automatically.
     * @param {String|jQuery|documentElement} [opts.handler=this.$el] Drag handler
     * @param {Object|jQuery|documentElement} [opts.area] Limited drag area. Exactly positions of top, right, bottom and left or jQuery object/document element are ok.
     * @param {Number} [opts.area.top]
     * @param {Number} [opts.area.right]
     * @param {Number} [opts.area.bottom]
     * @param {Number} [opts.area.left]
     * @example
     *      node.plug(Drag, {
     *          proxy: true, // optimize performance
     *          handler: '.handler' // assign a handler for dragging
     *      });
     *
     * @example
     *      node.plug(Drag, {
     *          area: 'areaSelector' // limit drag area to a certain area
     *      });
     */
    var Drag = Plugin.inherit({
        initialize: function(node, opts){
            this.node = node;
            this.addMethods(this.constructor.methods);

            this.mergeOptions(opts);

            this.initEvents();
            this.render();
            this.bindUI();

            this.bindEventsToHost(this.constructor.bindEventsToHost);

            this.trigger('load', [this]);
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            this.$el = this.node.$el;
            this.get('area') && this.setDragArea(this.get('area'));

            this.get('proxy') && this.createProxy();
            this.bind('change:proxy', function(){
                if(this.get('proxy')){
                    // enable proxy
                    this.removeProxy();
                    this.createProxy();
                    return;
                }

                // disable proxy
                this.removeProxy();
            });

            return this;
        },

        /**
         * Bind UI events like startDrag, watchDrag and endDrag
         * @method bindUI
         * @protected
         * @chainable
         */
        bindUI: function(){
            var dd = this,
                delegate = dd.get('delegate'),
                $body = dd.$(document),
                stickOnTrack = dd.get('stickOnTrack').toLowerCase(),
                $el = dd.$el,
                area = dd.get('area'),
				needWatch = false,
                $drag, $handler, $proxy, x0, y0, left, top;

            /**
             * @method startDrag
             * @private
             * @param {Event} e
             * @returns {Boolean}
             */
            var startDrag = function(e){
                    if(dd.disabled){
                        return;
                    }
					
					var containerOffset = $drag.offsetParent().offset(),
                        dragWidth = $drag.outerWidth(),
                        dragHeight = $drag.outerHeight(),
                        proxyWidth = dd.get('width') || dragWidth,
                        proxyHeight = dd.get('height') || dragHeight;

                    y0 = e.pageY;
                    x0 = e.pageX;
					needWatch = true;

                    if(dd.get('proxy')){
                        $proxy
                            .css({
                                width: proxyWidth,
                                height: proxyHeight
                            })
                            .show();

                        left = x0 - containerOffset.left - ($proxy.width())/2;
                        top = y0 - containerOffset.top - ($proxy.height())/2;
                    } else {
                        left = parseInt($proxy.css('left'), 10) || 0;
                        top = parseInt($proxy.css('top'), 10) || 0;
                    }

                    if(area){
                        top = Math.min(Math.max(top, area.top), area.bottom - $drag.outerHeight());
                        left = Math.min(Math.max(left, area.left), area.right - $drag.outerWidth());
                    }

                    $proxy.css({
                        top: top,
                        left: left,
                        position: 'absolute',
                        //z-index始终为当前最大值
                        zIndex: zIndexGenerator()
                    });

                    /**
                     * Fired befor drag starts
                     * @event beforeDrag
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's y direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('beforeDrag', [dd, x0, y0, left, top]);
                },

                /**
                 * @method watchDrag
                 * @private
                 * @param {Event} e
                 * @returns {Boolean}
                 */
                watchDrag = function(e){
					if(!needWatch) {
						return true;
					}

                    // let all element can't not be selected
                    dd.$('body').addClass('lbf-drag-unselect').attr('unselectable', 'on');
					
                    top = top + e.pageY - y0;
                    left = left + e.pageX - x0;

                    if(area){
                        top = Math.min(Math.max(top, area.top), area.bottom - $drag.outerHeight());
                        left = Math.min(Math.max(left, area.left), area.right - $drag.outerWidth());
                    }

                    var position = {
                        top: top,
                        left: left
                    };

                    if(stickOnTrack === 'x'){
                        delete position.top
                    }

                    if(stickOnTrack === 'y'){
                        delete position.left
                    }

                    $proxy.css(position);

                    y0 = e.pageY;
                    x0 = e.pageX;

                    /**
                     * Fired when dragging
                     * @event drag
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('drag', [dd, x0, y0, left, top]);
                },

                /**
                 * @method endDrag
                 * @private
                 * @param {Event} e
                 * @returns {Boolean}
                 */
                endDrag = function(e){
                    needWatch = false;

                    x0 = e.pageX;
                    y0 = e.pageY;

                    /**
                     * Fired when drag ends
                     * @event drag
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('afterDrag', [dd, x0, y0, left, top]);

                    /**
                     * Fired before drop
                     * @event beforeDrop
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('beforeDrop', [dd, x0, y0, left, top]);

                    // final adjust
                    watchDrag(e);

                    // let all element can't not be selected
                    dd.$('body').removeClass('lbf-drag-unselect').removeAttr('unselectable');

                    // if not using proxy mode
                    if($drag !== $proxy){
                        // hide proxy
                        $proxy.hide();

                        // final set $drag position
                        $drag.css({
                            top: top,
                            left: left,

                            //使用proxy时，drop也需要更新z-index
                            zIndex: zIndexGenerator()
                        });
                    }

                    /**
                     * Fired when drop
                     * @event drop
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('drop', [dd, x0, y0, left, top]);

                    /**
                     * Fired after drop
                     * @event afterDrop
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('afterDrop', [dd, x0, y0, left, top]);
                };

            // update area
            dd.bind('change:area', function(){
                area = dd.get('area');
            });

            if(delegate){
                // when proxy changed
                // move proxy to $drag's parent node
                dd.bind('change:proxy', function(){
                    dd.get('proxy') && dd.$proxy.appendTo(($drag || $el).parent());
                });

                // use delegate mode
                $el.delegate(delegate, 'mousedown', function(e){
                    // don't bind event on input
                    // otherwise input can't be operated
                    var tagName = e.target.tagName.toLowerCase();
                    if(tagName === 'input' || tagName === 'textarea'){
                        return;
                    }

                    // prepare variables when delegating
                    if(!$drag || $drag.get(0) !== e.currentTarget){
                        // when no drag element assigned yet
                        // or drag element has been changed

                        // change to new drag element
                        $drag = dd.$drag = dd.$(e.currentTarget);

                        // make sure $drag is draggable
                        /^static|relative$/.test($drag.css('position')) && $drag.css('position', 'absolute');

                        // move proxy
                        $proxy = dd.get('proxy') ? dd.$proxy.appendTo($drag.parent()) : $drag;

                        $handler = dd.$handler = dd.get('handler') ? $drag.find(dd.get('handler')) : $drag;
                    }

                    startDrag(e);
                });
            } else {
                // use normal mode

                // prepare variables
                $drag = dd.$drag = $el;
                $handler = this.$handler = dd.get('handler') ? $el.find(dd.get('handler')) : $el;
                $proxy = dd.get('proxy') ? this.$proxy : $drag;

                // make sure $drag is draggable
                /^static|relative$/.test($drag.css('position')) && $drag.css('position', 'absolute');

                // when proxy changed
                // reset $drag
                dd.bind('change:proxy', function(){
                    dd.get('proxy') && ($drag = dd.$proxy);
                });

                // bind event
                $handler.mousedown(function(e){
                    // don't bind event on input
                    // otherwise input can't be operated
                    var tagName = e.target.tagName.toLowerCase();
                    if(tagName === 'input' || tagName === 'textarea'){
                        return;
                    }

                    startDrag(e);
                });
            }

            // bind mouse move & up events
            $body
                .bind('mousemove.drag', watchDrag)
                .bind('mouseup.drag', endDrag);


            return this;
        },

        /**
         * Disable drag
         * @method disableDrag
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.disableDrag();
         */
        disableDrag: function(){
            this.disabled = true;
            return this;
        },

        /**
         * Enable drag
         * @method enableDrag
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.enableDrag();
         */
        enableDrag: function(){
            this.disabled = false;
            return this;
        },

        /**
         * Create proxy element
         * @method createProxy
         * @protect
         * @returns {jQuery} Proxy element
         */
        createProxy: function(){
            var proxy = this.get('proxy'),
                delegate = this.get('delegate'),
                proxyTemplate = proxy === true ? this.get('proxyTemplate') : proxy;

            return this.$proxy = this.$(proxyTemplate).appendTo(delegate ? this.$el : this.$el.offsetParent());
        },

        /**
         * Remove proxy element
         * @method removeProxy
         * @protect
         * @chainable
         */
         removeProxy: function(){
            this.$proxy && this.$proxy.remove();
            return this;
         },

        /**
         * Use proxy element instead of real element when dragging. This will improve performance effectively when real element is complex. Shortcut to set('proxy', proxy).
         * @method enableProxy
         * @param {Boolean|String|jQuery|documentElement} [proxy=true] Assign proxy element
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.enableProxy();
         */
        enableProxy: function(proxy){
            return this.set('proxy', proxy || true);
        },

        /**
         * Disable using proxy element. Shortcut to set('proxy', false).
         * @method disableProxy
         * @chainable
         * @example
         *      node.plug(Drag, {
         *          proxy: true
         *      });
         *      // do something
         *      // ...
         *      node.disableProxy();
         */
        disableProxy: function(){
            return this.set('proxy', false);
        },

        /**
         * Set draggable area
         * @method setDragArea
         * @param {Object|jQuery|documentElement} [area] Limited draggable area. Exactly positions of top, right, bottom and left or jQuery object/document element are ok.
         * @param {Number} [area.top]
         * @param {Number} [area.right]
         * @param {Number} [area.bottom]
         * @param {Number} [area.left]
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.setDragArea('restrictAreaSelector');
         *
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      // restrict to a square area width and height of which are both 100px
         *      node.setDragArea({
         *          top: 0,
         *          bottom: 100,
         *          left: 0,
         *          right: 100
         *      });
         */
        setDragArea: function(area){
            if(area && !area.top && area.top !== 0){
                area = this.$(area);

                var offset = this.$(area).outerPosition();

                //按照目前这个思路，如果父容器position为relative或者absolute，left=0; top=0，遗留z-index无法逾越的问题，需要在业务侧管理好z-index，by rains
                if(area.css('position') === 'relative' || area.css('position') === 'absolute'){
                    offset = {
                        top: 0,
                        left: 0
                    };
                }

                area = {
                    top: offset.top,
                    left: offset.left,
                    bottom: offset.top + area.height(),
                    right: offset.left + area.width()
                };
            }

            this.set('area', area);

            return this;
        },

        /**
         * Remove drag, including clear proxy element
         * @method remove
         */
        remove: function(){
            this.removeProxy();
            return Plugin.prototype.remove.apply(this, arguments);
        }
    });

    Drag.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Drag',

        /**
         * Methods to be mix in host node
         * @property methods
         * @type Array
         * @static
         */
        methods: ['enableDrag', 'disableDrag', 'enableProxy', 'disableProxy', 'setDragArea'],

        /**
         * Events to be mix in host node
         * @property events
         * @type Array
         * @static
         */
        bindEventsToHost: ['load', 'unload', 'beforeDrag', 'afterDrag', 'drag', 'beforeDrop', 'afterDrop', 'drop'],

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            proxyTemplate: '<div class="lbf-drag-proxy"></div>',

            stickOnTrack: 'xy'
        }
    });

    return Drag;
});
/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-5 下午8:51
 */
LBF.define('ui.Plugins.Overlay', function(require){
    var proxy = require('lang.proxy'),
        Inject = require('lang.Inject'),
        Style = require('util.Style'),
        zIndexGenerator = require('util.zIndexGenerator'),
        $ = require('lib.jQuery'),
        Plugin = require('ui.Plugins.Plugin');

    var body = document.getElementsByTagName('body')[0],
        $doc = $(window);
        //$doc = $(document); by rains

    /**
     * Create overlay that covers the host
     * @class Overlay
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {ui.Nodes.Node} node Instance of classes extended from ui.Nodes.Node
     * @param {Object} [opts] Options of node
     * @param {String} [opts.overlayTemplate] Overlay's template
     * @param {String|jQuery|documentElement} [opts.container] Overlay's container
     * @param {String} [opts.backgroundColor] Background color
     * @param {Number} [opts.opacity] Opacity of overlay
     * @param {Number} [opts.zIndex] ZIndex of overlay
     * @example
     *      node.plug(Overlay, {
     *          container: 'whereTheOverlayGoes',
     *          backgroundColor: '#000',
     *          opacity: 0.1,
     *          zIndex: 10
     *      });
     */
    var Overlay = Plugin.inherit(Inject, {
        initialize: function(node, opts){
            this.mergeOptions(opts);
            this.node = node;

            this.render();
            this.initEvents();
            this.injectMethods(['show', 'hide']);

            this.trigger('load', [this]);
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var $el = this.$el = this.$(this.get('overlayTemplate')).hide(),
                $container = this.$container = this.$(this.get('container') || this.node.$el).append($el);

            this.css({
                backgroundColor: this.get('backgroundColor'),
                opacity: this.get('opacity'),
                zIndex: this.get('zIndex') || zIndexGenerator()
            }).show();
            
            if($container.get(0) !== body){
                // body needs no position:relative, otherwise may cause layout problem
                if( /(?:static|auto)/.test($container.css('position')) ){
                    $container.css('position', 'relative');
                }
            } else {
                // if container is body, listen to window's resize event for auto-expand
                $doc.bind('resize', proxy(this.expand, this));
            }

            return this;
        },

        /**
         * Show overlay
         * @method show
         * @chainable
         */
        show: function(){
            this.expand();

            this.$el.show();

            return this.node;
        },

        /**
         * Expand to full width & height as container
         * @method expand
         * @chainable
         */
        expand: function(){
            var $container = this.$container,
                width = $container.outerWidth(),
                height = $container.outerHeight();

            if($container.get(0) === body){
                width = Math.max(width, $doc.width());
                height = Math.max(height, $doc.height());
            }

            this.$el.css({
                width: width,
                height: height
            });

            return this.node;
        },

        /**
         * Unplug overlay from host
         * @method unplug
         * @chainable
         */
        unplug: function(){
            this.$el.remove();
            this.trigger('unload', [this]);
            return this;
        }
    });

    Overlay.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Overlay',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            overlayTemplate: [
                '<div class="lbf-overlay"></div>'
            ].join(''),

            opacity: 0.3,

            backgroundColor: 'black'
        },

        /**
         * Default styles
         * @property cssText
         * @type String
         * @static
         * @protected
         */
        cssText: [
            '.lbf-overlay { position:fixed; top:0; left:0;}'
        ].join(' ')
    });

    Style.add('lbf-overlay', Overlay.cssText);

    return Overlay;
});