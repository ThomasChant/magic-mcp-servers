import React from "react";
import { Routes, Route } from "react-router-dom";

const SimpleHome = () => (
    <div>
        <h1>Simple Home Page</h1>
        <p>This is a test for SSR functionality.</p>
    </div>
);

const SimpleApp = () => {
    return (
        <div>
            <nav>
                <a href="/">Home</a>
            </nav>
            <main>
                <Routes>
                    <Route path="/" element={<SimpleHome />} />
                    <Route path="*" element={<div>404 - Page Not Found</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default SimpleApp;