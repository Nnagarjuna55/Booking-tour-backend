// import app from "./app";
// import { config } from "./config/env";

// const PORT = config.port || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
import cors from "cors";

app.use(cors({
  origin: "https://booking-tour-chi.vercel.app"
}));
