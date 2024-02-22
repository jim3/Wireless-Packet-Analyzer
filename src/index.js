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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var axios_1 = require("axios");
var dotenv = require("dotenv");
var mqtt_1 = require("mqtt");
dotenv.config();
var username = process.env.USERNAME;
var password = process.env.PASSWORD;
var server = process.env.SERVER;
var port = process.env.PORT;
var url = "http://".concat(username, ":").concat(password, "@").concat(server, ":").concat(port);
// URI paths
var rfsensor = "/devices/views/phy-RFSENSOR/devices.json";
var accesspoints = "/devices/views/phydot11_accesspoints/devices.json";
var bluetooth = "/devices/views/phy-BLUETOOTH/devices.json";
var macaddr = "/devices/by-mac/{MACADDRESS}/devices.json.json";
var macaddrRange = "/devices/by-mac/02:10:18:00:00:00/ff:ff:ff:00:00:00/devices.json.json";
// -------------------------------------------------------- //
var getRFSensors = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, arr, _i, data_1, d, manufacturer, macaddr_1, frequency, last_time;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get("".concat(url).concat(rfsensor))];
            case 1:
                response = _a.sent();
                data = response.data;
                arr = [];
                try {
                    for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                        d = data_1[_i];
                        if (d !== null) {
                            manufacturer = d["kismet.device.base.name"] || "";
                            macaddr_1 = d["kismet.device.base.macaddr"] || "";
                            frequency = d["kismet.device.base.frequency"] || "";
                            last_time = d["kismet.device.base.last_time"] || "";
                            arr.push({ manufacturer: manufacturer, macaddr: macaddr_1, frequency: frequency, last_time: last_time });
                        }
                    }
                }
                catch (error) {
                    console.error("Error fetching RF sensors:", error);
                }
                return [2 /*return*/, arr];
        }
    });
}); };
// -------------------------------------------------------- //
var getRelatedClients = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, clients, _i, data_2, d, deviceKey, ssid, response_1, relatedClients, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get("".concat(url).concat(accesspoints))];
            case 1:
                response = _a.sent();
                data = response.data;
                clients = {};
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 8]);
                _i = 0, data_2 = data;
                _a.label = 3;
            case 3:
                if (!(_i < data_2.length)) return [3 /*break*/, 6];
                d = data_2[_i];
                if (!(d !== null)) return [3 /*break*/, 5];
                deviceKey = d["kismet.device.base.key"] || "";
                ssid = d["kismet.device.base.name"] || "";
                if (!(deviceKey && ssid)) return [3 /*break*/, 5];
                return [4 /*yield*/, axios_1.default.get("".concat(url, "/phy/phy80211/related-to/").concat(deviceKey, "/devices.json") // get related clients
                    )];
            case 4:
                response_1 = _a.sent();
                relatedClients = response_1.data;
                clients[ssid] = relatedClients;
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.error("Error fetching access points:", error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/, clients];
        }
    });
}); };
// -------------------------------------------------------- //
// const getMacAddrRange = async () => {
//     const response = await axios.get(`${url}${macaddrRange}`);
//     console.log(response.data);
// };
// -------------------------------------------------------- //
var getBluetoothDevices = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, arr, _i, data_3, d, macaddr_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get("".concat(url).concat(bluetooth))];
            case 1:
                response = _a.sent();
                data = response.data;
                arr = {};
                try {
                    for (_i = 0, data_3 = data; _i < data_3.length; _i++) {
                        d = data_3[_i];
                        if (d !== null) {
                            macaddr_2 = d["kismet.device.base.macaddr"] || "";
                            // let deviceName = d[""]; // TODO: get device name
                            // arr[macaddr] = deviceName; // Add to the array
                        }
                    }
                }
                catch (error) {
                    console.error("Error fetching bluetooth devices:", error);
                }
                return [2 /*return*/, arr];
        }
    });
}); };
// -------------------------------------------------------- //
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        var _this = this;
        return __generator(this, function (_a) {
            client = mqtt_1.default.connect("mqtt://localhost:1883");
            client.on("connect", function () { return __awaiter(_this, void 0, void 0, function () {
                var sensors, _i, sensors_1, s, topic, payload, clients, ssid, relatedClients, _a, relatedClients_1, c, macaddr_3, deviceName, last_time, topic, payload;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            console.log("Connected to MQTT broker");
                            return [4 /*yield*/, getRFSensors()];
                        case 1:
                            sensors = _b.sent();
                            for (_i = 0, sensors_1 = sensors; _i < sensors_1.length; _i++) {
                                s = sensors_1[_i];
                                topic = "kismet/sensors/".concat(s.frequency);
                                payload = JSON.stringify(s);
                                client.publish(topic, payload); // Publish sensor data to the broker
                            }
                            return [4 /*yield*/, getRelatedClients()];
                        case 2:
                            clients = _b.sent();
                            for (ssid in clients) {
                                if (clients.hasOwnProperty(ssid)) {
                                    relatedClients = clients[ssid];
                                    // console.log({ ssid, relatedClients });
                                    for (_a = 0, relatedClients_1 = relatedClients; _a < relatedClients_1.length; _a++) {
                                        c = relatedClients_1[_a];
                                        macaddr_3 = c["kismet.device.base.macaddr"] || "";
                                        deviceName = c["kismet.device.base.manuf"] || "";
                                        last_time = c["kismet.device.base.last_time"] || "";
                                        topic = "kismet/clients/".concat(ssid, "/").concat(macaddr_3);
                                        payload = JSON.stringify({
                                            ssid: ssid,
                                            macaddr: macaddr_3,
                                            deviceName: deviceName,
                                            last_time: last_time,
                                        });
                                        client.publish(topic, payload); // Publish client data to the broker
                                    }
                                }
                            }
                            client.end(); // Disconnect from the broker
                            return [2 /*return*/];
                    }
                });
            }); });
            client.on("error", function (error) {
                console.error("MQTT error:", error);
            });
            return [2 /*return*/];
        });
    });
}
// -------------------------------------------------------- //
main();
