// Ensure this file is treated as a module
export {}

// Augmentation to the NodeJS globals
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COMMAND_PREFIX: string
      DISCORD_TOKEN: string
    }
  }
}
