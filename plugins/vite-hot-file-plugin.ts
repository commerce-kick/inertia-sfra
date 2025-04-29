import fs from "fs";
import { ViteDevServer } from "vite";
import os from "os";

export default function viteHotFilePlugin(filePath) {
  return {
    name: "vite-hot-file",
    configureServer: function (server: ViteDevServer) {
      if (!server.httpServer) return;

      // Configure CORS for the server
      server.middlewares.use((req, res, next) => {
        // Set CORS headers for all responses
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Private-Network", "true");

        // Handle preflight OPTIONS requests
        if (req.method === "OPTIONS") {
          res.statusCode = 204; // No content for OPTIONS
          res.end();
          return;
        }

        next();
      });

      server.httpServer.on("listening", function () {
        // Get network IP address
        const networkIP = getNetworkIP();
        const protocol = server.config.server.https ? "https" : "http";
        const port = server.config.server.port || 5173;

        // Construct the network URL
        const networkUrl = `${protocol}://${networkIP}:${port}`;

        const jsonData = {
          hmr: networkUrl,
          hot: true,
          timestamp: Date.now(),
        };

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
      });
    },
    buildStart: () => {
      fs.existsSync(filePath) && fs.rmSync(filePath);
    },
  };
}

// Function to get network IP address
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal and non-IPv4 addresses
      if (!iface.internal && iface.family === "IPv4") {
        return iface.address;
      }
    }
  }
  return "localhost"; // Fallback to localhost if no network IP is found
}
