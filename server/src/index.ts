import { app } from "./app";
import { env } from "./lib/env";

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`yunto server listening on http://localhost:${env.PORT}`);
});
