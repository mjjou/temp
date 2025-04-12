import express from 'express';
import searchRouter from './routes/searchRoute';

const app = express();

app.use(express.json());
app.use('/search', searchRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Search Service is running on port ${PORT}`);
});
