declare function require(context: string): any;

declare namespace NodeJS {
  interface Require {
    context(
      directory: string,
      useSubdirectories: boolean,
      regExp: RegExp
    ): __WebpackModuleApi.RequireContext;
  }
}
