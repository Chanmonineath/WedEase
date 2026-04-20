const axios = require('axios');

const themes = [
  { key: "romantic", title: "Romantic", desc: "Soft colors, candles, and florals for a dreamy atmosphere." },
  { key: "fairytale", title: "Fairytale", desc: "Whimsical decor, pastel tones, and magical lighting." },
  { key: "garden", title: "Garden Wedding", desc: "Fresh greenery, outdoor florals, and nature-inspired elegance." },
  { key: "pastel", title: "Pastel Theme", desc: "Soft blush, baby blue, lavender tones for a gentle vibe." },
  { key: "boho", title: "Boho", desc: "Macrame, earthy tones, and free-spirited artistic styling." },
  { key: "barn", title: "Barn Wedding", desc: "Warm lights, wooden textures, and cozy barn details." },
  { key: "forest", title: "Forest Wedding", desc: "Leafy backdrops, natural textures, and woodland vibes." },
  { key: "elegant", title: "Elegant", desc: "Clean design, premium fabrics, and timeless style." },
  { key: "classic", title: "Classic", desc: "Neutral palettes and sophisticated traditional decor." },
  { key: "luxury", title: "Luxury Wedding", desc: "Gold accents, crystal decor, and premium styling." },
  { key: "modern", title: "Modern", desc: "Bold accents, geometric shapes, and contemporary design." },
  { key: "industrial", title: "Industrial", desc: "Metallics, exposed brick, and chic warehouse aesthetics." },
  { key: "chinese", title: "Chinese Traditional", desc: "Red and gold tones, lanterns, and cultural symbolism." },
  { key: "indian", title: "Indian Wedding", desc: "Vibrant colors, rich fabrics, and celebratory traditions." },
  { key: "beach", title: "Beach Wedding", desc: "Soft sands, ocean breeze, and tropical styling." },
  { key: "sunset", title: "Sunset Wedding", desc: "Warm glowing tones and dreamy golden-hour aesthetics." },
  { key: "vintage", title: "Vintage", desc: "Old-fashioned decor and timeless visual charm." },
  { key: "french", title: "French Romantic", desc: "Soft elegance, pastel florals and vintage French décor." },
];

const listThemes = (req, res) => {
  res.status(200).json({ success: true, data: themes });
};

const fetchAllThemes = async (req, res) => {
  console.log("Fetching all themes from Unsplash...");
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    console.error('UNSPLASH_ACCESS_KEY not set in .env file');
    // Return themes with placeholder images instead of failing
    const placeholderResults = themes.map(theme => ({
      key: theme.key,
      title: theme.title,
      description: theme.desc,
      images: [null, null, null],
      link: '#'
    }));
    return res.json({ success: true, data: placeholderResults, warning: 'API key not configured' });
  }
  
  const results = [];
  
  for (const theme of themes) {
    const queries = [
      `${theme.key} wedding decoration`,
      `${theme.key} wedding ceremony`,
      `${theme.key} wedding reception`
    ];
    
    const images = [];
    let link = '#';
    
    for (const q of queries) {
      try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
          params: { query: q, per_page: 1, orientation: 'landscape' },
          headers: { 'Authorization': `Client-ID ${accessKey}` },
          timeout: 10000
        });
        
        const photo = response.data.results && response.data.results[0];
        if (photo) {
          images.push(photo.urls.small);
          if (link === '#') link = photo.links.html;
        } else {
          images.push(null);
        }
      } catch (error) {
        console.error(`Error fetching for ${q}:`, error.message);
        images.push(null);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    results.push({
      key: theme.key,
      title: theme.title,
      description: theme.desc,
      images: images,
      link: link
    });
  }
  
  console.log(`Completed fetching ${results.length} themes`);
  res.json({ success: true, data: results });
};

module.exports = { listThemes, fetchAllThemes };