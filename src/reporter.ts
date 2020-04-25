import { encode } from "deno_std:encoding/utf8.ts";

class Reporter {
  id?: number;
  writer = Deno.stdout;
  interval = 60;
  frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  clear = (): void => {
    this.writer.writeSync(encode("\x1b[999D\x1b[K"));
  }

  render = (frame: number): void => {
    if (this.id !== undefined) clearTimeout(this.id);
    this.clear();
    this.writer.writeSync(encode(`${this.frames[frame]} ${this.message}`));
    this.id = setTimeout(
      () => this.render(++frame % this.frames.length),
      this.interval,
    );
  };

  start = (): void => {
    this.render(0);
  };

  stop = (): void => {
    if (this.id === undefined) return;
    clearTimeout(this.id);
    this.id = undefined;
    this.writer.writeSync(encode(`\x1b[999D\x1b[K`));
  };
}

export default Reporter;

const reporter = new Reporter("resolving versions...");
reporter.start();
setTimeout(() => reporter.stop(), 5000);
