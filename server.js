import express from 'express';

const app = express();
app.use(express.json());

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

app.options('/api/generate-tryon', (req, res) => {
  res.set(CORS_HEADERS).status(204).send();
});

app.post('/api/generate-tryon', async (req, res) => {
  res.set(CORS_HEADERS);
  const { dog, product } = req.body;

  if (!dog?.breed || !dog?.furColor) {
    return res.status(422).json({ error: 'breed y furColor son requeridos' });
  }

  const breedNames = {
    golden_retriever: 'Golden Retriever', labrador: 'Labrador', poodle: 'Poodle',
    french_bulldog: 'French Bulldog', beagle: 'Beagle', corgi: 'Corgi',
    dachshund: 'Dachshund', shih_tzu: 'Shih Tzu', border_collie: 'Border Collie',
    german_shepherd: 'German Shepherd', pomeranian: 'Pomeranian', yorkshire_terrier: 'Yorkshire Terrier'
  };

  const breedName = breedNames[dog.breed] || dog.breed;
  const productName = product?.productTitle || 'accessory';
  const prompt = `A cute ${dog.furColor} ${breedName} dog wearing a ${productName}, studio photo, white background, professional pet photography, adorable, high quality`;

  try {
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: 'square_hd',
        num_images: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('fal.ai error:', data);
      return res.status(500).json({ error: 'Error generando imagen' });
    }

    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      return res.status(500).json({ error: 'No se recibió imagen' });
    }

    res.json({ imageUrl, metadata: { breed: dog.breed, furColor: dog.furColor, prompt } });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
