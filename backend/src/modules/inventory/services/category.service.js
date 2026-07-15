import Category from '../models/Category.js';
import Counter from '../models/Counter.js';
import AppError from '../../../utils/appError.js';

class CategoryService {
  async getNextCategoryCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'categoryCode' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `CAT-${codeNumber}`;
  }

  async createCategory(categoryData, creatorId) {
    const existing = await Category.findOne({ name: categoryData.name, isDeleted: false });
    if (existing) {
      throw new AppError('Category name already exists', 400);
    }

    // Resolve empty string parent categories to null
    if (!categoryData.parentCategory || categoryData.parentCategory === '') {
      categoryData.parentCategory = null;
    }

    const categoryCode = await this.getNextCategoryCode();

    const category = await Category.create({
      ...categoryData,
      categoryCode,
      createdBy: creatorId
    });

    return category;
  }

  async getCategoryById(id) {
    const category = await Category.findOne({ _id: id, isDeleted: false })
      .populate('parentCategory', 'name categoryCode')
      .populate('createdBy', 'name email');

    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async updateCategory(id, updateData) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (updateData.name && updateData.name !== category.name) {
      const existing = await Category.findOne({ name: updateData.name, isDeleted: false });
      if (existing) {
        throw new AppError('Category name already exists', 400);
      }
    }

    // Resolve parent cycles
    if (updateData.parentCategory && String(updateData.parentCategory) === String(id)) {
      throw new AppError('Category cannot be its own parent category', 400);
    }

    if (!updateData.parentCategory || updateData.parentCategory === '') {
      updateData.parentCategory = null;
    }

    // Strip unmodifiable values
    delete updateData.categoryCode;
    delete updateData.createdBy;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    const updated = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('parentCategory', 'name categoryCode');

    return updated;
  }

  async softDeleteCategory(id, deleterId) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if there are active subcategories linked as child parentCategories
    const subCount = await Category.countDocuments({ parentCategory: id, isDeleted: false });
    if (subCount > 0) {
      throw new AppError('Cannot delete category: child subcategories are linked to it', 400);
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save();

    return null;
  }

  async queryCategories(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { isDeleted: false };
    if (status) filter.status = status;

    if (search) {
      filter.name = new RegExp(search, 'i');
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await Category.countDocuments(filter);
    const categories = await Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('parentCategory', 'name categoryCode');

    const totalPages = Math.ceil(total / limit);

    return {
      categories,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new CategoryService();
