/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./scripts/warn-engines.js":
/*!*********************************!*\
  !*** ./scripts/warn-engines.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const semver = __webpack_require__(/*! semver */ "semver");
if (!semver.satisfies(process.versions.node, '^16 || ^18')) {
  console.warn(`WARNING: Unsupported Node.js version v${process.versions.node}. NodeCG may not function as expected!`);
}

/***/ }),

/***/ "./src/server/api.server.ts":
/*!**********************************!*\
  !*** ./src/server/api.server.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Packages
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const is_error_1 = __importDefault(__webpack_require__(/*! is-error */ "is-error"));
const serialize_error_1 = __webpack_require__(/*! serialize-error */ "serialize-error");
// Ours
const api_base_1 = __webpack_require__(/*! ../shared/api.base */ "./src/shared/api.base.ts");
const config_1 = __webpack_require__(/*! ./config */ "./src/server/config/index.ts");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/server/logger/index.ts");
const ncgUtils = __importStar(__webpack_require__(/*! ./util */ "./src/server/util/index.ts"));
exports["default"] = (io, replicator, extensions, mount) => {
    const apiContexts = new Set();
    /**
     * This is what enables intra-context messaging.
     * I.e., passing messages from one extension to another in the same Node.js context.
     */
    function _forwardMessageToContext(messageName, bundleName, data) {
        process.nextTick(() => {
            apiContexts.forEach((ctx) => {
                ctx._messageHandlers.forEach((handler) => {
                    if (messageName === handler.messageName && bundleName === handler.bundleName) {
                        handler.func(data);
                    }
                });
            });
        });
    }
    return class NodeCGAPIServer extends api_base_1.NodeCGAPIBase {
        static sendMessageToBundle(messageName, bundleName, data) {
            _forwardMessageToContext(messageName, bundleName, data);
            io.emit('message', {
                bundleName,
                messageName,
                content: data,
            });
        }
        static readReplicant(name, namespace) {
            if (!name || typeof name !== 'string') {
                throw new Error('Must supply a name when reading a Replicant');
            }
            if (!namespace || typeof namespace !== 'string') {
                throw new Error('Must supply a namespace when reading a Replicant');
            }
            const replicant = replicator.declare(name, namespace);
            return replicant.value;
        }
        static Replicant(name, namespace, opts) {
            if (!name || typeof name !== 'string') {
                throw new Error('Must supply a name when reading a Replicant');
            }
            if (!namespace || typeof namespace !== 'string') {
                throw new Error('Must supply a namespace when reading a Replicant');
            }
            return replicator.declare(name, namespace, opts);
        }
        get Logger() {
            return logger_1.Logger;
        }
        get log() {
            if (this._memoizedLogger) {
                return this._memoizedLogger;
            }
            this._memoizedLogger = new logger_1.Logger(this.bundleName);
            return this._memoizedLogger;
        }
        /**
         * The full NodeCG server config, including potentially sensitive keys.
         */
        get config() {
            return JSON.parse(JSON.stringify(config_1.config));
        }
        /**
         * _Extension only_<br/>
         * Object containing references to all other loaded extensions. To access another bundle's extension,
         * it _must_ be declared as a `bundleDependency` in your bundle's [`package.json`]{@tutorial manifest}.
         * @name NodeCG#extensions
         *
         * @example
         * // bundles/my-bundle/package.json
         * {
         *     "name": "my-bundle"
         *     ...
         *     "bundleDependencies": {
         *         "other-bundle": "^1.0.0"
         *     }
         * }
         *
         * // bundles/my-bundle/extension.js
         * module.exports = function (nodecg) {
         *     const otherBundle = nodecg.extensions['other-bundle'];
         *     // Now I can use `otherBundle`!
         * }
         */
        get extensions() {
            return extensions;
        }
        constructor(bundle) {
            super(bundle);
            /**
             * _Extension only_<br/>
             * Creates a new express router.
             * See the [express docs](http://expressjs.com/en/api.html#express.router) for usage.
             * @function
             */
            this.Router = express_1.default.Router;
            this.util = {
                /**
                 * _Extension only_<br/>
                 * Checks if a session is authorized. Intended to be used in express routes.
                 * @param {object} req - A HTTP request.
                 * @param {object} res - A HTTP response.
                 * @param {function} next - The next middleware in the control flow.
                 */
                authCheck: ncgUtils.authCheck,
            };
            /**
             * _Extension only_<br/>
             * Mounts express middleware to the main server express app.
             * See the [express docs](http://expressjs.com/en/api.html#app.use) for usage.
             * @function
             */
            this.mount = mount;
            /**
             * _Extension only_<br/>
             * Gets the server Socket.IO context.
             * @function
             */
            this.getSocketIOServer = () => io;
            this._replicantFactory = (name, namespace, opts) => replicator.declare(name, namespace, opts);
            apiContexts.add(this);
            io.on('connection', (socket) => {
                socket.on('message', (data, ack) => {
                    const wrappedAck = _wrapAcknowledgement(ack);
                    this._messageHandlers.forEach((handler) => {
                        if (data.messageName === handler.messageName && data.bundleName === handler.bundleName) {
                            handler.func(data.content, wrappedAck);
                        }
                    });
                });
            });
        }
        /**
         * Sends a message to a specific bundle. Also available as a static method.
         * See {@link NodeCG#sendMessage} for usage details.
         * @param {string} messageName - The name of the message.
         * @param {string} bundleName - The name of the target bundle.
         * @param {mixed} [data] - The data to send.
         * @param {function} [cb] - _Browser only_ The error-first callback to handle the server's
         * [acknowledgement](http://socket.io/docs/#sending-and-getting-data-%28acknowledgements%29) message, if any.
         * @return {Promise|undefined} - _Browser only_ A Promise that is rejected if the first argument provided to the
         * acknowledgement is an `Error`, otherwise it is resolved with the remaining arguments provided to the acknowledgement.
         * But, if a callback was provided, this return value will be `undefined`, and there will be no Promise.
         */
        sendMessageToBundle(messageName, bundleName, data) {
            this.log.trace('Sending message %s to bundle %s with data:', messageName, bundleName, data);
            // eslint-disable-next-line prefer-rest-params,@typescript-eslint/no-confusing-void-expression
            return NodeCGAPIServer.sendMessageToBundle.apply(api_base_1.NodeCGAPIBase, arguments);
        }
        /**
         * Sends a message with optional data within the current bundle.
         * Messages can be sent from client to server, server to client, or client to client.
         *
         * Messages are namespaced by bundle. To send a message in another bundle's namespace,
         * use {@link NodeCG#sendMessageToBundle}.
         *
         * When a `sendMessage` is used from a client context (i.e., graphic or dashboard panel),
         * it returns a `Promise` called an "acknowledgement". Your server-side code (i.e., extension)
         * can invoke this acknowledgement with whatever data (or error) it wants. Errors sent to acknowledgements
         * from the server will be properly serialized and intact when received on the client.
         *
         * Alternatively, if you do not wish to use a `Promise`, you can provide a standard error-first
         * callback as the last argument to `sendMessage`.
         *
         * If your server-side code has multiple listenFor handlers for your message,
         * you must first check if the acknowledgement has already been handled before
         * attempting to call it. You may so do by checking the `.handled` boolean
         * property of the `ack` function passed to your listenFor handler.
         *
         * See [Socket.IO's docs](http://socket.io/docs/#sending-and-getting-data-%28acknowledgements%29)
         * for more information on how acknowledgements work under the hood.
         *
         * @param {string} messageName - The name of the message.
         * @param {mixed} [data] - The data to send.
         * @param {function} [cb] - _Browser only_ The error-first callback to handle the server's
         * [acknowledgement](http://socket.io/docs/#sending-and-getting-data-%28acknowledgements%29) message, if any.
         * @return {Promise} - _Browser only_ A Promise that is rejected if the first argument provided to the
         * acknowledgement is an `Error`, otherwise it is resolved with the remaining arguments provided to the acknowledgement.
         *
         * @example <caption>Sending a normal message:</caption>
         * nodecg.sendMessage('printMessage', 'dope.');
         *
         * @example <caption>Sending a message and replying with an acknowledgement:</caption>
         * // bundles/my-bundle/extension.js
         * module.exports = function (nodecg) {
         *     nodecg.listenFor('multiplyByTwo', (value, ack) => {
         *         if (value === 4) {
         *             ack(new Error('I don\'t like multiplying the number 4!');
         *             return;
         *         }
         *
         *         // acknowledgements should always be error-first callbacks.
         *         // If you do not wish to send an error, send "null"
         *         if (ack && !ack.handled) {
         *             ack(null, value * 2);
         *         }
         *     });
         * }
         *
         * // bundles/my-bundle/graphics/script.js
         * // Both of these examples are functionally identical.
         *
         * // Promise acknowledgement
         * nodecg.sendMessage('multiplyByTwo', 2)
         *     .then(result => {
         *         console.log(result); // Will eventually print '4'
         *     .catch(error => {
         *         console.error(error);
         *     });
         *
         * // Error-first callback acknowledgement
         * nodecg.sendMessage('multiplyByTwo', 2, (error, result) => {
         *     if (error) {
         *         console.error(error);
         *         return;
         *     }
         *
         *     console.log(result); // Will eventually print '4'
         * });
         */
        sendMessage(messageName, data) {
            this.sendMessageToBundle(messageName, this.bundleName, data);
        }
        /**
         * Reads the value of a replicant once, and doesn't create a subscription to it. Also available as a static method.
         * @param {string} name - The name of the replicant.
         * @param {string} [bundle=CURR_BNDL] - The bundle namespace to in which to look for this replicant.
         * @param {function} cb - _Browser only_ The callback that handles the server's response which contains the value.
         * @example <caption>From an extension:</caption>
         * // Extensions have immediate access to the database of Replicants.
         * // For this reason, they can use readReplicant synchronously, without a callback.
         * module.exports = function (nodecg) {
         *     var myVal = nodecg.readReplicant('myVar', 'some-bundle');
         * }
         * @example <caption>From a graphic or dashboard panel:</caption>
         * // Graphics and dashboard panels must query the server to retrieve the value,
         * // and therefore must provide a callback.
         * nodecg.readReplicant('myRep', 'some-bundle', value => {
         *     // I can use 'value' now!
         *     console.log('myRep has the value '+ value +'!');
         * });
         */
        readReplicant(name, param2) {
            let { bundleName } = this;
            if (typeof param2 === 'string') {
                bundleName = param2;
            }
            else if (typeof param2 === 'object' && bundleName in param2) {
                bundleName = param2.name;
            }
            return this.constructor.readReplicant(name, bundleName);
        }
    };
};
/**
 * By default, Errors get serialized to empty objects when run through JSON.stringify.
 * This function wraps an "acknowledgement" callback and checks if the first argument
 * is an Error. If it is, that Error is serialized _before_ being sent off to Socket.IO
 * for serialization to be sent across the wire.
 * @param ack {Function}
 * @private
 * @ignore
 * @returns {Function}
 */
function _wrapAcknowledgement(ack) {
    let handled = false;
    const wrappedAck = function (firstArg, ...restArgs) {
        if (handled) {
            throw new Error('Acknowledgement already handled');
        }
        handled = true;
        if ((0, is_error_1.default)(firstArg)) {
            firstArg = (0, serialize_error_1.serializeError)(firstArg);
        }
        ack(firstArg, ...restArgs);
    };
    Object.defineProperty(wrappedAck, 'handled', {
        get() {
            return handled;
        },
    });
    return wrappedAck;
}


/***/ }),

/***/ "./src/server/assets/AssetFile.ts":
/*!****************************************!*\
  !*** ./src/server/assets/AssetFile.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path = __importStar(__webpack_require__(/*! path */ "path"));
const ASSETS_ROOT = path.join(process.env.NODECG_ROOT, 'assets');
class AssetFile {
    constructor(filepath, sum) {
        const parsedPath = path.parse(filepath);
        const parts = parsedPath.dir.replace(ASSETS_ROOT + path.sep, '').split(path.sep);
        this.sum = sum;
        this.base = parsedPath.base;
        this.ext = parsedPath.ext;
        this.name = parsedPath.name;
        this.namespace = parts[0];
        this.category = parts[1];
        this.url = `/assets/${this.namespace}/${this.category}/${encodeURIComponent(this.base)}`;
    }
}
exports["default"] = AssetFile;


/***/ }),

/***/ "./src/server/assets/index.ts":
/*!************************************!*\
  !*** ./src/server/assets/index.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
// Packages
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const chokidar_1 = __importDefault(__webpack_require__(/*! chokidar */ "chokidar"));
const multer_1 = __importDefault(__webpack_require__(/*! multer */ "multer"));
const sha1_file_1 = __importDefault(__webpack_require__(/*! sha1-file */ "sha1-file"));
// Ours
const AssetFile_1 = __importDefault(__webpack_require__(/*! ./AssetFile */ "./src/server/assets/AssetFile.ts"));
const util_1 = __webpack_require__(/*! ../util */ "./src/server/util/index.ts");
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const utils_1 = __webpack_require__(/*! ../../shared/utils */ "./src/shared/utils/index.ts");
class AssetManager {
    constructor(bundles, replicator) {
        this.log = (0, logger_1.default)('assets');
        this.assetsRoot = path.join(process.env.NODECG_ROOT, 'assets');
        this._repsByNamespace = new Map();
        this._replicator = replicator;
        // Create assetsRoot folder if it does not exist.
        /* istanbul ignore next: Simple directory creation. */
        if (!fs.existsSync(this.assetsRoot)) {
            fs.mkdirSync(this.assetsRoot);
        }
        this.collectionsRep = replicator.declare('collections', '_assets', {
            defaultValue: [],
            persistent: false,
        });
        const { watchPatterns } = this._computeCollections(bundles);
        this._setupWatcher(watchPatterns);
        this.app = this._setupExpress();
    }
    _computeCollections(bundles) {
        const watchPatterns = new Set();
        const collections = [];
        bundles.forEach((bundle) => {
            if (!bundle.hasAssignableSoundCues && (!bundle.assetCategories || bundle.assetCategories.length <= 0)) {
                return;
            }
            // If this bundle has sounds && at least one of those sounds is assignable, create the assets:sounds replicant.
            if (bundle.hasAssignableSoundCues) {
                bundle.assetCategories.unshift({
                    name: 'sounds',
                    title: 'Sounds',
                    allowedTypes: ['mp3', 'ogg'],
                });
            }
            collections.push({
                name: bundle.name,
                categories: bundle.assetCategories,
            });
        });
        collections.forEach(({ name, categories }) => {
            const namespacedAssetsPath = this._calcNamespacedAssetsPath(name);
            const collectionReps = new Map();
            this._repsByNamespace.set(name, collectionReps);
            this.collectionsRep.value.push({ name, categories });
            for (const category of categories) {
                /* istanbul ignore next: Simple directory creation. */
                const categoryPath = path.join(namespacedAssetsPath, category.name);
                if (!fs.existsSync(categoryPath)) {
                    fs.mkdirSync(categoryPath);
                }
                collectionReps.set(category.name, this._replicator.declare(`assets:${category.name}`, name, {
                    defaultValue: [],
                    persistent: false,
                }));
                if (category.allowedTypes && category.allowedTypes.length > 0) {
                    category.allowedTypes.forEach((type) => {
                        watchPatterns.add(`${categoryPath}/**/*.${type}`);
                    });
                }
                else {
                    watchPatterns.add(`${categoryPath}/**/*`);
                }
            }
        });
        return { collections, watchPatterns };
    }
    _setupWatcher(watchPatterns) {
        // Chokidar no longer accepts Windows-style path separators when using globs.
        // Therefore, we must replace them with Unix-style ones.
        // See https://github.com/paulmillr/chokidar/issues/777 for more details.
        const fixedPaths = Array.from(watchPatterns).map((pattern) => pattern.replace(/\\/g, '/'));
        const watcher = chokidar_1.default.watch(fixedPaths, { ignored: '**/.*' });
        /* When the Chokidar watcher first starts up, it will fire an 'add' event for each file found.
         * After that, it will emit the 'ready' event.
         * To avoid thrashing the replicant, we want to add all of these first files at once.
         * This is what the ready Boolean, deferredFiles Map, and resolveDeferreds function are for.
         */
        let ready = false;
        const deferredFiles = new Map();
        watcher.on('add', (filepath) => __awaiter(this, void 0, void 0, function* () {
            if (!ready) {
                deferredFiles.set(filepath, undefined);
            }
            try {
                const sum = yield (0, sha1_file_1.default)(filepath);
                const uploadedFile = new AssetFile_1.default(filepath, sum);
                if (deferredFiles) {
                    deferredFiles.set(filepath, uploadedFile);
                    this._resolveDeferreds(deferredFiles);
                }
                else {
                    const rep = this._getCollectRep(uploadedFile.namespace, uploadedFile.category);
                    if (rep) {
                        rep.value.push(uploadedFile);
                    }
                }
            }
            catch (err) {
                if (deferredFiles) {
                    deferredFiles.delete(filepath);
                }
                this.log.error((0, utils_1.stringifyError)(err));
            }
        }));
        watcher.on('ready', () => {
            ready = true;
        });
        watcher.on('change', (filepath) => {
            (0, util_1.debounceName)(filepath, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const sum = yield (0, sha1_file_1.default)(filepath);
                    const newUploadedFile = new AssetFile_1.default(filepath, sum);
                    const rep = this._getCollectRep(newUploadedFile.namespace, newUploadedFile.category);
                    if (!rep) {
                        throw new Error('should have had a replicant here');
                    }
                    const index = rep.value.findIndex((uf) => uf.url === newUploadedFile.url);
                    if (index > -1) {
                        rep.value.splice(index, 1, newUploadedFile);
                    }
                    else {
                        rep.value.push(newUploadedFile);
                    }
                }
                catch (err) {
                    this.log.error((0, utils_1.stringifyError)(err));
                }
            }));
        });
        watcher.on('unlink', (filepath) => {
            const deletedFile = new AssetFile_1.default(filepath, 'temp');
            const rep = this._getCollectRep(deletedFile.namespace, deletedFile.category);
            if (!rep) {
                return;
            }
            rep.value.some((assetFile, index) => {
                if (assetFile.url === deletedFile.url) {
                    rep.value.splice(index, 1);
                    this.log.debug('"%s" was deleted', deletedFile.url);
                    return true;
                }
                return false;
            });
        });
        watcher.on('error', (e) => {
            this.log.error(e.stack);
        });
    }
    _setupExpress() {
        const app = (0, express_1.default)();
        const upload = (0, multer_1.default)({
            storage: multer_1.default.diskStorage({
                destination: this.assetsRoot,
                filename(req, file, cb) {
                    const p = req.params;
                    // https://github.com/expressjs/multer/issues/1104
                    cb(null, `${p.namespace}/${p.category}/${Buffer.from(file.originalname, 'latin1').toString('utf8')}`);
                },
            }),
        });
        const uploader = upload.array('file', 64);
        // Retrieving existing files
        app.get('/assets/:namespace/:category/:filePath', 
        // Check if the user is authorized.
        util_1.authCheck, 
        // Send the file (or an appropriate error).
        (req, res, next) => {
            const parentDir = this.assetsRoot;
            const fullPath = path.join(parentDir, req.params.namespace, req.params.category, req.params.filePath);
            (0, util_1.sendFile)(parentDir, fullPath, res, next);
        });
        // Uploading new files
        app.post('/assets/:namespace/:category', 
        // Check if the user is authorized.
        util_1.authCheck, 
        // Then receive the files they are sending, up to a max of 64.
        (req, res, next) => {
            uploader(req, res, (err) => {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }
                next();
            });
        }, 
        // Then send a response.
        (req, res) => {
            if (req.files) {
                res.status(200).send('Success');
            }
            else {
                res.status(400).send('Bad Request');
            }
        });
        // Deleting existing files
        app.delete('/assets/:namespace/:category/:filename', 
        // Check if the user is authorized.
        util_1.authCheck, 
        // Delete the file (or an send appropriate error).
        (req, res) => {
            const { namespace, category, filename } = req.params;
            const fullPath = path.join(this.assetsRoot, namespace, category, filename);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return res.status(410).send(`The file to delete does not exist: ${filename}`);
                    }
                    this.log.error(`Failed to delete file ${fullPath}`, err);
                    return res.status(500).send(`Failed to delete file: ${filename}`);
                }
                return res.sendStatus(200);
            });
        });
        return app;
    }
    _calcNamespacedAssetsPath(namespace) {
        const assetsPath = path.join(this.assetsRoot, namespace);
        /* istanbul ignore next: Simple directory creation. */
        if (!fs.existsSync(assetsPath)) {
            fs.mkdirSync(assetsPath);
        }
        return assetsPath;
    }
    _resolveDeferreds(deferredFiles) {
        let foundNull = false;
        deferredFiles.forEach((uf) => {
            if (uf === null) {
                foundNull = true;
            }
        });
        if (!foundNull) {
            deferredFiles.forEach((uploadedFile) => {
                if (!uploadedFile) {
                    return;
                }
                const rep = this._getCollectRep(uploadedFile.namespace, uploadedFile.category);
                if (rep) {
                    rep.value.push(uploadedFile);
                }
            });
            deferredFiles.clear();
        }
    }
    _getCollectRep(namespace, category) {
        const nspReps = this._repsByNamespace.get(namespace);
        if (nspReps) {
            return nspReps.get(category);
        }
        return undefined;
    }
}
exports["default"] = AssetManager;


/***/ }),

/***/ "./src/server/bootstrap.ts":
/*!*********************************!*\
  !*** ./src/server/bootstrap.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This file is used to automatically bootstrap a NodeCG Server instance.
 * It exports nothing and offers no controls.
 *
 * At this time, other means of starting NodeCG are not officially supported,
 * but they are used internally by our tests.
 *
 * Tests directly instantiate the NodeCGServer class, so that they may have full control
 * over its lifecycle and when the process exits.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Packages
const semver_1 = __importDefault(__webpack_require__(/*! semver */ "semver"));
const node_fetch_commonjs_1 = __importDefault(__webpack_require__(/*! node-fetch-commonjs */ "node-fetch-commonjs"));
// Ours
const rootPath_1 = __importDefault(__webpack_require__(/*! ../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const cwd = process.cwd();
if (cwd !== rootPath_1.default.path) {
    console.warn('[nodecg] process.cwd is %s, expected %s', cwd, rootPath_1.default.path);
    process.chdir(rootPath_1.default.path);
    console.info('[nodecg] Changed process.cwd to %s', rootPath_1.default.path);
}
if (!process.env.NODECG_ROOT) {
    // This must happen before we import any of our other application code.
    process.env.NODECG_ROOT = process.cwd();
}
// Ours
const util_1 = __webpack_require__(/*! ./util */ "./src/server/util/index.ts");
const server_1 = __importDefault(__webpack_require__(/*! ./server */ "./src/server/server/index.ts"));
const exit_hook_1 = __webpack_require__(/*! ./util/exit-hook */ "./src/server/util/exit-hook.ts");
process.title = 'NodeCG';
global.exitOnUncaught = true;
process.title += ` - ${String(util_1.pjson.version)}`;
process.on('uncaughtException', (err) => {
    if (!global.sentryEnabled) {
        if (global.exitOnUncaught) {
            console.error('UNCAUGHT EXCEPTION! NodeCG will now exit.');
        }
        else {
            console.error('UNCAUGHT EXCEPTION!');
        }
        console.error(err);
        if (global.exitOnUncaught) {
            (0, exit_hook_1.gracefulExit)(1);
        }
    }
});
process.on('unhandledRejection', (err) => {
    if (!global.sentryEnabled) {
        console.error('UNHANDLED PROMISE REJECTION!');
        console.error(err);
    }
});
const server = new server_1.default();
server.on('error', () => {
    (0, exit_hook_1.gracefulExit)(1);
});
server.on('stopped', () => {
    if (!process.exitCode) {
        (0, exit_hook_1.gracefulExit)(0);
    }
});
server.start().catch((error) => {
    console.error(error);
    process.nextTick(() => {
        (0, exit_hook_1.gracefulExit)(1);
    });
});
(0, util_1.asyncExitHook)(() => __awaiter(void 0, void 0, void 0, function* () {
    yield server.stop();
}), {
    minimumWait: 100,
});
// Check for updates
(0, node_fetch_commonjs_1.default)('https://registry.npmjs.org/nodecg/latest')
    .then((res) => res.json())
    .then((body) => {
    if (semver_1.default.gt(body.version, util_1.pjson.version)) {
        console.warn('An update is available for NodeCG: %s (current: %s)', JSON.parse(body).version, util_1.pjson.version);
    }
})
    .catch(
/* istanbul ignore next */ () => {
    // Discard errors.
});


/***/ }),

/***/ "./src/server/bundle-manager.ts":
/*!**************************************!*\
  !*** ./src/server/bundle-manager.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const fs_extra_1 = __importDefault(__webpack_require__(/*! fs-extra */ "fs-extra"));
const chokidar_1 = __importDefault(__webpack_require__(/*! chokidar */ "chokidar"));
const lodash_debounce_1 = __importDefault(__webpack_require__(/*! lodash.debounce */ "lodash.debounce"));
const semver_1 = __importDefault(__webpack_require__(/*! semver */ "semver"));
const cosmiconfig_1 = __webpack_require__(/*! cosmiconfig */ "cosmiconfig");
// Ours
const bundle_parser_1 = __importDefault(__webpack_require__(/*! ./bundle-parser */ "./src/server/bundle-parser/index.ts"));
const git_1 = __importDefault(__webpack_require__(/*! ./bundle-parser/git */ "./src/server/bundle-parser/git.ts"));
const logger_1 = __importDefault(__webpack_require__(/*! ./logger */ "./src/server/logger/index.ts"));
const typed_emitter_1 = __webpack_require__(/*! ../shared/typed-emitter */ "./src/shared/typed-emitter.ts");
/**
 * Milliseconds
 */
