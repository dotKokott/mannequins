import openai from "openai";
import config from "./config.json";

import { second } from "./second";

console.log("Hello via Bun!!!");
console.log("Key: ", config.OPENAI_KEY);

console.log(second);