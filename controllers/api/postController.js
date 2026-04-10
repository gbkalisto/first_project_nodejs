const Post = require('../../models/post');
const slugify = require("slugify");

exports.index = async (req, res) => {
    try {
        // 1. Get the user ID from the JWT payload (attached by middleware)
        const userId = req.user.id;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: userId, isPublished: true })
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 4. Get total count for frontend metadata
        const totalPosts = await Post.countDocuments({ author: userId, isPublished: true });
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
            success: true,
            count: posts.length,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                limit
            },
            data: posts
        });

    } catch (error) {
        // Handle database errors
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
}


exports.create = async (req, res) => {
    let { title, body, publishedAt, isPublished } = req.body
    const authorId = req.user.id;
    const status = isPublished === 'on' ? true : false;

    // ✅ Step 1: Base slug (from slug OR title)
    let generatedSlug = slugify(title, {
        lower: true,
        strict: true,
        trim: true
    });

    // ✅ Step 2: Ensure uniqueness
    let uniqueSlug = generatedSlug;
    let count = 1;

    while (await Post.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${generatedSlug}-${count++}`;
    }

    const createdPost = await Post.create({
        title,
        body,
        slug: uniqueSlug,
        isPublished: status,
        publishedAt: publishedAt || Date.now(),
        author: authorId
    })


    res.status(200).json({
        success: true,
        message: 'Post created successfully.',
        data: createdPost
    });

}
