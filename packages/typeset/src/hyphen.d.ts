declare module 'hyphen/*' {
  const mod: {
    hyphenateSync(text: string, options?: { minWordLength?: number; hyphenChar?: string }): string;
  };
  export default mod;
}
