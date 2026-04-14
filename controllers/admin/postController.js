const postModel = require('../../models/post')
const User = require('../../models/user')
const slugify = require("slugify");

exports.index = async (req, res) => {
    try {

        const search = req.query.search || "";

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            // 1. Find users whose name matches search
            const users = await User.find({
                name: { $regex: search, $options: 'i' }
            }).select('_id');
            const userIds = users.map(user => user._id);
            // 2. Create OR condition
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { body: { $regex: search, $options: 'i' } },
                    { author: { $in: userIds } }
                ]
            };
        }

        const totalPosts = await postModel.countDocuments(query);
        let posts = await postModel.find(query)
            .populate('author', 'name')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        res.render('admin/posts/index', {
            posts, currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            search
        });
    } catch (error) {
        console.error("Sorting Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

exports.create = async (req, res) => {
    const authors = await User.find({ is_active: true }).select('name id');
    res.render('admin/posts/create', { authors, errors: null, oldData: null });
}

exports.store = async (req, res) => {
    let { author, title, body, slug, publishedAt, isPublished } = req.body
    const authorId = author;
    const status = isPublished === 'on' ? true : false;

    //Base slug (from slug OR title)
    let baseSlug = slug || title;

    let generatedSlug = slugify(baseSlug, {
        lower: true,
        strict: true,
        trim: true
    });

    // Ensure uniqueness
    let uniqueSlug = generatedSlug;
    let count = 1;

    while (await postModel.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${generatedSlug}-${count++}`;
    }

    await postModel.create({
        title,
        body,
        slug: uniqueSlug,
        isPublished: status,
        publishedAt: publishedAt || Date.now(),
        author: authorId
    })
    res.redirect('/admin/posts')
}

exports.edit = async (req, res) => {
    const authors = await User.find({ is_active: true }).select('name id');
    let post = await postModel.findOne({ _id: req.params.id });
    res.render('admin/posts/edit', { post, authors, errors: null, oldData: null });
}

exports.update = async (req, res) => {
    try {
        let { author, title, slug, body, publishedAt, isPublished } = req.body;
        const authorId = author;
        const post = await postModel.findById(req.params.id);
        if (!post) return res.send("No post found!");

        // 1. Handle Status
        let status = isPublished === 'on';

        // 2. Logic: Only regenerate slug if Title or Slug has changed
        let uniqueSlug = post.slug; // Default to existing

        if (title !== post.title || slug !== post.slug) {
            // Generate a clean slug from the new slug or new title
            let baseSlug = slugify(slug || title, {
                lower: true,
                strict: true,
                trim: true
            });

            uniqueSlug = baseSlug;
            let count = 1;

            // Ensure uniqueness, but EXCLUDE the current post from the search
            // (Otherwise, it might find itself and think the slug is "taken")
            while (await postModel.findOne({ slug: uniqueSlug, _id: { $ne: req.params.id } })) {
                uniqueSlug = `${baseSlug}-${count++}`;
            }
        }

        // 3. Update the document
        await postModel.findByIdAndUpdate(
            req.params.id,
            {
                title,
                slug: uniqueSlug, // Use the verified unique slug
                body,
                publishedAt: publishedAt || Date.now(),
                isPublished: status,
                author: authorId
            },
            { new: true }
        );

        res.redirect('/admin/posts');

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


exports.delete = async (req, res) => {
    await postModel.findOneAndDelete({ _id: req.params.id });
    res.redirect('/admin/posts')
}