import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount']
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  channel: {
    type: String,
    enum: ['online', 'in-store', 'marketplace'],
    default: 'online'
  }
}, {
  timestamps: true
});

// Compound indexes for analytics queries
saleSchema.index({ user: 1, date: -1 });
saleSchema.index({ user: 1, product: 1 });
saleSchema.index({ date: -1 });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
