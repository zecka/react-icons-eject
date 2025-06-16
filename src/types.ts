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
}
