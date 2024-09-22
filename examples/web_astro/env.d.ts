/// <reference types="astro/client" />

declare global {
  namespace App {
    interface Locals {
      helper: import("./src/core/helper").Helper;
    }
  }
}

export {};