const READY_WAIT_THRESHOLD = 1000;
// Start up the watcher, but don't watch any files yet.
// We'll add the files we want to watch later, in the init() method.
const watcher = chokidar_1.default.watch([
    '!**/*___jb_*___',
    '!**/node_modules/**',
    '!**/bower_components/**',
    '!**/*.lock', // Ignore lockfiles
], {
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true,
});
const blacklistedBundleDirectories = ['node_modules', 'bower_components'];
const bundles = [];
const log = (0, logger_1.default)('bundle-manager');
const hasChanged = new Set();
let backoffTimer;
class BundleManager extends typed_emitter_1.TypedEmitter {
    get ready() {
        return this._ready;
    }
    constructor(bundlesPaths, cfgPath, nodecgVersion, nodecgConfig) {
        super();
        this.bundles = [];
        this._ready = false;
        // This is on a debouncer to avoid false-positives that can happen when editing a manifest.
        this._debouncedManifestDeletionCheck = (0, lodash_debounce_1.default)((bundleName, manifestPath) => {
            if (fs_extra_1.default.existsSync(manifestPath)) {
                this.handleChange(bundleName);
            }
            else {
                log.debug('Processing removed event for', bundleName);
                log.info("%s's package.json can no longer be found on disk, assuming the bundle has been deleted or moved", bundleName);
                this.remove(bundleName);
                this.emit('bundleRemoved', bundleName);
            }
        }, 100);
        this._debouncedGitChangeHandler = (0, lodash_debounce_1.default)((bundleName) => {
            const bundle = this.find(bundleName);
            if (!bundle) {
                return;
            }
            bundle.git = (0, git_1.default)(bundle.dir);
            this.emit('gitChanged', bundle);
        }, 250);
        this._cfgPath = cfgPath;
        const readyTimeout = setTimeout(() => {
            this._ready = true;
            this.emit('ready');
        }, READY_WAIT_THRESHOLD);
        bundlesPaths.forEach((bundlesPath) => {
            log.trace(`Loading bundles from ${bundlesPath}`);
            // Create the "bundles" dir if it does not exist.
            /* istanbul ignore if: We know this code works and testing it is tedious, so we don't bother to test it. */
            if (!fs_extra_1.default.existsSync(bundlesPath)) {
                fs_extra_1.default.mkdirpSync(bundlesPath);
            }
            /* istanbul ignore next */
            watcher.on('add', (filePath) => {
                const bundleName = extractBundleName(bundlesPath, filePath);
                // In theory, the bundle parser would have thrown an error long before this block would execute,
                // because in order for us to be adding a panel HTML file, that means that the file would have been missing,
                // which the parser does not allow and would throw an error for.
                // Just in case though, its here.
                if (this.isPanelHTMLFile(bundleName, filePath)) {
                    this.handleChange(bundleName);
                }
                else if (isGitData(bundleName, filePath)) {
                    this._debouncedGitChangeHandler(bundleName);
                }
                if (!this.ready) {
                    readyTimeout.refresh();
                }
            });
            watcher.on('change', (filePath) => {
                const bundleName = extractBundleName(bundlesPath, filePath);
                if (isManifest(bundleName, filePath) || this.isPanelHTMLFile(bundleName, filePath)) {
                    this.handleChange(bundleName);
                }
                else if (isGitData(bundleName, filePath)) {
                    this._debouncedGitChangeHandler(bundleName);
                }
            });
            watcher.on('unlink', (filePath) => {
                const bundleName = extractBundleName(bundlesPath, filePath);
                if (this.isPanelHTMLFile(bundleName, filePath)) {
                    // This will cause NodeCG to crash, because the parser will throw an error due to
                    // a panel's HTML file no longer being present.
                    this.handleChange(bundleName);
                }
                else if (isManifest(bundleName, filePath)) {
                    this._debouncedManifestDeletionCheck(bundleName, filePath);
                }
                else if (isGitData(bundleName, filePath)) {
                    this._debouncedGitChangeHandler(bundleName);
                }
            });
            /* istanbul ignore next */
            watcher.on('error', (error) => {
                log.error(error.stack);
            });
            // Do an initial load of each bundle in the "bundles" folder.
            // During runtime, any changes to a bundle's "dashboard" folder will trigger a re-load of that bundle,
            // as will changes to its `package.json`.
            const bundleFolders = fs_extra_1.default.readdirSync(bundlesPath);
            bundleFolders.forEach((bundleFolderName) => {
                var _a, _b, _c;
                const bundlePath = path_1.default.join(bundlesPath, bundleFolderName);
                if (!fs_extra_1.default.statSync(bundlePath).isDirectory()) {
                    return;
                }
                // Prevent attempting to load unwanted directories. Those specified above and all dot-prefixed.
                if (blacklistedBundleDirectories.includes(bundleFolderName) || bundleFolderName.startsWith('.')) {
                    return;
                }
                if ((_b = (_a = nodecgConfig === null || nodecgConfig === void 0 ? void 0 : nodecgConfig.bundles) === null || _a === void 0 ? void 0 : _a.disabled) === null || _b === void 0 ? void 0 : _b.includes(bundleFolderName)) {
                    log.debug(`Not loading bundle ${bundleFolderName} as it is disabled in config`);
                    return;
                }
                if (((_c = nodecgConfig === null || nodecgConfig === void 0 ? void 0 : nodecgConfig.bundles) === null || _c === void 0 ? void 0 : _c.enabled) && !nodecgConfig.bundles.enabled.includes(bundleFolderName)) {
                    log.debug(`Not loading bundle ${bundleFolderName} as it is not enabled in config`);
                    return;
                }
                log.debug(`Loading bundle ${bundleFolderName}`);
                // Parse each bundle and push the result onto the bundles array
                const bundle = (0, bundle_parser_1.default)(bundlePath, loadBundleCfg(cfgPath, bundleFolderName));
                // Check if the bundle is compatible with this version of NodeCG
                if (!semver_1.default.satisfies(nodecgVersion, bundle.compatibleRange)) {
                    log.error('%s requires NodeCG version %s, current version is %s', bundle.name, bundle.compatibleRange, nodecgVersion);
                    return;
                }
                bundles.push(bundle);
                // Use `chokidar` to watch for file changes within bundles.
                // Workaround for https://github.com/paulmillr/chokidar/issues/419
                // This workaround is necessary to fully support symlinks.
                // This is applied after the bundle has been validated and loaded.
                // Bundles that do not properly load upon startup are not recognized for updates.
                watcher.add([
                    path_1.default.join(bundlePath, '.git'),
                    path_1.default.join(bundlePath, 'dashboard'),
                    path_1.default.join(bundlePath, 'package.json'), // Watch each bundle's `package.json`.
                ]);
            });
        });
    }
    /**
     * Returns a shallow-cloned array of all currently active bundles.
     * @returns {Array.<Object>}
     */
    all() {
        return bundles.slice(0);
    }
    /**
     * Returns the bundle with the given name. undefined if not found.
     * @param name {String} - The name of the bundle to find.
     * @returns {Object|undefined}
     */
    find(name) {
        return bundles.find((b) => b.name === name);
    }
    /**
     * Adds a bundle to the internal list, replacing any existing bundle with the same name.
     * @param bundle {Object}
     */
    add(bundle) {
        /* istanbul ignore if: Again, it shouldn't be possible for "bundle" to be undefined, but just in case... */
        if (!bundle) {
            return;
        }
        // Remove any existing bundles with this name
        if (this.find(bundle.name)) {
            this.remove(bundle.name);
        }
        bundles.push(bundle);
    }
    /**
     * Removes a bundle with the given name from the internal list. Does nothing if no match found.
     * @param bundleName {String}
     */
    remove(bundleName) {
        const len = bundles.length;
        for (let i = 0; i < len; i++) {
            // TODO: this check shouldn't have to happen, idk why things in this array can sometimes be undefined
            if (!bundles[i]) {
                continue;
            }
            if (bundles[i].name === bundleName) {
                bundles.splice(i, 1);
            }
        }
    }
    handleChange(bundleName) {
        setTimeout(() => {
            this._handleChange(bundleName);
        }, 100);
    }
    /**
     * Resets the backoff timer used to avoid event thrashing when many files change rapidly.
     */
    resetBackoffTimer() {
        clearTimeout(backoffTimer); // Typedefs for clearTimeout are always wonky
        backoffTimer = setTimeout(() => {
            backoffTimer = undefined;
            for (const bundleName of hasChanged) {
                log.debug('Backoff finished, emitting change event for', bundleName);
                this.handleChange(bundleName);
            }
            hasChanged.clear();
        }, 500);
    }
    /**
     * Checks if a given path is a panel HTML file of a given bundle.
     * @param bundleName {String}
     * @param filePath {String}
     * @returns {Boolean}
     * @private
     */
    isPanelHTMLFile(bundleName, filePath) {
        const bundle = this.find(bundleName);
        if (bundle) {
            return bundle.dashboard.panels.some((panel) => panel.path.endsWith(filePath));
        }
        return false;
    }
    /**
     * Only used by tests.
     */
    _stopWatching() {
        void watcher.close();
    }
    _handleChange(bundleName) {
        const bundle = this.find(bundleName);
        /* istanbul ignore if: It's rare for `bundle` to be undefined here, but it can happen when using black/whitelisting. */
        if (!bundle) {
            return;
        }
        if (backoffTimer) {
            log.debug('Backoff active, delaying processing of change detected in', bundleName);
            hasChanged.add(bundleName);
            this.resetBackoffTimer();
        }
        else {
            log.debug('Processing change event for', bundleName);
            this.resetBackoffTimer();
            try {
                const reparsedBundle = (0, bundle_parser_1.default)(bundle.dir, loadBundleCfg(this._cfgPath, bundle.name));
                this.add(reparsedBundle);
                this.emit('bundleChanged', reparsedBundle);
                // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
            }
            catch (error) {
                log.warn('Unable to handle the bundle "%s" change:\n%s', bundleName, error.stack);
                this.emit('invalidBundle', bundle, error);
            }
        }
    }
}
exports["default"] = BundleManager;
/**
 * Returns the name of a bundle that owns a given path.
 * @param filePath {String} - The path of the file to extract a bundle name from.
 * @returns {String} - The name of the bundle that owns this path.
 * @private
 */
function extractBundleName(bundlesPath, filePath) {
    return filePath.replace(bundlesPath, '').split(path_1.default.sep)[1];
}
/**
 * Checks if a given path is the manifest file for a given bundle.
 * @param bundleName {String}
 * @param filePath {String}
 * @returns {Boolean}
 * @private
 */
function isManifest(bundleName, filePath) {
    return path_1.default.dirname(filePath).endsWith(bundleName) && path_1.default.basename(filePath) === 'package.json';
}
/**
 * Checks if a given path is in the .git dir of a bundle.
 * @param bundleName {String}
 * @param filePath {String}
 * @returns {Boolean}
 * @private
 */
function isGitData(bundleName, filePath) {
    const regex = new RegExp(`${bundleName}${'\\'}${path_1.default.sep}${'\\'}.git`);
    return regex.test(filePath);
}
/**
 * Determines which config file to use for a bundle.
 */
function loadBundleCfg(cfgDir, bundleName) {
    try {
        const cc = (0, cosmiconfig_1.cosmiconfigSync)('nodecg', {
            searchPlaces: [
                `${bundleName}.json`,
                `${bundleName}.yaml`,
                `${bundleName}.yml`,
                `${bundleName}.js`,
                `${bundleName}.config.js`,
            ],
            stopDir: cfgDir,
        });
        const result = cc.search(cfgDir);
        return result === null || result === void 0 ? void 0 : result.config;
    }
    catch (_) {
        throw new Error(`Config for bundle "${bundleName}" could not be read. Ensure that it is valid JSON, YAML, or CommonJS.`);
    }
}


/***/ }),

/***/ "./src/server/bundle-parser/assets.ts":
/*!********************************************!*\
  !*** ./src/server/bundle-parser/assets.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function default_1(manifest) {
    if (!manifest.assetCategories) {
        return [];
    }
    if (!Array.isArray(manifest.assetCategories)) {
        throw new Error(`${manifest.name}'s nodecg.assetCategories is not an Array`);
    }
    return manifest.assetCategories.map((category, index) => {
        if (typeof category.name !== 'string') {
            throw new Error(`nodecg.assetCategories[${index}] in bundle ${manifest.name} lacks a "name" property`);
        }
        if (category.name.toLowerCase() === 'sounds') {
            throw new Error('"sounds" is a reserved assetCategory name. ' +
                `Please change nodecg.assetCategories[${index}].name in bundle ${manifest.name}`);
        }
        if (typeof category.title !== 'string') {
            throw new Error(`nodecg.assetCategories[${index}] in bundle ${manifest.name} lacks a "title" property`);
        }
        if (category.allowedTypes && !Array.isArray(category.allowedTypes)) {
            throw new Error(`nodecg.assetCategories[${index}].allowedTypes in bundle ${manifest.name} is not an Array`);
        }
        return category;
    });
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/bundle-parser/config.ts":
/*!********************************************!*\
  !*** ./src/server/bundle-parser/config.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseDefaults = exports.parse = void 0;
// Native
const path = __importStar(__webpack_require__(/*! path */ "path"));
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
// Packages
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const extend_1 = __importDefault(__webpack_require__(/*! extend */ "extend"));
// Ours
const utils_1 = __webpack_require__(/*! ../../shared/utils */ "./src/shared/utils/index.ts");
function parse(bundleName, bundleDir, userConfig) {
    const cfgSchemaPath = path.resolve(bundleDir, 'configschema.json');
    if (!fs.existsSync(cfgSchemaPath)) {
        return userConfig;
    }
    const schema = _parseSchema(bundleName, cfgSchemaPath);
    const defaultConfig = (0, utils_1.getSchemaDefault)(schema, bundleName);
    let validateUserConfig;
    try {
        validateUserConfig = (0, utils_1.compileJsonSchema)(schema);
    }
    catch (error) {
        throw new Error(`Error compiling JSON Schema for bundle config "${bundleName}":\n\t${(0, utils_1.stringifyError)(error)}`);
    }
    const userConfigValid = validateUserConfig(userConfig);
    let finalConfig;
    // If the user's config is currently valid before any defaults from the schema have been added,
    // then ensure that adding the defaults won't suddenly invalidate the schema.
    // Else, if the user's config is currently invalid, then try adding the defaults and check if that makes it valid.
    if (userConfigValid) {
        finalConfig = (0, clone_1.default)(userConfig);
        for (const key in defaultConfig) {
            /* istanbul ignore if */
            if (!{}.hasOwnProperty.call(defaultConfig, key)) {
                continue;
            }
            const _foo = {};
            _foo[key] = defaultConfig[key];
            const _tempMerged = (0, extend_1.default)(true, _foo, (0, clone_1.default)(finalConfig));
            const result = validateUserConfig(_tempMerged);
            if (result) {
                finalConfig = _tempMerged;
            }
        }
    }
    else {
        finalConfig = (0, extend_1.default)(true, defaultConfig, userConfig);
    }
    const result = validateUserConfig(finalConfig);
    if (result) {
        return finalConfig;
    }
    throw new Error(`Config for bundle "${bundleName}" is invalid:\n${(0, utils_1.formatJsonSchemaErrors)(schema, validateUserConfig.errors)}`);
}
exports.parse = parse;
function parseDefaults(bundleName, bundleDir) {
    const cfgSchemaPath = path.resolve(bundleDir, 'configschema.json');
    if (fs.existsSync(cfgSchemaPath)) {
        const schema = _parseSchema(bundleName, cfgSchemaPath);
        return (0, utils_1.getSchemaDefault)(schema, bundleName);
    }
    return {};
}
exports.parseDefaults = parseDefaults;
function _parseSchema(bundleName, schemaPath) {
    try {
        return JSON.parse(fs.readFileSync(schemaPath, { encoding: 'utf8' }));
    }
    catch (_) {
        throw new Error(`configschema.json for bundle "${bundleName}" could not be read. Ensure that it is valid JSON.`);
    }
}


/***/ }),

/***/ "./src/server/bundle-parser/extension.ts":
/*!***********************************************!*\
  !*** ./src/server/bundle-parser/extension.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
function default_1(bundleDir, manifest) {
    const singleFilePath = path.resolve(bundleDir, 'extension.js');
    const directoryPath = path.resolve(bundleDir, 'extension');
    const singleFileExists = fs.existsSync(singleFilePath);
    const directoryExists = fs.existsSync(directoryPath);
    // If there is a file named "extension", throw an error. It should be a directory.
    if (directoryExists && !fs.lstatSync(directoryPath).isDirectory()) {
        throw new Error(`${manifest.name} has an illegal file named "extension" in its root. ` +
            'Either rename it to "extension.js", or make a directory named "extension"');
    }
    // If both "extension.js" and a directory named "extension" exist, throw an error.
    if (singleFileExists && directoryExists) {
        throw new Error(`${manifest.name} has both "extension.js" and a folder named "extension". ` +
            'There can only be one of these, not both.');
    }
    // Return "true" if either "extension.js" or a directory named "extension" exist.
    return singleFileExists || directoryExists;
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/bundle-parser/git.ts":
/*!*****************************************!*\
  !*** ./src/server/bundle-parser/git.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Packages
const git = __importStar(__webpack_require__(/*! git-rev-sync */ "git-rev-sync"));
function default_1(bundleDir) {
    const workingDir = process.cwd();
    let retValue;
    try {
        // These will error if bundleDir is not a git repo
        const branch = git.branch(bundleDir);
        const hash = git.long(bundleDir);
        const shortHash = git.short(bundleDir);
        try {
            // Needed for the below commands to work.
            process.chdir(bundleDir);
            // These will error if bundleDir is not a git repo and if `git` is not in $PATH.
            const date = git.date().toISOString();
            const message = git.message();
            retValue = { branch, hash, shortHash, date, message };
        }
        catch (_a) {
            retValue = {
                branch,
                hash,
                shortHash,
            };
        }
    }
    catch (_b) { }
    process.chdir(workingDir);
    return retValue;
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/bundle-parser/graphics.ts":
/*!**********************************************!*\
  !*** ./src/server/bundle-parser/graphics.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
function default_1(graphicsDir, manifest) {
    const graphics = [];
    if (fs.existsSync(graphicsDir) && typeof manifest.graphics === 'undefined') {
        // If the graphics folder exists but the nodecg.graphics property doesn't, throw an error.
        throw new Error(`${manifest.name} has a "graphics" folder, ` +
            'but no "nodecg.graphics" property was found in its package.json');
    }
    // If nodecg.graphics exists but the graphics folder doesn't, throw an error.
    if (!fs.existsSync(graphicsDir) && typeof manifest.graphics !== 'undefined') {
        throw new Error(`${manifest.name} has a "nodecg.graphics" property in its package.json, but no "graphics" folder`);
    }
    // If neither the folder nor the manifest exist, return an empty array.
    if (!fs.existsSync(graphicsDir) && typeof manifest.graphics === 'undefined') {
        return graphics;
    }
    if (!manifest.graphics) {
        return graphics;
    }
    manifest.graphics.forEach((graphic, index) => {
        const missingProps = [];
        if (typeof graphic.file === 'undefined') {
            missingProps.push('file');
        }
        if (typeof graphic.width === 'undefined') {
            missingProps.push('width');
        }
        if (typeof graphic.height === 'undefined') {
            missingProps.push('height');
        }
        if (missingProps.length) {
            throw new Error(`Graphic #${index} could not be parsed as it is missing the following properties: ` +
                `${missingProps.join(', ')}`);
        }
        // Check if this bundle already has a graphic for this file
        const dupeFound = graphics.some((g) => g.file === graphic.file);
        if (dupeFound) {
            throw new Error(`Graphic #${index} (${graphic.file}) has the same file as another graphic in ${manifest.name}`);
        }
        const filePath = path.join(graphicsDir, graphic.file);
        // Check that the panel file exists, throws error if it doesn't
        // eslint-disable-next-line no-bitwise
        fs.accessSync(filePath, fs.constants.F_OK | fs.constants.R_OK);
        const parsedGraphic = Object.assign(Object.assign({}, graphic), { singleInstance: Boolean(graphic.singleInstance), url: `/bundles/${manifest.name}/graphics/${graphic.file}` });
        graphics.push(parsedGraphic);
    });
    return graphics;
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/bundle-parser/index.ts":
/*!*******************************************!*\
  !*** ./src/server/bundle-parser/index.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path = __importStar(__webpack_require__(/*! path */ "path"));
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
// Ours
const panels_1 = __importDefault(__webpack_require__(/*! ./panels */ "./src/server/bundle-parser/panels.ts"));
const mounts_1 = __importDefault(__webpack_require__(/*! ./mounts */ "./src/server/bundle-parser/mounts.ts"));
const graphics_1 = __importDefault(__webpack_require__(/*! ./graphics */ "./src/server/bundle-parser/graphics.ts"));
const manifest_1 = __importDefault(__webpack_require__(/*! ./manifest */ "./src/server/bundle-parser/manifest.ts"));
const assets_1 = __importDefault(__webpack_require__(/*! ./assets */ "./src/server/bundle-parser/assets.ts"));
const sounds_1 = __importDefault(__webpack_require__(/*! ./sounds */ "./src/server/bundle-parser/sounds.ts"));
const config = __importStar(__webpack_require__(/*! ./config */ "./src/server/bundle-parser/config.ts"));
const extension_1 = __importDefault(__webpack_require__(/*! ./extension */ "./src/server/bundle-parser/extension.ts"));
const git_1 = __importDefault(__webpack_require__(/*! ./git */ "./src/server/bundle-parser/git.ts"));
function default_1(bundlePath, bundleCfg) {
    // Resolve the path to the bundle and its package.json
    const pkgPath = path.join(bundlePath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        throw new Error(`Bundle at path ${bundlePath} does not contain a package.json!`);
    }
    // Read metadata from the package.json
    let pkg;
    try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    }
    catch (_) {
        throw new Error(`${pkgPath} is not valid JSON, please check it against a validator such as jsonlint.com`);
    }
    const dashboardDir = path.resolve(bundlePath, 'dashboard');
    const graphicsDir = path.resolve(bundlePath, 'graphics');
    const manifest = (0, manifest_1.default)(pkg, bundlePath);
    const bundle = Object.assign(Object.assign(Object.assign({}, manifest), { dir: bundlePath, 
        // If there is a config file for this bundle, parse it.
        // Else if there is only a configschema for this bundle, parse that and apply any defaults.
        config: bundleCfg
            ? config.parse(manifest.name, bundlePath, bundleCfg)
            : config.parseDefaults(manifest.name, bundlePath), dashboard: {
            dir: dashboardDir,
            panels: (0, panels_1.default)(dashboardDir, manifest),
        }, mount: (0, mounts_1.default)(manifest), graphics: (0, graphics_1.default)(graphicsDir, manifest), assetCategories: (0, assets_1.default)(manifest), hasExtension: (0, extension_1.default)(bundlePath, manifest), git: (0, git_1.default)(bundlePath) }), (0, sounds_1.default)(bundlePath, manifest));
    return bundle;
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/bundle-parser/manifest.ts":
/*!**********************************************!*\
  !*** ./src/server/bundle-parser/manifest.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path = __importStar(__webpack_require__(/*! path */ "path"));
// Packages
const semver = __importStar(__webpack_require__(/*! semver */ "semver"));
function default_1(pkg, bundlePath) {
    if (!semver.valid(pkg.version)) {
        throw new Error(`${pkg.name}'s package.json must specify a valid version.`);
    }
    // Check if this manifest has a nodecg property
    if (!{}.hasOwnProperty.call(pkg, 'nodecg')) {
        throw new Error(`${pkg.name}'s package.json lacks a "nodecg" property, and therefore cannot be parsed.`);
    }
    if (!semver.validRange(pkg.nodecg.compatibleRange)) {
        throw new Error(`${pkg.name}'s package.json does not have a valid "nodecg.compatibleRange" property.`);
    }
    const bundleFolderName = path.parse(bundlePath).base;
    if (bundleFolderName !== pkg.name) {
        throw new Error(`${pkg.name}'s folder is named "${bundleFolderName}". Please rename it to "${pkg.name}".`);
    }
    // Grab the standard properties from the package.json that we care about.
    const manifest = Object.assign(Object.assign({}, pkg.nodecg), { name: pkg.name, version: pkg.version, license: pkg.license, description: pkg.description, homepage: pkg.homepage, author: pkg.author, contributors: pkg.contributors, transformBareModuleSpecifiers: Boolean(pkg.nodecg.transformBareModuleSpecifiers) });
    return manifest;
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/bundle-parser/mounts.ts":
/*!********************************************!*\
  !*** ./src/server/bundle-parser/mounts.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function default_1(manifest) {
    const mounts = [];
    // Return early if no mounts
    if (typeof manifest.mount === 'undefined' || manifest.mount.length <= 0) {
        return mounts;
    }
    if (!Array.isArray(manifest.mount)) {
        throw new Error(`${manifest.name} has an invalid "nodecg.mount" property in its package.json, it must be an array`);
    }
    manifest.mount.forEach((mount, index) => {
        const missingProps = [];
        // Check for missing properties
        if (typeof mount.directory === 'undefined') {
            missingProps.push('directory');
        }
        if (typeof mount.endpoint === 'undefined') {
            missingProps.push('endpoint');
        }
        if (missingProps.length > 0) {
            throw new Error(`Mount #${index} could not be parsed as it is missing the following properties: ` +
                `${missingProps.join(', ')}`);
        }
        // Remove trailing slashes from endpoint
        if (mount.endpoint.endsWith('/')) {
            mount.endpoint = mount.endpoint.slice(0, -1);
        }
        mounts.push(mount);
    });
    return mounts;
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/bundle-parser/panels.ts":
/*!********************************************!*\
  !*** ./src/server/bundle-parser/panels.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path = __importStar(__webpack_require__(/*! path */ "path"));
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
// Packages
const cheerio_1 = __importDefault(__webpack_require__(/*! cheerio */ "cheerio"));
function default_1(dashboardDir, manifest) {
    var _a;
    const unparsedPanels = (_a = manifest.dashboardPanels) !== null && _a !== void 0 ? _a : undefined;
    const bundleName = manifest.name;
    const panels = [];
    // If the dashboard folder exists but the nodecg.dashboardPanels property doesn't, throw an error.
    if (fs.existsSync(dashboardDir) && typeof unparsedPanels === 'undefined') {
        throw new Error(`${bundleName} has a "dashboard" folder, ` +
            'but no "nodecg.dashboardPanels" property was found in its package.json');
    }
    // If nodecg.dashboardPanels exists but the dashboard folder doesn't, throw an error.
    if (!fs.existsSync(dashboardDir) && typeof unparsedPanels !== 'undefined') {
        throw new Error(`${bundleName} has a "nodecg.dashboardPanels" property in its package.json, but no "dashboard" folder`);
    }
    // If neither the folder nor the manifest exist, return an empty array.
    if (!fs.existsSync(dashboardDir) && typeof unparsedPanels === 'undefined') {
        return panels;
    }
    unparsedPanels === null || unparsedPanels === void 0 ? void 0 : unparsedPanels.forEach((panel, index) => {
        var _a, _b, _c;
        assertRequiredProps(panel, index);
        // Check if this bundle already has a panel by this name
        const dupeFound = panels.some((p) => p.name === panel.name);
        if (dupeFound) {
            throw new Error(`Panel #${index} (${panel.name}) has the same name as another panel in ${bundleName}.`);
        }
        const filePath = path.join(dashboardDir, panel.file);
        // Check that the panel file exists, throws error if it doesn't
        if (!fs.existsSync(filePath)) {
            throw new Error(`Panel file "${panel.file}" in bundle "${bundleName}" does not exist.`);
        }
        // This fixes some harder to spot issues with Unicode Byte Order Markings in dashboard HTML.
        const panelStr = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio_1.default.load(panelStr.trim());
        // We used to need to check for a <head> tag, but modern versions of Cheerio add this for us automatically!
        // Check that the panel has a DOCTYPE
        const html = $.html();
        if (!html.match(/(<!doctype )/gi)) {
            throw new Error(`Panel "${path.basename(panel.file)}" in bundle "${bundleName}" has no DOCTYPE,` +
                'panel resizing will not work. Add <!DOCTYPE html> to it.');
        }
        // Error if this panel is a dialog but also has a workspace defined
        if (panel.dialog && panel.workspace) {
            throw new Error(`Dialog "${path.basename(panel.file)}" in bundle "${bundleName}" has a "workspace" ` +
                'configured. Dialogs don\'t get put into workspaces. Either remove the "workspace" property from ' +
                'this dialog, or turn it into a normal panel by setting "dialog" to false.');
        }
        if (panel.dialog && panel.fullbleed) {
            throw new Error(`Panel "${path.basename(panel.file)}" in bundle "${bundleName}" is fullbleed, ` +
                'but it also a dialog. Fullbleed panels cannot be dialogs. Either set fullbleed or dialog ' +
                'to false.');
        }
        if (panel.fullbleed && panel.workspace) {
            throw new Error(`Panel "${path.basename(panel.file)}" in bundle "${bundleName}" is fullbleed, ` +
                'but it also has a workspace defined. Fullbleed panels are not allowed to define a workspace, ' +
                'as they are automatically put into their own workspace. Either set fullbleed to ' +
                'false or remove the workspace property from this panel.');
        }
        if (panel.fullbleed && typeof panel.width !== 'undefined') {
            throw new Error(`Panel "${path.basename(panel.file)}" in bundle "${bundleName}" is fullbleed, ` +
                'but it also has a width defined. Fullbleed panels have their width set based on the, ' +
                'width of the browser viewport. Either set fullbleed to ' +
                'false or remove the width property from this panel.');
        }
        if ((_a = panel.workspace) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith('__nodecg')) {
            throw new Error(`Panel "${path.basename(panel.file)}" in bundle "${bundleName}" is in a workspace ` +
                'whose name begins with __nodecg, which is a reserved string. Please change the name ' +
                'of this workspace to not begin with this string.');
        }
        let sizeInfo;
        if (panel.fullbleed) {
            sizeInfo = {
                fullbleed: true,
            };
        }
        else {
            sizeInfo = {
                fullbleed: false,
                width: (_b = panel.width) !== null && _b !== void 0 ? _b : 1,
            };
        }
        let workspaceInfo;
        if (panel.dialog) {
            workspaceInfo = {
                dialog: true,
                dialogButtons: panel.dialogButtons,
            };
        }
        else {
            workspaceInfo = {
                dialog: false,
                workspace: panel.workspace ? panel.workspace.toLowerCase() : 'default',
            };
        }
        const parsedPanel = Object.assign(Object.assign(Object.assign({ name: panel.name, title: panel.title, file: panel.file }, sizeInfo), workspaceInfo), { path: filePath, headerColor: (_c = panel.headerColor) !== null && _c !== void 0 ? _c : '#525F78', bundleName, html: $.html() });
        panels.push(parsedPanel);
    });
    return panels;
}
exports["default"] = default_1;
function assertRequiredProps(panel, index) {
    const missingProps = [];
    if (typeof panel.name === 'undefined') {
        missingProps.push('name');
    }
    if (typeof panel.title === 'undefined') {
        missingProps.push('title');
    }
    if (typeof panel.file === 'undefined') {
        missingProps.push('file');
    }
    if (missingProps.length) {
        throw new Error(`Panel #${index} could not be parsed as it is missing the following properties: ` +
            `${missingProps.join(', ')}`);
    }
}


/***/ }),

/***/ "./src/server/bundle-parser/sounds.ts":
/*!********************************************!*\
  !*** ./src/server/bundle-parser/sounds.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
function default_1(bundlePath, manifest) {
    if (!manifest.soundCues) {
        return { soundCues: [], hasAssignableSoundCues: false };
    }
    if (!Array.isArray(manifest.soundCues)) {
        throw new Error(`${manifest.name}'s nodecg.soundCues is not an Array`);
    }
    let hasAssignable = false;
    const parsedCues = manifest.soundCues.map((unparsedCue, index) => {
        if (typeof unparsedCue.name !== 'string') {
            throw new Error(`nodecg.soundCues[${index}] in bundle ${manifest.name} lacks a "name" property`);
        }
        const parsedCue = Object.assign({}, unparsedCue);
        if (typeof parsedCue.assignable === 'undefined') {
            parsedCue.assignable = true;
        }
        if (parsedCue.assignable) {
            hasAssignable = true;
        }
        // Clamp default volume to 0-100.
        if (parsedCue.defaultVolume) {
            parsedCue.defaultVolume = Math.min(parsedCue.defaultVolume, 100);
            parsedCue.defaultVolume = Math.max(parsedCue.defaultVolume, 0);
        }
        // Verify that defaultFile exists, if provided.
        if (parsedCue.defaultFile) {
            const defaultFilePath = path.join(bundlePath, parsedCue.defaultFile);
            if (!fs.existsSync(defaultFilePath)) {
                throw new Error(`nodecg.soundCues[${index}].defaultFile in bundle ${manifest.name} does not exist`);
            }
        }
        return parsedCue;
    });
    return { soundCues: parsedCues, hasAssignableSoundCues: hasAssignable };
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/config/index.ts":
/*!************************************!*\
  !*** ./src/server/config/index.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.filteredConfig = exports.config = void 0;
// Native
const path = __importStar(__webpack_require__(/*! path */ "path"));
// Packages
const fs = __importStar(__webpack_require__(/*! fs-extra */ "fs-extra"));
const yargs_1 = __webpack_require__(/*! yargs */ "yargs");
// Ours
const loader_1 = __importDefault(__webpack_require__(/*! ./loader */ "./src/server/config/loader.ts"));
const cfgDirectoryPath = (_a = yargs_1.argv.cfgPath) !== null && _a !== void 0 ? _a : path.join(process.env.NODECG_ROOT, 'cfg');
// Make 'cfg' folder if it doesn't exist
if (!fs.existsSync(cfgDirectoryPath)) {
    fs.mkdirpSync(cfgDirectoryPath);
}
const { config, filteredConfig } = (0, loader_1.default)(cfgDirectoryPath);
exports.config = config;
exports.filteredConfig = filteredConfig;


