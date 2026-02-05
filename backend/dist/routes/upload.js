"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../config/supabase.js");
const auth_js_1 = require("../middleware/auth.js");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, PDF, DOC, DOCX'));
        }
    }
});
// POST /api/upload/space-photo/:spaceId - Upload photo for space
router.post('/space-photo/:spaceId', (0, auth_js_1.requireRole)('owner'), upload.single('photo'), async (req, res) => {
    try {
        const { spaceId } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        // Generate unique filename
        const ext = file.originalname.split('.').pop();
        const filename = `spaces/${spaceId}/${Date.now()}.${ext}`;
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase_js_1.supabaseAdmin.storage
            .from('space-photos')
            .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });
        if (uploadError)
            throw uploadError;
        // Get public URL
        const { data: urlData } = supabase_js_1.supabaseAdmin.storage
            .from('space-photos')
            .getPublicUrl(filename);
        const photoUrl = urlData.publicUrl;
        // Update space's photos array
        const { data: space, error: fetchError } = await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .select('photos')
            .eq('id', spaceId)
            .single();
        if (fetchError)
            throw fetchError;
        const currentPhotos = space?.photos || [];
        const updatedPhotos = [...currentPhotos, photoUrl];
        const { error: updateError } = await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .update({ photos: updatedPhotos })
            .eq('id', spaceId);
        if (updateError)
            throw updateError;
        return res.json({
            success: true,
            data: {
                url: photoUrl,
                photos: updatedPhotos
            }
        });
    }
    catch (error) {
        console.error('Upload space photo error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to upload photo'
        });
    }
});
// DELETE /api/upload/space-photo/:spaceId - Delete photo from space
router.delete('/space-photo/:spaceId', (0, auth_js_1.requireRole)('owner'), async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { photoUrl } = req.body;
        if (!photoUrl) {
            return res.status(400).json({
                success: false,
                error: 'Photo URL is required'
            });
        }
        // Extract path from URL
        const urlParts = photoUrl.split('/space-photos/');
        if (urlParts.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Invalid photo URL'
            });
        }
        const filePath = urlParts[1];
        // Delete from storage
        const { error: deleteError } = await supabase_js_1.supabaseAdmin.storage
            .from('space-photos')
            .remove([filePath]);
        if (deleteError)
            throw deleteError;
        // Update space's photos array
        const { data: space, error: fetchError } = await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .select('photos')
            .eq('id', spaceId)
            .single();
        if (fetchError)
            throw fetchError;
        const currentPhotos = space?.photos || [];
        const updatedPhotos = currentPhotos.filter((p) => p !== photoUrl);
        const { error: updateError } = await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .update({ photos: updatedPhotos })
            .eq('id', spaceId);
        if (updateError)
            throw updateError;
        return res.json({
            success: true,
            data: {
                photos: updatedPhotos
            }
        });
    }
    catch (error) {
        console.error('Delete space photo error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete photo'
        });
    }
});
// POST /api/upload/contract-document - Upload contract document
router.post('/contract-document', (0, auth_js_1.requireRole)('owner', 'accountant'), upload.single('document'), async (req, res) => {
    try {
        const file = req.file;
        const { tenantName } = req.body;
        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        // Generate unique filename
        const ext = file.originalname.split('.').pop();
        const safeName = (tenantName || 'contract').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `contracts/${safeName}_${Date.now()}.${ext}`;
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase_js_1.supabaseAdmin.storage
            .from('contracts')
            .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });
        if (uploadError)
            throw uploadError;
        // Get public URL
        const { data: urlData } = supabase_js_1.supabaseAdmin.storage
            .from('contracts')
            .getPublicUrl(filename);
        return res.json({
            success: true,
            data: {
                url: urlData.publicUrl,
                filename: file.originalname
            }
        });
    }
    catch (error) {
        console.error('Upload contract document error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to upload document'
        });
    }
});
exports.default = router;
