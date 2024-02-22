import axios from "axios";
import * as dotenv from "dotenv";
import mqtt from "mqtt";

dotenv.config();
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const server = process.env.SERVER;
const port = process.env.PORT;
const url = `http://${username}:${password}@${server}:${port}`;
const rfsensor = "/devices/views/phy-RFSENSOR/devices.json";
const accesspoints = "/devices/views/phydot11_accesspoints/devices.json";

// Interface for SensorData objects
interface SensorData {
    manufacturer: string;
    macaddr: string;
    frequency: string | number;
    last_time: string | number;
}

// Interface for Client objects
interface Clients {
    [ssid: string]: (string | number)[];
}

// -------------------------------------------------------- //

const getRFSensors = async (): Promise<SensorData[]> => {
    const response = await axios.get(`${url}${rfsensor}`);
    const data = response.data;
    let arr: SensorData[] = [];
    try {
        for (let d of data) {
            if (d !== null) {
                let manufacturer = d["kismet.device.base.name"] || "";
                let macaddr = d["kismet.device.base.macaddr"] || "";
                let frequency = d["kismet.device.base.frequency"] || "";
                let last_time = d["kismet.device.base.last_time"] || "";
                arr.push({ manufacturer, macaddr, frequency, last_time });
            }
        }
    } catch (error) {
        console.error("Error fetching RF sensors:", error);
    }
    return arr;
};

// -------------------------------------------------------- //

const getRelatedClients = async (): Promise<Clients> => {
    const response = await axios.get(`${url}${accesspoints}`);
    let data = response.data;
    const clients = {};
    try {
        for (const d of data) {
            if (d !== null) {
                const deviceKey = d["kismet.device.base.key"] || "";
                const ssid = d["kismet.device.base.name"] || "";
                if (deviceKey && ssid) {
                    const response = await axios.get(
                        `${url}/phy/phy80211/related-to/${deviceKey}/devices.json` // get related clients
                    );
                    const relatedClients = response.data;
                    clients[ssid] = relatedClients;
                }
            }
        }
    } catch (error) {
        console.error("Error fetching access points:", error);
    }
    return clients;
};

// -------------------------------------------------------- //

async function main() {
    // Create a new MQTT client and connect to the broker
    const client = mqtt.connect("mqtt://localhost:1883");
    client.on("connect", async () => {
        console.log("Connected to MQTT broker");

        // Get sensor data
        const sensors = await getRFSensors(); // -> Promise<SensorData[]>
        for (const s of sensors) {
            // Create a mqtt topic
            const topic = `kismet/sensors/${s.frequency}`;
            const payload = JSON.stringify(s);
            // Publish sensor data to the broker
            client.publish(topic, payload);
        }

        // Get wifi clients
        const clients = await getRelatedClients(); // -> Promise<Clients>
        for (const ssid in clients) {
            if (clients.hasOwnProperty(ssid)) {
                const relatedClients = clients[ssid];
                for (const c of relatedClients) {
                    const macaddr = c["kismet.device.base.macaddr"] || "";
                    const deviceName = c["kismet.device.base.manuf"] || "";
                    const last_time = c["kismet.device.base.last_time"] || "";
                    // Create a topic for each client
                    const topic = `kismet/clients/${ssid}/${macaddr}`;
                    const payload = JSON.stringify({
                        ssid,
                        macaddr,
                        deviceName,
                        last_time,
                    });
                    // Publish client data to the broker
                    client.publish(topic, payload);
                }
            }
        }
        client.end(); // Disconnect from the broker
    });
    client.on("error", (error) => {
        console.error("MQTT error:", error);
    });
}

main();
