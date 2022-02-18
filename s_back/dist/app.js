"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
require("colors");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const bodyParser = __importStar(require("body-parser"));
class App {
    constructor(controllers, middlewares = []) {
        this.middlewares = [
            helmet_1.default(),
            //cors({origin:process.env.FRONT_HOST||''}),
            cors_1.default(),
            bodyParser.urlencoded({ extended: true }),
            bodyParser.json(),
        ];
        this.app = express_1.default();
        // initialize all given middlewares
        middlewares.forEach((middleware) => this.middlewares.push(middleware));
        this.initializeMiddlewares();
        // initialize the controllers
        this.initializeControllers(controllers);
        // serve public static files //sert les fichiers du front au client
        // used in prod
        this.app.use("/", express_1.default.static('public', { maxAge: '48h' }));
        this.app.use('*', express_1.default.static('public', { maxAge: '48h' }));
    }
    initializeMiddlewares() {
        this.middlewares.forEach((middleware) => this.app.use(middleware));
    }
    initializeControllers(controllers) {
        controllers.forEach(controller => this.app.use('/', controller.router));
    }
    /**
     *
     * @param port .env.PORT OR 3000 by default
     */
    start(port = process.env.PORT || 3000) {
        this.app.listen(port, () => console.log(`Listenning on ${port}`.blue));
    }
}
exports.App = App;
