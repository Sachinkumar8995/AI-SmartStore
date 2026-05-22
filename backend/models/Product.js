import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    enum: {
      values: ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Beauty', 'Books', 'Toys', 'Food & Beverage', 'Other'],
      message: '{VALUE} is not a valid category'
    },
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
    default: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  aiDescription: {
    type: String,
    maxlength: [2000, 'AI description cannot exceed 2000 characters']
  },
  seoTags: {
    type: [String],
    default: []
  },
  marketingCaption: {
    type: String,
    maxlength: [500, 'Marketing caption cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

// Compound index for user queries
productSchema.index({ user: 1, status: 1 });
productSchema.index({ user: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
