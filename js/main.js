// Mock data for demonstration
const mockPosts = [
    {
        id: 1,
        username: 'JohnDoe',
        handle: '@johndoe',
        content: 'Just launched my new project! #coding #webdev',
        likes: 42,
        comments: 7,
        shares: 3,
        timestamp: '2h ago'
    },
    {
        id: 2,
        username: 'TechGuru',
        handle: '@techguru',
        content: 'The future of AI is fascinating! What are your thoughts? 🤖',
        likes: 128,
        comments: 23,
        shares: 15,
        timestamp: '4h ago'
    }
];

const mockTrends = [
    { tag: '#coding', posts: '125K' },
    { tag: '#webdev', posts: '89K' },
    { tag: '#technology', posts: '256K' },
    { tag: '#AI', posts: '342K' }
];

const mockSuggestions = [
    { username: 'TechExpert', handle: '@techexpert', followers: '12K' },
    { username: 'WebDev', handle: '@webdev', followers: '8K' },
    { username: 'DesignPro', handle: '@designpro', followers: '15K' }
];

// DOM Elements
const postModal = document.getElementById('postModal');
const commentModal = document.getElementById('commentModal');
const createPostBtn = document.getElementById('createPost');
const closeButtons = document.querySelectorAll('.close-modal');
const mediaUpload = document.getElementById('mediaUpload');
const mediaPreview = document.querySelector('.media-preview');
const postsContainer = document.querySelector('.posts-container');

// Mock user data
const currentUser = {
    username: 'CurrentUser',
    handle: '@currentuser',
    profilePic: 'assets/default-avatar.png'
};

// Mock posts data
const mockPostsData = [
    {
        id: 1,
        user: {
            username: 'JohnDoe',
            handle: '@johndoe',
            profilePic: 'assets/default-avatar.png'
        },
        content: 'Just launched my new project! #coding #webdev',
        media: [],
        likes: 42,
        comments: [
            {
                user: {
                    username: 'TechGuru',
                    handle: '@techguru',
                    profilePic: 'assets/default-avatar.png'
                },
                content: 'Looks amazing! Great work! 🚀',
                timestamp: '2h ago'
            }
        ],
        shares: 3,
        timestamp: '3h ago'
    }
];

// Modal Functions
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 10);
}

function closeModal(modal) {
    modal.querySelector('.modal-content').style.transform = 'translateY(100%)';
    setTimeout(() => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }, 300);
}

// Media Upload Preview
function handleMediaUpload(event) {
    mediaPreview.innerHTML = '';
    const files = event.target.files;
    
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaElement = file.type.startsWith('image/') 
                ? createImagePreview(e.target.result)
                : createVideoPreview(e.target.result);
            mediaPreview.appendChild(mediaElement);
        };
        reader.readAsDataURL(file);
    }
}

function createImagePreview(src) {
    const img = document.createElement('img');
    img.src = src;
    return img;
}

function createVideoPreview(src) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    return video;
}

// Post Creation
function createPost(content, mediaFiles = []) {
    const timestamp = 'Just now';
    const post = {
        id: Date.now(),
        user: currentUser,
        content,
        media: mediaFiles,
        likes: 0,
        comments: [],
        shares: 0,
        timestamp
    };
    
    const postElement = createPostElement(post);
    postsContainer.insertBefore(postElement, postsContainer.firstChild);
    return post;
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.user.profilePic}" alt="${post.user.username}" class="profile-pic">
            <div class="post-info">
                <span class="username">${post.user.username}</span>
                <span class="handle">${post.user.handle}</span>
                <span class="timestamp">${post.timestamp}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${createMediaContent(post.media)}
        </div>
        <div class="post-actions">
            <button class="like-btn" onclick="toggleLike(this, ${post.id})">
                <i class="far fa-heart"></i>
                <span>${post.likes}</span>
            </button>
            <button class="comment-btn" onclick="openComments(${post.id})">
                <i class="far fa-comment"></i>
                <span>${post.comments.length}</span>
            </button>
            <button class="share-btn" onclick="sharePost(${post.id})">
                <i class="far fa-share-square"></i>
                <span>${post.shares}</span>
            </button>
        </div>
        <div class="comments-section" style="display: none;"></div>
    `;
    return postDiv;
}

function createMediaContent(mediaFiles) {
    if (!mediaFiles.length) return '';
    
    return `
        <div class="post-media ${mediaFiles.length > 1 ? 'media-grid' : ''}">
            ${mediaFiles.map(media => {
                if (media.type.startsWith('image/')) {
                    return `<img src="${media.url}" alt="Post image">`;
                } else {
                    return `<video src="${media.url}" controls></video>`;
                }
            }).join('')}
        </div>
    `;
}

// Post Interactions
function toggleLike(button, postId) {
    const likeIcon = button.querySelector('i');
    const likeCount = button.querySelector('span');
    const isLiked = likeIcon.classList.contains('fas');
    
    if (isLiked) {
        likeIcon.classList.replace('fas', 'far');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
    } else {
        likeIcon.classList.replace('far', 'fas');
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
    }
}

function openComments(postId) {
    const post = document.querySelector(`[data-post-id="${postId}"]`);
    const commentsSection = post.querySelector('.comments-section');
    const isOpen = commentsSection.style.display === 'block';
    
    if (isOpen) {
        commentsSection.style.display = 'none';
    } else {
        commentsSection.style.display = 'block';
        loadComments(postId, commentsSection);
    }
}

function loadComments(postId, container) {
    const post = mockPostsData.find(p => p.id === postId);
    if (!post) return;
    
    container.innerHTML = `
        <div class="comments-list">
            ${post.comments.map(comment => `
                <div class="comment">
                    <img src="${comment.user.profilePic}" alt="${comment.user.username}" class="profile-pic">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="username">${comment.user.username}</span>
                            <span class="handle">${comment.user.handle}</span>
                            <span class="timestamp">${comment.timestamp}</span>
                        </div>
                        <p>${comment.content}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="comment-btn" onclick="openCommentModal(${postId})">
            Add Comment
        </button>
    `;
}

function sharePost(postId) {
    // Implement sharing functionality
    alert('Sharing coming soon!');
}

// Event Listeners
createPostBtn.addEventListener('click', () => openModal(postModal));

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

mediaUpload.addEventListener('change', handleMediaUpload);

// Initialize
function initializePage() {
    // Load mock posts
    mockPostsData.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

document.addEventListener('DOMContentLoaded', initializePage);
