import { CLI, Executor, checkArguments } from "@gendev/cli-lib";

const cli = new CLI();
const executor = new Executor(cli);
executor.use(checkArguments);

cli.echoSuccess("Demo CLI app is running...");
for (;;) {
  const line = await cli.read(">");
  if (line === null || ["quit", "q"].includes(line.trim())) break;
  await executor.execute(line);
}
cli.echo("Exiting...");
cli.close();
