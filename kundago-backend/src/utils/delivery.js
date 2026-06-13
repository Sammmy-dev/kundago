const DELIVERY_TIERS = [
  { max: 10, fee: 150, label: 'Small' },
  { max: 50, fee: 300, label: 'Standard' },
  { max: 200, fee: 600, label: 'Medium' },
  { max: 400, fee: 1000, label: 'Heavy' },
  { max: Infinity, fee: 2000, label: 'Truck' },
];

export function calculateDeliveryFee(weights) {
  const maxWeight = Math.max(...weights, 0);
  const tier = DELIVERY_TIERS.find((t) => maxWeight <= t.max);
  return { fee: tier.fee, label: tier.label, maxWeight };
}
