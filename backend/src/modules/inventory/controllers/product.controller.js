import ProductService from '../services/product.service.js';

class ProductController {
  async create(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await ProductService.softDeleteProduct(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Product soft-deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await ProductService.queryProducts(req.query);
      res.status(200).json({
        status: 'success',
        results: result.products.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { products: result.products }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
