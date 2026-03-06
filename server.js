
import 'dotenv/config.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import userRoutes from './routers/userRouter.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

app.use(bodyParser.json()); 
app.use(cors());


app.get('/', (req, res) => {
  res.json({ message: 'Server API running' });
});



app.use('/api', userRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack); 


  if (res.headersSent) return next(err);

 
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ message: 'Something went wrong!' });
  }


  return res.status(500).json({
    message: err.message,
    code: err.code,
    url: req.originalUrl,
    body: req.body,
    stack: err.stack,
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
