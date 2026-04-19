const themes = [
  {
    id: "classic",
    name: "Classic Elegance",
    description: "Formal layouts with timeless colors and refined typography.",
  },
  {
    id: "modern",
    name: "Modern Minimal",
    description:
      "Clean spacing, soft neutrals, and contemporary visual balance.",
  },
  {
    id: "romantic",
    name: "Romantic Bloom",
    description: "Warm tones and decorative accents for a softer wedding feel.",
  },
];

const listThemes = (req, res) => {
  res.status(200).json({
    success: true,
    data: themes,
  });
};

module.exports = {
  listThemes,
};
