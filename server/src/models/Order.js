import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        image: String,
        tint: String,
        price: Number, // price at the moment of purchase
        quantity: Number,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['card', 'cod'], required: true },
    cardLast4: String, // we never store full card numbers
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    itemsPrice: Number,
    shippingPrice: Number,
    taxPrice: Number,
    totalPrice: Number,
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
