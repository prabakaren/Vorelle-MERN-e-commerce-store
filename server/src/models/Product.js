import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: '' }, // optional URL; the UI draws a fallback tile
    tint: { type: String, default: '#4a3aff' }, // colour used by the fallback tile
    stock: { type: Number, required: true, min: 0, default: 0 },
    featured: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
