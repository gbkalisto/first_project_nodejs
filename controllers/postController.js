const postModel = require('../models/post')
const slugify = require("slugify");

exports.index = async (req, res) => {
    let posts = await postModel.find({ author: req.user.id })
        .populate('author', 'name') // if you need to get other fields like email or something pass other key after space
        .sort({ _id: -1 });
    res.render('posts/index', { posts })
}

exports.create = async (req, res) => {
    res.render('posts/create')
}

exports.store = async (req, res) => {
    let { title, body, slug, publishedAt, isPublished } = req.body
    const authorId = req.user.id;
    const status = isPublished === 'on' ? true : false;

    // ✅ Step 1: Base slug (from slug OR title)
    let baseSlug = slug || title;

    let generatedSlug = slugify(baseSlug, {
        lower: true,
        strict: true,
        trim: true
    });

    // ✅ Step 2: Ensure uniqueness
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
    res.redirect('/posts')
}

exports.edit = async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id });
    res.render('posts/edit', { post })
}

exports.update = async (req, res) => {
    try {
        let { title, slug, body, publishedAt, isPublished } = req.body;

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
                isPublished: status
            },
            { new: true }
        );

        res.redirect('/posts');

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


exports.delete = async (req, res) => {
    await postModel.findOneAndDelete({ _id: req.params.id });
    res.redirect('/posts')
}