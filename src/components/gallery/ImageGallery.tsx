"use client";
import React, { useEffect, useState } from "react";

interface Image {
    url: string;
    category: string;
    fileName: string;
    fileSize: number;
    lastModified: string;
}

const ImageGallery = () => {
    const [images, setImages] = useState<Image[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/images");
                if (!response.ok) {
                    throw new Error("Failed to fetch images");
                }
                const data: Image[] = await response.json();
                setImages(data);
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        fetchImages();
    }, []);

    return (
        <section className="px-4 pt-6 pb-12 bg-white text-black md:px-16 md:pt-12 md:pb-14">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="bg-gray-200 rounded-lg overflow-hidden relative cursor-pointer shadow"
                        >
                            <img
                                src={image.url}
                                alt={image.fileName}
                                className="w-full h-auto object-cover"
                            />
                            <div className="p-4 bg-white bg-opacity-90 absolute bottom-0 w-full text-sm">
                                <p className="font-bold">{image.fileName}</p>
                                <p>Size: {Math.round(image.fileSize / 1024)} KB</p>
                                <p>Last Modified: {new Date(image.lastModified).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ImageGallery;
