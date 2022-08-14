const { ProductRepository } = require('../database');
const { FormatData } = require('../utils');
const { APIError } = require('../utils/app-errors');

// All Business logic will be here
class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  async CreateProduct(productInputs) {
    try {
      const productResult = await this.repository.CreateProduct(productInputs);
      return FormatData(productResult);
    } catch (err) {
      throw new APIError('Data Not found');
    }
  }

  async GetProducts() {
    try {
      const products = await this.repository.Products();

      let categories = {};

      products.map(({ type }) => {
        categories[type] = type;
      });

      return FormatData({
        products,
        categories: Object.keys(categories),
      });
    } catch (err) {
      throw new APIError('Data Not found');
    }
  }

  async GetProductDescription(productId) {
    try {
      const product = await this.repository.FindById(productId);
      return FormatData(product);
    } catch (err) {
      throw new APIError('Data Not found');
    }
  }

  async GetProductsByCategory(category) {
    try {
      const products = await this.repository.FindByCategory(category);
      return FormatData(products);
    } catch (err) {
      throw new APIError('Data Not found');
    }
  }

  async GetSelectedProducts(selectedIds) {
    try {
      const products = await this.repository.FindSelectedProducts(selectedIds);
      return FormatData(products);
    } catch (err) {
      throw new APIError('Data Not found');
    }
  }

  async GetProductById(productId) {
    try {
      return await this.repository.FindById(productId);
    } catch (err) {
      throw new APIError('Data Not found');
    }
  }

  async GetProductPayload(usreId, { productId, qty }, event) {
    const product = await this.repository.FindById(productId);

    if (product) {
      const payload = {
        event: event,
        data: { usreId, product, qty },
      };
      return FormatData(payload);
    } else {
      return FormatData({ error: 'No Product available' });
    }
  }
}

module.exports = ProductService;