/***/ }),

/***/ "./src/server/config/loader.ts":
/*!*************************************!*\
  !*** ./src/server/config/loader.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const joi_1 = __importDefault(__webpack_require__(/*! joi */ "joi"));
const cosmiconfig_1 = __webpack_require__(/*! cosmiconfig */ "cosmiconfig");
const yargs_1 = __webpack_require__(/*! yargs */ "yargs");
// Ours
const logger_interface_1 = __webpack_require__(/*! ../../shared/logger-interface */ "./src/shared/logger-interface.ts");
// eslint-disable-next-line complexity
function getConfigSchema(userConfig) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
    return joi_1.default.object({
        host: joi_1.default.string().default('0.0.0.0').description('The IP address or hostname that NodeCG should bind to.'),
        port: joi_1.default.number().port().default(9090).description('The port that NodeCG should listen on.'),
        baseURL: joi_1.default.string()
            .default('')
            .description('The URL of this instance. Used for things like cookies. Defaults to HOST:PORT. ' +
            "If you use a reverse proxy, you'll likely need to set this value."),
        exitOnUncaught: joi_1.default.boolean().default(true).description('Whether or not to exit on uncaught exceptions.'),
        logging: joi_1.default.object({
            console: joi_1.default.object({
                enabled: joi_1.default.boolean().default(true).description('Whether to enable console logging.'),
                level: joi_1.default.string()
                    .valid(...Object.values(logger_interface_1.LogLevel))
                    .default('info'),
                timestamps: joi_1.default.boolean()
                    .default(true)
                    .description('Whether to add timestamps to the console logging.'),
                replicants: joi_1.default.boolean()
                    .default(false)
                    .description('Whether to enable logging of the Replicants subsystem. Very spammy.'),
            }).default(),
            file: joi_1.default.object({
                enabled: joi_1.default.boolean().default(false).description('Whether to enable file logging.'),
                level: joi_1.default.string()
                    .valid(...Object.values(logger_interface_1.LogLevel))
                    .default('info'),
                path: joi_1.default.string().default('logs/nodecg.log').description('The filepath to log to.'),
                timestamps: joi_1.default.boolean().default(true).description('Whether to add timestamps to the file logging.'),
                replicants: joi_1.default.boolean()
                    .default(false)
                    .description('Whether to enable logging of the Replicants subsystem. Very spammy.'),
            }).default(),
        }).default(),
        bundles: joi_1.default.object({
            enabled: joi_1.default.array()
                .items(joi_1.default.string())
                .allow(null)
                .default((_a = yargs_1.argv.bundlesEnabled) !== null && _a !== void 0 ? _a : null)
                .description('A whitelist array of bundle names that will be the only ones loaded at startup.'),
            disabled: joi_1.default.array()
                .items(joi_1.default.string())
                .allow(null)
                .default((_b = yargs_1.argv.bundlesDisabled) !== null && _b !== void 0 ? _b : null)
                .description('A blacklist array of bundle names that will be excluded from loading at startup.'),
            paths: joi_1.default.array()
                .items(joi_1.default.string())
                .default((_c = yargs_1.argv.bundlesPaths) !== null && _c !== void 0 ? _c : [])
                .description('An array of additional paths where bundles are located.'),
        }).default({
            enabled: null,
            disabled: null,
            paths: [],
        }),
        login: joi_1.default.object({
            enabled: joi_1.default.boolean().default(false).description('Whether to enable login security.'),
            sessionSecret: joi_1.default.string()
                // This will throw if the user does not provide a value, but only if login security is enabled.
                .default(((_d = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _d === void 0 ? void 0 : _d.enabled) ? null : 'insecureButUnused')
                .description('The secret used to salt sessions.'),
            forceHttpsReturn: joi_1.default.boolean()
                .default(false)
                .description('Forces Steam & Twitch login return URLs to use HTTPS instead of HTTP. Useful in reverse proxy setups.'),
            steam: joi_1.default.object({
                enabled: joi_1.default.boolean().default(false).description('Whether to enable Steam authentication.'),
                apiKey: joi_1.default.string()
                    // This will throw if the user does not provide a value, but only if Steam auth is enabled.
                    .default(((_f = (_e = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _e === void 0 ? void 0 : _e.steam) === null || _f === void 0 ? void 0 : _f.enabled) ? null : '')
                    .description('A Steam API Key. Obtained from http://steamcommunity.com/dev/apikey'),
                allowedIds: joi_1.default.array()
                    .items(joi_1.default.string())
                    // This will throw if the user does not provide a value, but only if Steam auth is enabled.
                    .default(((_h = (_g = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _g === void 0 ? void 0 : _g.steam) === null || _h === void 0 ? void 0 : _h.enabled) ? null : [])
                    .description('Which 64 bit Steam IDs to allow. Can be obtained from https://steamid.io/'),
            }),
            twitch: joi_1.default.object({
                enabled: joi_1.default.boolean().default(false).description('Whether to enable Twitch authentication.'),
                clientID: joi_1.default.string()
                    // This will throw if the user does not provide a value, but only if Twitch auth is enabled.
                    .default(((_k = (_j = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _j === void 0 ? void 0 : _j.twitch) === null || _k === void 0 ? void 0 : _k.enabled) ? null : '')
                    .description('A Twitch application ClientID http://twitch.tv/kraken/oauth2/clients/new'),
                clientSecret: joi_1.default.string()
                    // This will throw if the user does not provide a value, but only if Twitch auth is enabled.
                    .default(((_m = (_l = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _l === void 0 ? void 0 : _l.twitch) === null || _m === void 0 ? void 0 : _m.enabled) ? null : '')
                    .description('A Twitch application ClientSecret http://twitch.tv/kraken/oauth2/clients/new'),
                scope: joi_1.default.string()
                    .default('user_read')
                    .description('A space-separated string of Twitch application permissions.'),
                allowedUsernames: joi_1.default.array()
                    .items(joi_1.default.string())
                    // This will throw if the user does not provide a value and is not using allowedIds, but only if Twitch auth is enabled.
                    .default(((_p = (_o = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _o === void 0 ? void 0 : _o.twitch) === null || _p === void 0 ? void 0 : _p.enabled) && !((_r = (_q = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _q === void 0 ? void 0 : _q.twitch) === null || _r === void 0 ? void 0 : _r.allowedIds) ? null : [])
                    .description('Which Twitch usernames to allow.'),
                allowedIds: joi_1.default.array()
                    .items(joi_1.default.string())
                    // This will throw if the user does not provide a value and is not using allowedUsernames, but only if Twitch auth is enabled.
                    .default(((_t = (_s = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _s === void 0 ? void 0 : _s.twitch) === null || _t === void 0 ? void 0 : _t.enabled) && !((_v = (_u = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _u === void 0 ? void 0 : _u.twitch) === null || _v === void 0 ? void 0 : _v.allowedUsernames) ? null : [])
                    .description('Which Twitch IDs to allow. Can be obtained from https://twitchinsights.net/checkuser'),
            }),
            discord: joi_1.default.object({
                enabled: joi_1.default.boolean().default(false).description('Whether to enable Discord authentication.'),
                clientID: joi_1.default.string()
                    // This will throw if the user does not provide a value, but only if Twitch auth is enabled.
                    .default(((_x = (_w = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _w === void 0 ? void 0 : _w.discord) === null || _x === void 0 ? void 0 : _x.enabled) ? null : '')
                    .description('A Discord application ClientID https://discord.com/developers/applications'),
                clientSecret: joi_1.default.string()
                    // This will throw if the user does not provide a value, but only if Twitch auth is enabled.
                    .default(((_z = (_y = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _y === void 0 ? void 0 : _y.discord) === null || _z === void 0 ? void 0 : _z.enabled) ? null : '')
                    .description('A Discord application ClientSecret https://discord.com/developers/applications'),
                scope: joi_1.default.string()
                    .default('identify')
                    .description('A space-separated string of Discord application scopes. https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes'),
                allowedUserIDs: joi_1.default.array()
                    .items(joi_1.default.string())
                    // This will throw if the user does not provide a value and is not using allowedGuilds, but only if Discord auth is enabled.
                    .default(((_1 = (_0 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _0 === void 0 ? void 0 : _0.discord) === null || _1 === void 0 ? void 0 : _1.enabled) && !((_3 = (_2 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _2 === void 0 ? void 0 : _2.discord) === null || _3 === void 0 ? void 0 : _3.allowedGuilds) ? null : [])
                    .description('Which Discord user IDs to allow.'),
                allowedGuilds: joi_1.default.array()
                    .items(joi_1.default.object({
                    guildID: joi_1.default.string().description('Users in this Discord Server are allowed to log in.'),
                    allowedRoleIDs: joi_1.default.array()
                        .items(joi_1.default.string())
                        .default([])
                        .description('Additionally require one of the roles on the server to log in.'),
                    guildBotToken: joi_1.default.string()
                        .default('')
                        .description('Discord bot token, needed if allowedRoleIDs is used.'),
                }))
                    // This will throw if the user does not provide a value and is not using allowedUserIDs, but only if Discord auth is enabled.
                    .default(((_5 = (_4 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _4 === void 0 ? void 0 : _4.discord) === null || _5 === void 0 ? void 0 : _5.enabled) && !((_7 = (_6 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _6 === void 0 ? void 0 : _6.discord) === null || _7 === void 0 ? void 0 : _7.allowedUserIDs) ? null : []),
            }),
            local: joi_1.default.object({
                enabled: joi_1.default.boolean().default(false).description('Enable Local authentication.'),
                allowedUsers: joi_1.default.array()
                    .items(joi_1.default.object({
                    username: joi_1.default.string(),
                    password: joi_1.default.string(),
                }))
                    // This will throw if the user does not provide a value, but only if Local auth is enabled.
                    .default(((_9 = (_8 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.login) === null || _8 === void 0 ? void 0 : _8.local) === null || _9 === void 0 ? void 0 : _9.enabled) ? null : [])
                    .description('Which users can log in.'),
            }),
        }).default(),
        ssl: joi_1.default.object({
            enabled: joi_1.default.boolean().default(false).description('Whether to enable SSL/HTTPS encryption.'),
            allowHTTP: joi_1.default.boolean()
                .default(false)
                .description('Whether to allow insecure HTTP connections while SSL is active.'),
            keyPath: joi_1.default.string()
                // This will throw if the user does not provide a value, but only if SSL is enabled.
                .default(((_10 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.ssl) === null || _10 === void 0 ? void 0 : _10.enabled) ? null : '')
                .description('The path to an SSL key file.'),
            certificatePath: joi_1.default.string()
                // This will throw if the user does not provide a value, but only if SSL is enabled.
                .default(((_11 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.ssl) === null || _11 === void 0 ? void 0 : _11.enabled) ? null : '')
                .description('The path to an SSL certificate file.'),
            passphrase: joi_1.default.string().description('The passphrase for the provided key file.').optional(),
        }).optional(),
        sentry: joi_1.default.object({
            enabled: joi_1.default.boolean().default(false).description('Whether to enable Sentry error reporting.'),
            dsn: joi_1.default.string()
                // This will throw if the user does not provide a value, but only if Sentry is enabled.
                .default(((_12 = userConfig === null || userConfig === void 0 ? void 0 : userConfig.sentry) === null || _12 === void 0 ? void 0 : _12.enabled) ? null : '')
                .description("Your project's DSN, used to route alerts to the correct place."),
        }).optional(),
    });
}
// eslint-disable-next-line complexity
function default_1(cfgDirOrFile) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let isDir = false;
    try {
        isDir = fs_1.default.lstatSync(cfgDirOrFile).isDirectory();
        // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw error;
        }
    }
    const cfgDir = isDir ? cfgDirOrFile : path_1.default.dirname(cfgDirOrFile);
    const cc = (0, cosmiconfig_1.cosmiconfigSync)('nodecg', {
        searchPlaces: isDir
            ? ['nodecg.json', 'nodecg.yaml', 'nodecg.yml', 'nodecg.js', 'nodecg.config.js']
            : [path_1.default.basename(cfgDirOrFile)],
        stopDir: cfgDir,
    });
    const result = cc.search(cfgDir);
    const userCfg = (_a = result === null || result === void 0 ? void 0 : result.config) !== null && _a !== void 0 ? _a : {};
    if (((_b = userCfg === null || userCfg === void 0 ? void 0 : userCfg.bundles) === null || _b === void 0 ? void 0 : _b.enabled) && ((_c = userCfg === null || userCfg === void 0 ? void 0 : userCfg.bundles) === null || _c === void 0 ? void 0 : _c.disabled)) {
        throw new Error('nodecg.json may only contain EITHER bundles.enabled OR bundles.disabled, not both.');
    }
    else if (!userCfg) {
        console.info('[nodecg] No config found, using defaults.');
    }
    const schema = getConfigSchema(userCfg);
    /**
     * Generate the config in two passes, because Joi is kind of weird.
     *
     * We apply defaults, but we need to do that in a separate pass
     * before we report validation errors.
     */
    const { value: cfgWithDefaults } = schema.validate(userCfg, { abortEarly: false, allowUnknown: true });
    cfgWithDefaults.baseURL =
        cfgWithDefaults.baseURL ||
            `${cfgWithDefaults.host === '0.0.0.0' ? 'localhost' : String(cfgWithDefaults.host)}:${String(cfgWithDefaults.port)}`;
    const validationResult = schema.validate(cfgWithDefaults, { noDefaults: true });
    if (validationResult.error) {
        if (!process.env.NODECG_TEST) {
            console.error('[nodecg] Config invalid:\n', validationResult.error.annotate());
        }
        throw new Error(validationResult.error.details[0].message);
    }
    const config = validationResult.value;
    if (!config) {
        if (!process.env.NODECG_TEST) {
            console.error('[nodecg] config unexpectedly undefined. This is a bug with NodeCG, not your config.');
        }
        throw new Error('config undefined');
    }
    // Create the filtered config
    const filteredConfig = {
        host: config.host,
        port: config.port,
        baseURL: config.baseURL,
        logging: {
            console: {
                enabled: config.logging.console.enabled,
                level: config.logging.console.level,
                timestamps: config.logging.console.timestamps,
                replicants: config.logging.console.replicants,
            },
            file: {
                enabled: config.logging.file.enabled,
                level: config.logging.file.level,
                timestamps: config.logging.file.timestamps,
                replicants: config.logging.file.replicants,
            },
        },
        login: {
            enabled: (_d = config.login) === null || _d === void 0 ? void 0 : _d.enabled,
        },
        sentry: {
            enabled: (_f = (_e = config.sentry) === null || _e === void 0 ? void 0 : _e.enabled) !== null && _f !== void 0 ? _f : false,
            dsn: (_h = (_g = config.sentry) === null || _g === void 0 ? void 0 : _g.dsn) !== null && _h !== void 0 ? _h : '',
        },
    };
    if (config.login.steam) {
        filteredConfig.login.steam = {
            enabled: config.login.steam.enabled,
        };
    }
    if (config.login.twitch) {
        filteredConfig.login.twitch = {
            enabled: config.login.twitch.enabled,
            clientID: config.login.twitch.clientID,
            scope: config.login.twitch.scope,
        };
    }
    if (config.login.local) {
        filteredConfig.login.local = {
            enabled: config.login.local.enabled,
        };
    }
    if (config.login.discord) {
        filteredConfig.login.discord = {
            enabled: config.login.discord.enabled,
            clientID: config.login.discord.clientID,
            scope: config.login.discord.scope,
        };
    }
    if (config.ssl) {
        filteredConfig.ssl = {
            enabled: config.ssl.enabled,
        };
    }
    return {
        config: (0, clone_1.default)(config),
        filteredConfig: (0, clone_1.default)(filteredConfig),
    };
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/dashboard/index.ts":
/*!***************************************!*\
  !*** ./src/server/dashboard/index.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
// Ours
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
const ncgUtils = __importStar(__webpack_require__(/*! ../util */ "./src/server/util/index.ts"));
const rootPath_1 = __importDefault(__webpack_require__(/*! ../../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const BUILD_PATH = path_1.default.join(rootPath_1.default.path, 'build/client');
const VIEWS_PATH = path_1.default.join(rootPath_1.default.path, 'build/server/templates');
class DashboardLib {
    constructor(bundleManager) {
        this.app = (0, express_1.default)();
        this.dashboardContext = undefined;
        const { app } = this;
        app.set('views', VIEWS_PATH);
        app.use(express_1.default.static(BUILD_PATH));
        app.use('/node_modules', express_1.default.static(path_1.default.join(rootPath_1.default.path, 'node_modules')));
        app.get('/', (_, res) => {
            res.redirect('/dashboard/');
        });
        app.get('/dashboard', ncgUtils.authCheck, (req, res) => {
            if (!req.url.endsWith('/')) {
                res.redirect('/dashboard/');
                return;
            }
            if (!this.dashboardContext) {
                this.dashboardContext = getDashboardContext(bundleManager.all());
            }
            res.render(path_1.default.join(VIEWS_PATH, 'dashboard.tmpl'), this.dashboardContext);
        });
        app.get('/nodecg-api.min.js', (_, res) => {
            res.sendFile(path_1.default.join(BUILD_PATH, 'api.js'));
        });
        app.get('/nodecg-api.min.js.map', (_, res) => {
            res.sendFile(path_1.default.join(BUILD_PATH, 'api.js.map'));
        });
        app.get('/bundles/:bundleName/dashboard/*', ncgUtils.authCheck, (req, res, next) => {
            const { bundleName } = req.params;
            const bundle = bundleManager.find(bundleName);
            if (!bundle) {
                next();
                return;
            }
            const resName = req.params[0];
            // If the target file is a panel or dialog, inject the appropriate scripts.
            // Else, serve the file as-is.
            const panel = bundle.dashboard.panels.find((p) => p.file === resName);
            if (panel) {
                const resourceType = panel.dialog ? 'dialog' : 'panel';
                ncgUtils.injectScripts(panel.html, resourceType, {
                    createApiInstance: bundle,
                    standalone: Boolean(req.query.standalone),
                    fullbleed: panel.fullbleed,
                }, (html) => res.send(html));
            }
            else {
                const parentDir = bundle.dashboard.dir;
                const fileLocation = path_1.default.join(parentDir, resName);
                ncgUtils.sendFile(parentDir, fileLocation, res, next);
            }
        });
        // When a bundle changes, delete the cached dashboard context
        bundleManager.on('bundleChanged', () => {
            this.dashboardContext = undefined;
        });
    }
}
exports["default"] = DashboardLib;
function getDashboardContext(bundles) {
    return {
        bundles: bundles.map((bundle) => {
            const cleanedBundle = (0, clone_1.default)(bundle);
            if (cleanedBundle.dashboard.panels) {
                cleanedBundle.dashboard.panels.forEach((panel) => {
                    // @ts-expect-error This is a performance hack.
                    delete panel.html;
                });
            }
            return cleanedBundle;
        }),
        publicConfig: config_1.filteredConfig,
        privateConfig: config_1.config,
        workspaces: parseWorkspaces(bundles),
        sentryEnabled: global.sentryEnabled,
    };
}
function parseWorkspaces(bundles) {
    let defaultWorkspaceHasPanels = false;
    let otherWorkspacesHavePanels = false;
    const workspaces = [];
    const workspaceNames = new Set();
    bundles.forEach((bundle) => {
        bundle.dashboard.panels.forEach((panel) => {
            if (panel.dialog) {
                return;
            }
            if (panel.fullbleed) {
                otherWorkspacesHavePanels = true;
                const workspaceName = `__nodecg_fullbleed__${bundle.name}_${panel.name}`;
                workspaces.push({
                    name: workspaceName,
                    label: panel.title,
                    route: `fullbleed/${panel.name}`,
                    fullbleed: true,
                });
            }
            else if (panel.workspace === 'default') {
                defaultWorkspaceHasPanels = true;
            }
            else {
                workspaceNames.add(panel.workspace);
                otherWorkspacesHavePanels = true;
            }
        });
    });
    workspaceNames.forEach((name) => {
        workspaces.push({
            name,
            label: name,
            route: `workspace/${name}`,
        });
    });
    workspaces.sort((a, b) => a.label.localeCompare(b.label));
    if (defaultWorkspaceHasPanels || !otherWorkspacesHavePanels) {
        workspaces.unshift({
            name: 'default',
            label: otherWorkspacesHavePanels ? 'Main Workspace' : 'Workspace',
            route: '',
        });
    }
    return workspaces;
}


/***/ }),

/***/ "./src/server/database/datasource.ts":
/*!*******************************************!*\
  !*** ./src/server/database/datasource.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.testing = void 0;
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
__exportStar(__webpack_require__(/*! ./entity */ "./src/server/database/entity/index.ts"), exports);
// Ours
const User_1 = __webpack_require__(/*! ./entity/User */ "./src/server/database/entity/User.ts");
const Session_1 = __webpack_require__(/*! ./entity/Session */ "./src/server/database/entity/Session.ts");
const Role_1 = __webpack_require__(/*! ./entity/Role */ "./src/server/database/entity/Role.ts");
const Replicant_1 = __webpack_require__(/*! ./entity/Replicant */ "./src/server/database/entity/Replicant.ts");
const Permission_1 = __webpack_require__(/*! ./entity/Permission */ "./src/server/database/entity/Permission.ts");
const Identity_1 = __webpack_require__(/*! ./entity/Identity */ "./src/server/database/entity/Identity.ts");
const ApiKey_1 = __webpack_require__(/*! ./entity/ApiKey */ "./src/server/database/entity/ApiKey.ts");
const rootPath_1 = __importDefault(__webpack_require__(/*! ../../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const dbPath = path_1.default.join(rootPath_1.default.path, 'db/nodecg.sqlite3');
exports.testing = ((_a = process.env.NODECG_TEST) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true';
const dataSource = new typeorm_1.DataSource({
    type: 'better-sqlite3',
    /**
     * TypeORM has this special :memory: key which indicates
     * that an in-memory version of SQLite should be used.
     *
     * I can't find ANY documentation on this,
     * only references to it in GitHub issue threads
     * and in the TypeORM source code.
     *
     * But, bad docs aside, it is still useful
     * and we use it for tests.
     */
    database: exports.testing ? ':memory:' : dbPath,
    logging: false,
    entities: [ApiKey_1.ApiKey, Identity_1.Identity, Permission_1.Permission, Replicant_1.Replicant, Role_1.Role, Session_1.Session, User_1.User],
    migrations: [path_1.default.join(rootPath_1.default.path, 'build/typeorm/migration/**/*.js')],
    subscribers: [path_1.default.join(rootPath_1.default.path, 'build/typeorm/subscriber/**/*.js')],
    migrationsRun: true,
    synchronize: false,
});
exports["default"] = dataSource;


/***/ }),

/***/ "./src/server/database/entity/ApiKey.ts":
/*!**********************************************!*\
  !*** ./src/server/database/entity/ApiKey.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiKey = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const User_1 = __webpack_require__(/*! ./User */ "./src/server/database/entity/User.ts");
let ApiKey = class ApiKey {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    (0, typeorm_1.Generated)('uuid'),
    __metadata("design:type", String)
], ApiKey.prototype, "secret_key", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.apiKeys),
    __metadata("design:type", typeof (_a = typeof User_1.User !== "undefined" && User_1.User) === "function" ? _a : Object)
], ApiKey.prototype, "user", void 0);
ApiKey = __decorate([
    (0, typeorm_1.Entity)()
], ApiKey);
exports.ApiKey = ApiKey;


/***/ }),

/***/ "./src/server/database/entity/Identity.ts":
/*!************************************************!*\
  !*** ./src/server/database/entity/Identity.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Identity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const User_1 = __webpack_require__(/*! ./User */ "./src/server/database/entity/User.ts");
let Identity = class Identity {
    constructor() {
        /**
         * Only used by Twitch and Discord providers.
         */
        this.provider_access_token = null;
        /**
         * Only used by Twitch and Discord providers.
         */
        this.provider_refresh_token = null;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Identity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Identity.prototype, "provider_type", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Identity.prototype, "provider_hash", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], Identity.prototype, "provider_access_token", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], Identity.prototype, "provider_refresh_token", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.identities),
    __metadata("design:type", typeof (_a = typeof User_1.User !== "undefined" && User_1.User) === "function" ? _a : Object)
], Identity.prototype, "user", void 0);
Identity = __decorate([
    (0, typeorm_1.Entity)()
], Identity);
exports.Identity = Identity;


/***/ }),

/***/ "./src/server/database/entity/Permission.ts":
/*!**************************************************!*\
  !*** ./src/server/database/entity/Permission.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Permission = exports.Action = void 0;
/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Role_1 = __webpack_require__(/*! ./Role */ "./src/server/database/entity/Role.ts");
var Action;
(function (Action) {
    Action[Action["NONE"] = 0] = "NONE";
    Action[Action["READ"] = 1] = "READ";
    Action[Action["WRITE"] = 2] = "WRITE";
})(Action = exports.Action || (exports.Action = {}));
let Permission = class Permission {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Permission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Permission.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Role_1.Role, (role) => role.permissions),
    __metadata("design:type", typeof (_a = typeof Role_1.Role !== "undefined" && Role_1.Role) === "function" ? _a : Object)
], Permission.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Permission.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Permission.prototype, "actions", void 0);
Permission = __decorate([
    (0, typeorm_1.Entity)()
], Permission);
exports.Permission = Permission;


/***/ }),

/***/ "./src/server/database/entity/Replicant.ts":
/*!*************************************************!*\
  !*** ./src/server/database/entity/Replicant.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Replicant = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let Replicant = class Replicant {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)('text'),
    __metadata("design:type", String)
], Replicant.prototype, "namespace", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('text'),
    __metadata("design:type", String)
], Replicant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Replicant.prototype, "value", void 0);
Replicant = __decorate([
    (0, typeorm_1.Entity)()
], Replicant);
exports.Replicant = Replicant;


/***/ }),

/***/ "./src/server/database/entity/Role.ts":
/*!********************************************!*\
  !*** ./src/server/database/entity/Role.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Permission_1 = __webpack_require__(/*! ./Permission */ "./src/server/database/entity/Permission.ts");
let Role = class Role {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        unique: true,
    }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Permission_1.Permission, (permission) => permission.role),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
Role = __decorate([
    (0, typeorm_1.Entity)()
], Role);
exports.Role = Role;


/***/ }),

/***/ "./src/server/database/entity/Session.ts":
/*!***********************************************!*\
  !*** ./src/server/database/entity/Session.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Session = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
// Postgres returns string by default. Return number instead.
const Bigint = {
    from: (value) => Number(value),
    to: (value) => (value === Infinity ? '+Infinity' : Number(value)),
};
let Session = class Session {
    constructor() {
        this.expiredAt = Date.now();
        this.id = '';
        this.json = '';
    }
};
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)('bigint', { transformer: Bigint }),
    __metadata("design:type", Object)
], Session.prototype, "expiredAt", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 255 }),
    __metadata("design:type", Object)
], Session.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", Object)
], Session.prototype, "json", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Session.prototype, "destroyedAt", void 0);
Session = __decorate([
    (0, typeorm_1.Entity)()
], Session);
exports.Session = Session;


/***/ }),

/***/ "./src/server/database/entity/User.ts":
/*!********************************************!*\
  !*** ./src/server/database/entity/User.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Role_1 = __webpack_require__(/*! ./Role */ "./src/server/database/entity/Role.ts");
const Identity_1 = __webpack_require__(/*! ./Identity */ "./src/server/database/entity/Identity.ts");
const ApiKey_1 = __webpack_require__(/*! ./ApiKey */ "./src/server/database/entity/ApiKey.ts");
let User = class User {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Number)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Role_1.Role),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Identity_1.Identity, (identity) => identity.user),
    __metadata("design:type", Array)
], User.prototype, "identities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ApiKey_1.ApiKey, (apiKey) => apiKey.user),
    __metadata("design:type", Array)
], User.prototype, "apiKeys", void 0);
User = __decorate([
    (0, typeorm_1.Entity)()
], User);
exports.User = User;


/***/ }),

/***/ "./src/server/database/entity/index.ts":
/*!*********************************************!*\
  !*** ./src/server/database/entity/index.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./ApiKey */ "./src/server/database/entity/ApiKey.ts"), exports);
__exportStar(__webpack_require__(/*! ./Identity */ "./src/server/database/entity/Identity.ts"), exports);
__exportStar(__webpack_require__(/*! ./Permission */ "./src/server/database/entity/Permission.ts"), exports);
__exportStar(__webpack_require__(/*! ./Replicant */ "./src/server/database/entity/Replicant.ts"), exports);
__exportStar(__webpack_require__(/*! ./Role */ "./src/server/database/entity/Role.ts"), exports);
__exportStar(__webpack_require__(/*! ./Session */ "./src/server/database/entity/Session.ts"), exports);
__exportStar(__webpack_require__(/*! ./User */ "./src/server/database/entity/User.ts"), exports);


/***/ }),

/***/ "./src/server/database/index.ts":
/*!**************************************!*\
  !*** ./src/server/database/index.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getConnection = void 0;
// Ours
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const datasource_1 = __importStar(__webpack_require__(/*! ./datasource */ "./src/server/database/datasource.ts"));
__exportStar(__webpack_require__(/*! ./entity */ "./src/server/database/entity/index.ts"), exports);
const log = (0, logger_1.default)('database');
let initialized = false;
function getConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!initialized) {
            if (datasource_1.testing) {
                log.warn('Using in-memory test database.');
            }
            yield datasource_1.default.initialize();
            initialized = true;
        }
        return datasource_1.default;
    });
}
exports.getConnection = getConnection;


/***/ }),

