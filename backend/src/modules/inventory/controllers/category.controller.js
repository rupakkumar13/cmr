import CategoryService from '../services/category.service.js';

class CategoryController {
  async create(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await CategoryService.softDeleteCategory(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await CategoryService.queryCategories(req.query);
      res.status(200).json({
        status: 'success',
        results: result.categories.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { categories: result.categories }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
