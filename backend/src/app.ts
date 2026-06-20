import express from 'express';

/** Instancia principal de la aplicación Express. */
const app = express();

app.use(express.json());

export default app;
