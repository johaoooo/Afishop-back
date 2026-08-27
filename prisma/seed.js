const { prisma } = require('../src/config/database');
const bcrypt = require('bcrypt');

const realProducts = [
  {
    name: "Sac Macramé Bohème Prestige",
    description: "Sublime sac en macramé tressé main avec fil de coton naturel haute résistance. Motifs géométriques exclusifs, finitions raffinées et anses ergonomiques. Idéal pour un look bohème chic au quotidien comme en soirée.",
    price: 26000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563927/sac4_sozq69.png",
    stock: 12
  },
  {
    name: "Sac Cabas Macramé Élégance",
    description: "Grand cabas artisanal confectionné à la main. Spacieux, robuste et léger, il allie parfaitement le charme des fibres naturelles et l'élégance moderne. Parfait pour vos sorties, vos cours ou vos moments de détente.",
    price: 29000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563927/sac2_ctb3wb.png",
    stock: 10
  },
  {
    name: "Sac à Main Macramé Royal",
    description: "Pièce maîtresse de notre collection AFISAC. Un tressage macramé sophistiqué rehaussé de perles et de détails minutieux. Conçu par nos artisanes pour sublimer vos tenues de cérémonie et grandes occasions.",
    price: 35000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563925/sac1_hdywxz.png",
    stock: 8
  },
  {
    name: "Chemise Homme Motif Pagne Teint",
    description: "Chemise contemporaine confectionnée en coton 100% avec empiècements en pagne teint artisanal aux pigments naturels. Coupe moderne, col structuré et confort exceptionnel pour un style africain affirmé.",
    price: 22000,
    category: "mode",
    brand: "afi-mode",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563922/chem4_rmeuif.jpg",
    stock: 15
  },
  {
    name: "Chemise Manches Courtes Batik Royal",
    description: "Chemise casual chic en tissu batik travaillé à la cire et teint à la main. Motifs authentiques uniques, matière respirante et finitions de haute couture pour un porté agréable tout au long de la journée.",
    price: 20000,
    category: "mode",
    brand: "afi-mode",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563921/chem2_k44jqe.jpg",
    stock: 14
  },
  {
    name: "Pochette Macramé & Tissage Fin",
    description: "Élégante pochette à main tressée en macramé avec rabat travaillé. Doublure intérieure soignée et fermeture sécurisée. L'accessoire indispensable pour emporter vos essentiels avec distinction.",
    price: 18000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563919/sa1_prkynm.jpg",
    stock: 16
  },
  {
    name: "Sac Bandoulière Macramé Floral",
    description: "Sac bandoulière compact orné de motifs en relief inspirés de la flore tropicale. Confortable à porter en bandoulière ou à l'épaule, il apporte une touche artisanale lumineuse à toutes vos tenues.",
    price: 24000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563919/sa2_wgsn0h.jpg",
    stock: 11
  },
  {
    name: "Chemise Moderne en Pagne Artisanal",
    description: "Création originale mariant élégance urbaine et authenticité béninoise. Tissu doux et résistant, boutons naturels et finitions irréprochables pour un vêtement durable et plein de caractère.",
    price: 24000,
    category: "mode",
    brand: "afi-mode",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563921/chem1_ebwwcn.jpg",
    stock: 12
  },
  {
    name: "Pagne Teint Artisanal Motif Indigo",
    description: "Étoffe traditionnelle 100% coton de qualité supérieure, teinte à la main selon les techniques ancestrales de l'indigo. Motifs géométriques symboliques, couleur profonde et éclat durable.",
    price: 25000,
    category: "tissus",
    brand: "afi-mode",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1780563945/pagne_utvisy.png",
    stock: 20
  },
  {
    name: "Suspension Murale Macramé Bohème",
    description: "Magnifique tenture murale tressée à la main sur support en bois naturel. Apporte instantanément chaleur, texture et authenticité à votre salon, bureau ou chambre.",
    price: 19500,
    category: "décoration",
    brand: "afi-deco",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1782719675/tetete_mc3g0r.jpg",
    stock: 10
  },
  {
    name: "Étoffe de Pagne Teinté Traditionnel",
    description: "Pièce de tissu exclusive aux nuances riches et contrastées. Confectionnée avec des pigments écologiques durables, idéale pour la confection de tenues sur mesure ou d'accessoires de luxe.",
    price: 28000,
    category: "tissus",
    brand: "afi-mode",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1782720165/pgn_w8qoer.jpg",
    stock: 18
  },
  {
    name: "Set d'Accessoires Déco & Table Macramé",
    description: "Ensemble d'accessoires décoratifs tressés en macramé. Parfait pour habiller vos tables de réception ou apporter une touche naturelle raffinée à votre intérieur.",
    price: 16000,
    category: "décoration",
    brand: "afi-deco",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1782720381/pp_dq4fz8.jpg",
    stock: 15
  },
  {
    name: "Tissu Pagne Tissé Traditionnel de Luxe",
    description: "Tissu artisanal d'exception tissé au métier traditionnel à bras. Fibres épaisses de coton pur garantissant une tenue parfaite pour grands boubous, vestes ou tailleurs.",
    price: 32000,
    category: "tissus",
    brand: "afi-tissu",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1782907386/tiss_msfbhc.jpg",
    stock: 14
  },
  {
    name: "Sac Macramé Design Contemporain",
    description: "Sac à main moderne revisitant le tressage traditionnel avec un jeu de textures audacieux. Anses confortables et structure renforcée pour une durabilité maximale au quotidien.",
    price: 27000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1784014275/WhatsApp_Image_2026-07-14_at_08.29.54_rsd6nr.jpg",
    stock: 9
  },
  {
    name: "Sac Macramé Perles & Finitions Dorées",
    description: "Chef-d'œuvre artisanal associant fil de coton soyeux et incrustations de perles dorées. Une pièce de créateur rare qui sublime vos tenues de soirée et galas.",
    price: 38000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1785573438/WhatsApp_Image_2026-08-01_at_08.30.44_kxtvvh.jpg",
    stock: 7
  },
  {
    name: "Pochette de Soirée Macramé Tressé",
    description: "Pochette chic confectionnée entièrement à la main. Format compact et élégant avec chaînette amovible, idéale pour garder vos essentiels en toute sécurité.",
    price: 21000,
    category: "accessoires",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1785573439/WhatsApp_Image_2026-08-01_at_08.30.46_fpield.jpg",
    stock: 12
  },
  {
    name: "Grand Cabas Macramé Artisanal",
    description: "Grand sac cabas tressé en corde de coton naturelle renforcée. Grande capacité de rangement et résistance éprouvée pour vous accompagner partout avec élégance.",
    price: 32000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1785573441/WhatsApp_Image_2026-08-01_at_08.30.44_1_xv745q.jpg",
    stock: 8
  },
  {
    name: "Sac Seau Macramé Style Bohème",
    description: "Sac seau iconique avec fermeture à cordon tressé et fond rigide. Style nomade chic indémodable, pratique et léger, réalisé avec le plus grand soin par nos artisans.",
    price: 28000,
    category: "sacs",
    brand: "afisac",
    image: "https://res.cloudinary.com/dzxesa3wi/image/upload/v1785573442/WhatsApp_Image_2026-08-01_at_08.30.43_q8m0uj.jpg",
    stock: 10
  }
];

async function seed() {
  console.log('[Seed] Remplacement complet par les 18 vrais produits AFI Collection...');
  
  // Suppression des anciens produits de test pour garantir le catalogue officiel
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});

  for (const p of realProducts) {
    await prisma.product.create({
      data: {
        ...p,
        updatedAt: new Date()
      }
    });
  }
  console.log(`[Seed] ${realProducts.length} vrais produits insérés avec succès !`);

  // Seed default Admin Accounts
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
