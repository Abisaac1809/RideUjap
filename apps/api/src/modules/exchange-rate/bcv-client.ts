import { readFileSync } from "node:fs";
import { request } from "node:https";
import { rootCertificates } from "node:tls";

const BCV_URL = "https://www.bcv.org.ve/";
const TIMEOUT_MS = 10_000;

/**
 * El servidor del BCV no envía el certificado intermedio de Sectigo, así que
 * se agrega a las raíces de Node sin desactivar la verificación TLS.
 */
const ca = [
  ...rootCertificates,
  readFileSync(
    new URL("./certs/sectigo-public-server-authentication-ca-dv-r36.pem", import.meta.url),
    "utf8",
  ),
];

export function fetchBcvHtml(): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = request(BCV_URL, { ca, signal: AbortSignal.timeout(TIMEOUT_MS) }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`BCV responded ${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });

    req.on("error", reject);
    req.end();
  });
}
