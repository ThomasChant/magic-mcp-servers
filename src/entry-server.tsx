import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

export function render(url: string, context?: any) {
    const html = renderToString(
        <React.StrictMode>
            <MemoryRouter initialEntries={[url]}>
                <App />
            </MemoryRouter>
        </React.StrictMode>
    );
    return { html };
}