/***/ "./src/server/database/utils.ts":
/*!**************************************!*\
  !*** ./src/server/database/utils.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isSuperUser = exports.upsertUser = exports.getSuperUserRole = exports.findUser = void 0;
const database_1 = __webpack_require__(/*! ../database */ "./src/server/database/index.ts");
const ApiKey_1 = __webpack_require__(/*! ./entity/ApiKey */ "./src/server/database/entity/ApiKey.ts");
function findUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield (0, database_1.getConnection)();
        return database
            .getRepository(database_1.User)
            .findOne({ where: { id }, relations: ['roles', 'identities', 'apiKeys'], cache: true });
    });
}
exports.findUser = findUser;
function getSuperUserRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const superUserRole = yield findRole('superuser');
        if (!superUserRole) {
            throw new Error('superuser role unexpectedly not found');
        }
        return superUserRole;
    });
}
exports.getSuperUserRole = getSuperUserRole;
function upsertUser({ name, provider_type, provider_hash, provider_access_token, provider_refresh_token, roles, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield (0, database_1.getConnection)();
        const { manager } = database;
        let user;
        // Check for ident that matches.
        // If found, it should have an associated user, so return that.
        // Else, make an ident and user.
        const existingIdent = yield findIdent(provider_type, provider_hash);
        if (existingIdent) {
            existingIdent.provider_access_token = provider_access_token !== null && provider_access_token !== void 0 ? provider_access_token : null;
            existingIdent.provider_refresh_token = provider_refresh_token !== null && provider_refresh_token !== void 0 ? provider_refresh_token : null;
            yield manager.save(existingIdent);
            user = existingIdent.user;
        }
        else {
            const ident = yield createIdentity({
                provider_type,
                provider_hash,
                provider_access_token: provider_access_token !== null && provider_access_token !== void 0 ? provider_access_token : null,
                provider_refresh_token: provider_refresh_token !== null && provider_refresh_token !== void 0 ? provider_refresh_token : null,
            });
            const apiKey = yield createApiKey();
            user = manager.create(database_1.User, {
                name,
                identities: [ident],
                apiKeys: [apiKey],
            });
        }
        // Always update the roles, regardless of if we are making a new user or updating an existing one.
        user.roles = roles;
        return manager.save(user);
    });
}
exports.upsertUser = upsertUser;
function isSuperUser(user) {
    var _a;
    return Boolean((_a = user.roles) === null || _a === void 0 ? void 0 : _a.find((role) => role.name === 'superuser'));
}
exports.isSuperUser = isSuperUser;
function findRole(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield (0, database_1.getConnection)();
        const { manager } = database;
        return manager.findOne(database_1.Role, { where: { name }, relations: ['permissions'] });
    });
}
function createIdentity(identInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield (0, database_1.getConnection)();
        const { manager } = database;
        // See https://github.com/typeorm/typeorm/issues/9070
        const ident = manager.create(database_1.Identity, identInfo);
        return manager.save(ident);
    });
}
function createApiKey() {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield (0, database_1.getConnection)();
        const { manager } = database;
        const apiKey = manager.create(ApiKey_1.ApiKey);
        return manager.save(apiKey);
    });
}
function findIdent(type, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield (0, database_1.getConnection)();
        return database.getRepository(database_1.Identity).findOne({
            where: { provider_hash: hash, provider_type: type },
            relations: ['user'],
        });
    });
}


/***/ }),

/***/ "./src/server/graphics/index.ts":
/*!**************************************!*\
  !*** ./src/server/graphics/index.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
// Ours
const util_1 = __webpack_require__(/*! ../util */ "./src/server/util/index.ts");
const registration_1 = __importDefault(__webpack_require__(/*! ./registration */ "./src/server/graphics/registration.ts"));
class GraphicsLib {
    constructor(io, bundleManager, replicator) {
        this.app = (0, express_1.default)();
        const { app } = this;
        // Start up the registration lib, which tracks how many instances of
        // a graphic are open, and enforces singleInstance behavior.
        app.use(new registration_1.default(io, bundleManager, replicator).app);
        app.get('/bundles/:bundleName/graphics*', util_1.authCheck, (req, res, next) => {
            const { bundleName } = req.params;
            const bundle = bundleManager.find(bundleName);
            if (!bundle) {
                next();
                return;
            }
            // We start out assuming the user is trying to reach the index page
            let resName = 'index.html';
            // We need a trailing slash for view index pages so that relatively linked assets can be reached as expected.
            if (req.path.endsWith(`/${bundleName}/graphics`)) {
                res.redirect(`${req.url}/`);
                return;
            }
            // If the url path has more params beyond just /graphics/,
            // then the user is trying to resolve an asset and not the index page.
            if (!req.path.endsWith(`/${bundleName}/graphics/`)) {
                resName = req.params[0];
            }
            // Set a flag if this graphic is one we should enforce singleInstance behavior on.
            // This flag is passed to injectScripts, which then injects the client-side portion of the
            // singleInstance enforcement.
            let isGraphic = false;
            bundle.graphics.some((graphic) => {
                if (`/${graphic.file}` === resName || graphic.file === resName) {
                    isGraphic = true;
                    return true;
                }
                return false;
            });
            const parentDir = path_1.default.join(bundle.dir, 'graphics');
            const fileLocation = path_1.default.join(parentDir, resName);
            // If this file is a main HTML file for a graphic, inject the graphic setup scripts.
            if (isGraphic) {
                (0, util_1.injectScripts)(fileLocation, 'graphic', {
                    createApiInstance: bundle,
                    sound: bundle.soundCues && bundle.soundCues.length > 0,
                }, (html) => res.send(html));
            }
            else {
                (0, util_1.sendFile)(parentDir, fileLocation, res, next);
            }
        });
        // This isn't really a graphics-specific thing, should probably be in the main server lib.
        app.get('/bundles/:bundleName/:target(bower_components|node_modules)/*', (req, res, next) => {
            const { bundleName } = req.params;
            const bundle = bundleManager.find(bundleName);
            if (!bundle) {
                next();
                return;
            }
            const resName = req.params[0];
            const parentDir = path_1.default.join(bundle.dir, req.params.target);
            const fileLocation = path_1.default.join(parentDir, resName);
            (0, util_1.sendFile)(parentDir, fileLocation, res, next);
        });
    }
}
exports["default"] = GraphicsLib;


/***/ }),

/***/ "./src/server/graphics/registration.ts":
/*!*********************************************!*\
  !*** ./src/server/graphics/registration.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
// Packages
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
// Ours
const util_1 = __webpack_require__(/*! ../util */ "./src/server/util/index.ts");
const isChildOf_1 = __importDefault(__webpack_require__(/*! ../util/isChildOf */ "./src/server/util/isChildOf.ts"));
const rootPath_1 = __importDefault(__webpack_require__(/*! ../../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const BUILD_PATH = path_1.default.join(rootPath_1.default.path, 'build/client/instance');
class RegistrationCoordinator {
    constructor(io, bundleManager, replicator) {
        this.app = (0, express_1.default)();
        this._bundleManager = bundleManager;
        const { app } = this;
        this._instancesRep = replicator.declare('graphics:instances', 'nodecg', {
            schemaPath: path_1.default.resolve(rootPath_1.default.path, 'schemas/graphics%3Ainstances.json'),
            persistent: false,
            defaultValue: [],
        });
        bundleManager.on('bundleChanged', this._updateInstanceStatuses.bind(this));
        bundleManager.on('gitChanged', this._updateInstanceStatuses.bind(this));
        io.on('connection', (socket) => {
            socket.on('graphic:registerSocket', (regRequest, cb) => {
                const { bundleName } = regRequest;
                let { pathName } = regRequest;
                if (pathName.endsWith(`/${bundleName}/graphics/`)) {
                    pathName += 'index.html';
                }
                const bundle = bundleManager.find(bundleName);
                /* istanbul ignore if: simple error trapping */
                if (!bundle) {
                    cb(undefined, false);
                    return;
                }
                const graphicManifest = this._findGraphicManifest({ bundleName, pathName });
                /* istanbul ignore if: simple error trapping */
                if (!graphicManifest) {
                    cb(undefined, false);
                    return;
                }
                const existingSocketRegistration = this._findRegistrationBySocketId(socket.id);
                const existingPathRegistration = this._findOpenRegistrationByPathName(pathName);
                // If there is an existing registration with this pathName,
                // and this is a singleInstance graphic,
                // then deny the registration, unless the socket ID matches.
                if (existingPathRegistration && graphicManifest.singleInstance) {
                    if (existingPathRegistration.socketId === socket.id) {
                        cb(undefined, true);
                        return;
                    }
                    cb(undefined, !existingPathRegistration.open);
                    return;
                }
                if (existingSocketRegistration) {
                    existingSocketRegistration.open = true;
                }
                else {
                    this._addRegistration(Object.assign(Object.assign({}, regRequest), { ipv4: socket.request.socket.remoteAddress, socketId: socket.id, singleInstance: Boolean(graphicManifest.singleInstance), potentiallyOutOfDate: calcBundleGitMismatch(bundle, regRequest) || calcBundleVersionMismatch(bundle, regRequest), open: true }));
                    if (graphicManifest.singleInstance) {
                        app.emit('graphicOccupied', pathName);
                    }
                }
                cb(undefined, true);
            });
            socket.on('graphic:queryAvailability', (pathName, cb) => {
                cb(undefined, !this._findOpenRegistrationByPathName(pathName));
            });
            socket.on('graphic:requestBundleRefresh', (bundleName, cb) => {
                const bundle = bundleManager.find(bundleName);
                if (!bundle) {
                    cb(undefined, undefined);
                    return;
                }
                io.emit('graphic:bundleRefresh', bundleName);
                cb(undefined, undefined);
            });
            socket.on('graphic:requestRefreshAll', (graphic, cb) => {
                io.emit('graphic:refreshAll', graphic);
                if (typeof cb === 'function') {
                    cb(undefined, undefined);
                }
            });
            socket.on('graphic:requestRefresh', (instance, cb) => {
                io.emit('graphic:refresh', instance);
                cb(undefined, undefined);
            });
            socket.on('graphic:requestKill', (instance, cb) => {
                io.emit('graphic:kill', instance);
                cb(undefined, undefined);
            });
            socket.on('disconnect', () => {
                // Unregister the socket.
                const registration = this._findRegistrationBySocketId(socket.id);
                if (!registration) {
                    return;
                }
                registration.open = false;
                if (registration.singleInstance) {
                    app.emit('graphicAvailable', registration.pathName);
                }
                setTimeout(() => {
                    this._removeRegistration(socket.id);
                }, 1000);
            });
        });
        app.get('/instance/*', (req, res, next) => {
            const resName = req.path.split('/').slice(2).join('/');
            // If it's a HTML file, inject the graphic setup script and serve that
            // otherwise, send the file unmodified
            const fileLocation = path_1.default.join(BUILD_PATH, resName);
            if (resName.endsWith('.html') && (0, isChildOf_1.default)(BUILD_PATH, fileLocation)) {
                if (fs_1.default.existsSync(fileLocation)) {
                    (0, util_1.injectScripts)(fileLocation, 'graphic', {}, (html) => res.send(html));
                }
                else {
                    next();
                }
            }
            else {
                next();
            }
        });
    }
    _addRegistration(registration) {
        this._instancesRep.value.push(Object.assign(Object.assign({}, registration), { open: true }));
    }
    _removeRegistration(socketId) {
        const registrationIndex = this._instancesRep.value.findIndex((instance) => instance.socketId === socketId);
        /* istanbul ignore next: simple error trapping */
        if (registrationIndex < 0) {
            return false;
        }
        return this._instancesRep.value.splice(registrationIndex, 1)[0];
    }
    _findRegistrationBySocketId(socketId) {
        return this._instancesRep.value.find((instance) => instance.socketId === socketId);
    }
    _findOpenRegistrationByPathName(pathName) {
        return this._instancesRep.value.find((instance) => instance.pathName === pathName && instance.open);
    }
    _updateInstanceStatuses() {
        this._instancesRep.value.forEach((instance) => {
            const { bundleName, pathName } = instance;
            const bundle = this._bundleManager.find(bundleName);
            /* istanbul ignore next: simple error trapping */
            if (!bundle) {
                return;
            }
            const graphicManifest = this._findGraphicManifest({ bundleName, pathName });
            /* istanbul ignore next: simple error trapping */
            if (!graphicManifest) {
                return;
            }
            instance.potentiallyOutOfDate =
                calcBundleGitMismatch(bundle, instance) || calcBundleVersionMismatch(bundle, instance);
            instance.singleInstance = Boolean(graphicManifest.singleInstance);
        });
    }
    _findGraphicManifest({ pathName, bundleName, }) {
        const bundle = this._bundleManager.find(bundleName);
        /* istanbul ignore if: simple error trapping */
        if (!bundle) {
            return;
        }
        return bundle.graphics.find((graphic) => graphic.url === pathName);
    }
}
exports["default"] = RegistrationCoordinator;
function calcBundleGitMismatch(bundle, regRequest) {
    if (regRequest.bundleGit && !bundle.git) {
        return true;
    }
    if (!regRequest.bundleGit && bundle.git) {
        return true;
    }
    if (!regRequest.bundleGit && !bundle.git) {
        return false;
    }
    return regRequest.bundleGit.hash !== bundle.git.hash;
}
function calcBundleVersionMismatch(bundle, regRequest) {
    return bundle.version !== regRequest.bundleVersion;
}


/***/ }),

/***/ "./src/server/logger/index.ts":
/*!************************************!*\
  !*** ./src/server/logger/index.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = void 0;
// Packages
const Sentry = __importStar(__webpack_require__(/*! @sentry/node */ "@sentry/node"));
// Ours
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
const logger_server_1 = __importDefault(__webpack_require__(/*! ./logger.server */ "./src/server/logger/logger.server.ts"));
if ((_a = config_1.config.sentry) === null || _a === void 0 ? void 0 : _a.enabled) {
    exports.Logger = (0, logger_server_1.default)(config_1.config.logging, Sentry);
}
else {
    exports.Logger = (0, logger_server_1.default)(config_1.config.logging);
}
function default_1(name) {
    return new exports.Logger(name);
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/logger/logger.server.ts":
/*!********************************************!*\
  !*** ./src/server/logger/logger.server.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path = __importStar(__webpack_require__(/*! path */ "path"));
const util_1 = __webpack_require__(/*! util */ "util");
// Packages
const fs = __importStar(__webpack_require__(/*! fs-extra */ "fs-extra"));
const winston_1 = __importDefault(__webpack_require__(/*! winston */ "winston"));
const logger_interface_1 = __webpack_require__(/*! ../../shared/logger-interface */ "./src/shared/logger-interface.ts");
/**
 * A factory that configures and returns a Logger constructor.
 *
 * @returns A constructor used to create discrete logger instances.
 */
function default_1(initialOpts = {}, sentry = undefined) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h;
    initialOpts = initialOpts || {};
    initialOpts.console = (_a = initialOpts.console) !== null && _a !== void 0 ? _a : {};
    initialOpts.file = (_b = initialOpts.file) !== null && _b !== void 0 ? _b : {};
    initialOpts.file.path = (_c = initialOpts.file.path) !== null && _c !== void 0 ? _c : 'logs/nodecg.log';
    const consoleTransport = new winston_1.default.transports.Console({
        level: (_d = initialOpts.console.level) !== null && _d !== void 0 ? _d : logger_interface_1.LogLevel.Info,
        silent: !initialOpts.console.enabled,
        stderrLevels: ['warn', 'error'],
        format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Format local time for console.
        winston_1.default.format.errors({ stack: true }), winston_1.default.format.colorize(), winston_1.default.format.printf((info) => { var _a; return `${((_a = initialOpts === null || initialOpts === void 0 ? void 0 : initialOpts.console) === null || _a === void 0 ? void 0 : _a.timestamps) ? `${info.timestamp} - ` : ''}${info.level}: ${info.message}`; })),
    });
    const fileTransport = new winston_1.default.transports.File({
        filename: initialOpts.file.path,
        level: (_e = initialOpts.file.level) !== null && _e !== void 0 ? _e : logger_interface_1.LogLevel.Info,
        silent: !initialOpts.file.enabled,
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), // Leave formatting as ISO 8601 UTC for file.
        winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf((info) => { var _a; return `${((_a = initialOpts === null || initialOpts === void 0 ? void 0 : initialOpts.file) === null || _a === void 0 ? void 0 : _a.timestamps) ? `${info.timestamp} - ` : ''}${info.level}: ${info.message}`; })),
    });
    if (typeof initialOpts.file.path !== 'undefined') {
        fileTransport.filename = initialOpts.file.path;
        // Make logs folder if it does not exist.
        if (!fs.existsSync(path.dirname(initialOpts.file.path))) {
            fs.mkdirpSync(path.dirname(initialOpts.file.path));
        }
    }
    winston_1.default.addColors({
        verbose: 'green',
        debug: 'cyan',
        info: 'white',
        warn: 'yellow',
        error: 'red',
    });
    const consoleLogger = winston_1.default.createLogger({
        transports: [consoleTransport],
        levels: {
            verbose: 4,
            trace: 4,
            debug: 3,
            info: 2,
            warn: 1,
            error: 0,
        },
    });
    const fileLogger = winston_1.default.createLogger({
        transports: [fileTransport],
        levels: {
            verbose: 4,
            trace: 4,
            debug: 3,
            info: 2,
            warn: 1,
            error: 0,
        },
    });
    /**
     * Constructs a new Logger instance that prefixes all output with the given name.
     * @param name {String} - The label to prefix all output of this logger with.
     * @returns {Object} - A Logger instance.
     * @constructor
     */
    return _h = class Logger {
            constructor(name) {
                this.name = name;
                this.name = name;
            }
            trace(...args) {
                [consoleLogger, fileLogger].forEach((logger) => logger.verbose(`[${this.name}] ${(0, util_1.format)(args[0], ...args.slice(1))}`));
            }
            debug(...args) {
                [consoleLogger, fileLogger].forEach((logger) => logger.debug(`[${this.name}] ${(0, util_1.format)(args[0], ...args.slice(1))}`));
            }
            info(...args) {
                [consoleLogger, fileLogger].forEach((logger) => logger.info(`[${this.name}] ${(0, util_1.format)(args[0], ...args.slice(1))}`));
            }
            warn(...args) {
                [consoleLogger, fileLogger].forEach((logger) => logger.warn(`[${this.name}] ${(0, util_1.format)(args[0], ...args.slice(1))}`));
            }
            error(...args) {
                [consoleLogger, fileLogger].forEach((logger) => logger.error(`[${this.name}] ${(0, util_1.format)(args[0], ...args.slice(1))}`));
                if (sentry) {
                    const formattedArgs = args.map((argument) => typeof argument === 'object' ? (0, util_1.inspect)(argument, { depth: null, showProxy: true }) : argument);
                    sentry.captureException(new Error(`[${this.name}] ` + (0, util_1.format)(formattedArgs[0], ...formattedArgs.slice(1))));
                }
            }
            replicants(...args) {
                if (Logger._shouldConsoleLogReplicants) {
                    consoleLogger.info(`[${this.name}] ${(0, util_1.format)(args[0], ...args.slice(1))}`);
                }
                if (Logger._shouldFileLogReplicants) {
                    fileLogger.info(`[${this.name}] ${(0, util_1.format)(args[0], ...args.slice(1))}`);
                }
            }
        },
        _h._consoleLogger = consoleLogger,
        _h._fileLogger = fileLogger,
        // A messy bit of internal state used to determine if the special-case "replicants" logging level is active.
        _h._shouldConsoleLogReplicants = Boolean((_f = initialOpts.console) === null || _f === void 0 ? void 0 : _f.replicants),
        _h._shouldFileLogReplicants = Boolean((_g = initialOpts.file) === null || _g === void 0 ? void 0 : _g.replicants),
        _h;
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/login/UnauthorizedError.ts":
/*!***********************************************!*\
  !*** ./src/server/login/UnauthorizedError.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class UnauthorizedError extends Error {
    constructor(code, message) {
        super(message);
        this.message = message;
        this.serialized = {
            message: this.message,
            code,
            type: 'UnauthorizedError',
        };
    }
}
exports["default"] = UnauthorizedError;


/***/ }),

/***/ "./src/server/login/index.ts":
/*!***********************************!*\
  !*** ./src/server/login/index.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createMiddleware = void 0;
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const crypto_1 = __importDefault(__webpack_require__(/*! crypto */ "crypto"));
// Packages
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const express_session_1 = __importDefault(__webpack_require__(/*! express-session */ "express-session"));
const passport_1 = __importDefault(__webpack_require__(/*! passport */ "passport"));
const passport_steam_1 = __importDefault(__webpack_require__(/*! passport-steam */ "passport-steam"));
const passport_local_1 = __webpack_require__(/*! passport-local */ "passport-local");
const connect_typeorm_1 = __webpack_require__(/*! connect-typeorm */ "connect-typeorm");
const cookie_parser_1 = __importDefault(__webpack_require__(/*! cookie-parser */ "cookie-parser"));
const node_fetch_commonjs_1 = __importDefault(__webpack_require__(/*! node-fetch-commonjs */ "node-fetch-commonjs"));
// Ours
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const database_1 = __webpack_require__(/*! ../database */ "./src/server/database/index.ts");
const utils_1 = __webpack_require__(/*! ../database/utils */ "./src/server/database/utils.ts");
const rootPath_1 = __importDefault(__webpack_require__(/*! ../../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const log = (0, logger_1.default)('login');
const protocol = ((_b = (_a = config_1.config.ssl) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : config_1.config.login.forceHttpsReturn) ? 'https' : 'http';
// Required for persistent login sessions.
// Passport needs ability to serialize and unserialize users out of session.
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        done(null, yield (0, utils_1.findUser)(id));
    }
    catch (error) {
        done(error);
    }
}));
if ((_c = config_1.config.login.steam) === null || _c === void 0 ? void 0 : _c.enabled) {
    passport_1.default.use((0, passport_steam_1.default)({
        returnURL: `${protocol}://${config_1.config.baseURL}/login/auth/steam`,
        realm: `${protocol}://${config_1.config.baseURL}/login/auth/steam`,
        apiKey: config_1.config.login.steam.apiKey,
    }, (_, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h;
        try {
            const roles = [];
            const allowed = (_h = (_g = config_1.config.login.steam) === null || _g === void 0 ? void 0 : _g.allowedIds) === null || _h === void 0 ? void 0 : _h.includes(profile.id);
            if (allowed) {
                log.info('(Steam) Granting "%s" (%s) access', profile.id, profile.displayName);
                roles.push(yield (0, utils_1.getSuperUserRole)());
            }
            else {
                log.info('(Steam) Denying "%s" (%s) access', profile.id, profile.displayName);
            }
            const user = yield (0, utils_1.upsertUser)({
                name: profile.displayName,
                provider_type: 'steam',
                provider_hash: profile.id,
                roles,
            });
            done(undefined, user);
            return;
            // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
        }
        catch (error) {
            done(error);
        }
    })));
}
if ((_d = config_1.config.login.twitch) === null || _d === void 0 ? void 0 : _d.enabled) {
    const TwitchStrategy = (__webpack_require__(/*! passport-twitch-helix */ "passport-twitch-helix").Strategy);
    // The "user:read:email" scope is required. Add it if not present.
    const scopesArray = config_1.config.login.twitch.scope.split(' ');
    if (!scopesArray.includes('user:read:email')) {
        scopesArray.push('user:read:email');
    }
    const concatScopes = scopesArray.join(' ');
    passport_1.default.use(new TwitchStrategy({
        clientID: config_1.config.login.twitch.clientID,
        clientSecret: config_1.config.login.twitch.clientSecret,
        callbackURL: `${protocol}://${config_1.config.baseURL}/login/auth/twitch`,
        scope: concatScopes,
        customHeaders: { 'Client-ID': config_1.config.login.twitch.clientID },
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k, _l, _m, _o;
        try {
            const roles = [];
            const allowed = (_l = (_k = (_j = config_1.config.login.twitch) === null || _j === void 0 ? void 0 : _j.allowedUsernames) === null || _k === void 0 ? void 0 : _k.includes(profile.username)) !== null && _l !== void 0 ? _l : (_o = (_m = config_1.config.login.twitch) === null || _m === void 0 ? void 0 : _m.allowedIds) === null || _o === void 0 ? void 0 : _o.includes(profile.id);
            if (allowed) {
                log.info('(Twitch) Granting %s access', profile.username);
                roles.push(yield (0, utils_1.getSuperUserRole)());
            }
            else {
                log.info('(Twitch) Denying %s access', profile.username);
            }
            const user = yield (0, utils_1.upsertUser)({
                name: profile.displayName,
                provider_type: 'twitch',
                provider_hash: profile.id,
                provider_access_token: accessToken,
                provider_refresh_token: refreshToken,
                roles,
            });
            done(undefined, user);
            return;
            // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
        }
        catch (error) {
            done(error);
        }
    })));
}
function makeDiscordAPIRequest(guild, userID) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield (0, node_fetch_commonjs_1.default)(`https://discord.com/api/v8/guilds/${guild.guildID}/members/${userID}`, {
            headers: {
                Authorization: `Bot ${guild.guildBotToken}`,
            },
        });
        const data = (yield res.json());
        if (res.status === 200) {
            return [guild, false, data];
        }
        return [guild, true, data];
    });
}
if ((_e = config_1.config.login.discord) === null || _e === void 0 ? void 0 : _e.enabled) {
    const DiscordStrategy = (__webpack_require__(/*! passport-discord */ "passport-discord").Strategy);
    // The "identify" scope is required. Add it if not present.
    const scopeArray = config_1.config.login.discord.scope.split(' ');
    if (!scopeArray.includes('identify')) {
        scopeArray.push('identify');
    }
    // The "guilds" scope is required if allowedGuilds are used. Add it if not present.
    if (!scopeArray.includes('guilds') && config_1.config.login.discord.allowedGuilds) {
        scopeArray.push('guilds');
    }
    const scope = scopeArray.join(' ');
    passport_1.default.use(new DiscordStrategy({
        clientID: config_1.config.login.discord.clientID,
        clientSecret: config_1.config.login.discord.clientSecret,
        callbackURL: `${protocol}://${config_1.config.baseURL}/login/auth/discord`,
        scope,
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _p;
        if (!config_1.config.login.discord) {
            // Impossible but TS doesn't know that.
            done(new Error('Discord login config was impossibly undefined.'));
            return;
        }
        let allowed = false;
        if ((_p = config_1.config.login.discord.allowedUserIDs) === null || _p === void 0 ? void 0 : _p.includes(profile.id)) {
            // Users that are on allowedUserIDs are allowed
            allowed = true;
        }
        else if (config_1.config.login.discord.allowedGuilds) {
            // Get guilds that are specified in the config and that user is in
            const intersectingGuilds = config_1.config.login.discord.allowedGuilds.filter((allowedGuild) => profile.guilds.some((profileGuild) => profileGuild.id === allowedGuild.guildID));
            const guildRequests = [];
            for (const intersectingGuild of intersectingGuilds) {
                if (!intersectingGuild.allowedRoleIDs || intersectingGuild.allowedRoleIDs.length === 0) {
                    // If the user matches any guilds that only have member and not role requirements we do not need to make requests to the discord API
                    allowed = true;
                }
                else {
                    // Queue up all requests to the Discord API to improve speed
                    guildRequests.push(makeDiscordAPIRequest(intersectingGuild, profile.id));
                }
            }
            if (!allowed) {
                const guildsData = yield Promise.all(guildRequests);
                for (const [guildWithRoles, err, memberResponse] of guildsData) {
                    if (err) {
                        log.warn(`Got error while trying to get guild ${guildWithRoles.guildID} ` +
                            `(Make sure you're using the correct bot token and guild id): ${JSON.stringify(memberResponse)}`);
                        continue;
                    }
                    const intersectingRoles = guildWithRoles.allowedRoleIDs.filter((allowedRole) => memberResponse.roles.includes(allowedRole));
                    if (intersectingRoles.length > 0) {
                        allowed = true;
                        break;
                    }
                }
            }
        }
        else {
            allowed = false;
        }
        const roles = [];
        if (allowed) {
            log.info('(Discord) Granting %s#%s (%s) access', profile.username, profile.discriminator, profile.id);
            roles.push(yield (0, utils_1.getSuperUserRole)());
        }
        else {
            log.info('(Discord) Denying %s#%s (%s) access', profile.username, profile.discriminator, profile.id);
        }
        const user = yield (0, utils_1.upsertUser)({
            name: `${profile.username}#${profile.discriminator}`,
            provider_type: 'discord',
            provider_hash: profile.id,
            provider_access_token: accessToken,
            provider_refresh_token: refreshToken,
            roles,
        });
        done(undefined, user);
    })));
}
if ((_f = config_1.config.login.local) === null || _f === void 0 ? void 0 : _f.enabled) {
    const { sessionSecret, local: { allowedUsers }, } = config_1.config.login;
    const hashes = crypto_1.default.getHashes();
    passport_1.default.use(new passport_local_1.Strategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false,
    }, (username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _q;
        try {
            const roles = [];
            const foundUser = allowedUsers === null || allowedUsers === void 0 ? void 0 : allowedUsers.find((u) => u.username === username);
            let allowed = false;
            if (foundUser) {
                const match = /^([^:]+):(.+)$/.exec((_q = foundUser.password) !== null && _q !== void 0 ? _q : '');
                let expected = foundUser.password;
                let actual = password;
                if (match && hashes.includes(match[1])) {
                    expected = match[2];
                    actual = crypto_1.default.createHmac(match[1], sessionSecret).update(actual, 'utf8').digest('hex');
                }
                if (expected === actual) {
                    allowed = true;
                    roles.push(yield (0, utils_1.getSuperUserRole)());
                }
            }
            log.info('(Local) %s "%s" access', allowed ? 'Granting' : 'Denying', username);
            const user = yield (0, utils_1.upsertUser)({
                name: username,
                provider_type: 'local',
                provider_hash: username,
                roles,
            });
            done(undefined, user);
            return;
            // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
        }
        catch (error) {
            done(error);
        }
    })));
}
function createMiddleware(callbacks) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield (0, database_1.getConnection)();
        const sessionRepository = database.getRepository(database_1.Session);
        const app = (0, express_1.default)();
        const redirectPostLogin = (req, res) => {
            var _a, _b;
            const url = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.returnTo) !== null && _b !== void 0 ? _b : '/dashboard';
            delete req.session.returnTo;
            res.redirect(url);
            app.emit('login', req.user);
            if (req.user)
                callbacks.onLogin(req.user);
        };
        if (!config_1.config.login.sessionSecret) {
            throw new Error("no session secret defined, can't salt sessions, not safe, aborting");
        }
        app.use((0, cookie_parser_1.default)(config_1.config.login.sessionSecret));
        const sessionMiddleware = (0, express_session_1.default)({
            resave: false,
            saveUninitialized: false,
            store: new connect_typeorm_1.TypeormStore({
                cleanupLimit: 2,
                ttl: Infinity,
            }).connect(sessionRepository),
            secret: config_1.config.login.sessionSecret,
            cookie: {
                path: '/',
                httpOnly: true,
                secure: (_a = config_1.config.ssl) === null || _a === void 0 ? void 0 : _a.enabled,
            },
        });
        app.use(sessionMiddleware);
        app.use(passport_1.default.initialize());
        app.use(passport_1.default.session());
        const VIEWS_DIR = path_1.default.join(rootPath_1.default.path, 'build/server/templates');
        app.use('/login', express_1.default.static(path_1.default.join(rootPath_1.default.path, 'build/client/login')));
        app.set('views', VIEWS_DIR);
        app.get('/login', (req, res) => {
            // If the user is already logged in, don't show them the login page again.
            if (req.user && (0, utils_1.isSuperUser)(req.user)) {
                res.redirect('/dashboard');
            }
            else {
                res.render(path_1.default.join(VIEWS_DIR, 'login.tmpl'), {
                    user: req.user,
                    config: config_1.config,
                });
            }
        });
        app.get('/authError', (req, res) => {
            res.render(path_1.default.join(VIEWS_DIR, 'authError.tmpl'), {
                message: req.query.message,
                code: req.query.code,
                viewUrl: req.query.viewUrl,
            });
        });
        app.get('/login/steam', passport_1.default.authenticate('steam'));
        app.get('/login/auth/steam', passport_1.default.authenticate('steam', { failureRedirect: '/login' }), redirectPostLogin);
        app.get('/login/twitch', passport_1.default.authenticate('twitch'));
        app.get('/login/auth/twitch', passport_1.default.authenticate('twitch', { failureRedirect: '/login' }), redirectPostLogin);
        app.get('/login/discord', passport_1.default.authenticate('discord'));
        app.get('/login/auth/discord', passport_1.default.authenticate('discord', { failureRedirect: '/login' }), redirectPostLogin);
        app.get('/login/local', passport_1.default.authenticate('local'));
        app.post('/login/local', passport_1.default.authenticate('local', { failureRedirect: '/login' }), redirectPostLogin);
        app.get('/logout', (req, res) => {
            var _a;
            app.emit('logout', req.user);
            (_a = req.session) === null || _a === void 0 ? void 0 : _a.destroy(() => {
                res.clearCookie('connect.sid', { path: '/' });
                res.clearCookie('io', { path: '/' });
                res.clearCookie('socketToken', {
                    secure: req.secure,
                    sameSite: req.secure ? 'none' : undefined,
                });
                res.redirect('/login');
            });
            if (req.user)
                callbacks.onLogout(req.user);
        });
        return { app, sessionMiddleware };
    });
}
exports.createMiddleware = createMiddleware;


