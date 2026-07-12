import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const ADMIN_PASSWORD = 'annie@admin'

// ─── Initialize data directory & default files ──────────
export function initDirectories() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const defaults = [
    {
      file: 'products.json',
      data: [
        // ─── Jewelry Products ────────────────────────────
        { id: 'p1', name: 'Shimmery Gold Necklace Set', department: 'jewelry', collection: 'Bridal', metal: 'Gold Plated', gemstone: 'Zircon', price: 3499, originalPrice: 4999, images: ['/images/products/gold-necklace.jpg'], description: 'A stunning gold-plated necklace set with sparkling zircon stones. Perfect for weddings and formal events. Includes matching earrings.', category: 'Necklace Sets', rating: 4.9, reviews: 234, inStock: true, stock: 42, variants: [{ label: 'Standard Size', price: 3499 }, { label: 'With Matching Bangles', price: 5499 }], sku: 'ANN-NS-001', weight: '85g', featured: true, createdAt: '2025-01-15' },
        { id: 'p2', name: 'Rose Gold Chandbali Earrings', department: 'jewelry', collection: 'Traditional', metal: 'Rose Gold Plated', gemstone: 'Pearl', price: 1899, originalPrice: 2499, images: ['/images/products/rose-earrings.jpg'], description: 'Beautiful chandbali-style earrings in rose gold with pearl drops. Lightweight and elegant for daily wear.', category: 'Ear Tops', rating: 4.8, reviews: 187, inStock: true, stock: 28, variants: [{ label: 'Small', price: 1899 }, { label: 'Large', price: 2499 }], sku: 'ANN-ET-001', weight: '22g', featured: true, createdAt: '2025-02-01' },
        { id: 'p3', name: 'Kundan Maang Tikka', department: 'jewelry', collection: 'Bridal', metal: 'Gold Plated', gemstone: 'Kundan', price: 2799, originalPrice: null, images: ['/images/products/gold-necklace.jpg'], description: 'Intricate kundan work maang tikka with pear-shaped drops. A must-have for your bridal trousseau.', category: 'Nose Pins & Tikka', rating: 4.7, reviews: 143, inStock: true, stock: 3, variants: [{ label: 'Gold Finish', price: 2799 }, { label: 'Rose Gold Finish', price: 2999 }], sku: 'ANN-TK-001', weight: '35g', featured: true, createdAt: '2025-01-20' },
        { id: 'p4', name: 'Multicolor Glass Bangles Set', department: 'jewelry', collection: 'Casual', metal: 'Glass with Gold Foil', gemstone: 'None', price: 699, originalPrice: 999, images: ['/images/products/gold-necklace.jpg'], description: 'Traditional multicolor glass bangles with real gold foil work. Set of 12 bangles in assorted colors.', category: 'Bangles', rating: 4.6, reviews: 312, inStock: true, stock: 65, variants: [{ label: 'Set of 6', price: 399 }, { label: 'Set of 12', price: 699 }, { label: 'Set of 24', price: 1299 }], sku: 'ANN-BG-001', weight: '120g', featured: false, createdAt: '2025-02-10' },
        { id: 'p5', name: 'Silver Payal (Anklet)', department: 'jewelry', collection: 'Footwear', metal: 'Silver Plated', gemstone: 'None', price: 1299, originalPrice: 1699, images: ['/images/products/rose-earrings.jpg'], description: 'Delicate silver-plated payal (anklet) with tiny bell charms. Classic design for casual and formal wear.', category: 'Payal & Foot', rating: 4.5, reviews: 198, inStock: true, stock: 18, variants: [{ label: 'Adjustable (8-10 inch)', price: 1299 }, { label: 'Adjustable (10-12 inch)', price: 1499 }], sku: 'ANN-PL-001', weight: '45g', featured: true, createdAt: '2025-02-20' },
        { id: 'p6', name: 'Crystal Nose Pin Set', department: 'jewelry', collection: 'Casual', metal: 'Silver Plated', gemstone: 'Crystal', price: 499, originalPrice: 799, images: ['/images/products/rose-earrings.jpg'], description: 'Set of 6 crystal nose pins in assorted colors. Hypoallergenic silver-plated posts.', category: 'Nose Pins & Tikka', rating: 4.9, reviews: 456, inStock: true, stock: 12, variants: [{ label: 'Pack of 6', price: 499 }, { label: 'Pack of 12', price: 899 }], sku: 'ANN-NP-001', weight: '8g', featured: true, createdAt: '2025-01-28' },
        { id: 'p7', name: 'Polki Work Ring', department: 'jewelry', collection: 'Bridal', metal: 'Gold Plated', gemstone: 'Polki', price: 1599, originalPrice: null, images: ['/images/products/gold-necklace.jpg'], description: 'Elegant polki work ring with intricate meenakari detailing. Adjustable size for perfect fit.', category: 'Rings', rating: 4.8, reviews: 167, inStock: true, stock: 22, variants: [{ label: 'Size 6', price: 1599 }, { label: 'Size 7', price: 1599 }, { label: 'Size 8', price: 1699 }, { label: 'Size 9', price: 1699 }], sku: 'ANN-RG-001', weight: '12g', featured: false, createdAt: '2025-03-01' },
        { id: 'p8', name: 'Embroidery Hand Jewelry', department: 'jewelry', collection: 'Hand', metal: 'Gold Plated', gemstone: 'Zircon', price: 2499, originalPrice: 3499, images: ['/images/products/gold-necklace.jpg'], description: 'Stunning hand jewelry (hath phool) with zircon stones and intricate gold work.', category: 'Hand Jewelry', rating: 4.7, reviews: 89, inStock: true, stock: 8, variants: [{ label: 'Standard', price: 2499 }, { label: 'With Chain', price: 2999 }], sku: 'ANN-HJ-001', weight: '65g', featured: true, createdAt: '2025-01-10' },
        { id: 'p9', name: 'Pearl & Crystal Jhumkas', department: 'jewelry', collection: 'Traditional', metal: 'Gold Plated', gemstone: 'Pearl & Crystal', price: 1399, originalPrice: 1999, images: ['/images/products/rose-earrings.jpg'], description: 'Classic jhumka earrings with pearl drops and crystal accents. Lightweight for all-day wear.', category: 'Ear Tops', rating: 4.9, reviews: 278, inStock: true, stock: 35, variants: [{ label: 'Small', price: 1399 }, { label: 'Large', price: 1899 }], sku: 'ANN-ET-002', weight: '28g', featured: false, createdAt: '2025-02-15' },
        { id: 'p10', name: 'Toe Rings Set (Bichhua)', department: 'jewelry', collection: 'Footwear', metal: 'Silver Plated', gemstone: 'None', price: 399, originalPrice: null, images: ['/images/products/rose-earrings.jpg'], description: 'Traditional silver-plated toe rings set. Set of 4 pairs in assorted designs.', category: 'Payal & Foot', rating: 4.6, reviews: 345, inStock: true, stock: 14, variants: [{ label: 'Pack of 4 pairs', price: 399 }, { label: 'Pack of 8 pairs', price: 699 }], sku: 'ANN-TR-001', weight: '15g', featured: true, createdAt: '2025-03-05' },
        { id: 'p11', name: 'Green Emerald Choker Set', department: 'jewelry', collection: 'Bridal', metal: 'Gold Plated', gemstone: 'Emerald', price: 4499, originalPrice: 5999, images: ['/images/products/gold-necklace.jpg'], description: 'Magnificent emerald-green choker set with gold plating. Comes with matching earrings.', category: 'Necklace Sets', rating: 4.8, reviews: 156, inStock: true, stock: 50, variants: [{ label: 'Choker Only', price: 4499 }, { label: 'Full Set with Earrings', price: 5999 }], sku: 'ANN-NS-002', weight: '95g', featured: true, createdAt: '2025-02-25' },
        { id: 'p12', name: 'Antique Gold Bangles', department: 'jewelry', collection: 'Traditional', metal: 'Gold Plated', gemstone: 'None', price: 2499, originalPrice: 3299, images: ['/images/products/gold-necklace.jpg'], description: 'Antique-style gold bangles with traditional engraving. Set of 6 with oxidized finish.', category: 'Bangles', rating: 4.7, reviews: 222, inStock: true, stock: 12, variants: [{ label: 'Set of 6', price: 2499 }, { label: 'Set of 12', price: 4499 }], sku: 'ANN-BG-002', weight: '180g', featured: false, createdAt: '2025-03-10' },
        // ─── Decor Products ──────────────────────────────
        { id: 'd1', name: 'Crystal Candelabra Set', department: 'decor', collection: 'Luxury', material: 'Crystal & Gold', price: 5999, originalPrice: 7999, images: ['/images/products/crystal-candelabra.jpg'], description: 'Elegant crystal candelabra set with gold accents. Three-piece set for table centrepieces.', category: 'Candles & Holders', rating: 4.8, reviews: 67, inStock: true, stock: 15, variants: [{ label: '3-Piece Set', price: 5999 }, { label: '5-Piece Set', price: 8999 }], sku: 'ANN-DC-001', weight: '1.2kg', featured: true, createdAt: '2025-02-10' },
        { id: 'd2', name: 'Pearl String Lights', department: 'decor', collection: 'Romance', material: 'Pearl & LED', price: 1899, originalPrice: 2499, images: ['/images/products/pearl-lights.jpg'], description: 'Delicate pearl-draped LED string lights. 3 metre length. Warm white glow for bedrooms and events.', category: 'Lighting', rating: 4.7, reviews: 134, inStock: true, stock: 40, variants: [{ label: '3 Metre', price: 1899 }, { label: '5 Metre', price: 2799 }], sku: 'ANN-DC-002', weight: '350g', featured: true, createdAt: '2025-03-01' },
        { id: 'd3', name: 'Rose Gold Vase', department: 'decor', collection: 'Modern', material: 'Ceramic & Rose Gold', price: 3299, originalPrice: null, images: ['/images/products/decorative-vase.jpg'], description: 'Minimalist rose gold ceramic vase. Perfect for dried flowers or as a standalone statement piece.', category: 'Vases', rating: 4.9, reviews: 89, inStock: true, stock: 22, variants: [{ label: 'Small (20cm)', price: 3299 }, { label: 'Large (35cm)', price: 4999 }], sku: 'ANN-DC-003', weight: '800g', featured: false, createdAt: '2025-01-20' },
        { id: 'd4', name: 'Velvet Cushion Set', department: 'decor', collection: 'Royal', material: 'Velvet & Gold Thread', price: 2499, originalPrice: 3299, images: ['/images/products/decorative-cushion.jpg'], description: 'Luxurious velvet cushions with gold thread embroidery. Set of 2. 18x18 inches.', category: 'Textiles', rating: 4.6, reviews: 203, inStock: true, stock: 30, variants: [{ label: 'Rose Gold', price: 2499 }, { label: 'Ivory', price: 2499 }, { label: 'Burgundy', price: 2699 }], sku: 'ANN-DC-004', weight: '600g', featured: true, createdAt: '2025-02-15' },
        { id: 'd5', name: 'Scented Candle Trio', department: 'decor', collection: 'Luxury', material: 'Soy Wax & Glass', price: 2799, originalPrice: null, images: ['/images/products/scented-candle.jpg'], description: 'Set of 3 hand-poured soy scented candles in amber glass jars. Lavender, Vanilla & Rose.', category: 'Candles & Holders', rating: 4.8, reviews: 89, inStock: true, stock: 25, variants: [{ label: 'Trio Set', price: 2799 }, { label: 'Single', price: 999 }], sku: 'ANN-DC-007', weight: '600g', featured: true, createdAt: '2025-03-20' },
        { id: 'd6', name: 'Woven Wall Hanging', department: 'decor', collection: 'Bohemian', material: 'Cotton & Jute', price: 1599, originalPrice: 1999, images: ['/images/products/woven-hanging.jpg'], description: 'Handwoven macrame wall hanging with cotton and jute. Natural tones. 60x90 cm.', category: 'Wall Art', rating: 4.5, reviews: 178, inStock: true, stock: 25, variants: [{ label: 'Small (40x60cm)', price: 1599 }, { label: 'Large (60x90cm)', price: 2299 }], sku: 'ANN-DC-006', weight: '450g', featured: false, createdAt: '2025-01-25' },
        // ─── Decor: New Additions ────────────────────────
        { id: 'd7', name: 'Abstract Canvas Painting', department: 'decor', collection: 'Modern', material: 'Canvas & Acrylic', price: 4999, originalPrice: 6499, images: ['/images/products/canvas-painting.jpg'], description: 'Hand-painted abstract canvas art piece. Gold, rose & white tones. 24x36 inches. Ready to hang.', category: 'Wall Art', rating: 4.9, reviews: 45, inStock: true, stock: 10, variants: [{ label: '24x36 inch', price: 4999 }, { label: '36x48 inch', price: 7999 }], sku: 'ANN-DC-008', weight: '2kg', featured: true, createdAt: '2025-04-01' },
        { id: 'd8', name: 'Floral Oil Painting', department: 'decor', collection: 'Traditional', material: 'Canvas & Oil', price: 5999, originalPrice: null, images: ['/images/products/abstract-art.jpg'], description: 'Luxurious floral oil painting on stretched canvas. Rich jewel tones with gold leaf accents. 20x30 inches.', category: 'Wall Art', rating: 4.8, reviews: 32, inStock: true, stock: 8, variants: [{ label: '20x30 inch', price: 5999 }, { label: '30x40 inch', price: 8999 }], sku: 'ANN-DC-009', weight: '2.5kg', featured: true, createdAt: '2025-04-05' },
        { id: 'd9', name: 'Artificial Monstera Plant', department: 'decor', collection: 'Modern', material: 'Silk & Plastic', price: 2299, originalPrice: 2999, images: ['/images/products/artificial-plant.jpg'], description: 'Realistic artificial monstera deliciosa plant in matte white ceramic pot. 60cm tall. No maintenance needed.', category: 'Figurines', rating: 4.7, reviews: 98, inStock: true, stock: 35, variants: [{ label: 'Small (40cm)', price: 1499 }, { label: 'Large (60cm)', price: 2299 }], sku: 'ANN-DC-010', weight: '1.5kg', featured: true, createdAt: '2025-04-08' },
        { id: 'd10', name: 'Artificial Rose Bouquet', department: 'decor', collection: 'Romance', material: 'Silk & Velvet', price: 1899, originalPrice: null, images: ['/images/products/artificial-flowers.jpg'], description: 'Eternal silk rose bouquet in a glass dome. 12 stems in blush pink. Perfect gift or home accent.', category: 'Vases', rating: 4.9, reviews: 120, inStock: true, stock: 40, variants: [{ label: 'Blush Pink', price: 1899 }, { label: 'Red', price: 1899 }, { label: 'White', price: 1899 }], sku: 'ANN-DC-011', weight: '800g', featured: false, createdAt: '2025-04-10' },
        { id: 'd11', name: 'Decorative Wall Mirror', department: 'decor', collection: 'Luxury', material: 'Mirror & Metal', price: 3999, originalPrice: 5499, images: ['/images/products/wall-mirror.jpg'], description: 'Sunburst-style decorative wall mirror with antique gold metal frame. 50cm diameter. Statement piece for entryways.', category: 'Mirrors', rating: 4.8, reviews: 67, inStock: true, stock: 14, variants: [{ label: 'Gold', price: 3999 }, { label: 'Silver', price: 3999 }], sku: 'ANN-DC-012', weight: '3kg', featured: true, createdAt: '2025-04-12' },
        { id: 'd12', name: 'Artificial Succulent Set', department: 'decor', collection: 'Modern', material: 'Resin & Plastic', price: 1299, originalPrice: null, images: ['/images/products/artificial-plant.jpg'], description: 'Set of 6 mini artificial succulents in concrete-look pots. Perfect for desks and shelves.', category: 'Figurines', rating: 4.6, reviews: 156, inStock: true, stock: 50, variants: [{ label: 'Set of 6', price: 1299 }, { label: 'Set of 12', price: 2199 }], sku: 'ANN-DC-013', weight: '900g', featured: false, createdAt: '2025-04-15' },
        // ─── Lingerie Products ───────────────────────────
        { id: 'l1', name: 'Silk Lace Chemise', department: 'lingerie', collection: 'Elegance', material: 'Silk & Lace', price: 3999, originalPrice: 5299, images: ['/images/products/silk-camisole.jpg'], description: 'Pure silk chemise with delicate lace trim. Adjustable straps. Available in multiple sizes.', category: 'Chemises', rating: 4.9, reviews: 156, inStock: true, stock: 20, variants: [{ label: 'S', price: 3999 }, { label: 'M', price: 3999 }, { label: 'L', price: 3999 }, { label: 'XL', price: 4199 }], sku: 'ANN-LG-001', weight: '120g', featured: true, createdAt: '2025-02-01' },
        { id: 'l2', name: 'Lace Bralette Set', department: 'lingerie', collection: 'Romance', material: 'Lace & Satin', price: 2799, originalPrice: 3499, images: ['/images/products/lace-bra.jpg'], description: 'Delicate lace bralette with matching bottoms. Wire-free comfort with satin bow detail.', category: 'Bralettes', rating: 4.7, reviews: 234, inStock: true, stock: 35, variants: [{ label: 'S', price: 2799 }, { label: 'M', price: 2799 }, { label: 'L', price: 2799 }], sku: 'ANN-LG-002', weight: '85g', featured: true, createdAt: '2025-01-15' },
        { id: 'l3', name: 'Satin Robe', department: 'lingerie', collection: 'Luxury', material: 'Satin', price: 4499, originalPrice: 5999, images: ['/images/products/silk-robe.jpg'], description: 'Luxurious satin robe with lace overlay on sleeves and hem. Knee-length. Belt included.', category: 'Robes', rating: 4.8, reviews: 98, inStock: true, stock: 15, variants: [{ label: 'S/M', price: 4499 }, { label: 'L/XL', price: 4499 }], sku: 'ANN-LG-003', weight: '250g', featured: true, createdAt: '2025-03-05' },
        { id: 'l4', name: 'Embroidered Bodysuit', department: 'lingerie', collection: 'Elegance', material: 'Tulle & Embroidery', price: 3499, originalPrice: null, images: ['/images/products/bikini-set.jpg'], description: 'Sheer tulle bodysuit with floral embroidery. Snap closure. Statement piece for special occasions.', category: 'Bodysuits', rating: 4.6, reviews: 67, inStock: true, stock: 12, variants: [{ label: 'S', price: 3499 }, { label: 'M', price: 3499 }, { label: 'L', price: 3499 }], sku: 'ANN-LG-004', weight: '150g', featured: false, createdAt: '2025-02-20' },
        { id: 'l5', name: 'Lace Thong Set', department: 'lingerie', collection: 'Romance', material: 'Lace', price: 1499, originalPrice: 1999, images: ['/images/products/lace-panty.jpg'], description: 'Delicate lace thong with matching bralette. Ultra-soft elastic for all-day comfort.', category: 'Sets', rating: 4.5, reviews: 312, inStock: true, stock: 45, variants: [{ label: 'S', price: 1499 }, { label: 'M', price: 1499 }, { label: 'L', price: 1499 }], sku: 'ANN-LG-005', weight: '50g', featured: false, createdAt: '2025-01-30' },
        { id: 'l6', name: 'Silk Sleep Set', department: 'lingerie', collection: 'Comfort', material: 'Mulberry Silk', price: 5999, originalPrice: 7499, images: ['/images/products/silk-camisole.jpg'], description: 'Luxurious mulberry silk camisole and shorts set. Hypoallergenic. Gift box included.', category: 'Sleepwear', rating: 4.9, reviews: 45, inStock: true, stock: 8, variants: [{ label: 'S', price: 5999 }, { label: 'M', price: 5999 }, { label: 'L', price: 5999 }, { label: 'XL', price: 6199 }], sku: 'ANN-LG-006', weight: '180g', featured: true, createdAt: '2025-03-15' },
        // ─── Lingerie: Inner Wear ────────────────────────
        { id: 'l7', name: 'Padded Push-Up Bra', department: 'lingerie', collection: 'Elegance', material: 'Lace & Satin', price: 1999, originalPrice: 2799, images: ['/images/products/padded-bra.jpg'], description: 'Comfortable padded push-up bra with lace overlay. Removable padding. Adjustable straps with 3-row hook closure.', category: 'Bralettes', rating: 4.8, reviews: 289, inStock: true, stock: 40, variants: [{ label: '32B', price: 1999 }, { label: '34B', price: 1999 }, { label: '36C', price: 2199 }, { label: '38C', price: 2199 }], sku: 'ANN-LG-007', weight: '120g', featured: true, createdAt: '2025-04-01' },
        { id: 'l8', name: 'Lace Panty Set', department: 'lingerie', collection: 'Romance', material: 'Lace', price: 999, originalPrice: 1499, images: ['/images/products/lace-panty.jpg'], description: 'Set of 3 seamless lace panties. Full coverage with delicate floral lace waistband. Soft & breathable.', category: 'Sets', rating: 4.7, reviews: 345, inStock: true, stock: 60, variants: [{ label: 'S (Pack of 3)', price: 999 }, { label: 'M (Pack of 3)', price: 999 }, { label: 'L (Pack of 3)', price: 999 }], sku: 'ANN-LG-008', weight: '80g', featured: true, createdAt: '2025-04-03' },
        { id: 'l9', name: 'Bra & Panty Combo', department: 'lingerie', collection: 'Romance', material: 'Lace & Cotton', price: 2499, originalPrice: 3499, images: ['/images/products/lace-bra.jpg'], description: 'Matching lace bra and panty set. Padded non-wire bra with high-waist thong. Perfect everyday luxury.', category: 'Sets', rating: 4.6, reviews: 198, inStock: true, stock: 30, variants: [{ label: 'S', price: 2499 }, { label: 'M', price: 2499 }, { label: 'L', price: 2499 }], sku: 'ANN-LG-009', weight: '150g', featured: false, createdAt: '2025-04-05' },
        { id: 'l10', name: 'Seamless T-Shirt Bra', department: 'lingerie', collection: 'Comfort', material: 'Cotton & Spandex', price: 1599, originalPrice: null, images: ['/images/products/padded-bra.jpg'], description: 'Invisible seamless t-shirt bra with molded cups. Wire-free. Perfect under fitted tops. Smooth & stretchy.', category: 'Bralettes', rating: 4.8, reviews: 412, inStock: true, stock: 55, variants: [{ label: '32A', price: 1599 }, { label: '34B', price: 1599 }, { label: '36C', price: 1599 }, { label: '38D', price: 1799 }], sku: 'ANN-LG-010', weight: '100g', featured: true, createdAt: '2025-04-08' },
        { id: 'l11', name: 'Cotton Bikini Brief Set', department: 'lingerie', collection: 'Comfort', material: 'Cotton', price: 799, originalPrice: 1099, images: ['/images/products/lace-panty.jpg'], description: 'Pack of 5 cotton bikini briefs. Breathable, stretchy, all-day comfort. Assorted solid colors.', category: 'Sets', rating: 4.5, reviews: 567, inStock: true, stock: 80, variants: [{ label: 'S (Pack of 5)', price: 799 }, { label: 'M (Pack of 5)', price: 799 }, { label: 'L (Pack of 5)', price: 799 }], sku: 'ANN-LG-011', weight: '120g', featured: false, createdAt: '2025-04-10' },
        { id: 'l12', name: 'Lace Chemise Nighty', department: 'lingerie', collection: 'Elegance', material: 'Chiffon & Lace', price: 2999, originalPrice: 3999, images: ['/images/products/silk-camisole.jpg'], description: 'Flowing chiffon chemise nighty with lace bodice. Spaghetti straps. Knee-length with side slit.', category: 'Sleepwear', rating: 4.7, reviews: 178, inStock: true, stock: 22, variants: [{ label: 'S', price: 2999 }, { label: 'M', price: 2999 }, { label: 'L', price: 2999 }, { label: 'XL', price: 3199 }], sku: 'ANN-LG-012', weight: '130g', featured: true, createdAt: '2025-04-12' },
      ]
    },
    {
      file: 'orders.json',
      data: [
        { id: 'ord-001', customerName: 'Fatima Ahmed', email: 'fatima@example.com', phone: '0300-1234567', items: [{ productId: 'p1', name: 'Shimmery Gold Necklace Set', quantity: 1, price: 3499, variant: 'Standard Size' }], total: 3499, status: 'delivered', address: { line1: 'House 12, Block B', city: 'Lahore', state: 'Punjab', zip: '54000' }, paymentMethod: 'JazzCash', createdAt: '2025-03-10', updatedAt: '2025-03-18' },
        { id: 'ord-002', customerName: 'Zainab Khan', email: 'zainab@example.com', phone: '0333-9876543', items: [{ productId: 'p6', name: 'Crystal Nose Pin Set', quantity: 2, price: 499, variant: 'Pack of 6' }], total: 998, status: 'shipped', address: { line1: 'F-7/2 Street 45', city: 'Islamabad', state: 'ICT', zip: '44000' }, paymentMethod: 'Easypaisa', createdAt: '2025-03-15', updatedAt: '2025-03-20' },
        { id: 'ord-003', customerName: 'Ayesha Malik', email: 'ayesha@example.com', phone: '0345-5556789', items: [{ productId: 'p8', name: 'Embroidery Hand Jewelry', quantity: 1, price: 2499, variant: 'Standard' }, { productId: 'p5', name: 'Silver Payal', quantity: 1, price: 1299, variant: 'Adjustable (8-10 inch)' }], total: 3798, status: 'processing', address: { line1: 'DHA Phase 6', city: 'Karachi', state: 'Sindh', zip: '75500' }, paymentMethod: 'HBL Connect', createdAt: '2025-03-18', updatedAt: '2025-03-19' },
        { id: 'ord-004', customerName: 'Sana Tariq', email: 'sana@example.com', phone: '0321-4443322', items: [{ productId: 'p9', name: 'Pearl & Crystal Jhumkas', quantity: 3, price: 1399, variant: 'Small' }], total: 4197, status: 'pending', address: { line1: 'Model Town', city: 'Multan', state: 'Punjab', zip: '60000' }, paymentMethod: 'JazzCash', createdAt: '2025-03-22', updatedAt: '2025-03-22' },
      ]
    },
    {
      file: 'customers.json',
      data: [
        { id: 'c1', name: 'Fatima Ahmed', email: 'fatima@example.com', phone: '0300-1234567', totalOrders: 3, totalSpent: 8997, joinDate: '2024-06-15', notes: 'VIP client. Prefers bridal collections. Birthday: March 12.', lastPurchase: '2025-03-10' },
        { id: 'c2', name: 'Zainab Khan', email: 'zainab@example.com', phone: '0333-9876543', totalOrders: 2, totalSpent: 2496, joinDate: '2024-08-22', notes: 'Loves crystal and pearl items. Ships to Islamabad.', lastPurchase: '2025-03-15' },
        { id: 'c3', name: 'Ayesha Malik', email: 'ayesha@example.com', phone: '0345-5556789', totalOrders: 5, totalSpent: 15990, joinDate: '2025-01-10', notes: 'Frequent buyer. Prefers hand jewelry and payal.', lastPurchase: '2025-03-18' },
        { id: 'c4', name: 'Sana Tariq', email: 'sana@example.com', phone: '0321-4443322', totalOrders: 4, totalSpent: 8394, joinDate: '2024-03-05', notes: 'Bulk buyer. Often orders jhumkas for resale.', lastPurchase: '2025-03-22' },
      ]
    },
    {
      file: 'collections.json',
      data: [
        { id: 'col-1', name: 'Bridal', description: 'Stunning bridal sets for your special day', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', pieceCount: 4 },
        { id: 'col-2', name: 'Traditional', description: 'Timeless traditional Pakistani designs', image: 'https://images.unsplash.com/photo-1535632066927-ab7c6ab60908?w=800', pieceCount: 3 },
        { id: 'col-3', name: 'Casual', description: 'Everyday elegance for the modern woman', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', pieceCount: 2 },
        { id: 'col-4', name: 'Hand', description: 'Exquisite hand jewelry (hath phool)', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', pieceCount: 1 },
        { id: 'col-5', name: 'Footwear', description: 'Beautiful payal and toe rings', image: 'https://images.unsplash.com/photo-1515562141589-69f0c2aa1f2d?w=800', pieceCount: 2 },
      ]
    },
    {
      file: 'categories.json',
      data: [
        { id: 'jewelry', name: 'Jewelry', description: 'Crafted elegance for every occasion', icon: '✦', color: '#D4919E', order: 1 },
        { id: 'decor', name: 'Decor', description: 'Transform your space', icon: '◈', color: '#C9A96E', order: 2 },
        { id: 'lingerie', name: 'Lingerie', description: 'Intimate luxury, redefined', icon: '❋', color: '#C57D8E', order: 3 },
      ]
    },
    {
      file: 'settings.json',
      data: {
        storeName: 'ANNIE',
        storeTagline: "Pakistan's Premier Luxury Artificial Jewelry",
        currency: 'PKR',
        currencySymbol: 'Rs.',
        taxRate: 0,
        shippingThreshold: 2000,
        shippingFee: 150,
        primaryColor: '#E8A0B8',
        accentColor: '#D4A86A',
        whatsapp: '0300-1234567',
        email: 'hello@anniejewelry.pk',
        address: 'Lahore, Pakistan',
        logo: '',
      }
    },
    {
      file: 'admin.json',
      data: { password: ADMIN_PASSWORD }
    },
    {
      file: 'hero-images.json',
      data: {
        jewelry: { image: '/images/products/p1-gold-necklace.jpg', updatedAt: null },
        decor: { image: '/images/products/p25-gold-vase.jpg', updatedAt: null },
        lingerie: { image: '/images/products/p13-bathrobe.jpg', updatedAt: null },
      }
    }
  ]

  defaults.forEach(({ file, data }) => {
    const filePath = join(DATA_DIR, file)
    if (!existsSync(filePath)) {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    }
  })
}

// ─── JSON File Helpers (Atomic Read/Write) ──────────────
function readJSON(name) {
  const p = join(DATA_DIR, `${name}.json`)
  if (!existsSync(p)) return name === 'settings' || name === 'admin' ? {} : []
  return JSON.parse(readFileSync(p, 'utf-8'))
}
function writeJSON(name, data) {
  writeFileSync(join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Authentication Middleware ──────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization
  if (!token || token !== 'Bearer annie-admin-token-2025') {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// ─── Default Settings ──────────────────────────────────
const DEFAULT_SETTINGS = {
  storeName: 'ANNIE',
  storeTagline: "Pakistan's Premier Luxury Artificial Jewelry",
  currency: 'PKR',
  currencySymbol: 'Rs.',
  taxRate: 0,
  shippingThreshold: 2000,
  shippingFee: 150,
  primaryColor: '#E8A0B8',
  accentColor: '#D4A86A',
  whatsapp: '0300-1234567',
  phone: '0300-1234567',
  email: 'hello@anniejewelry.pk',
  address: 'Lahore, Pakistan',
  logo: '',
  paymentMethods: ['Cash on Delivery', 'JazzCash', 'Easypaisa', 'Bank Transfer'],
  instagram: 'https://instagram.com/harisrsiddiqui',
  facebook: '',
  showroom: '',
}

// ─── Create and export the Express app ──────────────────
export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  app.use('/images', express.static(join(__dirname, 'public', 'images')))

  // ─── Auth ─────────────────────────────────────────────
  app.post('/api/login', (req, res) => {
    const { password } = req.body
    const admin = readJSON('admin')
    if (password === (admin.password || ADMIN_PASSWORD)) {
      res.json({ token: 'annie-admin-token-2025', user: 'admin' })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  })

  // ─── Settings ─────────────────────────────────────────
  app.get('/api/settings', (req, res) => {
    const saved = readJSON('settings')
    res.json({ ...DEFAULT_SETTINGS, ...saved })
  })

  app.put('/api/settings', auth, (req, res) => {
    const current = readJSON('settings')
    const updated = { ...DEFAULT_SETTINGS, ...current, ...req.body }
    writeJSON('settings', updated)
    res.json(updated)
  })

  // ─── Admin Password ────────────────────────────────────
  app.put('/api/admin/password', auth, (req, res) => {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' })
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' })
    }
    const admin = readJSON('admin')
    if (currentPassword !== (admin.password || ADMIN_PASSWORD)) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }
    admin.password = newPassword
    writeJSON('admin', admin)
    res.json({ ok: true, message: 'Password updated successfully' })
  })

  // ─── Auto-SKU generation ──────────────────────────────
  const DEPT_PREFIXES = { jewelry: 'JW', decor: 'DC', lingerie: 'LG' }
  const CAT_PREFIXES = {
    'Necklace Sets': 'NS', 'Ear Tops': 'ET', 'Rings': 'RG', 'Bangles': 'BG',
    'Nose Pins & Tikka': 'NP', 'Hand Jewelry': 'HJ', 'Payal & Foot': 'PF',
    'Candles & Holders': 'CH', 'Lighting': 'LT', 'Vases': 'VS', 'Textiles': 'TX',
    'Wall Art': 'WA', 'Mirrors': 'MR', 'Figurines': 'FG',
    'Chemises': 'CH', 'Bralettes': 'BR', 'Robes': 'RB', 'Bodysuits': 'BD',
    'Sets': 'ST', 'Sleepwear': 'SL', 'Nightwear': 'NW', 'Accessories': 'AC',
  }

  app.get('/api/products/auto-sku', auth, (req, res) => {
    const { department, category } = req.query
    const products = readJSON('products')
    const deptCode = DEPT_PREFIXES[department] || 'XX'
    const catCode = CAT_PREFIXES[category] || 'OT'
    const prefix = `ANN-${deptCode}-${catCode}-`
    const existing = products
      .map(p => p.sku)
      .filter(s => s && s.startsWith(prefix))
      .map(s => parseInt(s.replace(prefix, ''), 10))
      .filter(n => !isNaN(n))
    const next = (existing.length > 0 ? Math.max(...existing) : 0) + 1
    const sku = `${prefix}${String(next).padStart(3, '0')}`
    res.json({ sku })
  })

  // ─── Products ─────────────────────────────────────────
  app.get('/api/products', (req, res) => res.json(readJSON('products')))
  app.get('/api/products/:id', (req, res) => {
    const products = readJSON('products')
    const product = products.find(p => p.id === req.params.id)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
  })

  app.post('/api/products', auth, (req, res) => {
    const data = readJSON('products')
    const product = { id: `p${Date.now()}`, ...req.body, createdAt: new Date().toISOString().split('T')[0] }
    data.push(product)
    writeJSON('products', data)
    res.json(product)
  })

  app.put('/api/products/:id', auth, (req, res) => {
    const data = readJSON('products')
    const idx = data.findIndex(p => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    data[idx] = { ...data[idx], ...req.body, id: req.params.id }
    writeJSON('products', data)
    res.json(data[idx])
  })

  app.delete('/api/products/:id', auth, (req, res) => {
    let data = readJSON('products')
    data = data.filter(p => p.id !== req.params.id)
    writeJSON('products', data)
    res.json({ ok: true })
  })

  // ─── Orders ───────────────────────────────────────────
  app.get('/api/orders', auth, (req, res) => res.json(readJSON('orders')))

  // ─── Public Order Tracking ─────────────────────────────
  app.get('/api/track/:code', (req, res) => {
    const orders = readJSON('orders')
    const order = orders.find(o => (o.trackingCode || '').toUpperCase() === req.params.code.toUpperCase())
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({
      trackingCode: order.trackingCode,
      status: order.status,
      customerName: order.customerName,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
  })

  // ─── Generate unique tracking code ─────────────────────
  function generateTrackingCode(existingOrders) {
    let code
    let attempts = 0
    do {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      code = ''
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
      }
      attempts++
    } while (existingOrders.some(o => o.trackingCode === code) && attempts < 100)
    return code
  }

  app.post('/api/orders', (req, res) => {
    const data = readJSON('orders')
    const trackingCode = generateTrackingCode(data)
    const order = { id: `ord-${Date.now()}`, trackingCode, ...req.body, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    data.unshift(order)
    writeJSON('orders', data)

    // Decrement stock for ordered products
    if (order.items && order.items.length > 0) {
      const products = readJSON('products')
      let changed = false
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          const qty = item.quantity || 1
          product.stock = Math.max(0, (product.stock || 0) - qty)
          if (product.stock === 0) product.inStock = false
          changed = true
        }
      })
      if (changed) writeJSON('products', products)
    }

    res.json(order)
  })

  app.put('/api/orders/:id', auth, (req, res) => {
    const data = readJSON('orders')
    const idx = data.findIndex(o => o.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    data[idx] = { ...data[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() }
    writeJSON('orders', data)
    res.json(data[idx])
  })

  app.delete('/api/orders/:id', auth, (req, res) => {
    let data = readJSON('orders')
    data = data.filter(o => o.id !== req.params.id)
    writeJSON('orders', data)
    res.json({ ok: true })
  })

  // ─── Invoices ─────────────────────────────────────────
  app.get('/api/invoices/:orderId', (req, res) => {
    const orders = readJSON('orders')
    const order = orders.find(o => o.id === req.params.orderId)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const settings = { ...DEFAULT_SETTINGS, ...readJSON('settings') }
    const invoiceNo = `INV-${order.id.toUpperCase()}`
    const date = new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    const items = (order.items || []).map(item => ({
      name: item.name,
      variant: item.variant || 'Standard',
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }))

    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const shipping = subtotal > (settings.shippingThreshold || 2000) ? 0 : (settings.shippingFee || 150)
    const tax = Math.round(subtotal * (settings.taxRate || 0) / 100)
    const total = subtotal + shipping + tax

    res.json({
      invoiceNo,
      date,
      storeName: settings.storeName,
      storeTagline: settings.storeTagline,
      storeAddress: settings.address,
      storeEmail: settings.email,
      storeWhatsapp: settings.whatsapp,
      customer: {
        name: order.customerName,
        email: order.email,
        phone: order.phone,
        address: order.address
          ? `${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.zip}`
          : '',
      },
      items,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: order.paymentMethod || 'N/A',
      status: order.status || 'pending',
      orderId: order.id,
      createdAt: order.createdAt,
    })
  })

  // ─── Customers ────────────────────────────────────────
  app.get('/api/customers', auth, (req, res) => res.json(readJSON('customers')))

  app.put('/api/customers/:id', auth, (req, res) => {
    const data = readJSON('customers')
    const idx = data.findIndex(c => c.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    data[idx] = { ...data[idx], ...req.body, id: req.params.id }
    writeJSON('customers', data)
    res.json(data[idx])
  })

  // ─── Collections ──────────────────────────────────────
  app.get('/api/collections', (req, res) => res.json(readJSON('collections')))

  app.post('/api/collections', auth, (req, res) => {
    const data = readJSON('collections')
    const col = { id: `col-${Date.now()}`, ...req.body }
    data.push(col)
    writeJSON('collections', data)
    res.json(col)
  })

  app.put('/api/collections/:id', auth, (req, res) => {
    const data = readJSON('collections')
    const idx = data.findIndex(c => c.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    data[idx] = { ...data[idx], ...req.body, id: req.params.id }
    writeJSON('collections', data)
    res.json(data[idx])
  })

  app.delete('/api/collections/:id', auth, (req, res) => {
    let data = readJSON('collections')
    data = data.filter(c => c.id !== req.params.id)
    writeJSON('collections', data)
    res.json({ ok: true })
  })

  // ─── Categories (Departments) ──────────────────────────
  app.get('/api/categories', (req, res) => {
    const cats = readJSON('categories')
    res.json(cats.sort((a, b) => (a.order || 99) - (b.order || 99)))
  })

  app.post('/api/categories', auth, (req, res) => {
    const data = readJSON('categories')
    const cat = {
      id: req.body.id || `cat-${Date.now()}`,
      name: req.body.name,
      description: req.body.description || '',
      icon: req.body.icon || '✦',
      color: req.body.color || '#D4919E',
      order: req.body.order || data.length + 1,
    }
    data.push(cat)
    writeJSON('categories', data)
    res.json(cat)
  })

  app.put('/api/categories/:id', auth, (req, res) => {
    const data = readJSON('categories')
    const idx = data.findIndex(c => c.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    data[idx] = { ...data[idx], ...req.body, id: req.params.id }
    writeJSON('categories', data)
    res.json(data[idx])
  })

  app.delete('/api/categories/:id', auth, (req, res) => {
    let data = readJSON('categories')
    data = data.filter(c => c.id !== req.params.id)
    writeJSON('categories', data)
    res.json({ ok: true })
  })

  // ─── Dashboard Stats ──────────────────────────────────
  app.get('/api/stats', auth, (req, res) => {
    const orders = readJSON('orders')
    const products = readJSON('products')
    const customers = readJSON('customers')

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0)
    const activeOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending').length
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 5).length
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0

    const monthlyRevenue = {}
    orders.forEach(o => {
      if (o.status === 'cancelled') return
      const month = o.createdAt ? o.createdAt.substring(0, 7) : '2025-01'
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + o.total
    })

    res.json({ totalRevenue, activeOrders, lowStock, outOfStock, avgOrderValue, totalOrders: orders.length, totalCustomers: customers.length, monthlyRevenue, totalProducts: products.length })
  })

  // ─── Analytics ────────────────────────────────────────
  app.get('/api/analytics', auth, (req, res) => {
    const orders = readJSON('orders')
    const products = readJSON('products')
    const customers = readJSON('customers')

    // Revenue by month
    const monthlyRevenue = {}
    orders.forEach(o => {
      if (o.status === 'cancelled') return
      const month = o.createdAt ? o.createdAt.substring(0, 7) : '2025-01'
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + o.total
    })

    // Order status breakdown
    const statusBreakdown = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
    orders.forEach(o => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1
    })

    // Top products by revenue
    const productRevenue = {}
    orders.forEach(o => {
      if (o.status === 'cancelled') return
      ;(o.items || []).forEach(item => {
        if (!productRevenue[item.productId]) {
          productRevenue[item.productId] = { name: item.name, revenue: 0, quantity: 0 }
        }
        productRevenue[item.productId].revenue += (item.price || 0) * (item.quantity || 1)
        productRevenue[item.productId].quantity += (item.quantity || 1)
      })
    })
    const topProducts = Object.entries(productRevenue)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Collection performance
    const collectionRevenue = {}
    products.forEach(p => {
      if (!collectionRevenue[p.collection]) {
        collectionRevenue[p.collection] = { name: p.collection, revenue: 0, productCount: 0, totalStock: 0 }
      }
      collectionRevenue[p.collection].productCount++
      collectionRevenue[p.collection].totalStock += (p.stock || 0)
    })
    orders.forEach(o => {
      if (o.status === 'cancelled') return
      ;(o.items || []).forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product && collectionRevenue[product.collection]) {
          collectionRevenue[product.collection].revenue += (item.price || 0) * (item.quantity || 1)
        }
      })
    })

    // Stock summary
    const stockSummary = {
      totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
      outOfStock: products.filter(p => (p.stock || 0) === 0).length,
      lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 5).length,
      inStock: products.filter(p => (p.stock || 0) >= 5).length,
    }

    // Customer summary
    const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    const avgCustomerValue = customers.length > 0 ? Math.round(totalSpent / customers.length) : 0

    res.json({
      monthlyRevenue,
      statusBreakdown,
      topProducts,
      collectionRevenue: Object.values(collectionRevenue),
      stockSummary,
      customerSummary: { total: customers.length, totalSpent, avgValue: avgCustomerValue },
      totalRevenue: orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0),
      totalOrders: orders.length,
    })
  })

  // ─── Bulk Operations ──────────────────────────────────
  app.post('/api/products/bulk-update', auth, (req, res) => {
    const { ids, updates } = req.body
    if (!ids || !Array.isArray(ids) || !updates) {
      return res.status(400).json({ error: 'ids array and updates object required' })
    }
    const products = readJSON('products')
    let updated = 0
    products.forEach(p => {
      if (ids.includes(p.id)) {
        Object.assign(p, updates)
        updated++
      }
    })
    writeJSON('products', products)
    res.json({ ok: true, updated })
  })

  app.post('/api/products/bulk-delete', auth, (req, res) => {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids array required' })
    }
    let products = readJSON('products')
    const before = products.length
    products = products.filter(p => !ids.includes(p.id))
    writeJSON('products', products)
    res.json({ ok: true, deleted: before - products.length })
  })

  app.post('/api/orders/bulk-update', auth, (req, res) => {
    const { ids, updates } = req.body
    if (!ids || !Array.isArray(ids) || !updates) {
      return res.status(400).json({ error: 'ids array and updates object required' })
    }
    const orders = readJSON('orders')
    let updated = 0
    orders.forEach(o => {
      if (ids.includes(o.id)) {
        Object.assign(o, updates, { updatedAt: new Date().toISOString() })
        updated++
      }
    })
    writeJSON('orders', orders)
    res.json({ ok: true, updated })
  })

  // ─── Stock Management ─────────────────────────────────
  app.put('/api/products/:id/stock', auth, (req, res) => {
    const { stock } = req.body
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Valid stock number required' })
    }
    const products = readJSON('products')
    const idx = products.findIndex(p => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    products[idx].stock = stock
    products[idx].inStock = stock > 0
    writeJSON('products', products)
    res.json(products[idx])
  })

  // ─── Image Upload ────────────────────────────────────
  const UPLOAD_DIR = join(__dirname, 'public', 'images', 'uploads')
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })

  app.post('/api/upload', auth, (req, res) => {
    const { image, filename } = req.body
    if (!image || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' })
    }
    const match = image.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!match) return res.status(400).json({ error: 'Invalid base64 format' })

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
    const base64Data = match[2]
    const name = filename || `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const fileName = `${name}.${ext}`
    const filePath = join(UPLOAD_DIR, fileName)

    writeFileSync(filePath, Buffer.from(base64Data, 'base64'))
    const url = `/images/uploads/${fileName}`
    res.json({ url })
  })

  // ─── Hero Images ──────────────────────────────────────
  const DEFAULT_HERO = {
    jewelry: '/images/products/p1-gold-necklace.jpg',
    decor: '/images/products/p25-gold-vase.jpg',
    lingerie: '/images/products/p13-bathrobe.jpg',
  }

  app.get('/api/hero-images', (req, res) => {
    const saved = readJSON('hero-images')
    const result = {}
    for (const dept of ['jewelry', 'decor', 'lingerie']) {
      result[dept] = saved[dept]?.image || DEFAULT_HERO[dept]
    }
    res.json(result)
  })

  app.put('/api/hero-images/:department', auth, (req, res) => {
    const { department } = req.params
    if (!['jewelry', 'decor', 'lingerie'].includes(department)) {
      return res.status(400).json({ error: 'Invalid department' })
    }
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image path required' })
    }
    const saved = readJSON('hero-images')
    saved[department] = { image, updatedAt: new Date().toISOString() }
    writeJSON('hero-images', saved)
    res.json({ ok: true, department, image })
  })

  app.delete('/api/hero-images/:department', auth, (req, res) => {
    const { department } = req.params
    if (!['jewelry', 'decor', 'lingerie'].includes(department)) {
      return res.status(400).json({ error: 'Invalid department' })
    }
    const saved = readJSON('hero-images')
    delete saved[department]
    writeJSON('hero-images', saved)
    res.json({ ok: true, department, image: DEFAULT_HERO[department] })
  })

  return app
}


