"use client";

import React from "react";

const Footer = () => {
    return (
        <footer className="bg-black text-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <nav className="mb-4 md:mb-0">
                        <ul className="flex flex-wrap justify-center md:justify-start space-x-4">
                            <li><a href="/about" className="text-gray-300 hover:text-white">About</a></li>
                            <li><a href="/gallery" className="text-gray-300 hover:text-white">Gallery</a></li>
                            <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
                        </ul>
                    </nav>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                        <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
                    </div>
                </div>
                <div className="text-center text-gray-400">
                    <p>&copy; 2025 AI Image Site. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
