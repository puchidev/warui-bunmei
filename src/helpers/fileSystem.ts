import glob from 'glob'
import path from 'path'

/**
 * Dynamically import multiple resources matching the glob pattern provided.
 * @api https://github.com/isaacs/node-glob#readme
 *
 * @param globPattern - Glob pattern to be used to select files.
 * @param options - Option for `glob` module.
 * @param onResolve - Callback to run on succesively fetched files.
 * @param onReject - Callback to run on files failed to fetch.
 * @returns An array of requierd files.
 */
export async function importGlob({
  pattern,
  options,
  onResolve,
  onReject,
}: {
  pattern: string
  options: glob.IOptions
  onResolve: (...args: any) => void
  onReject: (...args: any) => void
}): Promise<string[]> {
  const basePath = process.cwd()
  const files = glob.sync(pattern, options).map(async filePath => {
    try {
      const fullPath = path.resolve(basePath, filePath)
      const file = await import(fullPath)
      if (onResolve) {
        await onResolve(file)
      }
      return file
    } catch (error) {
      if (onReject) {
        onReject(error as Error)
      }
    }
  })
  return Promise.all(files)
}
