import { Product } from '../models';

export const FEATURED_PRODUCT: Product = {
  id: 0,
  name: 'NIKE AIR VAPORMAX',
  image: '/assets/images/banner.png',
  description: 'Chúng tôi đã dồn hết tâm huyết để tạo ra những đôi giày hoàn hảo dành cho những người đam mê thể thao.',
  category: { id: 1, name: 'Giày Nam' },
  brand: { id: 1, name: 'Nike' },
  variants: [],
  minPrice: 20000000,
};

export const BANNER_CONTENT = {
  year: '2026',
  title: 'SỨC MẠNH ĐỘT PHÁ',
  description: 'Chúng tôi đã dồn hết tâm huyết để tạo ra những đôi giày hoàn hảo dành cho những người đam mê thể thao.'
};
