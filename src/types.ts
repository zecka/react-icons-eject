export interface ReactIconsEjectConfig {
  /**
   * Path to the directory where icons will be generated.
   * Use absolute or relative path, but do not use aliases like `@/`.
   * @example "./src/components/atoms/icons/react-icons/icons"
   */
  outputDir: string;
  /**
   *  Path to use in generated files.
   * @example @/src/components/atoms/icons/react-icons
   */
  importPath: string;

  /**
 * Optional list of directories to scan even if they're ignored by .gitignore.
 * Use relative paths from the project root.
 * @example ["node_modules/@acme/ui"]
 */
  forceScanDir?: string[];

  /**
   * If true, will override existing icon files.
   * If false, will skip files that already exist.
   * @default false
   */
  overrideExisting?: boolean;

}
