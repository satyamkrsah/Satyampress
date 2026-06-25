import { weddingPrinting } from './categories/weddingPrinting';
import { businessPrinting } from './categories/businessPrinting';
import { advertisingPrinting } from './categories/advertisingPrinting';
import { digitalPrinting } from './categories/digitalPrinting';
import { customPrinting } from './categories/customPrinting';

export const products = [
  ...weddingPrinting,
  ...businessPrinting,
  ...advertisingPrinting,
  ...digitalPrinting,
  ...customPrinting,
];

export const categories = [
  "All",
  "Wedding Printing",
  "Business Printing",
  "Advertising Printing",
  "Digital Printing",
  "Custom Printing"
];
