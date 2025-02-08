import * as React from 'react';

interface IConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmModal: React.FunctionComponent<IConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96 md:w-2/3 lg:w-1/3 xl:w-1/4 animate-fadeIn relative">
                {/* Modal Content */}
                <h2 className="text-xl font-semibold text-center mb-6">Are you sure?</h2>
                <p className="text-center text-gray-700 mb-6">Do you really want to delete this item? This action cannot be undone.</p>

                {/* Button Container */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-3xl hover:bg-gray-600"
                    >
                        No
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-800"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
