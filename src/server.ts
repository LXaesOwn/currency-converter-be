import app from './app';
import { PORT } from './config/env';

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Swagger docs at http://localhost:${PORT}/api-docs`);
});