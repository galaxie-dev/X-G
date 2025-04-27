import { contentDB } from './database.js';

class MediaService {
    constructor() {
        this.init();
        this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.supportedVideoTypes = ['video/mp4', 'video/webm'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    async init() {
        await contentDB.init();
    }

    // Media Validation
    validateFile(file) {
        if (file.size > this.maxFileSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        if (!this.isSupportedFileType(file.type)) {
            throw new Error('Unsupported file type');
        }

        return true;
    }

    isSupportedFileType(type) {
        return this.supportedImageTypes.includes(type) || 
               this.supportedVideoTypes.includes(type);
    }

    isImage(type) {
        return this.supportedImageTypes.includes(type);
    }

    isVideo(type) {
        return this.supportedVideoTypes.includes(type);
    }

    // File Processing
    async processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                resolve({
                    type: file.type,
                    size: file.size,
                    data: reader.result,
                    isImage: this.isImage(file.type),
                    isVideo: this.isVideo(file.type)
                });
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // Media Storage
    async storeMedia(postId, files) {
        try {
            const processedFiles = await Promise.all(
                files.map(async file => {
                    this.validateFile(file);
                    const processed = await this.processFile(file);
                    return {
                        postId,
                        ...processed,
                        uploadedAt: new Date().toISOString()
                    };
                })
            );

            const mediaIds = await Promise.all(
                processedFiles.map(file => contentDB.add('media', file))
            );

            return mediaIds;
        } catch (error) {
            throw error;
        }
    }

    // Media Retrieval
    async getPostMedia(postId) {
        return contentDB.queryByIndex('media', 'postId', postId);
    }

    async getMediaItem(mediaId) {
        return contentDB.get('media', mediaId);
    }

    // Media Deletion
    async deleteMedia(mediaId) {
        return contentDB.delete('media', mediaId);
    }

    async deletePostMedia(postId) {
        const media = await this.getPostMedia(postId);
        return Promise.all(media.map(item => this.deleteMedia(item.id)));
    }

    // Media Update
    async updateMedia(mediaId, updates) {
        const media = await this.getMediaItem(mediaId);
        if (!media) throw new Error('Media not found');

        const updatedMedia = {
            ...media,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        return contentDB.put('media', updatedMedia);
    }

    // Utility Functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileExtension(type) {
        const extensions = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/webm': 'webm'
        };
        return extensions[type] || '';
    }
}

export const mediaService = new MediaService();
