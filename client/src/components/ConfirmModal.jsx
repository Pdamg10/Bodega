import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-4">
                    {isDangerous && (
                        <div className="flex-shrink-0">
                            <AlertCircle className="text-orange-500" size={32} />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-5 py-2 text-white rounded-lg transition-colors font-medium ${isDangerous
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-primary hover:bg-secondary'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
