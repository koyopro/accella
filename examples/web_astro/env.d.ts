/// <reference types="astro/client" />

declare global {
  namespace App {
    interface Locals {
      helper: import("accel-web").Helper;
    }
  }
}

export {};
