import { app } from "./app";
import { env } from "./lib/env";

app.listen(env.PORT, env.HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`yunto server listening on http://${env.HOST}:${env.PORT}`);
});
