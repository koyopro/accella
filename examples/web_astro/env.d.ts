/// <reference types="astro/client" />

declare global {
  namespace App {
    interface Locals {
      session: import("./src/config/session").Session;
      params: import("accel-web").RequestParameters;
    }
  }
}

export {};
