import type { IncomingMessage } from "http";
import https from "https";

export const download = async (url: string) =>
  new Promise<File>((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }
        buildFile(response, resolve);
      })
      .on("error", (err) => {
        reject(err);
      });
  });

const buildFile = (response: IncomingMessage, resolve: (file: File) => void) => {
  const data: Uint8Array[] = [];

  response.on("data", (chunk) => {
    data.push(chunk);
  });

  response.on("end", () => {
    const buffer = Buffer.concat(data);
    const file = new File([buffer], "downloaded");
    resolve(file);
  });
};
