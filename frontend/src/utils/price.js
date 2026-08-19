export const getEffectivePrice = (item) =>
  item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price;
