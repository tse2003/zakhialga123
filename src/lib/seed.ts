import connectToDatabase from '@/lib/mongodb';
import { defaultFilters, defaultProducts, defaultSettings } from '@/lib/default-data';
import Filter from '@/models/Filter';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings';

let seedPromise: Promise<void> | null = null;

export async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await connectToDatabase();
      const [productCount, filterCount, settings] = await Promise.all([
        Product.countDocuments(),
        Filter.countDocuments(),
        SiteSettings.findOne({ key: 'main' }).lean(),
      ]);

      const writes: Promise<unknown>[] = [];
      if (productCount === 0) writes.push(Product.insertMany(defaultProducts));
      if (filterCount === 0) writes.push(Filter.insertMany(defaultFilters));
      if (!settings) writes.push(SiteSettings.create(defaultSettings));
      await Promise.all(writes);
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}
