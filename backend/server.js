require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');
const aiRoutes = require("./src/routes/ai.routes");



connectDB();

app.use("/api/ai", aiRoutes);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
