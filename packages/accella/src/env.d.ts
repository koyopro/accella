/// <reference types="astro/client" />

declare global {
  namespace App {
    interface Locals {
      session: import("./src/session").Session;
      params: import("accel-web").RequestParameters;
      readonly authenticityToken?: string;
    }
  }
}

export {};