/***/ }),

/***/ "./src/server/login/socketAuthMiddleware.ts":
/*!**************************************************!*\
  !*** ./src/server/login/socketAuthMiddleware.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Ours
const database_1 = __webpack_require__(/*! ../database */ "./src/server/database/index.ts");
const utils_1 = __webpack_require__(/*! ../database/utils */ "./src/server/database/utils.ts");
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
const UnauthorizedError_1 = __importDefault(__webpack_require__(/*! ../login/UnauthorizedError */ "./src/server/login/UnauthorizedError.ts"));
const socket_protocol_1 = __webpack_require__(/*! ../../types/socket-protocol */ "./src/types/socket-protocol.ts");
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const serialize_error_1 = __webpack_require__(/*! serialize-error */ "serialize-error");
const log = (0, logger_1.default)('socket-auth');
const socketsByKey = new Map();
function default_1(socket, next) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = socket.handshake.query;
            if (!token) {
                next(new UnauthorizedError_1.default(socket_protocol_1.UnAuthErrCode.InvalidToken, 'no token provided'));
                return;
            }
            if (Array.isArray(token)) {
                next(new UnauthorizedError_1.default(socket_protocol_1.UnAuthErrCode.InvalidToken, 'more than one token provided'));
                return;
            }
            const database = yield (0, database_1.getConnection)();
            const apiKey = yield database.getRepository(database_1.ApiKey).findOne({
                where: { secret_key: token },
                relations: ['user'],
            });
            if (!apiKey) {
                next(new UnauthorizedError_1.default(socket_protocol_1.UnAuthErrCode.CredentialsRequired, 'no credentials found'));
                return;
            }
            const user = yield (0, utils_1.findUser)(apiKey.user.id);
            if (!user) {
                next(new UnauthorizedError_1.default(socket_protocol_1.UnAuthErrCode.CredentialsRequired, 'no user associated with provided credentials'));
                return;
            }
            // But only authed sockets can join the Authed room.
            const provider = (_a = user.identities[0]) === null || _a === void 0 ? void 0 : _a.provider_type;
            const providerAllowed = (_c = (_b = config_1.config.login) === null || _b === void 0 ? void 0 : _b[provider]) === null || _c === void 0 ? void 0 : _c.enabled;
            const allowed = (0, utils_1.isSuperUser)(user) && providerAllowed;
            if (allowed) {
                if (!socketsByKey.has(token)) {
                    socketsByKey.set(token, new Set());
                }
                const socketSet = socketsByKey.get(token);
                /* istanbul ignore next: should be impossible */
                if (!socketSet) {
                    throw new Error('socketSet was somehow falsey');
                }
                socketSet.add(socket);
                socket.on('regenerateToken', (cb) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // Lookup the ApiKey for this token we want to revoke.
                        const keyToDelete = yield database
                            .getRepository(database_1.ApiKey)
                            .findOne({ where: { secret_key: token }, relations: ['user'] });
                        // If there's a User associated to this key (there should be)
                        // give them a new ApiKey
                        if (keyToDelete) {
                            // Make the new api key
                            const newApiKey = database.manager.create(database_1.ApiKey);
                            yield database.manager.save(newApiKey);
                            // Remove the old key from the user, replace it with the new
                            const user = yield (0, utils_1.findUser)(keyToDelete.user.id);
                            if (!user) {
                                throw new Error('should have been a user here');
                            }
                            user.apiKeys = user.apiKeys.filter((ak) => ak.secret_key !== token);
                            user.apiKeys.push(newApiKey);
                            yield database.manager.save(user);
                            // Delete the old key entirely
                            yield database.manager.delete(database_1.ApiKey, { secret_key: token });
                            if (cb) {
                                cb(undefined, undefined);
                            }
                        }
                        else {
                            // Something is weird if we're here, just close the socket.
                            if (cb) {
                                cb(undefined, undefined);
                            }
                            socket.disconnect(true);
                        }
                        // Close all sockets that are using the invalidated key,
                        // EXCEPT the one that requested the revocation.
                        // If we close the one that requested the revocation,
                        // there will be a race condition where it might get redirected
                        // to an error page before it receives the new key.
                        for (const s of socketSet) {
                            if (s === socket) {
                                continue;
                            }
                            s.emit('protocol_error', new UnauthorizedError_1.default(socket_protocol_1.UnAuthErrCode.TokenRevoked, 'This token has been invalidated')
                                .serialized);
                            // We need to wait a bit before disconnecting the socket,
                            // because we need to give them time to receive the "error"
                            // message we just sent.
                            setTimeout(() => {
                                s.disconnect(true);
                            }, 500);
                        }
                        socketsByKey.delete(token);
                    }
                    catch (error) {
                        log.error((0, serialize_error_1.serializeError)(error));
                        if (cb) {
                            cb(error, undefined);
                        }
                    }
                }));
                // Don't leak memory by retaining references to all sockets indefinitely
                socket.on('disconnect', () => {
                    socketSet.delete(socket);
                });
            }
            if (allowed) {
                next(undefined);
            }
            else {
                next(new UnauthorizedError_1.default(socket_protocol_1.UnAuthErrCode.InvalidToken, 'user is not allowed'));
            }
        }
        catch (error) {
            next(error);
        }
    });
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/mounts.ts":
/*!******************************!*\
  !*** ./src/server/mounts.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const util_1 = __webpack_require__(/*! ./util */ "./src/server/util/index.ts");
class MountsLib {
    constructor(bundles) {
        this.app = (0, express_1.default)();
        bundles.forEach((bundle) => {
            bundle.mount.forEach((mount) => {
                this.app.get(`/bundles/${bundle.name}/${mount.endpoint}/*`, util_1.authCheck, (req, res, next) => {
                    const resName = req.params[0];
                    const parentDir = path_1.default.join(bundle.dir, mount.directory);
                    const fileLocation = path_1.default.join(parentDir, resName);
                    (0, util_1.sendFile)(parentDir, fileLocation, res, next);
                });
            });
        });
    }
}
exports["default"] = MountsLib;


/***/ }),

/***/ "./src/server/replicant/replicator.ts":
/*!********************************************!*\
  !*** ./src/server/replicant/replicator.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Packages
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
// Ours
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const server_replicant_1 = __importDefault(__webpack_require__(/*! ./server-replicant */ "./src/server/replicant/server-replicant.ts"));
const util_1 = __webpack_require__(/*! ../util */ "./src/server/util/index.ts");
const uuid = __importStar(__webpack_require__(/*! uuid */ "uuid"));
const db = __importStar(__webpack_require__(/*! ../database */ "./src/server/database/index.ts"));
const utils_1 = __webpack_require__(/*! ../../shared/utils */ "./src/shared/utils/index.ts");
const log = (0, logger_1.default)('replicator');
class Replicator {
    constructor(io, repEntities) {
        this.io = io;
        this.declaredReplicants = new Map();
        this._uuid = uuid.v4();
        this._pendingSave = new WeakMap();
        this.io = io;
        io.on('connection', (socket) => {
            this._attachToSocket(socket);
        });
        this._repEntities = repEntities;
    }
    declare(name, namespace, opts) {
        // If replicant already exists, return that.
        const nsp = this.declaredReplicants.get(namespace);
        if (nsp) {
            const existing = nsp.get(name);
            if (existing) {
                existing.log.replicants('Existing replicant found, returning that instead of creating a new one.');
                return existing;
            }
        }
        else {
            this.declaredReplicants.set(namespace, new Map());
        }
        // Look up the persisted value, if any.
        let parsedPersistedValue;
        const repEnt = this._repEntities.find((re) => re.namespace === namespace && re.name === name);
        if (repEnt) {
            try {
                parsedPersistedValue = repEnt.value === '' ? undefined : JSON.parse(repEnt.value);
            }
            catch (_) {
                parsedPersistedValue = repEnt.value;
            }
        }
        // Make the replicant and add it to the declaredReplicants map
        const rep = new server_replicant_1.default(name, namespace, opts, parsedPersistedValue);
        this.declaredReplicants.get(namespace).set(name, rep);
        // Add persistence hooks
        rep.on('change', () => {
            this.saveReplicant(rep);
        });
        // Listen for server-side operations
        rep.on('operations', (data) => {
            this.emitToClients(rep, 'replicant:operations', data);
        });
        return rep;
    }
    /**
     * Applies an array of operations to a replicant.
     * @param replicant {object} - The Replicant to perform these operation on.
     * @param operations {array} - An array of operations.
     */
    applyOperations(replicant, operations) {
        const oldValue = (0, clone_1.default)(replicant.value);
        operations.forEach((operation) => replicant._applyOperation(operation));
        replicant.revision++;
        replicant.emit('change', replicant.value, oldValue, operations);
        this.emitToClients(replicant, 'replicant:operations', {
            name: replicant.name,
            namespace: replicant.namespace,
            revision: replicant.revision,
            operations,
        });
    }
    /**
     * Emits an event to all remote Socket.IO listeners.
     * @param namespace - The namespace in which to emit this event. Only applies to Socket.IO listeners.
     * @param eventName - The name of the event to emit.
     * @param data - The data to emit with the event.
     */
    emitToClients(replicant, eventName, data) {
        // Emit to clients (in the given namespace's room) using Socket.IO
        const namespace = `replicant:${replicant.namespace}:${replicant.name}`;
        log.replicants('emitting %s to %s:', eventName, namespace, JSON.stringify(data, undefined, 2));
        this.io.to(namespace).emit(eventName, data); // TODO: figure out how to type this properly
    }
    saveAllReplicants() {
        for (const replicants of this.declaredReplicants.values()) {
            for (const replicant of replicants.values()) {
                this.saveReplicant(replicant);
            }
        }
    }
    saveAllReplicantsNow() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            for (const replicants of this.declaredReplicants.values()) {
                for (const replicant of replicants.values()) {
                    promises.push(this._saveReplicant(replicant));
                }
            }
            yield Promise.all(promises);
        });
    }
    saveReplicant(replicant) {
        if (!replicant.opts.persistent) {
            return;
        }
        (0, util_1.throttleName)(`${this._uuid}:${replicant.namespace}:${replicant.name}`, () => {
            this._saveReplicant(replicant).catch((error) => {
                log.error('Error saving replicant:', error);
            });
        }, replicant.opts.persistenceInterval);
    }
    _saveReplicant(replicant) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!replicant.opts.persistent) {
                return;
            }
            let databaseSaveInProgress = false;
            let valueChangedDuringSave = false;
            // Return the promise so that it can still be awaited
            if (this._pendingSave.has(replicant)) {
                return this._pendingSave.get(replicant);
            }
            try {
                const promise = new Promise((resolve, reject) => {
                    db.getConnection()
                        .then((db) => {
                        resolve(db.manager);
                    })
                        .catch(reject);
                    // eslint-disable-next-line @typescript-eslint/promise-function-async
                }).then((manager) => {
                    let repEnt;
                    const exitingEnt = this._repEntities.find((pv) => pv.namespace === replicant.namespace && pv.name === replicant.name);
                    if (exitingEnt) {
                        repEnt = exitingEnt;
                    }
                    else {
                        repEnt = manager.create(db.Replicant, {
                            namespace: replicant.namespace,
                            name: replicant.name,
                        });
                        this._repEntities.push(repEnt);
                    }
                    return new Promise((resolve, reject) => {
                        const valueRef = replicant.value;
                        let serializedValue = JSON.stringify(valueRef);
                        if (typeof serializedValue === 'undefined') {
                            serializedValue = '';
                        }
                        const changeHandler = (newVal) => {
                            if (newVal !== valueRef && !isNaN(valueRef)) {
                                valueChangedDuringSave = true;
                            }
                        };
                        repEnt.value = serializedValue;
                        databaseSaveInProgress = true;
                        replicant.on('change', changeHandler);
                        manager
                            .save(repEnt)
                            .then(
                        // eslint-disable-next-line @typescript-eslint/promise-function-async
                        () => new Promise((resolve, reject) => {
                            if (!valueChangedDuringSave) {
                                resolve();
                                return;
                            }
                            // If we are here, then that means the value changed again during
                            // the save operation, and so we have to do some recursion
                            // to save it again.
                            this._pendingSave.delete(replicant);
                            this._saveReplicant(replicant).then(resolve).catch(reject);
                        }))
                            .then(() => {
                            resolve();
                        })
                            .catch(reject)
                            .finally(() => {
                            databaseSaveInProgress = false;
                            replicant.off('change', changeHandler);
                        });
                    });
                });
                this._pendingSave.set(replicant, promise);
                yield promise;
            }
            catch (error) {
                replicant.log.error('Failed to persist value:', (0, utils_1.stringifyError)(error));
            }
            finally {
                this._pendingSave.delete(replicant);
            }
        });
    }
    _attachToSocket(socket) {
        socket.on('replicant:declare', (data, cb) => {
            log.replicants('received replicant:declare', JSON.stringify(data, undefined, 2));
            try {
                const replicant = this.declare(data.name, data.namespace, data.opts);
                cb(undefined, {
                    value: replicant.value,
                    revision: replicant.revision,
                    schema: replicant.schema,
                    schemaSum: replicant.schemaSum,
                });
                // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
            }
            catch (e) {
                if (e.message.startsWith('Invalid value rejected for replicant')) {
                    cb(e.message, undefined);
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw e;
                }
            }
        });
        socket.on('replicant:proposeOperations', (data, cb) => {
            log.replicants('received replicant:proposeOperations', JSON.stringify(data, undefined, 2));
            const serverReplicant = this.declare(data.name, data.namespace, data.opts);
            if (serverReplicant.schema && (!('schemaSum' in data) || data.schemaSum !== serverReplicant.schemaSum)) {
                log.replicants('Change request %s:%s had mismatched schema sum (ours %s, theirs %s), invoking callback with new schema and fullupdate', data.namespace, data.name, serverReplicant.schemaSum, 'schemaSum' in data ? data.schemaSum : '(no schema)');
                cb('Mismatched schema version, assignment rejected', {
                    schema: serverReplicant.schema,
                    schemaSum: serverReplicant.schemaSum,
                    value: serverReplicant.value,
                    revision: serverReplicant.revision,
                });
            }
            else if (serverReplicant.revision !== data.revision) {
                log.replicants('Change request %s:%s had mismatched revision (ours %s, theirs %s), invoking callback with fullupdate', data.namespace, data.name, serverReplicant.revision, data.revision);
                cb('Mismatched revision number, assignment rejected', {
                    value: serverReplicant.value,
                    revision: serverReplicant.revision,
                });
            }
            this.applyOperations(serverReplicant, data.operations);
        });
        socket.on('replicant:read', (data, cb) => {
            log.replicants('replicant:read', JSON.stringify(data, undefined, 2));
            const replicant = this.declare(data.name, data.namespace);
            if (typeof cb === 'function') {
                if (replicant) {
                    cb(undefined, replicant.value);
                }
                else {
                    cb(undefined, undefined);
                }
            }
        });
    }
}
exports["default"] = Replicator;


/***/ }),

/***/ "./src/server/replicant/schema-hacks.ts":
/*!**********************************************!*\
  !*** ./src/server/replicant/schema-hacks.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* eslint-disable @typescript-eslint/prefer-for-of */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Packages
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const json_ptr_1 = __webpack_require__(/*! json-ptr */ "json-ptr");
// Crimes
const jsonSchemaLibTypeOf = __webpack_require__(/*! json-schema-lib/lib/util/typeOf */ "json-schema-lib/lib/util/typeOf");
const jsonSchemaStripHash = __webpack_require__(/*! json-schema-lib/lib/util/stripHash */ "json-schema-lib/lib/util/stripHash");
/**
 * Mutates an object in place, replacing all its JSON Refs with their dereferenced values.
 */
function replaceRefs(inputObj, currentFile, allFiles) {
    const type = jsonSchemaLibTypeOf(inputObj);
    if (!type.isPOJO && !type.isArray) {
        return;
    }
    const obj = inputObj;
    if (type.isPOJO) {
        let dereferencedData;
        let referenceFile;
        if (isFileReference(obj)) {
            const referenceUrl = resolveFileReference(obj.$ref, currentFile);
            referenceFile = allFiles.find((file) => file.url === referenceUrl);
            /* istanbul ignore next: in theory this isn't possible */
            if (!referenceFile) {
                throw new Error("Should have been a schema here but wasn't");
            }
            dereferencedData = referenceFile.data;
            // If this file reference also has a local reference appended to it,
            // we need to resolve that local reference within the file we just dereferenced.
            // Example: schemaRefTargetWithDef.json#/definitions/exampleDef
            const hashIndex = obj.$ref.indexOf('#');
            if (hashIndex >= 0) {
                const hashPath = obj.$ref.slice(hashIndex);
                dereferencedData = resolvePointerReference(dereferencedData, hashPath);
            }
        }
        else if (isPointerReference(obj)) {
            referenceFile = currentFile;
            dereferencedData = resolvePointerReference(currentFile.data, obj.$ref);
        }
        if (dereferencedData && referenceFile) {
            delete obj.$ref;
            for (const key in dereferencedData) {
                if (key === '$schema') {
                    continue;
                }
                obj[key] = (0, clone_1.default)(dereferencedData[key]);
            }
            // Crawl this POJO or Array, looking for nested JSON References
            const keys = Object.keys(dereferencedData);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = obj[key];
                replaceRefs(value, referenceFile, allFiles);
            }
        }
    }
    // Crawl this POJO or Array, looking for nested JSON References
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        replaceRefs(value, currentFile, allFiles);
    }
    return obj;
}
exports["default"] = replaceRefs;
/**
 * Determines whether the given value is a JSON Reference that points to a file
 * (as opposed to an internal reference, which points to a location within its own file).
 *
 * @param {*} value - The value to inspect
 * @returns {boolean}
 */
function isFileReference(value) {
    return typeof value.$ref === 'string' && !value.$ref.startsWith('#');
}
/**
 * Determines whether the given value is a JSON Pointer to another value in the same file.
 *
 * @param {*} value - The value to inspect
 * @returns {boolean}
 */
function isPointerReference(value) {
    return typeof value.$ref === 'string' && value.$ref.startsWith('#');
}
/**
 * Resolves the given JSON Reference URL against the specified file, and adds a new {@link File}
 * object to the schema if necessary.
 *
 * @param {string} url - The JSON Reference URL (may be absolute or relative)
 * @param {File} file - The file that the JSON Reference is in
 */
function resolveFileReference(url, file) {
    const { schema } = file;
    // Remove any hash from the URL, since this URL represents the WHOLE file, not a fragment of it
    url = jsonSchemaStripHash(url);
    // Resolve the new file's absolute URL
    return schema.plugins.resolveURL({ from: file.url, to: url });
}
function resolvePointerReference(obj, ref) {
    return json_ptr_1.JsonPointer.get(obj, ref);
}


/***/ }),

/***/ "./src/server/replicant/server-replicant.ts":
/*!**************************************************!*\
  !*** ./src/server/replicant/server-replicant.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
// Packages
const json_schema_lib_1 = __importDefault(__webpack_require__(/*! json-schema-lib */ "json-schema-lib"));
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const sha1_1 = __importDefault(__webpack_require__(/*! sha1 */ "sha1"));
// Ours
const replicants_shared_1 = __webpack_require__(/*! ../../shared/replicants.shared */ "./src/shared/replicants.shared.ts");
const schema_hacks_1 = __importDefault(__webpack_require__(/*! ./schema-hacks */ "./src/server/replicant/schema-hacks.ts"));
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const utils_1 = __webpack_require__(/*! ../../shared/utils */ "./src/shared/utils/index.ts");
/**
 * Never instantiate this directly.
 * Always use Replicator.declare instead.
 * The Replicator needs to have complete control over the ServerReplicant class.
 */
class ServerReplicant extends replicants_shared_1.AbstractReplicant {
    constructor(name, namespace, opts = {}, startingValue = undefined) {
        super(name, namespace, opts);
        /**
         * Server Replicants are immediately considered declared.
         * Client Replicants aren't considered declared until they have
         * fetched the current value from the server, which is an
         * async operation that takes time.
         */
        this.status = 'declared';
        this.log = (0, logger_1.default)(`Replicant/${namespace}.${name}`);
        // If present, parse the schema and generate the validator function.
        if (opts.schemaPath) {
            const absoluteSchemaPath = path.isAbsolute(opts.schemaPath)
                ? opts.schemaPath
                : path.join(process.env.NODECG_ROOT, opts.schemaPath);
            if (fs.existsSync(absoluteSchemaPath)) {
                try {
                    const rawSchema = json_schema_lib_1.default.readSync(absoluteSchemaPath);
                    const parsedSchema = (0, schema_hacks_1.default)(rawSchema.root, rawSchema.rootFile, rawSchema.files);
                    if (!parsedSchema) {
                        throw new Error('parsed schema was unexpectedly undefined');
                    }
                    this.schema = parsedSchema;
                    this.schemaSum = (0, sha1_1.default)(JSON.stringify(parsedSchema));
                    this.validate = this._generateValidator();
                    // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
                }
                catch (e) {
                    /* istanbul ignore next */
                    if (!process.env.NODECG_TEST) {
                        this.log.error('Schema could not be loaded, are you sure that it is valid JSON?\n', e.stack);
                    }
                }
            }
        }
        let defaultValue = 'defaultValue' in opts ? opts.defaultValue : undefined;
        // Set the default value, if a schema is present and no default value was provided.
        if (this.schema && defaultValue === undefined) {
            defaultValue = (0, utils_1.getSchemaDefault)(this.schema, `${this.namespace}:${this.name}`);
        }
        // If `opts.persistent` is true and this replicant has a persisted value, try to load that persisted value.
        // Else, apply `defaultValue`.
        if (opts.persistent && typeof startingValue !== 'undefined' && startingValue !== null) {
            if (this.validate(startingValue, { throwOnInvalid: false })) {
                this._value = (0, replicants_shared_1.proxyRecursive)(this, startingValue, '/');
                this.log.replicants('Loaded a persisted value:', startingValue);
            }
            else if (this.schema) {
                this._value = (0, replicants_shared_1.proxyRecursive)(this, (0, utils_1.getSchemaDefault)(this.schema, `${this.namespace}:${this.name}`), '/');
                this.log.replicants('Discarded persisted value, as it failed schema validation. Replaced with defaults from schema.');
            }
        }
        else {
            if (this.schema && defaultValue !== undefined) {
                this.validate(defaultValue);
            }
            if (defaultValue === undefined) {
                this.log.replicants('Declared "%s" in namespace "%s"\n', name, namespace);
            }
            else {
                this._value = (0, replicants_shared_1.proxyRecursive)(this, (0, clone_1.default)(defaultValue), '/');
                this.log.replicants('Declared "%s" in namespace "%s" with defaultValue:\n', name, namespace, defaultValue);
            }
        }
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        if (newValue === this._value) {
            this.log.replicants('value unchanged, no action will be taken');
            return;
        }
        this.validate(newValue);
        this.log.replicants('running setter with', newValue);
        const clonedNewVal = (0, clone_1.default)(newValue);
        this._addOperation({
            path: '/',
            method: 'overwrite',
            args: {
                newValue: clonedNewVal,
            },
        });
        (0, replicants_shared_1.ignoreProxy)(this);
        this._value = (0, replicants_shared_1.proxyRecursive)(this, newValue, '/');
        (0, replicants_shared_1.resumeProxy)(this);
    }
    /**
     * Refer to the abstract base class' implementation for details.
     * @private
     */
    _addOperation(operation) {
        this._operationQueue.push(operation);
        if (!this._pendingOperationFlush) {
            this._oldValue = (0, clone_1.default)(this.value);
            this._pendingOperationFlush = true;
            process.nextTick(() => {
                this._flushOperations();
            });
        }
    }
    /**
     * Refer to the abstract base class' implementation for details.
     * @private
     */
    _flushOperations() {
        this._pendingOperationFlush = false;
        if (this._operationQueue.length <= 0)
            return;
        this.revision++;
        this.emit('operations', {
            name: this.name,
            namespace: this.namespace,
            operations: this._operationQueue,
            revision: this.revision,
        });
        const opQ = this._operationQueue;
        this._operationQueue = [];
        this.emit('change', this.value, this._oldValue, opQ);
    }
}
exports["default"] = ServerReplicant;


/***/ }),

/***/ "./src/server/server/extensions.ts":
/*!*****************************************!*\
  !*** ./src/server/server/extensions.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const events_1 = __webpack_require__(/*! events */ "events");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const semver_1 = __importDefault(__webpack_require__(/*! semver */ "semver"));
