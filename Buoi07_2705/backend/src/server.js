import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const port = Number(process.env.PORT || 5000);

await connectDB();

app.listen(port, () => {
  console.log(`LuxeWatch API running at http://localhost:${port}`);
});
