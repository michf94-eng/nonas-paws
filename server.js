import express from 'express';

const app = express();
app.use(express.json());

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const BREED_SEED_MAP = {
  golden_retriever: 10, labrador: 20, poodle: 30, french_bulldog: 40,
  beagle: 50, corgi: 60, dachshund: 70, shih_tzu: 80,
  border_collie: 90, german_shepherd: 100, pomeranian: 110, yorkshire_terrier: 120,
};

const FUR_SEED_OFFSET = {
  golden: 0, brown: 1, black: 2, cream: 3, tan: 4, grey: 5, multi: 6,
};

app.options('/api/generate-tryon', (req, res) => {
  res.set(CORS_HEADERS).status(204).send();
});

app.post('/api/generate-tryon', (req, res) => {
  res.set(CORS_HEADERS);
  const { dog, product } = req.body;
  if (!dog?.breed || !dog?.furColor) {
    return res.status(422).json({ error: 'breed y furColor son requeridos' });
  }
  const seed = (BREED_SEED_MAP[dog.breed] ?? 10) + (FUR_SEED_OFFSET[dog.furColor] ?? 0);
  res.json({
    imageUrl: `https://picsum.photos/seed/np-${seed}/600/600`,
    metadata: { generationType: 'placeholder', breed: dog.breed, furColor: dog.furColor }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
