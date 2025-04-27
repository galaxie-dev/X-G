import { contentDB } from './database.js';

class PostService {
    constructor() {
        this.init();
    }

    async init() {
        await contentDB.init();
    }

    // Post Operations
    async createPost(postData) {
        try {
            const post = {
                ...postData,
                likes: [],
                shares: [],
                commentCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Create the post
            const postId = await contentDB.add('posts', post);

            // If there's media, store it
            if (postData.media && postData.media.length > 0) {
                const mediaPromises = postData.media.map(mediaItem => 
                    contentDB.add('media', {
                        postId,
                        ...mediaItem,
                        uploadedAt: new Date().toISOString()
                    })
                );
                await Promise.all(mediaPromises);
            }

            return postId;
        } catch (error) {
            throw error;
        }
    }

    async getPost(postId) {
        try {
            const [post, media] = await Promise.all([
                contentDB.get('posts', postId),
                contentDB.queryByIndex('media', 'postId', postId)
            ]);

            if (!post) throw new Error('Post not found');

            return {
                ...post,
                media
            };
        } catch (error) {
            throw error;
        }
    }

    async updatePost(postId, updates) {
        const post = await contentDB.get('posts', postId);
        if (!post) throw new Error('Post not found');

        const updatedPost = {
            ...post,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        return contentDB.put('posts', updatedPost);
    }

    async deletePost(postId) {
        // Delete associated media and comments first
        const media = await contentDB.queryByIndex('media', 'postId', postId);
        const comments = await contentDB.queryByIndex('comments', 'postId', postId);

        await Promise.all([
            ...media.map(m => contentDB.delete('media', m.id)),
            ...comments.map(c => contentDB.delete('comments', c.id))
        ]);

        // Delete the post
        return contentDB.delete('posts', postId);
    }

    // Comment Operations
    async addComment(commentData) {
        const comment = {
            ...commentData,
            likes: [],
            createdAt: new Date().toISOString()
        };

        const commentId = await contentDB.add('comments', comment);

        // Update post's comment count
        const post = await this.getPost(comment.postId);
        await this.updatePost(comment.postId, {
            commentCount: post.commentCount + 1
        });

        return commentId;
    }

    async getComments(postId) {
        return contentDB.queryByIndex('comments', 'postId', postId);
    }

    async deleteComment(commentId) {
        const comment = await contentDB.get('comments', commentId);
        if (!comment) throw new Error('Comment not found');

        // Update post's comment count
        const post = await this.getPost(comment.postId);
        await this.updatePost(comment.postId, {
            commentCount: Math.max(0, post.commentCount - 1)
        });

        return contentDB.delete('comments', commentId);
    }

    // Like Operations
    async toggleLike(postId, userId) {
        const post = await this.getPost(postId);
        if (!post) throw new Error('Post not found');

        const likes = post.likes || [];
        const userLikeIndex = likes.indexOf(userId);

        if (userLikeIndex === -1) {
            likes.push(userId);
        } else {
            likes.splice(userLikeIndex, 1);
        }

        await this.updatePost(postId, { likes });
        return userLikeIndex === -1; // Returns true if liked, false if unliked
    }

    // Feed Operations
    async getFeed(userId, page = 1, limit = 10) {
        const allPosts = await contentDB.getAll('posts');
        
        // Sort posts by creation date
        const sortedPosts = allPosts.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Paginate results
        const start = (page - 1) * limit;
        const paginatedPosts = sortedPosts.slice(start, start + limit);

        // Fetch media for each post
        const postsWithMedia = await Promise.all(
            paginatedPosts.map(async post => {
                const media = await contentDB.queryByIndex('media', 'postId', post.id);
                return { ...post, media };
            })
        );

        return {
            posts: postsWithMedia,
            hasMore: start + limit < sortedPosts.length,
            total: sortedPosts.length
        };
    }

    // Search Operations
    async searchPosts(query) {
        const allPosts = await contentDB.getAll('posts');
        return allPosts.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase())
        );
    }
}

export const postService = new PostService();
