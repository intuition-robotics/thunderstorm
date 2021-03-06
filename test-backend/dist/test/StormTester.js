"use strict";
/*
 * Thunderstorm is a full web app framework!
 *
 * Typescript & Express backend infrastructure that natively runs on firebase function
 * Typescript & React frontend infrastructure
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StormTester = void 0;
var backend_1 = require("@intuitionrobotics/firebase/backend");
var ts_common_1 = require("@intuitionrobotics/ts-common");
var backend_functions_1 = require("@intuitionrobotics/firebase/backend-functions");
var BaseStorm_1 = require("@intuitionrobotics/thunderstorm/app-backend/core/BaseStorm");
var backend_2 = require("@intuitionrobotics/thunderstorm/backend");
var testelot_1 = require("@intuitionrobotics/testelot");
var modules = [
    backend_2.HttpServer,
    backend_1.FirebaseModule,
];
var StormTester = /** @class */ (function (_super) {
    __extends(StormTester, _super);
    function StormTester() {
        var _this = _super.call(this) || this;
        _this.reporter = new testelot_1.Reporter();
        _this.addModules.apply(_this, modules);
        ts_common_1.BeLogged.addClient(ts_common_1.LogClient_Terminal);
        return _this;
    }
    StormTester.prototype.setScenario = function (scenario) {
        this.scenario = scenario;
        return this;
    };
    StormTester.prototype.build = function () {
        var _this = this;
        this.function = new backend_functions_1.Firebase_ExpressFunction(backend_2.HttpServer.express);
        var pwd = process.env.PWD;
        var packageName;
        if (pwd)
            packageName = pwd.substring(pwd.lastIndexOf("/") + 1);
        this.startServerImpl()
            .then(function () {
            var errorCount = _this.reporter.summary.Error;
            if (errorCount > 0) {
                _this.logError("Package: " + packageName + " - Tests ended with " + errorCount + " " + (errorCount === 1 ? "error" : "errors"));
                process.exit(2);
            }
            _this.logInfo("Package: " + packageName + " - Tests completed successfully");
            process.exit(0);
        })
            .catch(function (reason) {
            _this.logError("Package: " + packageName + " - Tests failed", reason);
            process.exit(3);
        });
        return { test: this.function.getFunction() };
    };
    StormTester.prototype.startServerImpl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scenario;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.scenario)
                            throw new ts_common_1.ImplementationMissingException("No test specified!!");
                        return [4 /*yield*/, this.resolveConfig()];
                    case 1:
                        _a.sent();
                        this.init();
                        return [4 /*yield*/, backend_2.HttpServer.startServer()];
                    case 2:
                        _a.sent();
                        this.reporter.init();
                        scenario = testelot_1.__scenario("root", this.reporter);
                        scenario.add(this.scenario);
                        return [4 /*yield*/, scenario.run()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, backend_2.HttpServer.terminate()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return StormTester;
}(BaseStorm_1.BaseStorm));
exports.StormTester = StormTester;
//# sourceMappingURL=StormTester.js.map
