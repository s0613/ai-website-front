"use client";
import React, { useState, useRef } from 'react';

const testImages = [
    { src: "/images/image1.jpg", alt: "Test Image 1" },
    { src: "/images/image2.jpg", alt: "Test Image 2" },
    { src: "/images/image3.jpg", alt: "Test Image 3" },
    { src: "/images/image4.jpg", alt: "Test Image 4" },
];

const ImageGallery = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
    const loaderRef = useRef(null);

    const handleImageClick = (image: { src: string; alt: string }) => {
        setSelectedImage(image);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    return (
        <section className="px-4 pt-6 pb-12 bg-white text-black md:px-16 md:pt-12 md:pb-14">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {testImages.map((image, index) => (
                        <div
                            key={index}
                            className="bg-gray-200 rounded-none overflow-hidden relative cursor-pointer"
                            onClick={() => handleImageClick(image)}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Intersection Observer 대상 */}
                <div ref={loaderRef} className="h-10"></div>

                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="relative">
                            <button
                                className="absolute top-2 right-2 text-white text-2xl"
                                onClick={handleCloseModal}
                            >
                                &times;
                            </button>
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.alt}
                                className="max-w-full max-h-full"
                                style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ImageGallery;