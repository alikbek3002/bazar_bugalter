'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FileUploadProps {
    onUpload: (url: string) => void;
    onRemove?: (url: string) => void;
    accept?: string;
    maxSize?: number; // in MB
    type: 'photo' | 'document';
    spaceId?: string;
    tenantName?: string;
    existingUrls?: string[];
    multiple?: boolean;
}

export function FileUpload({
    onUpload,
    onRemove,
    accept = 'image/*',
    maxSize = 10,
    type,
    spaceId,
    tenantName,
    existingUrls = [],
    multiple = false
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = useCallback(async (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`Файл слишком большой. Максимум ${maxSize}MB`);
            return;
        }

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            let endpoint = '';
            if (type === 'photo' && spaceId) {
                formData.append('photo', file);
                endpoint = `${API_URL}/api/upload/space-photo/${spaceId}`;
            } else if (type === 'document') {
                formData.append('document', file);
                formData.append('tenantName', tenantName || '');
                endpoint = `${API_URL}/api/upload/contract-document`;
            } else {
                throw new Error('Invalid upload type');
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            onUpload(result.data.url);
            toast.success('Файл загружен');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Ошибка загрузки файла');
        } finally {
            setIsUploading(false);
        }
    }, [type, spaceId, tenantName, maxSize, onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            if (multiple) {
                files.forEach(file => handleUpload(file));
            } else {
                handleUpload(files[0]);
            }
        }
    }, [handleUpload, multiple]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            if (multiple) {
                files.forEach(file => handleUpload(file));
            } else {
                handleUpload(files[0]);
            }
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleUpload, multiple]);

    const handleRemove = useCallback(async (url: string) => {
        if (onRemove) {
            onRemove(url);
        }
    }, [onRemove]);

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
                    }
                    ${isUploading ? 'pointer-events-none opacity-50' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm text-muted-foreground">Загрузка...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-muted-foreground">
                            Перетащите файлы сюда или нажмите для выбора
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Максимум {maxSize}MB
                        </p>
                    </div>
                )}
            </div>

            {/* Preview existing files */}
            {existingUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingUrls.map((url, index) => (
                        <div key={index} className="relative group">
                            {type === 'photo' ? (
                                <img
                                    src={url}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border"
                                />
                            ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                            {onRemove && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(url);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
