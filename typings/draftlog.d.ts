declare module 'draftlog' {
  export = draftlog;
  
  function draftlog(console: any, extra: any, ...args: any[]): any;
  
  namespace draftlog {
    class LineCountStream {
      constructor(outStream: any);
  
      addLineListener(inStream: any): void;
  
      columns(): any;
  
      countLines(data: any): void;
  
      line(): any;
  
      logs(): any;
  
      resumeLineCount(): void;
  
      rows(): any;
  
      stopLineCount(): void;
  
      write(data: any): void;
    }
  
    class LogDraft {
      constructor(console: any, methodName: any);
  
      isOffScreen(): any;
  
      linesUp(): any;
  
      saveLine(relative: any): void;
  
      update(...args: any[]): void;
  
      write(...args: any[]): void;
    }
  
    const defaults: {
      canReWrite: boolean;
      maximumLinesUp: number;
      stdinAutoBind: boolean;
    };
  
    const into: any;
  
    const prototype: {};
  
    namespace CSIHelper {
      const ESC: string;
  
      function clearLine(): any;
  
      function down(n: any): any;
  
      function restore(): any;
  
      function save(): any;
  
      function up(n: any): any;
  
      namespace clearLine {
        const prototype: {};
      }
  
      namespace down {
        const prototype: {};
      }
  
      namespace restore {
        const prototype: {};
      }
  
      namespace save {
        const prototype: {};
      }
  
      namespace up {
        const prototype: {};
      }
    }
  }
}
