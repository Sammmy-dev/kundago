import mongoose from 'mongoose';

const deliveryTierSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Label is required'],
      unique: true,
      trim: true,
    },
    max: {
      type: Number,
      required: [true, 'Max weight is required'],
      min: [0, 'Max weight cannot be negative'],
    },
    fee: {
      type: Number,
      required: [true, 'Fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

const DeliveryTier = mongoose.model('DeliveryTier', deliveryTierSchema);

export default DeliveryTier;
