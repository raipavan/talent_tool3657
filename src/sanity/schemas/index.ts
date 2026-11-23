import { seoSchema } from './seo';
import { siteSettingsSchema } from './siteSettings';
import { homeSchema } from './home';
import { productSchema } from './product';
import { postSchema } from './post';
import { pricingSchema } from './pricing';
import { genericPageSchema } from './genericPage';

export const schemaTypes = [
  seoSchema,
  siteSettingsSchema,
  homeSchema,
  productSchema,
  postSchema,
  pricingSchema,
  genericPageSchema,
];
