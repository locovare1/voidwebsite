/**
 * Fourthwall Shop Integration Service
 * Fetches products from your Fourthwall store at voidesports.org
 */

export interface FourthwallProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  description: string;
  url: string;
  variant?: string;
}

// Your actual Fourthwall products
const FOURTHWALL_PRODUCTS: FourthwallProduct[] = [
  {
    id: '1',
    name: 'Reaching for the Stars Boxy Tee',
    price: 29.99,
    image: 'https://imgproxy.fourthwall.com/iiWwxpAPhPvCuVmx1dIkV247crPVYEJiAlQS47grwRA/w:1920/sm:1/enc/Gtm6Q10gk1MtHdrM/fVYhg9Wzd7r1vvel/5zx-XnP7zJ8Cby8J/frZDbFSY2hQxP04D/iE4senr1QF-3wLyv/TxJ2hRr7ZvhBGpaa/In2aJwEc1qeBlKl8/67DmVffPiNpFMtvt/2UIEMtjBAFXvW2dS/Zu6734h6k-Xzg_2R/XCR6F_5OMd3pfVWR/jOqqDBj2ru5ZS9N9/qRF3dBph3SeHrQ67/dBJGJA',
    hoverImage: 'https://imgproxy.fourthwall.com/SnnneuvYauyB04R_zTPf3UzvwkEdx8-1wbgjVLA3B8Y/w:1920/sm:1/enc/jSWkNu0If2IACQiE/xSWresOAZC9_-oOO/Qgv51fpER02_LBQp/WBQ_LDdAVvJRy6qR/TWvjss5DHouJ45vt/hS0Cg9JweqxYJgMz/B6Bg9I6aJyzg7Q_o/1FNV2otLhfRwl6Ik/dcexq3-rlKJ8KH8_/c6vkn00SjxdQkgtB/e1T3c3pnfJHUUp5u/bI1YviJgtvJMiSRt/cHthila-Hnn4xNPS/oK0DdA',
    description: '100% Organic Combed Ring-Spun Cotton | Heavyweight Fabric (5.9 oz) | Oversized Fit',
    url: 'https://voidesports.org/products/reaching-for-the-stars-boxy-tee-void-esportstm',
  },
  {
    id: '2',
    name: 'Reaching for the Stars Hoodie',
    price: 44.99,
    image: 'https://imgproxy.fourthwall.com/OiVLdvvdMOc_16QMqZ_7bsE4l8s4OgP1WbM7OkkG8uc/w:1920/sm:1/enc/T2pyToHVKzpmLcez/iuIRdNJY4o9zgrWU/h0-cGUZKli4np7D4/NqwvR9urIQBZkA_R/7SqjVDeRBGFC8vHT/QshuempEe1SfdxQf/DGkfEtKsHkh4JnD4/BGQkco4UzNq96P5K/wfCd5T8AFhRZFfaf/f3-xPQ1xBHeeOWTO/iRj_mGxuKBo6SKPP/7RZ3LHSgNGOjTGnQ/gzkgsrCNPf1rtUoa/Q3cUwQ',
    hoverImage: 'https://imgproxy.fourthwall.com/3n_xa_sEBdQ3_lYo1SJ28hvRAb9EOLzPKmzcJmDIsK0/w:1920/sm:1/enc/KpxCTUm1OHtbNMx5/ROmD0-b6N46I3EON/-BzDHCi8V_j27LcW/qcM8KNAf4-Js8Eud/C17zqZDNerFl0Z7y/Wv0IZ0ZoeyWIksmj/Ogmbg8YTCgQ0K_pv/qjf2DyPT0NAV5TUL/5qiSKO867-Vh5I4K/-MxHCmoROwy78oVa/YQE-YRmsSE0ib5fO/Tlj_CA0Jpv8ChU8m/HmQTzejfydS8KTo6/BaABbA',
    description: 'Premium Void Esports Hoodie from the Reaching for the Stars collection',
    url: 'https://voidesports.org/products/reaching-for-the-stars-hoodie-void-esportstm',
  },
  {
    id: '3',
    name: 'Reaching for the Stars Mousepad',
    price: 14.99,
    image: 'https://imgproxy.fourthwall.com/owNXrQxXyKrwqlev_FRbP5jWBqs5Vajzi9TVvI22Veg/w:1920/sm:1/enc/b5NT9Rqd1QEcMRYg/l8CYa7OwBG6IUccy/zUlHnS9Hef8CLftv/BFzvGbTbt4-WhLdf/ozx9T7r5fyLUr8jB/Ovem-5MuXPXNVED2/f6nIxiGb2H2S999D/5bCeKBA0_icy57qQ/DTyCsiA8dyC5plE5/Abq9zbCx5UoLVWh1/BV0B0uMhmlvwogdO/xT63CSkZ9oktKMwb/p2gOVS-7TxiTaycR/wqWdng',
    hoverImage: 'https://imgproxy.fourthwall.com/f7DeXNuQNrESEuVjRZvCLLnIy_eB3ZfEOHgrmrriPbQ/w:1920/sm:1/enc/A-AgsaQZ1d4HRdum/LrjQjoift8r3yVmf/-D6Oq7WGECVkMrFL/-rO2nE6Vqy80NOEF/iK8yuhKx7_V1lUSs/GfZv0d8JElgA81Ur/IXE8oLv1OR1T3FyH/FEz4cRUgIqmx4F9Y/9MwyRp16E66EDqg4/knV1C9OSCNHjrobh/ZaUauU4unKTvxxDK/ZlTPnjRbqHULx2kw/csw9H-oNnGAPJ56j/6bns8Q',
    description: 'High-quality gaming mousepad with Void Esports branding',
    url: 'https://voidesports.org/products/reaching-for-the-stars-mousepad-void-esportstm',
  },
];

export const fourthwallService = {
  /**
   * Get products from your Fourthwall store
   */
  async getProducts(): Promise<FourthwallProduct[]> {
    try {
      // Return your actual Fourthwall products
      return FOURTHWALL_PRODUCTS;
    } catch (error) {
      console.error('Error fetching Fourthwall products:', error);
      return FOURTHWALL_PRODUCTS; // Return fallback even on error
    }
  },

  /**
   * Get the Fourthwall store URL
   */
  getStoreUrl(): string {
    return 'https://voidesports.org';
  },

  /**
   * Get a direct product URL
   */
  getProductUrl(productSlug: string): string {
    return `https://voidesports.org/products/${productSlug}`;
  }
};