const Sentry = __importStar(__webpack_require__(/*! @sentry/node */ "@sentry/node"));
// Ours
const api_server_1 = __importDefault(__webpack_require__(/*! ../api.server */ "./src/server/api.server.ts"));
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const utils_1 = __webpack_require__(/*! ../../shared/utils */ "./src/shared/utils/index.ts");
const log = (0, logger_1.default)('extensions');
class ExtensionManager extends events_1.EventEmitter {
    constructor(io, bundleManager, replicator, mount) {
        super();
        this.extensions = {};
        this._satisfiedDepNames = new WeakMap();
        this._apiInstances = new Set();
        log.trace('Starting extension mounting');
        this._bundleManager = bundleManager;
        this._ExtensionApi = (0, api_server_1.default)(io, replicator, this.extensions, mount);
        // Prevent us from messing with other listeners of this event
        const allBundles = bundleManager.all();
        // Track which bundles we know are fully loaded (extension and all)
        const fullyLoaded = [];
        while (allBundles.length > 0) {
            const startLen = allBundles.length;
            for (let i = 0; i < startLen; i++) {
                // If this bundle has no dependencies, load it and remove it from the list
                if (!allBundles[i].bundleDependencies) {
                    log.debug('Bundle %s has no dependencies', allBundles[i].name);
                    if (allBundles[i].hasExtension) {
                        this._loadExtension(allBundles[i]);
                    }
                    fullyLoaded.push(allBundles[i]);
                    allBundles.splice(i, 1);
                    break;
                }
                // If this bundle has dependencies, and all of them are satisfied, load it and remove it from the list
                if (this._bundleDepsSatisfied(allBundles[i], fullyLoaded)) {
                    log.debug('Bundle %s has extension with satisfied dependencies', allBundles[i].name);
                    if (allBundles[i].hasExtension) {
                        this._loadExtension(allBundles[i]);
                    }
                    fullyLoaded.push(allBundles[i]);
                    allBundles.splice(i, 1);
                    break;
                }
            }
            const endLen = allBundles.length;
            if (startLen === endLen) {
                // Any bundles left over must have had unsatisfied dependencies.
                // Print a warning about each bundle, and what its unsatisfied deps were.
                // Then, unload the bundle.
                allBundles.forEach((bundle) => {
                    const unsatisfiedDeps = [];
                    for (const dep in bundle.bundleDependencies) {
                        /* istanbul ignore if */
                        if (!{}.hasOwnProperty.call(bundle.bundleDependencies, dep)) {
                            continue;
                        }
                        /* istanbul ignore if */
                        const satisfied = this._satisfiedDepNames.get(bundle);
                        if (satisfied === null || satisfied === void 0 ? void 0 : satisfied.includes(dep)) {
                            continue;
                        }
                        unsatisfiedDeps.push(`${dep}@${bundle.bundleDependencies[dep]}`);
                    }
                    log.error('Bundle "%s" can not be loaded, as it has unsatisfied dependencies:\n', bundle.name, unsatisfiedDeps.join(', '));
                    bundleManager.remove(bundle.name);
                });
                log.error('%d bundle(s) can not be loaded because they have unsatisfied dependencies', endLen);
                break;
            }
        }
        log.trace('Completed extension mounting');
    }
    emitToAllInstances(eventName, ...params) {
        for (const instance of this._apiInstances) {
            instance.emit(eventName, ...params);
        }
    }
    _loadExtension(bundle) {
        var _a;
        const ExtensionApi = this._ExtensionApi;
        const extPath = path_1.default.join(bundle.dir, 'extension');
        try {
            const requireFunc = process.env.NODECG_TEST ? __webpack_require__("./src/server/server sync recursive") : require;
            let mod = requireFunc(extPath);
            // If the extension has been generated by Babel/TypeScript and exported with "export default".
            if (mod.__esModule) {
                mod = mod.default;
            }
            const apiInstance = new ExtensionApi(bundle);
            this._apiInstances.add(apiInstance);
            const extension = mod(apiInstance);
            log.info('Mounted %s extension', bundle.name);
            this.extensions[bundle.name] = extension;
        }
        catch (err) {
            this._bundleManager.remove(bundle.name);
            log.warn('Failed to mount %s extension:\n', bundle.name, (0, utils_1.stringifyError)(err));
            if (global.sentryEnabled) {
                err.message = `Failed to mount ${bundle.name} extension: ${
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                ((_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err)}`;
                Sentry.captureException(err);
            }
        }
    }
    _bundleDepsSatisfied(bundle, loadedBundles) {
        var _a, _b;
        const deps = bundle.bundleDependencies;
        if (!deps) {
            return true;
        }
        const unsatisfiedDepNames = Object.keys(deps);
        const arr = (_b = (_a = this._satisfiedDepNames.get(bundle)) === null || _a === void 0 ? void 0 : _a.slice(0)) !== null && _b !== void 0 ? _b : [];
        loadedBundles.forEach((loadedBundle) => {
            // Find out if this loaded bundle is one of the dependencies of the bundle in question.
            // If so, check if the version loaded satisfies the dependency.
            const index = unsatisfiedDepNames.indexOf(loadedBundle.name);
            if (index > -1) {
                if (semver_1.default.satisfies(loadedBundle.version, deps[loadedBundle.name])) {
                    arr.push(loadedBundle.name);
                    unsatisfiedDepNames.splice(index, 1);
                }
            }
        });
        this._satisfiedDepNames.set(bundle, arr);
        return unsatisfiedDepNames.length === 0;
    }
}
exports["default"] = ExtensionManager;


/***/ }),

/***/ "./src/server/server/index.ts":
/*!************************************!*\
  !*** ./src/server/server/index.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Minimal imports for first setup
__webpack_require__(/*! ../../../scripts/warn-engines.js */ "./scripts/warn-engines.js");
const os = __importStar(__webpack_require__(/*! os */ "os"));
const Sentry = __importStar(__webpack_require__(/*! @sentry/node */ "@sentry/node"));
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
__webpack_require__(/*! ../util/sentry-config */ "./src/server/util/sentry-config.ts");
const util_1 = __webpack_require__(/*! ../util */ "./src/server/util/index.ts");
global.exitOnUncaught = config_1.config.exitOnUncaught;
if ((_a = config_1.config.sentry) === null || _a === void 0 ? void 0 : _a.enabled) {
    Sentry.init({
        dsn: config_1.config.sentry.dsn,
        serverName: os.hostname(),
        release: util_1.pjson.version,
    });
    Sentry.configureScope((scope) => {
        scope.setTags({
            nodecgHost: config_1.config.host,
            nodecgBaseURL: config_1.config.baseURL,
        });
    });
    global.sentryEnabled = true;
    process.on('unhandledRejection', (reason, p) => {
        console.error('Unhandled Rejection at:', p, 'reason:', reason);
        Sentry.captureException(reason);
    });
    console.info('[nodecg] Sentry enabled.');
}
// Native
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
// Packages
const body_parser_1 = __importDefault(__webpack_require__(/*! body-parser */ "body-parser"));
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const lodash_debounce_1 = __importDefault(__webpack_require__(/*! lodash.debounce */ "lodash.debounce"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const lodash_template_1 = __importDefault(__webpack_require__(/*! lodash.template */ "lodash.template"));
const fast_memoize_1 = __importDefault(__webpack_require__(/*! fast-memoize */ "fast-memoize"));
const express_transform_bare_module_specifiers_1 = __importDefault(__webpack_require__(/*! express-transform-bare-module-specifiers */ "express-transform-bare-module-specifiers"));
const compression_1 = __importDefault(__webpack_require__(/*! compression */ "compression"));
const socket_io_1 = __importDefault(__webpack_require__(/*! socket.io */ "socket.io"));
const passport_1 = __importDefault(__webpack_require__(/*! passport */ "passport"));
// Ours
const bundle_manager_1 = __importDefault(__webpack_require__(/*! ../bundle-manager */ "./src/server/bundle-manager.ts"));
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const socketAuthMiddleware_1 = __importDefault(__webpack_require__(/*! ../login/socketAuthMiddleware */ "./src/server/login/socketAuthMiddleware.ts"));
const socketApiMiddleware_1 = __importDefault(__webpack_require__(/*! ./socketApiMiddleware */ "./src/server/server/socketApiMiddleware.ts"));
const replicator_1 = __importDefault(__webpack_require__(/*! ../replicant/replicator */ "./src/server/replicant/replicator.ts"));
const db = __importStar(__webpack_require__(/*! ../database */ "./src/server/database/index.ts"));
const graphics_1 = __importDefault(__webpack_require__(/*! ../graphics */ "./src/server/graphics/index.ts"));
const dashboard_1 = __importDefault(__webpack_require__(/*! ../dashboard */ "./src/server/dashboard/index.ts"));
const mounts_1 = __importDefault(__webpack_require__(/*! ../mounts */ "./src/server/mounts.ts"));
const sounds_1 = __importDefault(__webpack_require__(/*! ../sounds */ "./src/server/sounds.ts"));
const assets_1 = __importDefault(__webpack_require__(/*! ../assets */ "./src/server/assets/index.ts"));
const shared_sources_1 = __importDefault(__webpack_require__(/*! ../shared-sources */ "./src/server/shared-sources.ts"));
const extensions_1 = __importDefault(__webpack_require__(/*! ./extensions */ "./src/server/server/extensions.ts"));
const sentry_config_1 = __importDefault(__webpack_require__(/*! ../util/sentry-config */ "./src/server/util/sentry-config.ts"));
const typed_emitter_1 = __webpack_require__(/*! ../../shared/typed-emitter */ "./src/shared/typed-emitter.ts");
const rootPath_1 = __importDefault(__webpack_require__(/*! ../../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const renderTemplate = (0, fast_memoize_1.default)((content, options) => (0, lodash_template_1.default)(content)(options));
class NodeCGServer extends typed_emitter_1.TypedEmitter {
    constructor() {
        var _a;
        super();
        this.log = (0, logger_1.default)('server');
        this._app = (0, express_1.default)();
        this.mount = (...args) => this._app.use(...args);
        this.mount = this.mount.bind(this);
        /**
         * HTTP(S) server setup
         */
        const { _app: app } = this;
        let server;
        if ((_a = config_1.config.ssl) === null || _a === void 0 ? void 0 : _a.enabled) {
            const sslOpts = {
                key: fs.readFileSync(config_1.config.ssl.keyPath),
                cert: fs.readFileSync(config_1.config.ssl.certificatePath),
            };
            if (config_1.config.ssl.passphrase) {
                sslOpts.passphrase = config_1.config.ssl.passphrase;
            }
            // If we allow HTTP on the same port, use httpolyglot
            // otherwise, standard https server
            server = config_1.config.ssl.allowHTTP
                ? (__webpack_require__(/*! httpolyglot */ "httpolyglot").createServer)(sslOpts, app)
                : (__webpack_require__(/*! https */ "https").createServer)(sslOpts, app);
        }
        else {
            server = (__webpack_require__(/*! http */ "http").createServer)(app);
        }
        /**
         * Socket.IO server setup.
         */
        this._io = new socket_io_1.default.Server(server);
        this._io.setMaxListeners(75); // Prevent console warnings when many extensions are installed
        this._io.on('error', (err) => {
            if (global.sentryEnabled) {
                Sentry.captureException(err);
            }
            this.log.error(err.stack);
        });
        this._server = server;
    }
    start() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { _app: app, _server: server, log } = this;
            const io = this._io.of('/');
            log.info('Starting NodeCG %s (Running on Node.js %s)', util_1.pjson.version, process.version);
            const database = yield db.getConnection();
            if (global.sentryEnabled) {
                app.use(Sentry.Handlers.requestHandler());
            }
            // Set up Express
            app.use((0, compression_1.default)());
            app.use(body_parser_1.default.json());
            app.use(body_parser_1.default.urlencoded({ extended: true }));
            app.set('trust proxy', true);
            app.engine('tmpl', (filePath, options, callback) => {
                fs.readFile(filePath, (error, content) => {
                    if (error) {
                        return callback(error);
                    }
                    return callback(null, renderTemplate(content, options));
                });
            });
            if ((_a = config_1.config.login) === null || _a === void 0 ? void 0 : _a.enabled) {
                log.info('Login security enabled');
                const login = yield Promise.resolve().then(() => __importStar(__webpack_require__(/*! ../login */ "./src/server/login/index.ts")));
                const { app: loginMiddleware, sessionMiddleware } = yield login.createMiddleware({
                    onLogin: (user) => {
                        var _a;
                        (_a = this._extensionManager) === null || _a === void 0 ? void 0 : _a.emitToAllInstances('login', user);
                    },
                    onLogout: (user) => {
                        var _a;
                        (_a = this._extensionManager) === null || _a === void 0 ? void 0 : _a.emitToAllInstances('logout', user);
                    },
                });
                app.use(loginMiddleware);
                // convert a connect middleware to a Socket.IO middleware
                const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
                io.use(wrap(sessionMiddleware));
                io.use(wrap(passport_1.default.initialize()));
                io.use(wrap(passport_1.default.session()));
                this._io.use(socketAuthMiddleware_1.default);
            }
            else {
                app.get('/login*', (_, res) => {
                    res.redirect('/dashboard');
                });
            }
            this._io.use(socketApiMiddleware_1.default);
            const bundlesPaths = [path.join(process.env.NODECG_ROOT, 'bundles')].concat((_c = (_b = config_1.config.bundles) === null || _b === void 0 ? void 0 : _b.paths) !== null && _c !== void 0 ? _c : []);
            const cfgPath = path.join(process.env.NODECG_ROOT, 'cfg');
            const bundleManager = new bundle_manager_1.default(bundlesPaths, cfgPath, util_1.pjson.version, config_1.config);
            // Wait for Chokidar to finish its initial scan.
            yield new Promise((resolve, reject) => {
                let handled = false;
                const timeout = setTimeout(() => {
                    if (handled)
                        return;
                    handled = true;
                    reject(new Error('Timed out while waiting for the bundle manager to become ready.'));
                }, 15000);
                if (bundleManager.ready) {
                    succeed();
                }
                else {
                    bundleManager.once('ready', () => {
                        succeed();
                    });
                }
                function succeed() {
                    if (handled)
                        return;
                    handled = true;
                    clearTimeout(timeout);
                    resolve();
                }
            });
            bundleManager.all().forEach((bundle) => {
                // TODO: remove this feature in v3
                if (bundle.transformBareModuleSpecifiers) {
                    log.warn(`${bundle.name} uses the deprecated "transformBareModuleSpecifiers" feature. ` +
                        'This feature will be removed in NodeCG v3. ' +
                        'Please migrate to using browser-native import maps instead: ' +
                        'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap');
                    const opts = {
                        rootDir: process.env.NODECG_ROOT,
                        modulesUrl: `/bundles/${bundle.name}/node_modules`,
                    };
                    app.use(`/bundles/${bundle.name}/*`, (0, express_transform_bare_module_specifiers_1.default)(opts));
                }
            });
            // Only used by tests. Kinda gross. Sorry.
            this._bundleManager = bundleManager;
            log.trace(`Attempting to listen on ${config_1.config.host}:${config_1.config.port}`);
            server.on('error', (err) => {
                switch (err.code) {
                    case 'EADDRINUSE':
                        if (process.env.NODECG_TEST) {
                            return;
                        }
                        log.error(`Listen ${config_1.config.host}:${config_1.config.port} in use, is NodeCG already running? NodeCG will now exit.`);
                        break;
                    default:
                        log.error('Unhandled error!', err);
                        break;
                }
                this.emit('error', err);
            });
            if (global.sentryEnabled) {
                const sentryHelpers = new sentry_config_1.default(bundleManager);
                app.use(sentryHelpers.app);
            }
            const persistedReplicantEntities = yield database.getRepository(db.Replicant).find();
            const replicator = new replicator_1.default(io, persistedReplicantEntities);
            this._replicator = replicator;
            const graphics = new graphics_1.default(io, bundleManager, replicator);
            app.use(graphics.app);
            const dashboard = new dashboard_1.default(bundleManager);
            app.use(dashboard.app);
            const mounts = new mounts_1.default(bundleManager.all());
            app.use(mounts.app);
            const sounds = new sounds_1.default(bundleManager.all(), replicator);
            app.use(sounds.app);
            const assets = new assets_1.default(bundleManager.all(), replicator);
            app.use(assets.app);
            const sharedSources = new shared_sources_1.default(bundleManager.all());
            app.use(sharedSources.app);
            if (global.sentryEnabled) {
                app.use(Sentry.Handlers.errorHandler());
            }
            // Fallthrough error handler,
            // Taken from https://docs.sentry.io/platforms/node/express/
            app.use((err, _req, res, _next) => {
                res.statusCode = 500;
                if (global.sentryEnabled) {
                    // The error id is attached to `res.sentry` to be returned
                    // and optionally displayed to the user for support.
                    res.end(`Internal error\nSentry issue ID: ${String(res.sentry)}\n`);
                }
                else {
                    res.end('Internal error');
                }
                this.log.error(err);
            });
            // Set up "bundles" Replicant.
            const bundlesReplicant = replicator.declare('bundles', 'nodecg', {
                schemaPath: path.resolve(rootPath_1.default.path, 'schemas/bundles.json'),
                persistent: false,
            });
            const updateBundlesReplicant = (0, lodash_debounce_1.default)(() => {
                bundlesReplicant.value = (0, clone_1.default)(bundleManager.all());
            }, 100);
            bundleManager.on('ready', updateBundlesReplicant);
            bundleManager.on('bundleChanged', updateBundlesReplicant);
            bundleManager.on('gitChanged', updateBundlesReplicant);
            bundleManager.on('bundleRemoved', updateBundlesReplicant);
            updateBundlesReplicant();
            const extensionManager = new extensions_1.default(io, bundleManager, replicator, this.mount);
            this._extensionManager = extensionManager;
            this.emit('extensionsLoaded');
            (_d = this._extensionManager) === null || _d === void 0 ? void 0 : _d.emitToAllInstances('extensionsLoaded');
            // We intentionally wait until all bundles and extensions are loaded before starting the server.
            // This has two benefits:
            // 1) Prevents the dashboard/views from being opened before everything has finished loading
            // 2) Prevents dashboard/views from re-declaring replicants on reconnect before extensions have had a chance
            return new Promise((resolve) => {
                server.listen({
                    host: config_1.config.host,
                    port: process.env.NODECG_TEST ? undefined : config_1.config.port,
                }, () => {
                    var _a, _b;
                    if (process.env.NODECG_TEST) {
                        const addrInfo = server.address();
                        if (typeof addrInfo !== 'object' || addrInfo === null) {
                            throw new Error("couldn't get port number");
                        }
                        const { port } = addrInfo;
                        log.warn(`Test mode active, using automatic listen port: ${port}`);
                        config_1.config.port = port;
                        config_1.filteredConfig.port = port;
                        process.env.NODECG_TEST_PORT = String(port);
                    }
                    const protocol = ((_a = config_1.config.ssl) === null || _a === void 0 ? void 0 : _a.enabled) ? 'https' : 'http';
                    log.info('NodeCG running on %s://%s', protocol, config_1.config.baseURL);
                    this.emit('started');
                    (_b = this._extensionManager) === null || _b === void 0 ? void 0 : _b.emitToAllInstances('serverStarted');
                    resolve();
                });
            });
        });
    }
    stop() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this._extensionManager) === null || _a === void 0 ? void 0 : _a.emitToAllInstances('serverStopping');
            this._io.disconnectSockets(true);
            yield new Promise((resolve) => {
                // Also closes the underlying HTTP server.
                this._io.close(() => {
                    resolve();
                });
            });
            if (this._replicator) {
                this._replicator.saveAllReplicants();
            }
            this.emit('stopped');
        });
    }
    getExtensions() {
        var _a;
        return Object.assign({}, (_a = this._extensionManager) === null || _a === void 0 ? void 0 : _a.extensions);
    }
    getSocketIOServer() {
        return this._io;
    }
    saveAllReplicantsNow() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = this._replicator) === null || _a === void 0 ? void 0 : _a.saveAllReplicantsNow();
        });
    }
}
exports["default"] = NodeCGServer;


/***/ }),

/***/ "./src/server/server/socketApiMiddleware.ts":
/*!**************************************************!*\
  !*** ./src/server/server/socketApiMiddleware.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Packages
const Sentry = __importStar(__webpack_require__(/*! @sentry/node */ "@sentry/node"));
// Ours
const logger_1 = __importDefault(__webpack_require__(/*! ../logger */ "./src/server/logger/index.ts"));
const log = (0, logger_1.default)('socket-api');
function default_1(socket, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            log.trace('New socket connection: ID %s with IP %s', socket.id, socket.handshake.address);
            socket.on('error', (err) => {
                if (global.sentryEnabled) {
                    Sentry.captureException(err);
                }
                log.error(err);
            });
            socket.on('message', (data) => {
                log.trace('Received message %s (sent to bundle %s) with data:', data.messageName, data.bundleName, data.content);
                socket.broadcast.emit('message', data);
            });
            socket.on('joinRoom', (room, cb) => __awaiter(this, void 0, void 0, function* () {
                if (typeof room !== 'string') {
                    cb('Room must be a string', undefined);
                    return;
                }
                if (!Object.keys(socket.rooms).includes(room)) {
                    log.trace('Socket %s joined room:', socket.id, room);
                    yield socket.join(room);
                }
                cb(undefined, undefined);
            }));
            next();
        }
        catch (error) {
            next(error);
        }
    });
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/shared-sources.ts":
/*!**************************************!*\
  !*** ./src/server/shared-sources.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
// Ours
const util_1 = __webpack_require__(/*! ./util */ "./src/server/util/index.ts");
class SharedSourcesLib {
    constructor(bundles) {
        this.app = (0, express_1.default)();
        this.app.get('/bundles/:bundleName/shared/*', util_1.authCheck, (req, res, next) => {
            const { bundleName } = req.params;
            const bundle = bundles.find((b) => b.name === bundleName);
            if (!bundle) {
                next();
                return;
            }
            // Essentially behave like express.static
            // Serve up files with no extra logic
            const resName = req.params[0];
            const parentDir = path_1.default.join(bundle.dir, 'shared');
            const fileLocation = path_1.default.join(parentDir, resName);
            (0, util_1.sendFile)(parentDir, fileLocation, res, next);
        });
    }
}
exports["default"] = SharedSourcesLib;


/***/ }),

/***/ "./src/server/sounds.ts":
/*!******************************!*\
  !*** ./src/server/sounds.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
// Packages
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const sha1_file_1 = __importDefault(__webpack_require__(/*! sha1-file */ "sha1-file"));
const util_1 = __webpack_require__(/*! ./util */ "./src/server/util/index.ts");
const rootPath_1 = __importDefault(__webpack_require__(/*! ../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
class SoundsLib {
    constructor(bundles, replicator) {
        this.app = (0, express_1.default)();
        this._cueRepsByBundle = new Map();
        this._bundles = bundles;
        // Create the replicant for the "Master Fader"
        replicator.declare('volume:master', '_sounds', { defaultValue: 100 });
        bundles.forEach((bundle) => {
            // If this bundle has sounds
            if (bundle.soundCues.length > 0) {
                // Create an array replicant that will hold all this bundle's sound cues.
                const defaultCuesRepValue = this._makeCuesRepDefaultValue(bundle);
                const cuesRep = replicator.declare('soundCues', bundle.name, {
                    schemaPath: path_1.default.resolve(rootPath_1.default.path, 'schemas/soundCues.json'),
                    defaultValue: [],
                });
                this._cueRepsByBundle.set(bundle.name, cuesRep);
                if (cuesRep.value.length > 0) {
                    // Remove any persisted cues that are no longer in the bundle manifest.
                    cuesRep.value = cuesRep.value.filter((persistedCue) => defaultCuesRepValue.find((defaultCue) => defaultCue.name === persistedCue.name));
                    // Add/update any cues in the bundle manifest that aren't in the persisted replicant.
                    defaultCuesRepValue.forEach((defaultCue) => {
                        const existingIndex = cuesRep.value.findIndex((persistedCue) => persistedCue.name === defaultCue.name);
                        // We need to just update a few key properties in the persisted cue.
                        // We leave things like volume as-is.
                        if (existingIndex >= 0) {
                            cuesRep.value[existingIndex].assignable = defaultCue.assignable;
                            cuesRep.value[existingIndex].defaultFile = defaultCue.defaultFile;
                            // If we're updating the cue to not be assignable, then we have to
                            // set the `defaultFile` as the selected `file`.
                            if (!defaultCue.assignable && defaultCue.defaultFile) {
                                cuesRep.value[existingIndex].file = (0, clone_1.default)(defaultCue.defaultFile);
                            }
                        }
                        else {
                            cuesRep.value.push(defaultCue);
                        }
                    });
                }
                else {
                    // There's no persisted value, so just assign the default.
                    cuesRep.value = defaultCuesRepValue;
                }
                // Create this bundle's "Bundle Fader"
                replicator.declare(`volume:${bundle.name}`, '_sounds', {
                    defaultValue: 100,
                });
            }
        });
        this.app.get('/sound/:bundleName/:cueName/default.mp3', this._serveDefault.bind(this));
        this.app.get('/sound/:bundleName/:cueName/default.ogg', this._serveDefault.bind(this));
    }
    _serveDefault(req, res, next) {
        const bundle = this._bundles.find((b) => b.name === req.params.bundleName);
        if (!bundle) {
            res.status(404).send(`File not found: ${req.path}`);
            return;
        }
        const cue = bundle.soundCues.find((cue) => cue.name === req.params.cueName);
        if (!cue) {
            res.status(404).send(`File not found: ${req.path}`);
            return;
        }
        if (!cue.defaultFile) {
            res.status(404).send(`Cue "${cue.name}" had no default file`);
            return;
        }
        const parentDir = bundle.dir;
        const fullPath = path_1.default.join(parentDir, cue.defaultFile);
        (0, util_1.sendFile)(parentDir, fullPath, res, next);
    }
    _makeCuesRepDefaultValue(bundle) {
        var _a;
        const formattedCues = [];
        for (const rawCue of bundle.soundCues) {
            let file;
            if (rawCue.defaultFile) {
                const filepath = path_1.default.join(bundle.dir, rawCue.defaultFile);
                const parsedPath = path_1.default.parse(filepath);
                file = {
                    sum: sha1_file_1.default.sync(filepath),
                    base: parsedPath.base,
                    ext: parsedPath.ext,
                    name: parsedPath.name,
                    url: `/sound/${bundle.name}/${rawCue.name}/default${parsedPath.ext}`,
                    default: true,
                };
            }
            const formatted = {
                name: rawCue.name,
                assignable: Boolean(rawCue.assignable),
                volume: (_a = rawCue.defaultVolume) !== null && _a !== void 0 ? _a : 30,
            };
            if ('defaultVolume' in rawCue) {
                formatted.defaultVolume = rawCue.defaultVolume;
            }
            if (file) {
                formatted.file = file;
                formatted.defaultFile = (0, clone_1.default)(file);
            }
            formattedCues.push(formatted);
        }
        return formattedCues;
    }
}
exports["default"] = SoundsLib;


/***/ }),

/***/ "./src/server/util/authcheck.ts":
/*!**************************************!*\
  !*** ./src/server/util/authcheck.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Ours
const database_1 = __webpack_require__(/*! ../database */ "./src/server/database/index.ts");
const utils_1 = __webpack_require__(/*! ../database/utils */ "./src/server/database/utils.ts");
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
/**
 * Express middleware that checks if the user is authenticated.
 */
function default_1(req, res, next) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!((_a = config_1.config.login) === null || _a === void 0 ? void 0 : _a.enabled)) {
                next();
                return;
            }
            let { user } = req;
            let isUsingKeyOrSocketToken = false;
            let keyOrSocketTokenAuthenticated = false;
            if ((_b = req.query.key) !== null && _b !== void 0 ? _b : req.cookies.socketToken) {
                isUsingKeyOrSocketToken = true;
                const database = yield (0, database_1.getConnection)();
                const apiKey = yield database.getRepository(database_1.ApiKey).findOne({
                    where: { secret_key: (_c = req.query.key) !== null && _c !== void 0 ? _c : req.cookies.socketToken },
                    relations: ['user'],
                });
                // No record of this API Key found, reject the request.
                if (!apiKey) {
                    // Ensure we delete the existing cookie so that it doesn't become poisoned
                    // and cause an infinite login loop.
                    (_d = req.session) === null || _d === void 0 ? void 0 : _d.destroy(() => {
                        res.clearCookie('socketToken', {
                            secure: req.secure,
                            sameSite: req.secure ? 'none' : undefined,
                        });
                        res.clearCookie('connect.sid', { path: '/' });
                        res.clearCookie('io', { path: '/' });
                        res.redirect('/login');
                    });
                    return;
                }
                user = (_e = (yield (0, utils_1.findUser)(apiKey.user.id))) !== null && _e !== void 0 ? _e : undefined;
            }
            if (!user) {
                if (req.session) {
                    req.session.returnTo = req.url;
                }
                res.status(403).redirect('/login');
                return;
            }
            const allowed = (0, utils_1.isSuperUser)(user);
            keyOrSocketTokenAuthenticated = isUsingKeyOrSocketToken && allowed;
            const provider = (_f = user.identities[0]) === null || _f === void 0 ? void 0 : _f.provider_type;
            const providerAllowed = (_h = (_g = config_1.config.login) === null || _g === void 0 ? void 0 : _g[provider]) === null || _h === void 0 ? void 0 : _h.enabled;
            if ((keyOrSocketTokenAuthenticated || req.isAuthenticated()) && allowed && providerAllowed) {
                let apiKey = user.apiKeys[0];
                // This should only happen if the database is manually edited, say, in the event of a security breach
                // that reavealed an API key that needed to be deleted.
                if (!apiKey) {
                    // Make a new api key.
                    const database = yield (0, database_1.getConnection)();
                    apiKey = database.manager.create(database_1.ApiKey);
                    yield database.manager.save(apiKey);
                    // Assign this key to the user.
                    user.apiKeys.push(apiKey);
                    yield database.manager.save(user);
                }
                // Set the cookie so that requests to other resources on the page
                // can also be authenticated.
                // This is crucial for things like OBS browser sources,
                // where we don't have a session.
                res.cookie('socketToken', apiKey.secret_key, {
                    secure: req.secure,
                    sameSite: req.secure ? 'none' : undefined,
                });
                next();
                return;
            }
            if (req.session) {
                req.session.returnTo = req.url;
            }
            res.status(403).redirect('/login');
            return;
        }
        catch (error) {
            next(error);
        }
    });
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/util/debounce-name.ts":
/*!******************************************!*\
  !*** ./src/server/util/debounce-name.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const timers = new Map();
/**
 * A standard debounce, but uses a string `name` as the key instead of the callback.
 */
