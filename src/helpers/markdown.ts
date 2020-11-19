// Wrapper functions that applies markdown syntax to strings in a more expressive way.
export const italic = (value: unknown): string => `*${value}*`
export const bold = (value: unknown): string => `**${value}**`
export const underline = (value: unknown): string => `__${value}__`
export const code = (value: unknown): string => `\`${value}\``
export const pre = (value: unknown): string => `\`\`\`${value}\`\`\``
