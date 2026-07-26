import env = require("./config/env.js");
import app = require("./app.js");

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
