const { prisma } = require('../src/config/database');

const defaultProducts = [
  {
    name: "Sac AFISAC Royal",
    description: "Sac en macramé de luxe, pièce unique",
    price: 35000,
    category: "sacs",
    brand: "afisac",
    image: "/afi.jpeg",
    stock: 8
  },
  {
    name: "Tissu Faso Dan Fani",
    description: "Tissu traditionnel au mètre",
    price: 15000,
    category: "tissus",
    brand: "afi-tissu",
    image: "/afi2.jpeg",
    stock: 50
  },
  {
    name: "Tissu Macramé",
    description: "Tissu décoratif",
    price: 20000,
    category: "tissus",
    brand: "afi-tissu",
    image: "/afi2.jpeg",
    stock: 30
  },
  {
    name: "Bracelet Macramé",
    description: "Bracelet tissé main",
    price: 5000,
    category: "accessoires",
    brand: "afi-mode",
    image: "/afi7.jpeg",
    stock: 25
  },
  {
    name: "Collier Perles",
    description: "Collier en perles artisanales",
    price: 12000,
    category: "accessoires",
    brand: "afi-mode",
    image: "/afi7.jpeg",
    stock: 15
  },
  {
    name: "Porte-Clés Macramé Fleur",
    description: "Petit accessoire tressé avec anneau doré, idéal pour offrir.",
    price: 3000,
    category: "porte-clés",
    brand: "afisac",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600",
    stock: 22
  },
  {
    name: "Valise de Voyage Motif Tradition",
    description: "Valise cabine habillée de motif en batik et teinture artisanale.",
    price: 45000,
    category: "mode",
    brand: "afi-mode",
    image: "https://images.unsplash.com/photo-1565026057447-ba90a3d07d6b?w=600",
    stock: 27
  },
  {
    name: "Rideau en Macramé Grande Taille",
    description: "Séparateur de pièce ou rideau de fenêtre en fil d’allure bohème.",
    price: 38000,
    category: "rideau",
    brand: "afi-deco",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600",
    stock: 35
  },
  {
    name: "Panier Tissé Macramé Boho",
    description: "Magnifique panier fait main en coton naturel et jute pour décoration ou rangement.",
    price: 18500,
    category: "macramé",
    brand: "afisac",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600",
    stock: 12
  },
  {
    name: "Set de Table Tissé Artisanal",
    description: "Set de 4 dessous de plats en macramé tressé à la main, style élégant et chaleureux.",
    price: 14000,
    category: "macrame",
    brand: "afisac",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
    stock: 20
  },
  {
    name: "Pagne Teint Motif Indigo Royal",
    description: "Étoffes en coton 100% teintes à la main avec motifs géométriques traditionnels.",
    price: 28000,
    category: "teinture",
    brand: "afi-mode",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600",
    stock: 15
  },
  {
    name: "Echarpe Pagne Tissé Traditionnel",
    description: "Écharpe douce et légère teinté artisanalement aux pigments naturels.",
    price: 16500,
    category: "pagne",
    brand: "afi-mode",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
    stock: 10
  },
  {
    name: "Miroir Mural Cadre Macramé",
    description: "Miroir circulaire habillé d’un tressage macramé sophistiqué pour salon ou chambre.",
    price: 24500,
    category: "décoration",
    brand: "afi-deco",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600",
    stock: 7
  },
  {
    name: "Centre de Table Tissé Soleil",
    description: "Pièce maîtresse en fibre végétale et fil de coton pour habiller vos tables de fête.",
    price: 19000,
    category: "decoration",
    brand: "afi-deco",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
    stock: 14
  },
  {
    name: "Sac à Main Pagne Tissé & Cuir",
    description: "Sac à main structuré en pagne tissé fait main avec anses en cuir véritable.",
    price: 32000,
    category: "accessoire",
    brand: "afisac",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
    stock: 9
  },
  {
    name: "Graines de Sésame Bio (500g)",
    description: "Sésame blanc décortiqué de haute qualité, riche en nutriments et minéraux.",
    price: 3500,
    category: "sésame",
    brand: "afi-agro",
    image: "https://images.unsplash.com/photo-1509358271058-acd02cc93898?w=600",
    stock: 50
  },
  {
    name: "Chips de Sésame Caramélisées",
    description: "Croustillants de sésame sucrés au miel naturel, un en-cas délicieux et sain.",
    price: 2000,
    category: "sesame",
    brand: "afi-agro",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600",
    stock: 100
  },
  {
    name: "Farine de Soja Enrichie (1kg)",
    description: "Farine de soja artisanale bio, idéale pour la pâtisserie et les bouillies nourrissantes.",
    price: 4000,
    category: "soja",
    brand: "afi-agro",
    image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=600",
    stock: 40
  },
  {
    name: "Épices & Assaisonnements au Soja",
    description: "Mélange d’épices et protéines de soja torréfiées pour relever tous vos plats.",
    price: 2500,
    category: "soja",
    brand: "afi-agro",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    stock: 60
  }
];

async function seed() {
  const count = await prisma.product.count();
  if (count === 0) {
    console.log('[Seed] Insertion des produits par défaut...');
    for (const p of defaultProducts) {
      await prisma.product.create({ data: { ...p, updatedAt: new Date() } });
    }
    console.log(`[Seed] ${defaultProducts.length} produits insérés avec succès.`);
  } else {
    console.log(`[Seed] ${count} produits déjà présents en base.`);
  }

  // Seed default Admin Accounts
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('Admin@Afi2026!', 10);
  const adminAccounts = [
    { email: 'admin@aficollection.com', name: 'Admin AFI Collection' },
    { email: 'josephdehazounde@gmail.com', name: 'Dehazounde Joseph' }
  ];

  for (const acc of adminAccounts) {
    const existing = await prisma.user.findUnique({ where: { email: acc.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: acc.email,
          name: acc.name,
          password: hashedPassword,
          role: 'admin',
          updatedAt: new Date()
        }
      });
      console.log(`[Seed] Compte administrateur créé : ${acc.email}`);
    } else {
      await prisma.user.update({
        where: { email: acc.email },
        data: { password: hashedPassword, role: 'admin', updatedAt: new Date() }
      });
      console.log(`[Seed] Compte administrateur mis à jour : ${acc.email}`);
    }
  }
}

seed()
  .catch((e) => {
    console.error('[Seed Error]:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
