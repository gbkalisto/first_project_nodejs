const Category = require('../../models/category')
const slugify = require("slugify");
const path = require('path')
const fs = require('fs')

exports.index = async (req, res) => {
     const categories = await Category.find()
     res.render('admin/categories/index', { categories })
}

exports.create = async (req, res) => {
     res.render('admin/categories/create')
}

exports.store = async (req, res) => {
     //console.log(req.body)
     let { name, description, is_active } = req.body

     const status = is_active === 'on' ? true : false;
     const relativePath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');

     // ✅ Step 1: Base slug (from slug OR title)
     let generatedSlug = slugify(name, {
          lower: true,
          strict: true,
          trim: true
     });

     // ✅ Step 2: Ensure uniqueness
     let uniqueSlug = generatedSlug;
     let count = 1;

     while (await Category.findOne({ slug: uniqueSlug })) {
          uniqueSlug = `${generatedSlug}-${count++}`;
     }

     await Category.create({
          name,
          slug: uniqueSlug,
          image: relativePath,
          description,
          is_active: status,
     })
     req.flash('success', 'Category created successfully');
     res.redirect('/admin/categories')
}

exports.edit = async (req, res) => {
     const category = await Category.findOne({ _id: req.params.id })
     res.render('admin/categories/edit', { category })
}

exports.update = async (req, res) => {
     try {
          // 1. Consistency: Use 'name' throughout
          let { name, description, is_active } = req.body;
          const category = await Category.findById(req.params.id);
          const status = is_active === 'on' ? true : false;

          if (!category) {
               req.flash('error', 'Category not found');
               // return res.status(404).send("Category not found");
               return res.redirect('/admin/category/edit');
          }

          // Handle Image Update
          let dbImg = category.image;

          if (req.file) {
               // Fix: Ensure pathing is robust
               let oldImagePath = path.join(process.cwd(), 'public', category.image);

               if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
               }

               // Standardize path for DB
               dbImg = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
          }

          // 2. Slug Logic: Fixed variable reference from 'title' to 'name'
          let uniqueSlug = category.slug;

          // Check if the name has actually changed before regenerating
          if (name !== category.name) {
               let baseSlug = slugify(name, { // Use 'name' here
                    lower: true,
                    strict: true,
                    trim: true
               });

               uniqueSlug = baseSlug;
               let count = 1;

               // Loop to ensure uniqueness
               while (await Category.findOne({ slug: uniqueSlug, _id: { $ne: req.params.id } })) {
                    uniqueSlug = `${baseSlug}-${count++}`;
               }
          }

          // 3. Update the database
          await Category.findByIdAndUpdate(req.params.id, {
               name,
               description,
               slug: uniqueSlug,
               is_active: status,
               image: dbImg
          });
          req.flash('success', 'Category successfully updated.');
          res.redirect('/admin/categories');
     } catch (error) {
          console.error("Update Error:", error);
          req.flash('error', error.message());
          // return res.redirect('back'); // Redirects back to the form
          // res.status(500).send("Error updating category");
     }
};


exports.delete = async (req, res) => {
     const category = await Category.findById(req.params.id);

     if (!category) {
          return res.status(404).send("Category not found");
     }

     const imagePath = path.join(process.cwd(), 'public', category.image);

     console.log("Absolute Path:", imagePath);

     if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("File deleted successfully");
     } else {
          console.log("File not found on disk, could not delete");
     }

     await Category.findByIdAndDelete(req.params.id);
     req.flash('success', 'Category successfully deleted.');
     res.redirect('/admin/categories');
}