import { DeliveryTier } from '../models/index.js';

const DEFAULT_TIERS = [
  { max: 10, fee: 150, label: 'Small' },
  { max: 50, fee: 300, label: 'Standard' },
  { max: 200, fee: 600, label: 'Medium' },
  { max: 400, fee: 1000, label: 'Heavy' },
  { max: Infinity, fee: 2000, label: 'Truck' },
];

let tiersCache = [...DEFAULT_TIERS];

export async function initDeliveryTiers() {
  try {
    const count = await DeliveryTier.countDocuments();
    if (count === 0) {
      await DeliveryTier.insertMany(DEFAULT_TIERS.map((t) => ({ ...t })));
    }
    await refreshTiersCache();
  } catch (error) {
    console.error('Failed to init delivery tiers, using defaults:', error.message);
  }
}

export async function refreshTiersCache() {
  try {
    const tiers = await DeliveryTier.find().sort({ max: 1 }).lean();
    tiersCache = tiers.map((t) => ({ max: t.max, fee: t.fee, label: t.label }));
  } catch (error) {
    console.error('Failed to refresh tiers cache:', error.message);
  }
}

export function calculateDeliveryFee(weights) {
  const maxWeight = Math.max(...weights, 0);
  const tier = tiersCache.find((t) => maxWeight <= t.max);
  return { fee: tier.fee, label: tier.label, maxWeight };
}