function default_1(name, callback, duration = 500) {
    const existing = timers.get(name);
    if (existing) {
        clearTimeout(existing);
    }
    timers.set(name, setTimeout(() => {
        timers.delete(name);
        callback();
    }, duration));
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/util/exit-hook.ts":
/*!**************************************!*\
  !*** ./src/server/util/exit-hook.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gracefulExit = exports.asyncExitHook = void 0;
// Adapted from https://github.com/sindresorhus/exit-hook/blob/9fdc03b855f12f79a0d13246c38ca9b2114c8d2e/index.js
const node_process_1 = __importDefault(__webpack_require__(/*! node:process */ "node:process"));
const asyncCallbacks = new Set();
const callbacks = new Set();
let isCalled = false;
let isRegistered = false;
function exit(shouldManuallyExit, isSynchronous, signal) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isCalled) {
            return;
        }
        isCalled = true;
        if (asyncCallbacks.size > 0 && isSynchronous) {
            console.error([
                'SYNCHRONOUS TERMINATION NOTICE:',
                'When explicitly exiting the process via process.exit or via a parent process,',
                'asynchronous tasks in your exitHooks will not run. Either remove these tasks,',
                'use gracefulExit() instead of process.exit(), or ensure your parent process',
                'sends a SIGINT to the process running this code.',
            ].join(' '));
        }
        const exitCode = 128 + signal;
        const done = (force = false) => {
            if (force || shouldManuallyExit) {
                node_process_1.default.exit(exitCode);
            }
        };
        for (const callback of callbacks) {
            callback(exitCode);
        }
        if (isSynchronous) {
            done();
            return;
        }
        const promises = [];
        let forceAfter = 0;
        for (const [callback, wait] of asyncCallbacks) {
            forceAfter = Math.max(forceAfter, wait !== null && wait !== void 0 ? wait : 0);
            promises.push(Promise.resolve(callback(exitCode)));
        }
        // Force exit if we exceeded our wait value
        const asyncTimer = setTimeout(() => {
            done(true);
        }, forceAfter);
        yield Promise.all(promises);
        clearTimeout(asyncTimer);
        done();
    });
}
function addHook(options) {
    const { onExit, minimumWait, isSynchronous } = options;
    const asyncCallbackConfig = [onExit, minimumWait];
    if (isSynchronous) {
        callbacks.add(onExit);
    }
    else {
        asyncCallbacks.add(asyncCallbackConfig);
    }
    if (!isRegistered) {
        isRegistered = true;
        // Exit cases that support asynchronous handling
        node_process_1.default.once('beforeExit', exit.bind(undefined, true, false, -128));
        node_process_1.default.once('SIGHUP', exit.bind(undefined, true, false, 1));
        node_process_1.default.once('SIGINT', exit.bind(undefined, true, false, 2));
        node_process_1.default.once('SIGTERM', exit.bind(undefined, true, false, 15));
        // Explicit exit events. Calling will force an immediate exit and run all
        // synchronous hooks. Explicit exits must not extend the node process
        // artificially. Will log errors if asynchronous calls exist.
        node_process_1.default.once('exit', exit.bind(undefined, false, true, 0));
        // PM2 Cluster shutdown message. Caught to support async handlers with pm2,
        // needed because explicitly calling process.exit() doesn't trigger the
        // beforeExit event, and the exit event cannot support async handlers,
        // since the event loop is never called after it.
        node_process_1.default.on('message', (message) => {
            if (message === 'shutdown') {
                void exit(true, true, -128);
            }
        });
    }
    return () => {
        if (isSynchronous) {
            callbacks.delete(onExit);
        }
        else {
            asyncCallbacks.delete(asyncCallbackConfig);
        }
    };
}
function exitHook(onExit) {
    if (typeof onExit !== 'function') {
        throw new TypeError('onExit must be a function');
    }
    return addHook({
        onExit,
        isSynchronous: true,
    });
}
exports["default"] = exitHook;
function asyncExitHook(onExit, options = {}) {
    if (typeof onExit !== 'function') {
        throw new TypeError('onExit must be a function');
    }
    if (!(typeof options.minimumWait === 'number' && options.minimumWait > 0)) {
        throw new TypeError('minimumWait must be set to a positive numeric value');
    }
    return addHook({
        onExit,
        minimumWait: options.minimumWait,
        isSynchronous: false,
    });
}
exports.asyncExitHook = asyncExitHook;
function gracefulExit(signal = 0) {
    void exit(true, false, -128 + signal);
}
exports.gracefulExit = gracefulExit;


/***/ }),

/***/ "./src/server/util/index.ts":
/*!**********************************!*\
  !*** ./src/server/util/index.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.asyncExitHook = exports.sendFile = exports.pjson = exports.throttleName = exports.authCheck = exports.injectScripts = exports.debounceName = exports.noop = void 0;
var noop_1 = __webpack_require__(/*! ./noop */ "./src/server/util/noop.ts");
Object.defineProperty(exports, "noop", ({ enumerable: true, get: function () { return __importDefault(noop_1).default; } }));
var debounce_name_1 = __webpack_require__(/*! ./debounce-name */ "./src/server/util/debounce-name.ts");
Object.defineProperty(exports, "debounceName", ({ enumerable: true, get: function () { return __importDefault(debounce_name_1).default; } }));
var injectscripts_1 = __webpack_require__(/*! ./injectscripts */ "./src/server/util/injectscripts.ts");
Object.defineProperty(exports, "injectScripts", ({ enumerable: true, get: function () { return __importDefault(injectscripts_1).default; } }));
var authcheck_1 = __webpack_require__(/*! ./authcheck */ "./src/server/util/authcheck.ts");
Object.defineProperty(exports, "authCheck", ({ enumerable: true, get: function () { return __importDefault(authcheck_1).default; } }));
var throttle_name_1 = __webpack_require__(/*! ./throttle-name */ "./src/server/util/throttle-name.ts");
Object.defineProperty(exports, "throttleName", ({ enumerable: true, get: function () { return __importDefault(throttle_name_1).default; } }));
var pjson_1 = __webpack_require__(/*! ./pjson */ "./src/server/util/pjson.ts");
Object.defineProperty(exports, "pjson", ({ enumerable: true, get: function () { return __importDefault(pjson_1).default; } }));
var sendFile_1 = __webpack_require__(/*! ./sendFile */ "./src/server/util/sendFile.ts");
Object.defineProperty(exports, "sendFile", ({ enumerable: true, get: function () { return __importDefault(sendFile_1).default; } }));
var exit_hook_1 = __webpack_require__(/*! ./exit-hook */ "./src/server/util/exit-hook.ts");
Object.defineProperty(exports, "asyncExitHook", ({ enumerable: true, get: function () { return exit_hook_1.asyncExitHook; } }));


/***/ }),

/***/ "./src/server/util/injectscripts.ts":
/*!******************************************!*\
  !*** ./src/server/util/injectscripts.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/* eslint-disable complexity */
// Native
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
// Packages
const cheerio_1 = __importDefault(__webpack_require__(/*! cheerio */ "cheerio"));
const semver_1 = __importDefault(__webpack_require__(/*! semver */ "semver"));
// Ours
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
const util_1 = __webpack_require__(/*! ../util */ "./src/server/util/index.ts");
/**
 * Injects the appropriate assets into a panel, dialog, or graphic.
 */
function default_1(pathOrHtml, resourceType, { standalone = false, createApiInstance, sound = false, fullbleed = false } = {}, cb = util_1.noop) {
    // Graphics only pass the path to the html file.
    // Panels and dialogs pass a cached HTML string.
    if (resourceType === 'graphic') {
        fs_1.default.readFile(pathOrHtml, { encoding: 'utf8' }, (error, data) => {
            inject(error !== null && error !== void 0 ? error : undefined, data);
        });
    }
    else {
        inject(undefined, pathOrHtml);
    }
    function inject(err, html) {
        if (err) {
            throw err;
        }
        const $ = cheerio_1.default.load(html);
        const scripts = [];
        const styles = [];
        // Everything needs the config
        scripts.push(`<script>globalThis.ncgConfig = ${JSON.stringify(config_1.filteredConfig)};</script>`);
        if (resourceType === 'panel' || resourceType === 'dialog') {
            if (standalone) {
                // Load the API
                scripts.push('<script src="/nodecg-api.min.js"></script>');
            }
            else {
                // Panels and dialogs can grab the API from the dashboard
                scripts.push('<script>window.NodeCG = window.top.NodeCG</script>');
            }
            // Both panels and dialogs need the main default styles
            scripts.push('<link rel="stylesheet" href="/dashboard/css/panel-and-dialog-defaults.css">');
            if (standalone) {
                // Load the socket
                scripts.push('<script src="/socket.js"></script>');
            }
            else {
                // They both also need to reference the dashboard window's socket, rather than make their own
                scripts.push('<script>window.socket = window.top.socket;</script>');
            }
            // Likewise, they both need the contentWindow portion of the iframeResizer.
            // We put this at the start and make it async so it loads ASAP.
            if (!fullbleed) {
                scripts.unshift('<script async src="/node_modules/iframe-resizer/js/iframeResizer.contentWindow.min.js">' +
                    '</script>');
            }
            // Panels need the default panel styles and the dialog_opener.
            if (resourceType === 'panel') {
                // In v1.1.0, we changed the Dashboard to have a dark theme.
                // This also meant that we wanted to update the default panel styles.
                // However, this technically would have been a breaking change...
                // To minimize breakage, we only inject the new styles if
                // the bundle specifically lists support for v1.0.0.
                // If it only supports v1.1.0 and on, we assume it wants the dark theme styles.
                if (createApiInstance && semver_1.default.satisfies('1.0.0', createApiInstance.compatibleRange)) {
                    styles.push('<link rel="stylesheet" href="/dashboard/css/old-panel-defaults.css">');
                }
                else {
                    styles.push('<link rel="stylesheet" href="/dashboard/css/panel-defaults.css">');
                }
                scripts.push('<script async src="/dialog_opener.js"></script>');
            }
            else if (resourceType === 'dialog') {
                styles.push('<link rel="stylesheet" href="/dashboard/css/dialog-defaults.css">');
            }
        }
        else if (resourceType === 'graphic') {
            if (global.sentryEnabled) {
                scripts.unshift('<script src="/node_modules/@sentry/browser/build/bundle.es6.min.js"></script>', '<script src="/sentry.js"></script>');
            }
            // Graphics need to create their own socket
            scripts.push('<script src="/socket.io/socket.io.js"></script>');
            scripts.push('<script src="/socket.js"></script>');
            // If this bundle has sounds, inject SoundJS
            if (sound) {
                scripts.push('<script src="/node_modules/soundjs/lib/soundjs.min.js"></script>');
            }
            // Graphics must include the API script themselves before attempting to make an instance of it
            scripts.push('<script src="/nodecg-api.min.js"></script>');
        }
        // Inject a small script to create a NodeCG API instance, if requested.
        if (createApiInstance) {
            const partialBundle = {
                name: createApiInstance.name,
                config: createApiInstance.config,
                version: createApiInstance.version,
                git: createApiInstance.git,
                _hasSounds: sound,
            };
            scripts.push(`<script>globalThis.nodecg = new globalThis.NodeCG(${JSON.stringify(partialBundle)}, globalThis.socket)</script>`);
        }
        // Inject the scripts required for singleInstance behavior, if requested.
        if (resourceType === 'graphic' && !(pathOrHtml.endsWith('busy.html') || pathOrHtml.endsWith('killed.html'))) {
            scripts.push('<script src="/client_registration.js"></script>');
        }
        const concattedScripts = scripts.join('\n');
        // Put our scripts before their first script or HTML import.
        // If they have no scripts or imports, put our scripts at the end of <body>.
        const theirScriptsAndImports = $('script, link[rel="import"]');
        if (theirScriptsAndImports.length > 0) {
            theirScriptsAndImports.first().before(concattedScripts);
        }
        else {
            $('body').append(concattedScripts);
        }
        // Prepend our styles before the first one.
        // If there are no styles, put our styles at the end of <head>.
        if (styles.length > 0) {
            const concattedStyles = styles.join('\n');
            const headStyles = $('head').find('style, link[rel="stylesheet"]');
            if (headStyles.length > 0) {
                headStyles.first().before(concattedStyles);
            }
            else {
                $('head').append(concattedStyles);
            }
        }
        cb($.html());
    }
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/server/util/isChildOf.ts":
/*!**************************************!*\
  !*** ./src/server/util/isChildOf.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
/**
 * Checks if a given path (dirOrFile) is a child of another given path (parent).
 */
function isChildOf(parent, dirOrFile) {
    const relative = path_1.default.relative(parent, dirOrFile);
    return Boolean(relative) && !relative.startsWith('..') && !path_1.default.isAbsolute(relative);
}
exports["default"] = isChildOf;


/***/ }),

/***/ "./src/server/util/noop.ts":
/*!*********************************!*\
  !*** ./src/server/util/noop.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = () => { }; // eslint-disable-line @typescript-eslint/no-empty-function


/***/ }),

/***/ "./src/server/util/pjson.ts":
/*!**********************************!*\
  !*** ./src/server/util/pjson.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
// Ours
const rootPath_1 = __importDefault(__webpack_require__(/*! ../../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const pjsonPath = path_1.default.join(rootPath_1.default.path, 'package.json');
const rawContents = fs_1.default.readFileSync(pjsonPath, 'utf8');
const pjson = JSON.parse(rawContents);
exports["default"] = pjson;


/***/ }),

/***/ "./src/server/util/sendFile.ts":
/*!*************************************!*\
  !*** ./src/server/util/sendFile.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const isChildOf_1 = __importDefault(__webpack_require__(/*! ./isChildOf */ "./src/server/util/isChildOf.ts"));
exports["default"] = (directoryToPreventTraversalOutOf, fileLocation, res, next) => {
    if ((0, isChildOf_1.default)(directoryToPreventTraversalOutOf, fileLocation)) {
        res.sendFile(fileLocation, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    return res.type(path_1.default.extname(fileLocation)).sendStatus(404);
                }
                /* istanbul ignore next */
                if (!res.headersSent) {
                    next(err);
                }
            }
            return undefined;
        });
    }
    else {
        res.sendStatus(404);
    }
};


/***/ }),

/***/ "./src/server/util/sentry-config.ts":
/*!******************************************!*\
  !*** ./src/server/util/sentry-config.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Native
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const os_1 = __importDefault(__webpack_require__(/*! os */ "os"));
// Packages
const Sentry = __importStar(__webpack_require__(/*! @sentry/node */ "@sentry/node"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
// Ours
const config_1 = __webpack_require__(/*! ../config */ "./src/server/config/index.ts");
const util_1 = __webpack_require__(/*! ../util */ "./src/server/util/index.ts");
const rootPath_1 = __importDefault(__webpack_require__(/*! ../../shared/utils/rootPath */ "./src/shared/utils/rootPath.ts"));
const VIEWS_PATH = path_1.default.join(rootPath_1.default.path, 'build/server/templates');
const baseSentryConfig = {
    dsn: (_a = config_1.config.sentry) === null || _a === void 0 ? void 0 : _a.dsn,
    serverName: os_1.default.hostname(),
    release: util_1.pjson.version,
};
class SentryConfig {
    constructor(bundleManager) {
        this.bundleMetadata = [];
        this.app = (0, express_1.default)();
        const { app, bundleMetadata } = this;
        app.set('views', VIEWS_PATH);
        bundleManager.on('ready', () => {
            Sentry.configureScope((scope) => {
                bundleManager.all().forEach((bundle) => {
                    bundleMetadata.push({
                        name: bundle.name,
                        git: bundle.git,
                        version: bundle.version,
                    });
                });
                scope.setExtra('bundles', bundleMetadata);
            });
        });
        bundleManager.on('gitChanged', (bundle) => {
            const metadataToUpdate = bundleMetadata.find((data) => data.name === bundle.name);
            if (!metadataToUpdate) {
                return;
            }
            metadataToUpdate.git = bundle.git;
            metadataToUpdate.version = bundle.version;
        });
        // Render a pre-configured Sentry instance for client pages that request it.
        app.get('/sentry.js', util_1.authCheck, (_req, res) => {
            res.type('.js');
            res.render(path_1.default.join(VIEWS_PATH, 'sentry.js.tmpl'), {
                baseSentryConfig,
                bundleMetadata,
            });
        });
    }
}
exports["default"] = SentryConfig;


/***/ }),

/***/ "./src/server/util/throttle-name.ts":
/*!******************************************!*\
  !*** ./src/server/util/throttle-name.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const timers = new Map();
const queued = new Set();
/**
 * A standard throttle, but uses a string `name` as the key instead of the callback.
 */
function default_1(name, callback, duration = 500) {
    const existing = timers.get(name);
    if (existing) {
        queued.add(name);
        return;
    }
    callback();
    timers.set(name, setTimeout(() => {
        timers.delete(name);
        if (queued.has(name)) {
            queued.delete(name);
            callback();
        }
    }, duration));
}
exports["default"] = default_1;


/***/ }),

/***/ "./src/shared/api.base.ts":
/*!********************************!*\
  !*** ./src/shared/api.base.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NodeCGAPIBase = void 0;
// Ours
const { version } = __webpack_require__(/*! ../../package.json */ "./package.json");
const typed_emitter_1 = __webpack_require__(/*! ./typed-emitter */ "./src/shared/typed-emitter.ts");
class NodeCGAPIBase extends typed_emitter_1.TypedEmitter {
    /**
     * Lets you easily wait for a group of Replicants to finish declaring.
     *
     * Returns a promise which is resolved once all provided Replicants
     * have emitted a `change` event, which is indicates that they must
     * have finished declaring.
     *
     * This method is only useful in client-side code.
     * Server-side code never has to wait for Replicants.
     *
     * @param replicants {Replicant}
     * @returns {Promise<any>}
     *
     * @example <caption>From a graphic or dashboard panel:</caption>
     * const rep1 = nodecg.Replicant('rep1');
     * const rep2 = nodecg.Replicant('rep2');
     *
     * // You can provide as many Replicant arguments as you want,
     * // this example just uses two Replicants.
     * NodeCG.waitForReplicants(rep1, rep2).then(() => {
     *     console.log('rep1 and rep2 are fully declared and ready to use!');
     * });
     */
    static waitForReplicants(...replicants) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const numReplicants = replicants.length;
                let declaredReplicants = 0;
                replicants.forEach((replicant) => {
                    replicant.once('change', () => {
                        declaredReplicants++;
                        if (declaredReplicants >= numReplicants) {
                            resolve();
                        }
                    });
                });
            });
        });
    }
    constructor(bundle) {
        super();
        this._messageHandlers = [];
        this.bundleName = bundle.name;
        this.bundleConfig = bundle.config;
        this.bundleVersion = bundle.version;
        this.bundleGit = bundle.git;
    }
    listenFor(messageName, bundleNameOrHandlerFunc, handlerFunc) {
        let bundleName;
        if (typeof bundleNameOrHandlerFunc === 'string') {
            bundleName = bundleNameOrHandlerFunc;
        }
        else {
            bundleName = this.bundleName;
            handlerFunc = bundleNameOrHandlerFunc;
        }
        if (typeof handlerFunc !== 'function') {
            throw new Error(`argument "handler" must be a function, but you provided a(n) ${typeof handlerFunc}`);
        }
        this.log.trace('Listening for %s from bundle %s', messageName, bundleNameOrHandlerFunc);
        this._messageHandlers.push({
            messageName,
            bundleName,
            func: handlerFunc,
        });
    }
    unlisten(messageName, bundleNameOrHandler, maybeHandler) {
        let { bundleName } = this;
        let handlerFunc = maybeHandler;
        if (typeof bundleNameOrHandler === 'string') {
            bundleName = bundleNameOrHandler;
        }
        else {
            handlerFunc = bundleNameOrHandler;
        }
        if (typeof handlerFunc !== 'function') {
            throw new Error(`argument "handler" must be a function, but you provided a(n) ${typeof handlerFunc}`);
        }
        this.log.trace('[%s] Removing listener for %s from bundle %s', this.bundleName, messageName, bundleName);
        // Find the index of this handler in the array.
        const index = this._messageHandlers.findIndex((handler) => handler.messageName === messageName &&
            handler.bundleName === bundleName &&
            handler.func === handlerFunc);
        // If the handler exists, remove it and return true.
        if (index >= 0) {
            this._messageHandlers.splice(index, 1);
            return true;
        }
        // Else, return false.
        return false;
    }
    Replicant(name, namespaceOrOpts, opts) {
        let namespace;
        if (typeof namespaceOrOpts === 'string') {
            namespace = namespaceOrOpts;
        }
        else {
            namespace = this.bundleName;
        }
        if (typeof namespaceOrOpts !== 'string') {
            opts = namespaceOrOpts;
        }
        const defaultOpts = {};
        opts = opts !== null && opts !== void 0 ? opts : defaultOpts;
        if (typeof opts.schemaPath === 'undefined') {
            opts.schemaPath = `bundles/${encodeURIComponent(namespace)}/schemas/${encodeURIComponent(name)}.json`;
        }
        return this._replicantFactory(name, namespace, opts);
    }
}
exports.NodeCGAPIBase = NodeCGAPIBase;
NodeCGAPIBase.version = version;


/***/ }),

/***/ "./src/shared/logger-interface.ts":
/*!****************************************!*\
  !*** ./src/shared/logger-interface.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["Trace"] = "verbose";
    LogLevel["Debug"] = "debug";
    LogLevel["Info"] = "info";
    LogLevel["Warn"] = "warn";
    LogLevel["Error"] = "error";
    LogLevel["Silent"] = "silent";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));


/***/ }),

/***/ "./src/shared/replicants.shared.ts":
/*!*****************************************!*\
  !*** ./src/shared/replicants.shared.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.proxyRecursive = exports.isIgnoringProxy = exports.resumeProxy = exports.ignoreProxy = exports.ARRAY_MUTATOR_METHODS = exports.AbstractReplicant = void 0;
const clone_1 = __importDefault(__webpack_require__(/*! clone */ "clone"));
const object_path_1 = __importDefault(__webpack_require__(/*! object-path */ "object-path"));
const typed_emitter_1 = __webpack_require__(/*! ../shared/typed-emitter */ "./src/shared/typed-emitter.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./src/shared/utils/index.ts");
/**
 * If you're wondering why some things are prefixed with "_",
 * but not marked as protected or private, this is because our Proxy
 * trap handlers need to access these parts of the Replicant internals,
 * but don't have access to private or protected members.
 *
 * So, we code this like its 2010 and just use "_" on some public members.
 */
class AbstractReplicant extends typed_emitter_1.TypedEmitter {
    constructor(name, namespace, opts = {}) {
        super();
        this.revision = 0;
        this.status = 'undeclared';
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.validationErrors = [];
        this._operationQueue = [];
        this._pendingOperationFlush = false;
        /**
         * Used to validate the new value of a replicant.
         *
         * This is a stub that will be replaced if a Schema is available.
         */
        this.validate = () => true;
        if (!name || typeof name !== 'string') {
            throw new Error('Must supply a name when instantiating a Replicant');
        }
        if (!namespace || typeof namespace !== 'string') {
            throw new Error('Must supply a namespace when instantiating a Replicant');
        }
        if (typeof opts.persistent === 'undefined') {
            opts.persistent = true;
        }
        if (typeof opts.persistenceInterval === 'undefined') {
            opts.persistenceInterval = DEFAULT_PERSISTENCE_INTERVAL;
        }
        this.name = name;
        this.namespace = namespace;
        this.opts = opts;
        // Prevents one-time change listeners from potentially being called twice.
        // https://github.com/nodecg/nodecg/issues/296
        const originalOnce = this.once.bind(this);
        this.once = (event, listener) => {
            if (event === 'change' && this.status === 'declared') {
                listener(this.value);
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            return originalOnce(event, listener);
        };
        /**
         * When a new "change" listener is added, chances are that the developer wants it to be initialized ASAP.
         * However, if this replicant has already been declared previously in this context, their "change"
         * handler will *not* get run until another change comes in, which may never happen for Replicants
         * that change very infrequently.
         * To resolve this, we immediately invoke all new "change" handlers if appropriate.
         */
        this.on('newListener', (event, listener) => {
            if (event === 'change' && this.status === 'declared') {
                listener(this.value);
            }
        });
    }
    /**
     * If the operation is an array mutator method, call it on the target array with the operation arguments.
     * Else, handle it with objectPath.
     */
    _applyOperation(operation) {
        ignoreProxy(this);
        let result;
        const path = pathStrToPathArr(operation.path);
        if (exports.ARRAY_MUTATOR_METHODS.includes(operation.method)) {
            if (typeof this.value !== 'object' || this.value === null) {
                throw new Error(`expected replicant "${this.namespace}:${this.name}" to have a value with type "object", got "${typeof this.value}" instead`);
            }
            const arr = object_path_1.default.get(this.value, path);
            if (!Array.isArray(arr)) {
                throw new Error(`expected to find an array in replicant "${this.namespace}:${this.name}" at path "${operation.path}"`);
            }
            // eslint-disable-next-line prefer-spread
            result = arr[operation.method].apply(arr, 'args' in operation && 'mutatorArgs' in operation.args ? operation.args.mutatorArgs : []);
            // Recursively check for any objects that may have been added by the above method
            // and that need to be Proxied.
            proxyRecursive(this, arr, operation.path);
        }
        else {
            switch (operation.method) {
                case 'overwrite': {
                    const { newValue } = operation.args;
                    this[(0, utils_1.isBrowser)() ? 'value' : '_value'] = proxyRecursive(this, newValue, operation.path);
                    result = true;
                    break;
                }
                case 'add':
                case 'update': {
                    path.push(operation.args.prop);
                    let { newValue } = operation.args;
                    if (typeof newValue === 'object') {
                        newValue = proxyRecursive(this, newValue, pathArrToPathStr(path));
                    }
                    result = object_path_1.default.set(this.value, path, newValue);
                    break;
                }
                case 'delete':
                    // Workaround for https://github.com/mariocasciaro/object-path/issues/69
                    if (path.length === 0 || object_path_1.default.has(this.value, path)) {
                        const target = object_path_1.default.get(this.value, path);
                        result = delete target[operation.args.prop];
                    }
                    break;
                /* istanbul ignore next */
                default:
                    /* istanbul ignore next */
                    throw new Error(`Unexpected operation method "${operation.method}"`);
            }
        }
        resumeProxy(this);
        return result;
    }
    /**
     * Generates a JSON Schema validator function from the `schema` property of the provided replicant.
     * @param replicant {object} - The Replicant to perform the operation on.
     * @returns {function} - The generated validator function.
     */
    _generateValidator() {
        const { schema } = this;
        if (!schema) {
            throw new Error("can't generate a validator for a replicant which lacks a schema");
        }
        let validate;
        try {
            validate = (0, utils_1.compileJsonSchema)(schema);
        }
        catch (error) {
            throw new Error(`Error compiling JSON Schema for Replicant "${this.namespace}:${this.name}":\n\t${(0, utils_1.stringifyError)(error)}`);
        }
        /**
         * Validates a value against the current Replicant's schema.
         * Throws when the value fails validation.
         * @param [value=replicant.value] {*} - The value to validate. Defaults to the replicant's current value.
         * @param [opts] {Object}
         * @param [opts.throwOnInvalid = true] {Boolean} - Whether or not to immediately throw when the provided value fails validation against the schema.
         */
        return function (value = this.value, { throwOnInvalid = true } = {}) {
            const valid = validate(value);
            if (!valid) {
                this.validationErrors = validate.errors;
                if (throwOnInvalid) {
                    throw new Error(`Invalid value rejected for replicant "${this.name}" in namespace "${this.namespace}":\n${(0, utils_1.formatJsonSchemaErrors)(schema, validate.errors)}`);
                }
            }
            return valid;
        };
    }
}
exports.AbstractReplicant = AbstractReplicant;
const proxyMetadataMap = new WeakMap();
const metadataMap = new WeakMap();
const proxySet = new WeakSet();
const ignoringProxy = new WeakSet();
exports.ARRAY_MUTATOR_METHODS = [
    'copyWithin',
    'fill',
    'pop',
    'push',
    'reverse',
    'shift',
    'sort',
    'splice',
    'unshift',
];
/**
 * The default persistence interval, in milliseconds.
 */
const DEFAULT_PERSISTENCE_INTERVAL = 100;
function ignoreProxy(replicant) {
    ignoringProxy.add(replicant);
}
exports.ignoreProxy = ignoreProxy;
function resumeProxy(replicant) {
    ignoringProxy.delete(replicant);
}
exports.resumeProxy = resumeProxy;
function isIgnoringProxy(replicant) {
    return ignoringProxy.has(replicant);
}
exports.isIgnoringProxy = isIgnoringProxy;
const deleteTrap = function (target, prop) {
    const metadata = metadataMap.get(target);
    if (!metadata) {
        throw new Error('arrived at delete trap without any metadata');
    }
    const { replicant } = metadata;
    if (isIgnoringProxy(replicant)) {
        return delete target[prop];
    }
    // If the target doesn't have this prop, return true.
    if (!{}.hasOwnProperty.call(target, prop)) {
        return true;
    }
    if (replicant.schema) {
        const valueClone = (0, clone_1.default)(replicant.value);
        const targetClone = object_path_1.default.get(valueClone, pathStrToPathArr(metadata.path));
        delete targetClone[prop];
        replicant.validate(valueClone);
    }
    replicant._addOperation({ path: metadata.path, method: 'delete', args: { prop } });
    if (!(0, utils_1.isBrowser)()) {
        return delete target[prop];
    }
};
const CHILD_ARRAY_HANDLER = {
    get(target, prop) {
        const metadata = metadataMap.get(target);
        if (!metadata) {
            throw new Error('arrived at get trap without any metadata');
        }
        const { replicant } = metadata;
        if (isIgnoringProxy(replicant)) {
            return target[prop];
        }
        if ({}.hasOwnProperty.call(Array.prototype, prop) &&
            typeof Array.prototype[prop] === 'function' &&
            target[prop] === Array.prototype[prop] &&
            exports.ARRAY_MUTATOR_METHODS.includes(prop)) {
            return (...args) => {
                if (replicant.schema) {
                    const valueClone = (0, clone_1.default)(replicant.value);
                    const targetClone = object_path_1.default.get(valueClone, pathStrToPathArr(metadata.path));
                    // eslint-disable-next-line prefer-spread
                    targetClone[prop].apply(targetClone, args);
                    replicant.validate(valueClone);
                }
                if ((0, utils_1.isBrowser)()) {
                    metadata.replicant._addOperation({
                        path: metadata.path,
                        method: prop,
                        args: {
                            mutatorArgs: Array.prototype.slice.call(args),
                        },
                    });
                }
                else {
                    ignoreProxy(replicant);
                    metadata.replicant._addOperation({
                        path: metadata.path,
                        method: prop,
                        args: {
                            mutatorArgs: Array.prototype.slice.call(args),
                        },
                    });
                    const retValue = target[prop].apply(target, args);
                    resumeProxy(replicant);
                    // We have to re-proxy the target because the items could have been inserted.
                    proxyRecursive(replicant, target, metadata.path);
                    // TODO: This could leak a non-proxied object and cause bugs!
                    return retValue;
                }
            };
        }
        return target[prop];
    },
    set(target, prop, newValue) {
        if (target[prop] === newValue) {
            return true;
        }
        const metadata = metadataMap.get(target);
        if (!metadata) {
            throw new Error('arrived at set trap without any metadata');
        }
        const { replicant } = metadata;
        if (isIgnoringProxy(replicant)) {
            target[prop] = newValue;
            return true;
        }
        if (replicant.schema) {
            const valueClone = (0, clone_1.default)(replicant.value);
            const targetClone = object_path_1.default.get(valueClone, pathStrToPathArr(metadata.path));
            targetClone[prop] = newValue;
            replicant.validate(valueClone);
        }
        // It is crucial that this happen *before* the assignment below.
        if ({}.hasOwnProperty.call(target, prop)) {
            replicant._addOperation({
                path: metadata.path,
                method: 'update',
                args: {
                    prop: prop,
                    newValue,
                },
            });
        }
        else {
            replicant._addOperation({
                path: metadata.path,
                method: 'add',
                args: {
                    prop: prop,
                    newValue,
                },
            });
        }
        // If this Replicant is running in the server context, immediately apply the value.
        if (!(0, utils_1.isBrowser)()) {
            target[prop] = proxyRecursive(metadata.replicant, newValue, joinPathParts(metadata.path, prop));
        }
        return true;
    },
    deleteProperty: deleteTrap,
};
const CHILD_OBJECT_HANDLER = {
    get(target, prop) {
        const value = target[prop];
        const tag = Object.prototype.toString.call(value);
        const shouldBindProperty = prop !== 'constructor' &&
            (tag === '[object Function]' || tag === '[object AsyncFunction]' || tag === '[object GeneratorFunction]');
        if (shouldBindProperty) {
            return value.bind(target);
        }
        return value;
    },
    set(target, prop, newValue) {
        if (target[prop] === newValue) {
            return true;
        }
        const metadata = metadataMap.get(target);
        if (!metadata) {
            throw new Error('arrived at set trap without any metadata');
        }
        const { replicant } = metadata;
        if (isIgnoringProxy(replicant)) {
            target[prop] = newValue;
            return true;
        }
        if (replicant.schema) {
            const valueClone = (0, clone_1.default)(replicant.value);
            const targetClone = object_path_1.default.get(valueClone, pathStrToPathArr(metadata.path));
            targetClone[prop] = newValue;
            replicant.validate(valueClone);
        }
        // It is crucial that this happen *before* the assignment below.
        if ({}.hasOwnProperty.call(target, prop)) {
            replicant._addOperation({
                path: metadata.path,
                method: 'update',
                args: {
                    prop: prop,
                    newValue,
                },
            });
        }
        else {
            replicant._addOperation({
                path: metadata.path,
                method: 'add',
                args: {
                    prop: prop,
                    newValue,
                },
            });
        }
        // If this Replicant is running in the server context, immediately apply the value.
        if (!(0, utils_1.isBrowser)()) {
            target[prop] = proxyRecursive(metadata.replicant, newValue, joinPathParts(metadata.path, prop));
        }
        return true;
    },
    deleteProperty: deleteTrap,
};
/**
 * Recursively Proxies an Array or Object. Does nothing to primitive values.
 * @param replicant {object} - The Replicant in which to do the work.
 * @param value {*} - The value to recursively Proxy.
 * @param path {string} - The objectPath to this value.
 * @returns {*} - The recursively Proxied value (or just `value` unchanged, if `value` is a primitive)
 * @private
 */
function proxyRecursive(replicant, value, path) {
    if (typeof value === 'object' && value !== null) {
        let p;
        assertSingleOwner(replicant, value);
        // If "value" is already a Proxy, don't re-proxy it.
        if (proxySet.has(value)) {
            p = value;
            const metadata = proxyMetadataMap.get(value);
            metadata.path = path; // Update the path, as it may have changed.
        }
        else if (metadataMap.has(value)) {
            const metadata = metadataMap.get(value);
            if (!metadata) {
                throw new Error('metadata unexpectedly not found');
            }
            p = metadata.proxy;
            metadata.path = path; // Update the path, as it may have changed.
        }
        else {
            const handler = Array.isArray(value) ? CHILD_ARRAY_HANDLER : CHILD_OBJECT_HANDLER;
            p = new Proxy(value, handler);
            proxySet.add(p);
            const metadata = {
                replicant,
                path,
                proxy: p,
            };
            metadataMap.set(value, metadata);
            proxyMetadataMap.set(p, metadata);
        }
        for (const key in value) {
            /* istanbul ignore if */
            if (!{}.hasOwnProperty.call(value, key)) {
                continue;
            }
            const escapedKey = key.replace(/\//g, '~1');
            if (path) {
                const joinedPath = joinPathParts(path, escapedKey);
                value[key] = proxyRecursive(replicant, value[key], joinedPath);
            }
            else {
                value[key] = proxyRecursive(replicant, value[key], escapedKey);
            }
        }
        return p;
    }
    return value;
}
exports.proxyRecursive = proxyRecursive;
function joinPathParts(part1, part2) {
    return part1.endsWith('/') ? `${part1}${part2}` : `${part1}/${part2}`;
}
/**
 * Converts a string path (/a/b/c) to an array path ['a', 'b', 'c']
 * @param path {String} - The path to convert.
 * @returns {Array} - The converted path.
 */
function pathStrToPathArr(path) {
    const pathArr = path
        .substr(1)
        .split('/')
        .map((part) => 
    // De-tokenize '/' characters in path name
    part.replace(/~1/g, '/'));
    // For some reason, path arrays whose only item is an empty string cause errors.
    // In this case, we replace the path with an empty array, which seems to be fine.
    if (pathArr.length === 1 && pathArr[0] === '') {
        return [];
    }
    return pathArr;
}
/**
 * Converts an array path ['a', 'b', 'c'] to a string path /a/b/c)
 * @param path {Array} - The path to convert.
 * @returns {String} - The converted path.
 */
function pathArrToPathStr(path) {
    const strPath = path.join('/');
    if (!strPath.startsWith('/')) {
        return `/${strPath}`;
    }
    return strPath;
}
/**
 * Throws an exception if an object belongs to more than one Replicant.
 * @param replicant {object} - The Replicant that this value should belong to.
 * @param value {*} - The value to check ownership of.
 */
function assertSingleOwner(replicant, value) {
    let metadata;
    if (proxySet.has(value)) {
        metadata = proxyMetadataMap.get(value);
    }
    else if (metadataMap.has(value)) {
        metadata = metadataMap.get(value);
    }
    else {
        // If there's no metadata for this value, then it doesn't belong to any Replicants yet,
        // and we're okay to continue.
        return;
    }
    if (metadata.replicant !== replicant) {
        throw new Error(`This object belongs to another Replicant, ${metadata.replicant.namespace}::${metadata.replicant.name}.` +
            `\nA given object cannot belong to multiple Replicants. Object value:\n${JSON.stringify(value, null, 2)}`);
    }
}


/***/ }),

/***/ "./src/shared/typed-emitter.ts":
/*!*************************************!*\
  !*** ./src/shared/typed-emitter.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypedEmitter = void 0;
// Native
const events_1 = __webpack_require__(/*! events */ "events");
class TypedEmitter {
    constructor() {
        this._emitter = new events_1.EventEmitter();
        // We intentionally don't expose removeAllListeners because it would break Replicants when used.
    }
    addListener(eventName, fn) {
        this._emitter.addListener(eventName, fn);
    }
    on(eventName, fn) {
        this._emitter.on(eventName, fn);
    }
    off(eventName, fn) {
        this._emitter.off(eventName, fn);
    }
    removeListener(eventName, fn) {
        this._emitter.removeListener(eventName, fn);
    }
    emit(eventName, ...params) {
        this._emitter.emit(eventName, ...params);
    }
    once(eventName, fn) {
        this._emitter.once(eventName, fn);
    }
    setMaxListeners(max) {
        this._emitter.setMaxListeners(max);
    }
    listenerCount(eventName) {
        return this._emitter.listenerCount(eventName);
    }
    listeners(eventName) {
        return this._emitter.listeners(eventName);
    }
}
exports.TypedEmitter = TypedEmitter;


/***/ }),

/***/ "./src/shared/utils/compileJsonSchema.ts":
/*!***********************************************!*\
  !*** ./src/shared/utils/compileJsonSchema.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSchemaDefault = exports.formatJsonSchemaErrors = exports.compileJsonSchema = void 0;
// Packages
const ajv_1 = __importDefault(__webpack_require__(/*! ajv */ "ajv"));
const ajv_draft_04_1 = __importDefault(__webpack_require__(/*! ajv-draft-04 */ "ajv-draft-04"));
const _2019_1 = __importDefault(__webpack_require__(/*! ajv/dist/2019 */ "ajv/dist/2019"));
const _2020_1 = __importDefault(__webpack_require__(/*! ajv/dist/2020 */ "ajv/dist/2020"));
const ajv_formats_1 = __importDefault(__webpack_require__(/*! ajv-formats */ "ajv-formats"));
const json_schema_defaults_1 = __importDefault(__webpack_require__(/*! @nodecg/json-schema-defaults */ "@nodecg/json-schema-defaults"));
const _1 = __webpack_require__(/*! . */ "./src/shared/utils/index.ts");
const options = {
    allErrors: true,
    verbose: true,
    strict: undefined,
    strictSchema: true,
    strictNumbers: true,
    strictTypes: true,
    strictTuples: true,
    strictRequired: false,
};
const ajv = {
    draft04: (0, ajv_formats_1.default)(new ajv_draft_04_1.default(options)),
    draft07: (0, ajv_formats_1.default)(new ajv_1.default(options)),
    'draft2019-09': (0, ajv_formats_1.default)(new _2019_1.default(options)),
    'draft2020-12': (0, ajv_formats_1.default)(new _2020_1.default(options)),
};
function compileJsonSchema(schema) {
    const schemaVersion = extractSchemaVersion(schema);
    if (schemaVersion.includes('draft-04')) {
        return ajv.draft04.compile(schema);
    }
    if (schemaVersion.includes('draft-07')) {
        return ajv.draft07.compile(schema);
    }
    if (schemaVersion.includes('draft-2019-09')) {
        return ajv['draft2019-09'].compile(schema);
    }
    if (schemaVersion.includes('draft-2020-12')) {
        return ajv['draft2020-12'].compile(schema);
    }
    throw new Error(`Unsupported JSON Schema version "${schemaVersion}"`);
}
exports.compileJsonSchema = compileJsonSchema;
// eslint-disable-next-line @typescript-eslint/ban-types
function formatJsonSchemaErrors(schema, errors) {
    const schemaVersion = extractSchemaVersion(schema);
    if (schemaVersion.includes('draft-04')) {
        return ajv.draft04.errorsText(errors).replace(/^data\//gm, '');
    }
    if (schemaVersion.includes('draft-07')) {
        return ajv.draft07.errorsText(errors).replace(/^data\//gm, '');
    }
    if (schemaVersion.includes('draft-2019-09')) {
        return ajv['draft2019-09'].errorsText(errors).replace(/^data\//gm, '');
    }
    if (schemaVersion.includes('draft-2020-12')) {
        return ajv['draft2020-12'].errorsText(errors).replace(/^data\//gm, '');
    }
    throw new Error(`Unsupported JSON Schema version "${schemaVersion}"`);
}
exports.formatJsonSchemaErrors = formatJsonSchemaErrors;
function getSchemaDefault(schema, labelForDebugging) {
    try {
        return (0, json_schema_defaults_1.default)(schema);
    }
    catch (error) {
        throw new Error(`Error generating default value(s) for schema "${labelForDebugging}":\n\t${(0, _1.stringifyError)(error)}`);
    }
}
exports.getSchemaDefault = getSchemaDefault;
function extractSchemaVersion(schema) {
    // For backwards compat, we default to draft-04.
    const defaultVersion = 'https://json-schema.org/draft-04/schema';
    const extractedVersion = schema.$schema;
    return typeof extractedVersion === 'string' ? extractedVersion : defaultVersion;
}


/***/ }),

/***/ "./src/shared/utils/index.ts":
/*!***********************************!*\
  !*** ./src/shared/utils/index.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isBrowser = exports.stringifyErrorInner = exports.stringifyError = void 0;
__exportStar(__webpack_require__(/*! ./compileJsonSchema */ "./src/shared/utils/compileJsonSchema.ts"), exports);
/**
 * Make a string out of an error (or other equivalents),
 * including any additional data such as stack trace if available.
 * Safe to use on unknown inputs.
 */
function stringifyError(error, noStack = false) {
    const o = stringifyErrorInner(error);
    if (noStack || !o.stack) {
        return o.message;
    }
    return `${o.message}, ${o.stack}`;
}
exports.stringifyError = stringifyError;
function stringifyErrorInner(error) {
    let message;
    let stack;
    if (typeof error === 'string') {
        message = error;
    }
    else if (error === null) {
        message = 'null';
    }
    else if (error === undefined) {
        message = 'undefined';
    }
    else if (error && typeof error === 'object') {
        if (typeof error.error === 'object' && error.error.message) {
            message = error.error.message;
            stack = error.error.stack;
        }
        else if (error.reason) {
            if (error.reason.message) {
                message = error.reason.message;
                stack = error.reason.stack || error.reason.reason;
            }
            else {
                // Is a Meteor.Error
                message = error.reason;
                stack = error.stack;
            }
        }
        else if (error.message) {
            // Is an Error
            message = error.message;
            stack = error.stack;
        }
        else if (error.details) {
            message = error.details;
        }
        else {
            try {
                // Try to stringify the object:
                message = JSON.stringify(error);
            }
            catch (e) {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                message = `${error} (stringifyError: ${e})`;
            }
        }
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        message = `${error}`;
    }
    message = `${message}`;
    return {
        message,
        stack,
    };
}
exports.stringifyErrorInner = stringifyErrorInner;
function isBrowser() {
    return typeof globalThis.window !== 'undefined';
}
exports.isBrowser = isBrowser;


/***/ }),

/***/ "./src/shared/utils/rootPath.ts":
/*!**************************************!*\
  !*** ./src/shared/utils/rootPath.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const rootPath = {
    path: findRootPath(__dirname),
};
function findRootPath(dir) {
    const filePath = path_1.default.join(dir, 'package.json');
    if (fs_1.default.existsSync(filePath)) {
        return path_1.default.dirname(filePath);
    }
    const parentDir = path_1.default.dirname(dir);
    if (dir === parentDir) {
        return '';
    }
    return findRootPath(parentDir);
}
exports["default"] = rootPath;


/***/ }),

/***/ "./src/types/socket-protocol.ts":
/*!**************************************!*\
  !*** ./src/types/socket-protocol.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnAuthErrCode = void 0;
var UnAuthErrCode;
(function (UnAuthErrCode) {
    UnAuthErrCode["CredentialsBadFormat"] = "credentials_bad_format";
    UnAuthErrCode["CredentialsRequired"] = "credentials_required";
    UnAuthErrCode["InternalError"] = "internal_error";
    UnAuthErrCode["InvalidToken"] = "invalid_token";
    UnAuthErrCode["TokenRevoked"] = "token_invalidated";
    UnAuthErrCode["InvalidSession"] = "invalid_session";
})(UnAuthErrCode = exports.UnAuthErrCode || (exports.UnAuthErrCode = {}));


/***/ }),

/***/ "./src/server/server sync recursive":
/*!*********************************!*\
  !*** ./src/server/server/ sync ***!
  \*********************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "./src/server/server sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "@nodecg/json-schema-defaults":
/*!***********************************************!*\
  !*** external "@nodecg/json-schema-defaults" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@nodecg/json-schema-defaults");

/***/ }),

/***/ "@sentry/node":
/*!*******************************!*\
  !*** external "@sentry/node" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("@sentry/node");

/***/ }),

/***/ "ajv":
/*!**********************!*\
  !*** external "ajv" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("ajv");

/***/ }),

/***/ "ajv-draft-04":
/*!*******************************!*\
  !*** external "ajv-draft-04" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("ajv-draft-04");

/***/ }),

/***/ "ajv-formats":
/*!******************************!*\
  !*** external "ajv-formats" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("ajv-formats");

/***/ }),

/***/ "ajv/dist/2019":
/*!********************************!*\
  !*** external "ajv/dist/2019" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("ajv/dist/2019");

/***/ }),

/***/ "ajv/dist/2020":
/*!********************************!*\
  !*** external "ajv/dist/2020" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("ajv/dist/2020");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("body-parser");

/***/ }),

/***/ "cheerio":
/*!**************************!*\
  !*** external "cheerio" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("cheerio");

/***/ }),

/***/ "chokidar":
/*!***************************!*\
  !*** external "chokidar" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("chokidar");

/***/ }),

/***/ "clone":
/*!************************!*\
  !*** external "clone" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("clone");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("compression");

/***/ }),

/***/ "connect-typeorm":
/*!**********************************!*\
  !*** external "connect-typeorm" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("connect-typeorm");

/***/ }),

/***/ "cookie-parser":
/*!********************************!*\
  !*** external "cookie-parser" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("cookie-parser");

/***/ }),

/***/ "cosmiconfig":
/*!******************************!*\
  !*** external "cosmiconfig" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("cosmiconfig");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ "express-session":
/*!**********************************!*\
  !*** external "express-session" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("express-session");

/***/ }),

/***/ "express-transform-bare-module-specifiers":
/*!***********************************************************!*\
  !*** external "express-transform-bare-module-specifiers" ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("express-transform-bare-module-specifiers");

/***/ }),

/***/ "extend":
/*!*************************!*\
  !*** external "extend" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("extend");

/***/ }),

/***/ "fast-memoize":
/*!*******************************!*\
  !*** external "fast-memoize" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("fast-memoize");

/***/ }),

/***/ "fs-extra":
/*!***************************!*\
  !*** external "fs-extra" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("fs-extra");

/***/ }),

/***/ "git-rev-sync":
/*!*******************************!*\
  !*** external "git-rev-sync" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("git-rev-sync");

/***/ }),

/***/ "httpolyglot":
/*!******************************!*\
  !*** external "httpolyglot" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("httpolyglot");

/***/ }),

/***/ "is-error":
/*!***************************!*\
  !*** external "is-error" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("is-error");

/***/ }),

/***/ "joi":
/*!**********************!*\
  !*** external "joi" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("joi");

/***/ }),

/***/ "json-ptr":
/*!***************************!*\
  !*** external "json-ptr" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("json-ptr");

/***/ }),

/***/ "json-schema-lib":
/*!**********************************!*\
  !*** external "json-schema-lib" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("json-schema-lib");

/***/ }),

/***/ "json-schema-lib/lib/util/stripHash":
/*!*****************************************************!*\
  !*** external "json-schema-lib/lib/util/stripHash" ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("json-schema-lib/lib/util/stripHash");

/***/ }),

/***/ "json-schema-lib/lib/util/typeOf":
/*!**************************************************!*\
  !*** external "json-schema-lib/lib/util/typeOf" ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("json-schema-lib/lib/util/typeOf");

/***/ }),

/***/ "lodash.debounce":
/*!**********************************!*\
  !*** external "lodash.debounce" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash.debounce");

/***/ }),

/***/ "lodash.template":
/*!**********************************!*\
  !*** external "lodash.template" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash.template");

/***/ }),

/***/ "multer":
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("multer");

/***/ }),

/***/ "node-fetch-commonjs":
/*!**************************************!*\
  !*** external "node-fetch-commonjs" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node-fetch-commonjs");

/***/ }),

/***/ "object-path":
/*!******************************!*\
  !*** external "object-path" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("object-path");

/***/ }),

/***/ "passport":
/*!***************************!*\
  !*** external "passport" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("passport");

/***/ }),

/***/ "passport-discord":
/*!***********************************!*\
  !*** external "passport-discord" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("passport-discord");

/***/ }),

/***/ "passport-local":
/*!*********************************!*\
  !*** external "passport-local" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("passport-local");

/***/ }),

/***/ "passport-steam":
/*!*********************************!*\
  !*** external "passport-steam" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("passport-steam");

/***/ }),

/***/ "passport-twitch-helix":
/*!****************************************!*\
  !*** external "passport-twitch-helix" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("passport-twitch-helix");

/***/ }),

/***/ "reflect-metadata":
/*!***********************************!*\
  !*** external "reflect-metadata" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("reflect-metadata");

/***/ }),

/***/ "semver":
/*!*************************!*\
  !*** external "semver" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("semver");

/***/ }),

/***/ "serialize-error":
/*!**********************************!*\
  !*** external "serialize-error" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("serialize-error");

/***/ }),

/***/ "sha1":
/*!***********************!*\
  !*** external "sha1" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("sha1");

/***/ }),

/***/ "sha1-file":
/*!****************************!*\
  !*** external "sha1-file" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("sha1-file");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("socket.io");

/***/ }),

/***/ "typeorm":
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("typeorm");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("uuid");

/***/ }),

/***/ "winston":
/*!**************************!*\
  !*** external "winston" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("winston");

/***/ }),

/***/ "yargs":
/*!************************!*\
  !*** external "yargs" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("yargs");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"nodecg","description":"Dynamic broadcast graphics rendered in a browser","main":"index.js","version":"2.1.7","repository":{"type":"git","url":"https://github.com/nodecg/nodecg.git"},"bugs":"https://github.com/nodecg/nodecg/issues","homepage":"https://nodecg.dev/","license":"MIT","keywords":["graphics","nodecg","node","dynamic","broadcast"],"sideEffects":false,"dependencies":{"@nodecg/json-schema-defaults":"^1.0.4","@polymer/app-layout":"^3.0.0","@polymer/app-route":"^3.0.0","@polymer/iron-collapse":"^3.0.0","@polymer/iron-flex-layout":"^3.0.0","@polymer/iron-icons":"^3.0.0","@polymer/iron-image":"^3.0.0","@polymer/iron-localstorage":"^3.0.0","@polymer/iron-pages":"^3.0.0","@polymer/iron-selector":"^3.0.0","@polymer/paper-button":"^3.0.0","@polymer/paper-card":"^3.0.0","@polymer/paper-dialog":"^3.0.0","@polymer/paper-dialog-behavior":"^3.0.0","@polymer/paper-dialog-scrollable":"^3.0.0","@polymer/paper-icon-button":"^3.0.0","@polymer/paper-item":"^3.0.0","@polymer/paper-slider":"^3.0.0","@polymer/paper-spinner":"^3.0.0","@polymer/paper-styles":"^3.0.0","@polymer/paper-tabs":"^3.0.0","@polymer/paper-toast":"^3.0.0","@polymer/paper-toolbar":"^3.0.0","@polymer/polymer":"^3.0.0","@sentry/browser":"^7.21.1","@sentry/node":"^7.21.1","@vaadin/vaadin-upload":"^4.2.2","@webcomponents/webcomponentsjs":"^2.2.10","ajv":"^8.11.2","ajv-draft-04":"^1.0.0","ajv-formats":"^2.1.1","app-root-path":"^3.0.0","better-sqlite3":"^8.0.1","body-parser":"^1.18.3","cheerio":"^1.0.0-rc.2","chokidar":"^3.3.1","clipboard":"^2.0.4","clone":"^2.1.2","compression":"^1.7.4","connect-typeorm":"^2.0.0","cookie-parser":"^1.4.5","cookies-js":"^1.2.3","copy-webpack-plugin":"^11.0.0","cosmiconfig":"^8.0.0","deep-equal":"^2.1.0","draggabilly":"^2.4.1","express":"^4.17.1","express-session":"^1.17.0","express-transform-bare-module-specifiers":"^1.0.4","extend":"^3.0.2","fast-memoize":"^2.5.1","fp-ts":"^2.1.2","fs-extra":"^10.1.0","git-rev-sync":"^3.0.2","httpolyglot":"^0.1.2","iframe-resizer":"^4.1.1","io-ts":"^2.0.1","is-error":"^2.2.2","joi":"^17.7.0","json-ptr":"^3.1.1","json-schema-lib":"github:nodecg/json-schema-lib#dcb89d670c2b15cd398916209bb806b2e100f95f","lodash.debounce":"^4.0.8","lodash.template":"^4.4.0","multer":"^1.4.5-lts.1","node-fetch-commonjs":"^3.2.4","object-path":"^0.11.5","packery":"^2.1.2","passport":"^0.6.0","passport-discord":"^0.1.4","passport-local":"^1.0.0","passport-steam":"^1.0.10","passport-twitch-helix":"^1.1.0","process":"^0.11.10","semver":"^7.3.8","serialize-error":"^8.1.0","sha1":"^1.1.1","sha1-file":"^2.0.1","socket.io":"^4.5.4","socket.io-client":"^4.5.4","soundjs":"^1.0.1","tslib":"^2.4.1","typeorm":"0.3.11","util":"^0.12.5","uuid":"^9.0.0","webpack-node-externals":"^3.0.0","winston":"^3.8.2","yargs":"^15.3.1"},"scripts":{"prepare":"(npm ls husky && husky install) || echo \\"Skipping husky.\\"","start":"node index.js","dev":"concurrently --kill-others \\"npm run build:watch:browser\\" \\"nodemon\\"","pretest":"trash .nyc_output coverage","test":"nyc --instrument=false --reporter=none ava --config ava.config.js && nyc report --reporter=html --reporter=text --include=\\"src/**\\"","test:debug":"ava --config ava.config.js --verbose -- --debug-tests","test:no-coverage":"ava --config ava.config.js","test:types":"cd typetest/fake-bundle && npm run build","report-coverage":"nyc report --reporter=text-lcov --include=\\"src/**\\" > coverage.lcov && codecov","lint":"npm-run-all -s lint:*","lint:prettier":"prettier --check \\"**/*.{json,md,yml,ts,tsx,js,jsx}\\"","lint:eslint":"eslint \\"{src,test}/**/*.ts\\"","fix":"npm-run-all -s fix:*","fix:prettier":"prettier --write \\"**/*.{json,md,yml,ts,tsx,js,jsx}\\"","fix:eslint":"npm run lint:eslint -- --fix ","prebuild":"trash build && trash build-types","build":"cross-env TS_NODE_PROJECT=build-tools/tsconfig.json NODE_ENV=development webpack --progress --color --config build-tools/webpack.config.ts","pregenerate-types-package":"trash generated-types","generate-types-package":"cross-env TS_NODE_PROJECT=build-tools/tsconfig.json ts-node build-tools/generate-typings-package.ts","build:watch:browser":"cross-env TS_NODE_PROJECT=build-tools/tsconfig.json NODE_ENV=development webpack --color --config build-tools/webpack.config.ts --watch --env skipServer --env skipTypeORM","build:server":"cross-env TS_NODE_PROJECT=build-tools/tsconfig.json NODE_ENV=development webpack --color --config build-tools/webpack.config.ts --env skipBrowser","instrument":"cross-env NODECG_INSTRUMENT=true npm run build","postinstrument":"node test/helpers/retarget-browser-coverage.js","prerelease":"npm t","release":"standard-version","postrelease":"npm publish && git push --follow-tags","generate-migrations":"cd src/server && typeorm-ts-node-commonjs migration:generate ./database/migration/rename-me -d ./database/datasource.ts","predev":"trash build && trash build-types","postinstall":"node scripts/warn-engines.js"},"files":["build","scripts","bundles/.empty_directory","db/.empty_directory","schemas","AUTHORS"],"devDependencies":{"@babel/core":"^7.20.2","@babel/preset-env":"^7.20.2","@ephesoft/webpack.istanbul.loader":"^2.2.0","@istanbuljs/nyc-config-typescript":"^1.0.2","@semantic-release/changelog":"^6.0.1","@semantic-release/git":"^10.0.1","@types/app-root-path":"^1.2.4","@types/cheerio":"^0.22.16","@types/clone":"^2.1.1","@types/compression":"^1.7.0","@types/cookie-parser":"^1.4.2","@types/deep-equal":"^1.0.1","@types/express":"^4.17.4","@types/express-session":"^1.17.0","@types/extend":"^3.0.1","@types/fs-extra":"^9.0.13","@types/git-rev-sync":"^2.0.0","@types/glob":"^8.0.0","@types/is-ci":"^3.0.0","@types/lodash.debounce":"^4.0.6","@types/lodash.template":"^4.4.6","@types/make-fetch-happen":"^10.0.0","@types/multer":"^1.4.2","@types/node":"^18.11.9","@types/object-path":"^0.11.0","@types/passport":"^1.0.3","@types/passport-local":"^1.0.33","@types/passport-steam":"^1.0.1","@types/semver":"^7.1.0","@types/sha1":"^1.1.2","@types/sinon":"^10.0.13","@types/soundjs":"^0.6.27","@types/uuid":"^8.3.4","@types/webpack":"^5.28.0","@types/webpack-node-externals":"^2.5.3","@types/yargs":"^15.0.0","@typescript-eslint/eslint-plugin":"^5.44.0","@typescript-eslint/parser":"^5.44.0","ava":"^5.2.0","babel-loader":"^9.1.0","concurrently":"^7.6.0","cpy":"8","cross-env":"^7.0.2","eslint":"^8.28.0","eslint-config-prettier":"^8.5.0","eslint-config-xo":"^0.43.1","eslint-config-xo-typescript":"^0.55.0","eslint-plugin-ava":"^13.2.0","fork-ts-checker-webpack-plugin":"^7.2.13","husky":"^8.0.2","is-builtin-module":"^3.2.0","is-ci":"^3.0.1","is-windows":"^1.0.2","lint-staged":"^13.0.4","nodemon":"^2.0.20","npm-run-all":"^4.1.5","nyc":"^15.1.0","prettier":"^2.8.0","puppeteer":"^19.3.0","replace-in-file":"^6.3.5","semantic-release":"^19.0.5","simple-git":"^3.15.0","sinon":"^14.0.2","standard-version":"^9.0.0","tmp-promise":"^3.0.3","trash-cli":"^5.0.0","ts-essentials":"^9.3.0","ts-loader":"^9.4.1","ts-node":"^10.9.1","typescript":"~4.9.3","webpack":"^5.75.0","webpack-cli":"^5.0.0"},"browserslist":["last 2 chrome versions","last 2 firefox versions","last 2 safari versions","last 2 edge versions"],"lint-staged":{"*.{json,md,yml}":["prettier --write"],"{src,test}/**/*.{ts}":["eslint --fix","prettier --write"]}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/server/bootstrap.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=server.js.map